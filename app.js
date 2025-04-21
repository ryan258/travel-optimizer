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

// Import modularized AI providers and utils
const { generateOpenAIText } = require('./ai/openai');
const { generateClaudeText } = require('./ai/claude');
const { generateGeminiText } = require('./ai/gemini');
const { generateLocalText } = require('./ai/local');
const { logItinerary } = require('./utils/logger');
const { validateInput } = require('./utils/validateInput');
const { serveStaticFile } = require('./utils/serveStaticFile');

// Function to generate text using AI model (local)
async function generateText(prompt, modelName) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: modelName || aiModelName,
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
                itinerary = await generateText(prompt, modelName);
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

// Export for local AI stub
module.exports = { generateText };