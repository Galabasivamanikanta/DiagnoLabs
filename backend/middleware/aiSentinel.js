const crypto = require('crypto');

/**
 * DIAGNOLABS AI SENTINEL (V1.0)
 * Industrial-grade firewall for AI Safety and PII Protection.
 */
class AISentinel {
    constructor() {
        // PII Detection Patterns
        this.patterns = {
            aadhaar: /\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b/g,
            phone: /\b(?:\+91|91|0)?[6789]\d{9}\b/g,
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            injection: /\b(ignore previous|system prompt|developer mode|disregard|forget everything)\b/gi
        };
    }

    /**
     * Sanitizes input and checks for malicious intent.
     * @param {string} input - The raw user prompt
     * @returns {Object} { cleanInput, isTriggered, threats }
     */
    inspect(input) {
        let cleanInput = input;
        let isTriggered = false;
        let threats = [];

        // 1. Check for Prompt Injections
        if (this.patterns.injection.test(input)) {
            isTriggered = true;
            threats.push("PROMPT_INJECTION_ATTEMPT");
            // Neutralize the injection
            cleanInput = "[REDACTED_SECURITY_THREAT]";
        }

        // 2. Scrub PII (Sensitive Privacy Data)
        const scrubbedAadhaar = cleanInput.replace(this.patterns.aadhaar, "[AADHAAR_REDACTED]");
        if (scrubbedAadhaar !== cleanInput) {
            cleanInput = scrubbedAadhaar;
            threats.push("PII_AADHAAR_DETECTED");
        }

        const scrubbedPhone = cleanInput.replace(this.patterns.phone, "[PHONE_REDACTED]");
        if (scrubbedPhone !== cleanInput) {
            cleanInput = scrubbedPhone;
            threats.push("PII_PHONE_DETECTED");
        }

        const scrubbedEmail = cleanInput.replace(this.patterns.email, "[EMAIL_REDACTED]");
        if (scrubbedEmail !== cleanInput) {
            cleanInput = scrubbedEmail;
            threats.push("PII_EMAIL_DETECTED");
        }

        return {
            cleanInput,
            isTriggered: threats.length > 0,
            threats,
            timestamp: new Date().toISOString(),
            requestId: crypto.randomBytes(8).toString('hex')
        };
    }
}

const sentinel = new AISentinel();

/**
 * Express Middleware for AI Firewall
 */
const aiSentinelMiddleware = (req, res, next) => {
    const { prompt } = req.body;
    
    if (!prompt) return next();

    const result = sentinel.inspect(prompt);

    if (result.threats.includes("PROMPT_INJECTION_ATTEMPT")) {
        console.warn(`[SENTINEL] Blocked Threat [${result.requestId}]: PROMPT_INJECTION`);
        return res.status(403).json({
            error: "Security Violation",
            message: "This instruction violates DiagnoLabs clinical safety protocols.",
            requestId: result.requestId
        });
    }

    if (result.isTriggered) {
        console.log(`[SENTINEL] Sanitized Input [${result.requestId}]: ${result.threats.join(', ')}`);
        req.body.prompt = result.cleanInput;
    }

    req.sentinelReport = result;
    next();
};

module.exports = aiSentinelMiddleware;
