# Travel Itinerary Optimizer

The Travel Itinerary Optimizer is a Node.js application that generates personalized travel itineraries using AI. Users can input their destinations, preferences, and budget to receive a detailed day-by-day travel plan.

## Features

- AI-powered itinerary generation
- Simple web interface for easy user interaction
- Customizable travel preferences and budget considerations
- Caching system for improved performance

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (usually comes with Node.js)
- Access to an AI text generation API (e.g., OpenAI's GPT-3, Anthropic's Claude, or a local model)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/travel-itinerary-optimizer.git
   cd travel-itinerary-optimizer
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   API_URL=your_ai_api_endpoint
   MODEL_NAME=your_preferred_model_name
   ```
   Replace `your_ai_api_endpoint` and `your_preferred_model_name` with the appropriate values for your AI service.

## Usage

1. Start the server:
   ```
   node app.js
   ```

2. Open a web browser and navigate to `http://localhost:3000` (or the port you specified in the `.env` file).

3. In the web interface:
   - Enter your destinations (comma-separated)
   - Describe your travel preferences
   - Set your budget
   - Click "Generate Itinerary"

4. The application will generate and display your personalized travel itinerary.

## API Endpoints

- `POST /optimize-itinerary`: Generate a travel itinerary
  - Body: `{ "destinations": ["City1", "City2"], "preferences": "Your preferences", "budget": 5000 }`
  - Response: `{ "itinerary": "Your generated itinerary" }`

## Logging

The application logs all generated itineraries to a `travels.log` file in the project root directory. Each log entry includes:

- Timestamp
- Destinations
- User preferences
- Budget
- Generated itinerary

This log can be useful for:
- Debugging
- Analyzing popular destinations and preferences
- Improving the itinerary generation algorithm over time

Note: Ensure the application has write permissions in the project directory.  

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