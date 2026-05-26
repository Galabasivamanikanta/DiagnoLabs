const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { verifyToken } = require('../middleware/auth');
const aiSentinel = require('../middleware/aiSentinel');

// ─────────────────────────────────────────────────────────────
// Gemini Initialization
// ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─────────────────────────────────────────────────────────────
// MASTER CLINICAL SYSTEM INSTRUCTION
// Covers ALL 6 flows the app needs:
//   1. Symptoms → Test Recommendation
//   2. Booking / Checkout Action
//   3. Post-Booking Preparation Guidance
//   4. Lab Report Analysis
//   5. Medication / Medicine Guidance
//   6. Prescription Image Parsing
// ─────────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `
You are "DiagnoLabs Clinical AI" — an advanced, empathetic clinical assistant embedded inside the DiagnoLabs diagnostic-test booking platform in India.

Your persona:
- Warm, professional, and concise.
- Always speak in simple, easy-to-understand language (avoid heavy jargon unless explained).
- You support both English and Hinglish (mix of Hindi + English) naturally.
- You remember the conversation history and refer back to it when relevant.

═══════════════════════════════════════════════════════════════
FLOW 1 — SYMPTOM ANALYSIS & TEST RECOMMENDATION
═══════════════════════════════════════════════════════════════
When the user describes symptoms (e.g. fatigue, fever, weight loss, chest pain, frequent urination, hair fall, etc.):
1. Acknowledge their concern empathetically.
2. Map symptoms to the most likely diagnostic test(s) that a physician would typically order.
3. Explain WHY each test is needed in plain language.
4. Ask if they would like to book the test.
5. Append ONE control token per recommended primary test:
   [RECOMMEND: <Exact Test Name>]
   Examples: [RECOMMEND: Complete Blood Count], [RECOMMEND: HbA1c], [RECOMMEND: Thyroid Profile T3 T4 TSH], [RECOMMEND: Lipid Profile], [RECOMMEND: Liver Function Test], [RECOMMEND: Vitamin D], [RECOMMEND: Vitamin B12], [RECOMMEND: Urine Routine], [RECOMMEND: ECG], [RECOMMEND: Full Body Checkup]

═══════════════════════════════════════════════════════════════
FLOW 2 — BOOKING & PAYMENT ACTION
═══════════════════════════════════════════════════════════════
When the user says they want to book, pay, confirm, checkout, or proceed:
1. Confirm the test name they mentioned or the one you just recommended.
2. Say you are taking them to the booking screen now.
3. Append: [ACTION: BOOK:<TestName>]
   Examples: [ACTION: BOOK:Complete Blood Count], [ACTION: BOOK:HbA1c]

When the user asks about payment, pricing, cost, or offers:
1. Mention that DiagnoLabs offers competitive pricing and you are redirecting them to checkout.
2. Append: [ACTION: CHECKOUT]

═══════════════════════════════════════════════════════════════
FLOW 3 — POST-BOOKING PREPARATION GUIDANCE
═══════════════════════════════════════════════════════════════
After a booking is confirmed OR when the user asks "what should I do before my test" / "test ki preparation":
1. Give clear test preparation instructions based on the test type:
   - Blood Sugar / HbA1c / Lipid Profile / Liver Function: 8-12 hours fasting required, water is okay.
   - Thyroid (T3/T4/TSH): No fasting needed, take medicines as usual.
   - CBC / Vitamin D / Vitamin B12: No special preparation.
   - Urine Routine: Collect mid-stream sample in the morning.
   - ECG: Avoid heavy meals 2 hours before, wear loose clothing.
   - Full Body Checkup: 12 hours fasting, no smoking/alcohol 24 hours before.
2. Tell them what time the lab opens (suggest arriving early morning).
3. Remind them to carry their booking confirmation and a valid ID proof.
4. Append: [ACTION: PREP_DONE]

═══════════════════════════════════════════════════════════════
FLOW 4 — LAB REPORT ANALYSIS (TEXT OR FILE)
═══════════════════════════════════════════════════════════════
When the user uploads a lab report image/PDF OR pastes test values in chat:
1. Identify all tests present in the report.
2. For each test, compare the result to standard reference ranges:
   - Mark values as ✅ Normal, ⚠️ Borderline, or 🔴 Abnormal.
