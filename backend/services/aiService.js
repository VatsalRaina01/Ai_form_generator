const OpenAI = require("openai");

const endpoint = "https://models.github.ai/inference";

// Client for Chat Generation (GPT-4o)
const chatClient = new OpenAI({
  baseURL: endpoint,
  apiKey: process.env.GITHUB_TOKEN_CHAT
});

// Client for Embeddings (Text Embedding 3)
const embedClient = new OpenAI({
  baseURL: endpoint,
  apiKey: process.env.GITHUB_TOKEN_EMBEDDING
});

async function generateFormSchema(prompt, context = []) {
  const contextString = context.length > 0
    ? `Here is relevant user form history for reference:\n${JSON.stringify(context, null, 2)}\n`
    : "";

  const fullPrompt = `
    You are an intelligent form schema generator.
    ${contextString}
    Now generate a new form schema for this request: "${prompt}"
    
    Return ONLY a valid JSON object with this structure:
    {
      "title": "Form Title",
      "description": "Form Description",
      "fields": [
        { 
          "name": "fieldName", 
          "label": "Field Label", 
          "type": "text|email|number|textarea|file", 
          "required": true,
          "validation": {
            "min": 0,
            "max": 100,
            "pattern": "regex_pattern"
          }
        }
      ]
    }
    Do not include markdown formatting like \`\`\`json.
  `;

  try {
    const response = await chatClient.chat.completions.create({
      messages: [
        { role: "system", content: fullPrompt }
      ],
      model: "openai/gpt-4o-mini",
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("GitHub Models Generation Error:", error);
    throw new Error("Failed to generate form schema");
  }
}

async function generateEmbedding(text) {
  try {
    const response = await embedClient.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("GitHub Models Embedding Error:", error);
    throw new Error("Failed to generate embedding");
  }
}

module.exports = { generateFormSchema, generateEmbedding };
