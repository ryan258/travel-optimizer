# Travel Itinerary Optimizer

The Travel Itinerary Optimizer is a Node.js application that generates personalized travel itineraries using AI. Users can input their destinations, preferences, and budget to receive a detailed day-by-day travel plan.

## Features

- AI-powered itinerary generation (OpenAI, Anthropic Claude, Gemini, or Local)
- Modern, responsive web UI (Bootstrap 5)
- User can select AI provider and model
- Multi-day planning: Specify trip length and receive a day-by-day itinerary
- Markdown rendering for beautiful output
- Logs each itinerary as a markdown file in `/logs`
- Caching system for improved performance

## Prerequisites

- Node.js (v14.0.0 or later)
- npm (usually comes with Node.js)
- API keys for any external AI providers you wish to use (OpenAI, Claude, Gemini)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/travel-itinerary-optimizer.git
   cd travel-itinerary-optimizer
   ```

2. Install the dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```sh
   PORT=3000
   API_URL=http://localhost:11434/api/generate
   MODEL_NAME=llama3.1:latest
   OPENAI_API_KEY=your_openai_api_key_here
   CLAUDE_API_KEY=your_claude_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   AI_PROVIDER=local
   ```
   - `API_URL` and `MODEL_NAME` are for your local model (if used).
   - Set your API keys for any providers you want to use. Leave blank if not using.
   - `AI_PROVIDER` sets the default provider (can be changed in the UI).

## Usage

1. Start the server:
   ```sh
   npm run dev
   ```

2. Open a web browser and navigate to `http://localhost:3000` (or the port you specified in the `.env` file).

3. In the web interface:
   - Enter your destinations (comma-separated)
   - Describe your travel preferences
   - Set your budget
   - Enter the number of days for your trip
   - Select AI provider (OpenAI, Claude, Gemini, Local)
   - Specify the model name (e.g. `gpt-4o`, `claude-3-haiku-20240307`, `gemini-pro`, `llama3.1:latest`)
   - Click "Generate Itinerary"

4. The application will generate and display your personalized travel itinerary with beautiful markdown formatting.

## Supported AI Providers & Models

| Provider | Example Model Names |
|----------|--------------------|
| OpenAI   | gpt-4o, gpt-4-turbo, gpt-3.5-turbo |
| Claude   | claude-3-haiku-20240307, claude-3-sonnet-20240229, claude-3-opus-20240229 |
| Gemini   | gemini-pro, gemini-1.5-pro-latest |
| Local    | llama3.1:latest (Ollama) |

## API Endpoints

- `POST /optimize-itinerary`: Generate a travel itinerary
  - Body: `{ "destinations": ["City1", "City2"], "preferences": "Your preferences", "budget": 5000, "days": 7, "aiProvider": "openai", "modelName": "gpt-4o" }`
  - Response: `{ "itinerary": "Your generated itinerary" }`

## Logging

The application logs all generated itineraries as markdown files in the `/logs` directory. Each log entry includes:

- Timestamp
- Destinations
- User preferences
- Budget
- Generated itinerary

## Project Structure

```
/ai            # AI provider modules (openai.js, claude.js, gemini.js, local.js)
/utils         # Utility functions (logger.js, validateInput.js, serveStaticFile.js)
/logs          # Markdown logs of generated itineraries
index.html     # Main web UI
app.js         # Main server logic
.env           # Environment variables and API keys
```

## Contributing

Contributions to the Travel Itinerary Optimizer are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Thanks to ORSON4PREZ for powering the itinerary generation
- Inspired by the need for smarter travel planning in the digital age