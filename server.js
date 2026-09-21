const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY not found in .env file!');
  console.error('Please add your API key to the .env file');
  process.exit(1);
}

// Initialize Gemini AI with the NEW model (gemini-3.6-flash)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to generate AI response
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'Please enter a prompt' 
      });
    }
    
    // Generate content using Gemini 3.6 Flash
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ 
      success: true, 
      result: text 
    });
    
  } catch (error) {
    console.error('❌ AI API Error:', error);
    
    let errorMessage = 'Failed to generate response. Please try again.';
    
    if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID')) {
      errorMessage = 'Invalid API key. Please check your .env file.';
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      errorMessage = 'API rate limit exceeded. Please wait a moment and try again.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`🤖 Using model: gemini-3.6-flash`);
  console.log(`🔑 API Key loaded: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}\n`);
});