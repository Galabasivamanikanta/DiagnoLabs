const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { verifyToken } = require('../middleware/auth');
const aiSentinel = require('../middleware/aiSentinel');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const systemInstruction = `
You are the DiagnoLabs Clinical Intelligence system, an advanced clinical assistant designed to support diagnostic test selection, medical prescription parsing, laboratory report interpretation, and patient health monitoring.

Instructions:
1. Provide accurate, helpful, and empathetic health guidance.
2. If the user uploads a medical prescription (image/PDF):
   - Analyze the handwriting or print.
   - Extract and list all recommended diagnostic laboratory tests (e.g., CBC, Lipid Profile, Thyroid, Liver Function Test, Urine Culture, etc.).
   - Explain what each test does in simple terms.
3. If the user uploads a laboratory report (image/PDF):
   - Analyze the test results and values.
   - Summarize the key findings.
   - Highlight any values that are outside the standard reference range (abnormal values) and explain them in plain language.
4. Always include a clear clinical safety disclaimer: "I am an AI assistant designed for educational and informational purposes. This is not a professional medical diagnosis. Please consult a qualified doctor or healthcare professional for clinical advice."
5. Return your response using clean, easy-to-read Markdown formatting.

Interactive Integration Tokens (CRITICAL):
To trigger specific app logic and navigation in the DiagnoLabs frontend, you must append special control tokens at the very end of your response, if applicable:
- If you recommend a specific test that the user should book, append: [RECOMMEND: Test Name]
  - Match the exact test name if possible (e.g., [RECOMMEND: Complete Blood Count], [RECOMMEND: HbA1c], [RECOMMEND: Lipid Profile], [RECOMMEND: Thyroid Profile], etc.)
- If the user asks to book, pay, checkout, or place an order, append: [ACTION: BOOK]
- If the user asks for their lab reports, dashboard, booking history, or status, append: [ACTION: REPORTS]
`;

/**
 * DIAGONALABS CLINICAL CHAT GATEWAY (GEMINI AI & SENTINEL SECURED)
 */
router.post('/', verifyToken, aiSentinel, async (req, res) => {
    const { prompt, history, fileData, fileType } = req.body;
    const userName = req.user.name || "Guest";

    console.log(`[AI-REQUEST] Processed via Gemini for: ${userName}`);

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: "Configuration Error", 
                details: "Gemini API key is not configured in backend server environment." 
            });
        }

        // Initialize model with system instruction
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });

        // Construct contents history array
        const contents = [];
        
        // Add chat history
        if (Array.isArray(history)) {
            history.forEach(item => {
                if (item.parts && Array.isArray(item.parts)) {
                    contents.push({
                        role: item.role === 'model' ? 'model' : 'user',
                        parts: item.parts.map(p => ({ text: p.text || "" }))
                    });
                }
            });
        }

        // Add current user message
        const currentParts = [];
        if (prompt) {
            currentParts.push({ text: prompt });
        }
        if (fileData && fileType) {
            currentParts.push({
                inlineData: {
                    data: fileData,
                    mimeType: fileType
                }
            });
        }

        if (currentParts.length === 0) {
            return res.status(400).json({ error: "Empty Request", details: "No text prompt or file attachment received." });
        }

        contents.push({
            role: "user",
            parts: currentParts
        });

        // Generate response using Gemini
        const result = await model.generateContent({ contents });
        const responseText = result.response.text();

        res.json({ reply: responseText });

    } catch (err) {
        console.error("[CHAT-ERROR] Error calling Gemini API:", err);
        res.status(500).json({ 
            error: "Clinical Core Error", 
            details: err.message || "An error occurred while communicating with the clinical intelligence engine." 
        });
    }
});

module.exports = router;

