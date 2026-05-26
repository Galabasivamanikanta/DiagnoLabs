const crypto = require('crypto');
const { sendWhatsAppMessage } = require('./whatsappService');
const { sendEmail } = require('./mailService');

// In-memory OTP storage (Use Redis for production!)
const otpStore = new Map();

const generateOTP = (identifier) => {
    const now = Date.now();
    const record = otpStore.get(identifier);

    // SERVER-SIDE RATE LIMIT: 60s cooldown for OTP generation
    if (record && record.lastSent && (now - record.lastSent < 60 * 1000)) {
        const remaining = Math.ceil((60 * 1000 - (now - record.lastSent)) / 1000);
        throw new Error(`Please wait ${remaining} seconds before requesting a new clinical OTP.`);
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = now + 10 * 60 * 1000; // 10 minutes
    otpStore.set(identifier, { otp, expiry, lastSent: now });
    return otp;
};


const verifyOTP = (identifier, otp) => {
    const record = otpStore.get(identifier);
    if (!record) return { success: false, message: "OTP not found or expired" };
    
    if (Date.now() > record.expiry) {
        otpStore.delete(identifier);
        return { success: false, message: "OTP expired" };
    }

    if (record.otp === otp) {
        otpStore.delete(identifier);
        return { success: true };
    }

    return { success: false, message: "Invalid OTP" };
};

const sendVerificationOTP = async (phone, email) => {
    const identifier = phone || email;
    
    try {
        const otp = generateOTP(identifier);
        const message = `Your DiagnoLabs verification code is: ${otp}. Valid for 10 minutes.`;

        let whatsappResult = { success: false };
        let emailResult = { success: false };

        if (phone) {
            whatsappResult = await sendWhatsAppMessage(phone, message);
        }

        if (email) {
            emailResult = await sendEmail(email, 'DiagnoLabs Verification Code', message);
        }

        return { 
            success: whatsappResult.success || emailResult.success,
            whatsapp: whatsappResult,
            email: emailResult
        };
    } catch (err) {
        return { success: false, message: err.message };
    }
};


module.exports = { sendVerificationOTP, verifyOTP };
