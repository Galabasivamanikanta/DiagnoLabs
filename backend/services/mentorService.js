const axios = require('axios');

/**
 * AI CLINICAL MENTOR SERVICE
 * Analyzes report metadata and provides a patient-friendly summary.
 */
const generateMentorNote = async (booking) => {
    const API_KEY = (process.env.GEMINI_API_KEY || "").trim();
    const testNames = booking.testDetails.map(t => t.testName).join(', ');
    const patientName = booking.patient?.name || "Patient";

    try {
        console.log(`📡 Requesting AI Mentorship for: ${testNames}`);

        // Try Gemini Stable v1 first
        const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const prompt = `
        SYSTEM: You are a DiagnoLabs Clinical Mentor.
        PATIENT: ${patientName}
        TESTS: ${testNames}
        TASK: Write a 2-sentence patient-friendly mentorship note explaining what these tests are for and a supportive encouraging message. Do not provide medical diagnosis, just interpretation.
        `;

        const response = await axios.post(endpoint, {
            contents: [{ parts: [{ text: prompt }] }]
        }, { timeout: 5000 });

        return response.data.candidates[0].content.parts[0].text;

    } catch (err) {
        console.warn("⚠️ Cloud Mentor failed, using Rule-Based Mentorship.");
        
        // Rule-Based Fallback
        if (testNames.toLowerCase().includes('cbc')) {
            return `Hi ${patientName}, your CBC report checks your blood health. It helps identify infections or anemia. We recommend showing this to your doctor for a detailed consultation.`;
        }
        if (testNames.toLowerCase().includes('sugar') || testNames.toLowerCase().includes('hba1c')) {
            return `Hi ${patientName}, this diabetes screening tracks your glucose levels. Maintaining a balanced diet is key. Please consult your physician to discuss these results.`;
        }
        
        return `Hi ${patientName}, your reports have been successfully generated. This is a vital step in monitoring your health. We suggest booking a consultation with your general physician to review these findings together.`;
    }
};

module.exports = { generateMentorNote };
