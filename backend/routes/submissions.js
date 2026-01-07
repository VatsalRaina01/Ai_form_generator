const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// Submit Response
router.post('/', async (req, res) => {
    const { formId, data } = req.body;

    try {
        const submission = new Submission({ formId, data });
        await submission.save();
        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List Submissions for a Form
router.get('/form/:formId', async (req, res) => {
    try {
        const submissions = await Submission.find({ formId: req.params.formId });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
