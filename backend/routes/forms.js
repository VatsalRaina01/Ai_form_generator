const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const { generateFormSchema } = require('../services/aiService');
const { findRelevantForms, storeFormEmbedding } = require('../services/memoryService');

// Generate Form
router.post('/generate', async (req, res) => {
    const { prompt, userId } = req.body;

    try {
        // 1. Retrieve Context (filtered by userId if provided)
        const context = await findRelevantForms(prompt, userId || null);
        
        // 2. Get full schema from MongoDB for context forms if needed
        const contextSchemas = [];
        if (context.length > 0 && userId) {
            const Form = require('../models/Form');
            for (const ctx of context) {
                const form = await Form.findOne({ 
                    owner: userId, 
                    title: ctx.title 
                });
                if (form) {
                    contextSchemas.push({
                        purpose: form.purpose || ctx.purpose,
                        schema: form.schema
                    });
                }
            }
        }

        // 3. Generate Schema with context
        const schema = await generateFormSchema(prompt, contextSchemas);

        res.json({ schema, contextUsed: context });
    } catch (error) {
        console.error('Form generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Save Form
router.post('/', async (req, res) => {
    const { owner, title, description, schema, purpose } = req.body;

    try {
        const newForm = new Form({ owner, title, description, schema, purpose });
        const savedForm = await newForm.save();

        // Store Embedding asynchronously
        storeFormEmbedding(savedForm).catch(console.error);

        res.status(201).json(savedForm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Form by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ error: 'Form not found' });
        res.json(form);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List User Forms
router.get('/user/:userId', async (req, res) => {
    try {
        // Optional: Add auth middleware to verify user can only see their own forms
        const forms = await Form.find({ owner: req.params.userId }).sort({ createdAt: -1 });
        res.json(forms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
