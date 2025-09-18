const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// New validation endpoint
app.post('/api/validate', async (req, res) => {
    try {
        const { password, apiKey } = req.body;
        const isOwner = password && password === process.env.OWNER_PASSWORD;
        const keyToValidate = isOwner ? process.env.GEMINI_API_KEY : apiKey;

        if (!keyToValidate) {
            return res.status(400).json({ success: false, message: 'No API key provided.' });
        }

        const genAI = new GoogleGenerativeAI(keyToValidate);
        // A cheap way to validate a key is to list the models.
        await genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).countTokens("test");

        res.json({ success: true, type: isOwner ? 'owner' : 'guest' });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid API Key or password.' });
    }
});


// Main chat endpoint (mostly unchanged)
app.post('/api/chat', async (req, res) => {
    try {
        // Now accepts 'history' from the frontend
        const { prompt, model, safetySettings, password, apiKey, history } = req.body;
        const isOwner = password === process.env.OWNER_PASSWORD;
        const key = isOwner ? process.env.GEMINI_API_KEY : apiKey;

        console.log('Received from frontend:', safetySettings);

        if (!key) {
            return res.status(400).json({ error: 'An API Key is required.' });
        }
        const userGenAI = new GoogleGenerativeAI(key);
        const generativeModel = userGenAI.getGenerativeModel({ model: model, safetySettings: safetySettings });

        // --- CONVERSATIONAL CHAT LOGIC ---
        const chat = generativeModel.startChat({
            history: history, // Start the chat with the provided history
            generationConfig: {
                maxOutputTokens: 10000,
            },
        });

        console.log('Passing to Gemini API:', { model, safetySettings });

        const result = await chat.sendMessage(prompt); // Send the new prompt
        const response = await result.response;

        if (!response.text()) {
            if (response.promptFeedback?.blockReason === 'SAFETY' || response.candidates?.[0]?.finishReason === 'SAFETY') {
                return res.status(400).json({ error: 'Response blocked for safety. Adjust safety settings.' });
            } else {
                return res.status(500).json({ error: 'Empty response from model.' });
            }
        }
        res.json({ text: response.text() });
    } catch (error) {
        if (error.message.includes('API key not valid')) {
            return res.status(401).json({ error: 'The provided API key is not valid.' });
        }
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});