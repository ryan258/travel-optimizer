const fs = require('fs').promises;
const path = require('path');

async function logItinerary(destinations, preferences, budget, itinerary) {
    const logsDir = path.join(__dirname, '../logs');
    await fs.mkdir(logsDir, { recursive: true });
    const safeDest = destinations.join('_').replace(/[^a-zA-Z0-9_]/g, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `itinerary_${safeDest}_${timestamp}.md`;
    const filePath = path.join(logsDir, filename);
    const content = `# Travel Itinerary\n\n**Date:** ${new Date().toLocaleString()}\n\n**Destinations:** ${destinations.join(', ')}\n\n**Preferences:** ${preferences}\n\n**Budget:** $${budget}\n\n---\n\n${itinerary}`;
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Itinerary logged to logs/${filename}`);
}

module.exports = { logItinerary };