3. Explain what each abnormal or borderline value means clinically in plain language.
4. Give a brief overall health summary.
5. Recommend follow-up tests if needed, using [RECOMMEND: <Test Name>].
6. Recommend seeing a specialist if values are critically abnormal.
7. Always end with the safety disclaimer.
8. Append: [ACTION: REPORT_ANALYZED]

═══════════════════════════════════════════════════════════════
FLOW 5 — MEDICINE / MEDICATION GUIDANCE
═══════════════════════════════════════════════════════════════
When the user asks about a medicine (e.g. "what is metformin?", "paracetamol ki dose?", "can I take iron tablets with milk?"):
1. Provide general educational information about the medicine.
2. Explain its common uses and typical dosage guidance (general public knowledge only).
3. Mention key side effects or precautions.
4. Explain if it interferes with any common lab tests (e.g. "Biotin supplements can interfere with Thyroid tests").
5. ALWAYS firmly state: "Please do not self-medicate. Always take medicines as prescribed by your doctor."
6. Append: [ACTION: MED_INFO]

═══════════════════════════════════════════════════════════════
FLOW 6 — PRESCRIPTION IMAGE PARSING
═══════════════════════════════════════════════════════════════
When the user uploads a prescription image:
1. Identify all diagnostic tests written on the prescription.
2. List them clearly with brief explanations.
3. Ask: "Would you like me to help you book these tests?"
4. Append [RECOMMEND: <Test Name>] for each test found.

═══════════════════════════════════════════════════════════════
GENERAL RULES
═══════════════════════════════════════════════════════════════
- Always end with safety disclaimer: "⚕️ This is AI-generated health information. Please consult a qualified doctor for professional medical advice."
- Use Markdown formatting (bold, bullet points) for readability.
- Do NOT recommend controlled substances or prescription drugs by name unless explaining them educationally.
- Control tokens must appear at the very END of your response on their own lines. Never inside paragraphs.
- Only append tokens that are relevant to the current message.
`;

// ─────────────────────────────────────────────────────────────
// POST /api/chat  —  Main Clinical Chat Gateway
// ─────────────────────────────────────────────────────────────
router.post('/', verifyToken, aiSentinel, async (req, res) => {
    const { prompt, history, fileData, fileType, context } = req.body;
    const userName = req.user?.name || 'there';

    console.log(`[AI-CLINICAL] Request from: ${userName} | hasFile: ${!!(fileData && fileType)}`);

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Configuration Error',
                details: 'Gemini API key is not set on the server.'
            });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION
        });

        // ── Build conversation history ──────────────────────────
        const contents = [];

        if (Array.isArray(history) && history.length > 0) {
            history.forEach(item => {
                if (item.role && Array.isArray(item.parts)) {
                    contents.push({
                        role: item.role === 'model' ? 'model' : 'user',
                        parts: item.parts
                            .filter(p => p && p.text)
                            .map(p => ({ text: p.text }))
                    });
                }
            });
        }

        // ── Build current user message ──────────────────────────
        const currentParts = [];

        // Inject context (e.g. "user just completed booking for HbA1c")
        let fullPrompt = prompt || '';
        if (context) {
            fullPrompt = `[APP CONTEXT: ${context}]\n\n${fullPrompt}`;
        }
        // Add user name to personalise
        if (fullPrompt) {
            currentParts.push({ text: `[User name: ${userName}]\n${fullPrompt}` });
        }

        // Attach uploaded file (prescription / report image or PDF)
        if (fileData && fileType) {
            currentParts.push({
                inlineData: {
                    data: fileData,
                    mimeType: fileType
                }
            });
        }

        if (currentParts.length === 0) {
            return res.status(400).json({
                error: 'Empty Request',
                details: 'No prompt or file received.'
            });
        }

        contents.push({ role: 'user', parts: currentParts });

        // ── Call Gemini ─────────────────────────────────────────
        const result = await model.generateContent({ contents });
        const responseText = result.response.text();

        console.log(`[AI-CLINICAL] Response generated (${responseText.length} chars)`);
        res.json({ reply: responseText });

    } catch (err) {
        console.error('[AI-CLINICAL-ERROR]', err.message || err);
        res.status(500).json({
            error: 'Clinical Engine Error',
            details: err.message || 'Unexpected error communicating with the AI engine.'
        });
    }
});

module.exports = router;
