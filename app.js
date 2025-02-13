require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT;

// Middleware to parse JSON requests
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Endpoint to interact with Google Gemini AI
app.post('/ask-gemini', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: prompt }] }]
        });


        console.log("usesMeta:: ", response?.data?.usageMetadata)
        console.log("API Response :: ", `${response.status} | ${response.data}`)
        if(response.data?.usageMetadata?.promptTokenCount == response.data?.usageMetadata?.totalTokenCount){
            return res.status(400).json({ error: 'Free limit exceeded.' });
        }

        const aiResponse = response.data.candidates[0].content.parts[0].text;
        return res.json({ response: aiResponse });
    } catch (error) {
        console.log("FullError", error)
        console.error("Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
