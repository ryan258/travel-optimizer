const axios = require('axios');

async function generateClaudeText(prompt, modelName) {
    const apiKey = process.env.CLAUDE_API_KEY;
    const endpoint = 'https://api.anthropic.com/v1/messages';
    const response = await axios.post(endpoint, {
        model: modelName,
        max_tokens: 1000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
    }, {
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        }
    });
    return response.data.content[0].text || response.data.content;
}

module.exports = { generateClaudeText };
