const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');
const aiSentinel = require('../middleware/aiSentinel');

/**
 * DIAGONALABS CLINICAL CHAT GATEWAY (SENTINEL SECURED)
 */
router.post('/', verifyToken, aiSentinel, async (req, res) => {
    const { prompt } = req.body;
    const userName = req.user.name || "Guest";
    const input = (prompt || "").toLowerCase().trim();

    console.log(`[AI-REQUEST] Processed for: ${userName}`);

    let text = null;
    let recommendation = "";
    let successfulModel = "Internal Clinical Core";

    // 1. SMART GREETING HANDLER (Instant Response)
    if (input === "hi" || input === "hello" || input === "hey") {
        text = `Hello ${userName}. I am the DiagnoLabs Clinical Intelligence Engine. \n\nI am configured to assist with symptom interpretation, diagnostic test recommendations, and clinical report analysis. \n\nHow can I assist you with your health monitoring today? You may describe your symptoms or state "Full Body Checkup" to proceed.`;
        return res.json({ reply: text });
    }

    // 2. CLINICAL CORE LOGIC (Pattern Matching)
    if (input.includes("fever") || input.includes("cold") || input.includes("headache")) {
        text = `Hi ${userName}, I am currently operating in **Diagnostic Mode**. Based on your symptoms of fever/cold, I recommend getting a **Complete Blood Count (CBC)** to check for infections. \n\nDisclaimer: I am an AI. Consult a doctor for a professional diagnosis.`;
        recommendation = "CBC";
    } else if (input.includes("sugar") || input.includes("diabetes") || input.includes("urine")) {
        text = `For glucose-related concerns, a **Diabetes Screening (HbA1c)** is highly recommended. \n\nDisclaimer: I am an AI. Consult a doctor for a professional diagnosis.`;
        recommendation = "HbA1c";
    } else if (input.includes("who are you") || input.includes("what do you do") || input.includes("how can you help") || input.includes("work")) {
        text = `I am the DiagnoLabs Clinical Intelligence Engine. \n\nI am designed to assist you in three main areas:\n1. [DIAGNOSTIC DISCOVERY] Identifying appropriate clinical tests based on reported symptoms.\n2. [REPORT ANALYSIS] Interpreting verified laboratory data into accessible summaries.\n3. [GEOSPATIAL COORDINATION] Locating accredited diagnostic centers nationwide.\n\nHow may I support your clinical requirements today?`;
        recommendation = ""; // No button needed for info
    } else if (input.includes("book") || input.includes("pay") || input.includes("checkout") || input.includes("confirm")) {
        text = `Confirmed. I am initiating the transaction protocol for your clinical selection. \n\nYour details are being synchronized with our partner laboratories. Please review and finalize your selection on the following screen.`;
        recommendation = "Full Body Checkup"; // Default if not specified
        text += ` [ACTION: BOOK]`;
    } else if (input.includes("my report") || input.includes("my status") || input.includes("download")) {
        text = `Accessing clinical records for ${userName}. \n\nYou can access all verified reports and booking histories via the Patient Dashboard.`;
        text += ` [ACTION: REPORTS]`;
    } else {
        // [Fall back to standard prompt if no keywords match]
        text = `I am here to help you find the right diagnostic tests. Could you tell me more about your health concerns? Common tests include **Full Body Checkups** and **Vitamin Profiles**. \n\nDisclaimer: I am an AI. Consult a professional.`;
        recommendation = "Full Body Checkup";
    }



    if (recommendation) text += ` [RECOMMEND: ${recommendation}]`;

    res.json({ reply: text });
});

module.exports = router;
