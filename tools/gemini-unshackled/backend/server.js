// 1. Import necessary packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import the Google AI SDK

// 2. Set up the Express app
const app = express();
const PORT = 3000;

// 3. Configure middleware
app.use(cors());
app.use(express.json());

// 4. Initialize the Google Generative AI client
// This uses the API key from your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 5. Define the main chat route
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, model, safetySettings, isOwner, apiKey } = req.body;

    console.log('Received from frontend:', safetySettings);

    // Use the owner's key or the guest's key
    const key = isOwner ? process.env.GEMINI_API_KEY : apiKey;
    if (!key) {
        return res.status(400).json({ error: 'API Key is required.' });
    }
    const userGenAI = new GoogleGenerativeAI(key);

    const generativeModel = userGenAI.getGenerativeModel({
      model: model,
      safetySettings: safetySettings,
    });

    console.log('Passing to Gemini API:', { model, safetySettings });

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;

    // --- NEW: Check for Safety Blocks ---
    // If response.text() is empty, it was likely blocked.
    if (!response.text()) {
      // Check the specific reason for the block
      if (response.promptFeedback?.blockReason === 'SAFETY' || response.candidates?.[0]?.finishReason === 'SAFETY') {
        return res.status(400).json({ 
          error: 'Response was blocked due to safety settings. Try disabling the relevant safety flags in the UI.' 
        });
      } else {
        // Handle other reasons for an empty response
        return res.status(500).json({ error: 'The model returned an empty response.' });
      }
    }
    // --- End of New Code ---

    const text = response.text();
    res.json({ text });

  } catch (error) {
    console.error('Error processing chat request:', error);
    // Add a check for authentication errors
    if (error.message.includes('API key not valid')) {
        return res.status(401).json({ error: 'The provided API key is not valid.' });
    }
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// 6. Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});