// Local AI model integration
async function generateLocalText(prompt, modelName) {
    // Import or require your local AI logic here
    // For now, just call the existing generateText (to be refactored)
    // This is a stub for future local model expansion
    return require('../app').generateText(prompt, modelName);
}

module.exports = { generateLocalText };
