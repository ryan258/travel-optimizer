const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

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

// Function to validate input
function validateInput(body) {
    const { destinations, preferences, budget } = body;
    if (!Array.isArray(destinations) || destinations.length === 0) {
        return 'At least one destination is required';
    }
    if (typeof preferences !== 'string' || preferences.trim() === '') {
        return 'Preferences are required';
    }
    if (isNaN(Number(budget))) {
        return 'Budget must be a number';
    }
    return null;
}

// Function to log generated itineraries
async function logItinerary(destinations, preferences, budget, itinerary) {
    const logEntry = `
Date: ${new Date().toISOString()}
Destinations: ${destinations.join(', ')}
Preferences: ${preferences}
Budget: $${budget}
Itinerary:
${itinerary}
----------------------------------------
`;

    try {
        await fs.appendFile('travels.log', logEntry);
        console.log('Itinerary logged successfully');
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

            const { destinations, preferences, budget } = parsedBody;
            const cacheKey = `${destinations.join(',')}-${preferences}-${budget}`;

            // Check cache
            if (cache.has(cacheKey)) {
                const cachedItinerary = cache.get(cacheKey);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ itinerary: cachedItinerary, source: 'cache' }));
                return;
            }

            // Generate AI prompt
            const prompt = `Create a detailed, day-by-day travel itinerary for the following destinations: ${destinations.join(', ')}. 
            Preferences: ${preferences}. Budget: $${budget}. 
            For each day, suggest:
            1. Places to visit with brief descriptions
            2. Recommended restaurants or local cuisine to try
            3. Transportation options between locations
            4. Estimated costs for activities and transportation
            Optimize the route to minimize travel time and maximize experiences within the budget.`;

            const itinerary = await generateText(prompt);
            
            // Cache the result
            cache.set(cacheKey, itinerary);

            // Log the generated itinerary
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