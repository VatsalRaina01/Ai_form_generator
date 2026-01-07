const { Pinecone } = require('@pinecone-database/pinecone');
const { generateEmbedding } = require('./aiService');
const Form = require('../models/Form');

let pc, index;

async function initPinecone() {
    if (!pc) {
        pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        index = pc.index(process.env.PINECONE_INDEX);
    }
}

async function storeFormEmbedding(form) {
    try {
        await initPinecone();
        const textToEmbed = `${form.title} ${form.purpose || ''} ${JSON.stringify(form.schema)}`;
        const embedding = await generateEmbedding(textToEmbed);

        await index.upsert([{
            id: form._id.toString(),
            values: embedding,
            metadata: {
                title: form.title,
                purpose: form.purpose || form.title,
                userId: form.owner.toString(),
                formId: form._id.toString()
            }
        }]);
    } catch (error) {
        console.error('Error storing form embedding:', error);
        // Don't throw - allow form creation to continue even if embedding fails
    }
}

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function findRelevantForms(query, userId = null) {
    const cacheKey = userId ? `${userId}:${query}` : query;
    const cached = cache.get(cacheKey);
    
    // Check Cache with TTL
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('Serving from cache');
        return cached.results;
    }

    try {
        await initPinecone();
        const queryEmbedding = await generateEmbedding(query);

        const queryOptions = {
            vector: queryEmbedding,
            topK: 3,
            includeMetadata: true
        };

        // Filter by userId if provided
        if (userId) {
            queryOptions.filter = { userId: { $eq: userId } };
        }

        const queryResponse = await index.query(queryOptions);

        // Fetch full schemas from MongoDB for better context
        const results = [];
        for (const match of queryResponse.matches) {
            try {
                const form = await Form.findById(match.metadata.formId);
                if (form) {
                    results.push({
                        title: form.title,
                        purpose: form.purpose || match.metadata.purpose,
                        schema: form.schema,
                        score: match.score
                    });
                }
            } catch (err) {
                // Fallback to metadata if form not found
                results.push({
                    title: match.metadata.title,
                    purpose: match.metadata.purpose,
                    score: match.score
                });
            }
        }

        // Store in Cache
        cache.set(cacheKey, { results, timestamp: Date.now() });

        // Clear cache if too big to prevent memory leaks
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return results;
    } catch (error) {
        console.error('Error finding relevant forms:', error);
        // Return empty array if Pinecone fails - allow form generation to continue
        return [];
    }
}

module.exports = { storeFormEmbedding, findRelevantForms };
