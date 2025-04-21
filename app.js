const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const port = process.env.PORT || 3000;
const aiApiUrl = process.env.API_URL || 'http://localhost:11434/api/generate';
const aiModelName = process.env.MODEL_NAME || 'llama3.1:latest';

// Simple in-memory cache
const cache = new Map();

// Function to generate text using AI model
async function generateText(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: aiModelName,
            prompt: prompt,
            stream: false,
            max_tokens: 500,
            temperature: 0.7
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = (aiApiUrl.startsWith('https') ? https : http).request(aiApiUrl, options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve(parsedData.response);
                } catch (error) {
                    reject(new Error('Failed to parse AI response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// Function to generate text using OpenAI API
async function generateOpenAIText(prompt, modelName) {
    const apiKey = process.env.OPENAI_API_KEY;
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    try {
        const response = await axios.post(endpoint, {
            model: modelName,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch response from OpenAI API');
    }
}

// Function to generate text using Claude API
async function generateClaudeText(prompt, modelName) {
    const apiKey = process.env.CLAUDE_API_KEY;
    const endpoint = 'https://api.anthropic.com/v1/messages';
    try {
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
        // Claude's response format may differ; adjust as needed
        return response.data.content[0].text || response.data.content;
    } catch (error) {
        console.error('Claude API error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch response from Claude API');
    }
}

// Function to generate text using Gemini API
async function generateGeminiText(prompt, modelName) {
    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    try {
        const response = await axios.post(endpoint, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        // Gemini's response format may differ; adjust as needed
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch response from Gemini API');
    }
}

// Function to validate input
function validateInput(body) {
    const { destinations, preferences, budget, days } = body;
    if (!Array.isArray(destinations) || destinations.length === 0) {
        return 'At least one destination is required';
    }
    if (typeof preferences !== 'string' || preferences.trim() === '') {
        return 'Preferences are required';
    }
    if (isNaN(Number(budget))) {
        return 'Budget must be a number';
    }
    if (isNaN(Number(days)) || Number(days) < 1) {
        return 'Number of days must be a positive integer';
    }
    return null;
}

// Function to log generated itineraries
async function logItinerary(destinations, preferences, budget, itinerary) {
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, '-');
    const safeDest = destinations.join('_').replace(/[^a-zA-Z0-9_]/g, '');
    const filename = `logs/itinerary_${safeDest}_${timestamp}.md`;
    const logEntry = `# Travel Itinerary\n\n**Date:** ${date.toLocaleString()}\n\n**Destinations:** ${destinations.join(', ')}\n\n**Preferences:** ${preferences}\n\n**Budget:** $${budget}\n\n---\n\n${itinerary}\n`;
    try {
        await fs.writeFile(filename, logEntry);
        console.log(`Itinerary logged to ${filename}`);
    } catch (error) {
        console.error('Error logging itinerary:', error);
    }
}

// Function to handle POST request for itinerary optimization
async function handleOptimizeItinerary(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const validationError = validateInput(parsedBody);
            if (validationError) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: validationError }));
                return;
            }

            let { destinations, preferences, budget, days, aiProvider, modelName } = parsedBody;
            days = Number(days);
            aiProvider = aiProvider || process.env.AI_PROVIDER || 'local';
            modelName = modelName || process.env.MODEL_NAME || 'llama3.1:latest';

            const prompt = `Generate exactly ${days} days of a detailed, day-by-day travel itinerary.\nEach day should be labeled as 'Day 1', 'Day 2', etc.\nDestinations: ${destinations.join(', ')}\nPreferences: ${preferences}\nBudget: $${budget}\nFormat the response with clear day-by-day breakdowns. Do not combine days.`;

            let itinerary;
            if (aiProvider === 'openai') {
                itinerary = await generateOpenAIText(prompt, modelName);
            } else if (aiProvider === 'claude') {
                itinerary = await generateClaudeText(prompt, modelName);
            } else if (aiProvider === 'gemini') {
                itinerary = await generateGeminiText(prompt, modelName);
            } else {
                itinerary = await generateText(prompt);
            }

            await logItinerary(destinations, preferences, budget, itinerary);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ itinerary, source: 'generated' }));
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

// Function to serve static files
async function serveStaticFile(res, filePath, contentType) {
    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
}

// Main server function
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (parsedUrl.pathname === '/') {
        await serveStaticFile(res, path.join(__dirname, 'index.html'), 'text/html');
    } else if (parsedUrl.pathname === '/optimize-itinerary') {
        if (req.method === 'POST') {
            await handleOptimizeItinerary(req, res);
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(port, () => {
    console.log(`Travel Itinerary Optimizer running on http://localhost:${port}`);
});