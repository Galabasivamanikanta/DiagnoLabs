const crypto = require('crypto');
const { sendWhatsAppMessage } = require('./whatsappService');
const { sendEmail, getDiagnoLabsEmailTemplate } = require('./mailService');



// In-memory OTP storage (Use Redis for production!)
const otpStore = new Map();

const clearOTP = (identifier) => {
    if (identifier) otpStore.delete(identifier);
};

const generateOTP = (identifier, force = false) => {
    const now = Date.now();
    const record = otpStore.get(identifier);

    // SERVER-SIDE RATE LIMIT: 60s cooldown for OTP generation (unless force re-generate)
    if (!force && record && record.lastSent && (now - record.lastSent < 60 * 1000)) {
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
        const otp = generateOTP(identifier, true); // Force fresh OTP
        const messageHtml = `
            <p>Your official DiagnoLabs security verification code is:</p>
            <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0284c7; margin: 20px 0; text-align: center; background: #f0f9ff; padding: 15px; border-radius: 12px; border: 1.5px dashed #0284c7;">
                ${otp}
            </div>
            <p style="font-size: 13px; color: #64748b;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
        `;

        console.log(`\n======================================================`);
        console.log(`🧪 DIAGNOLABS STRICT OTP DISPATCHED TO: ${identifier}`);
        console.log(`======================================================\n`);

        let whatsappResult = { success: false };
        let emailResult = { success: false };

        if (phone) {
            whatsappResult = await sendWhatsAppMessage(phone, `Your DiagnoLabs verification code is: ${otp}. Valid for 10 minutes.`);
        }

        if (email) {
            emailResult = await sendEmail(
                email,
                `🧪 ${otp} is your DiagnoLabs Verification Code`,
                `Your DiagnoLabs verification code is: ${otp}`,
                getDiagnoLabsEmailTemplate({
                    title: 'Verification Code',
                    recipientName: 'Team Member',
                    messageHtml: messageHtml
                })
            );
        }

        const isSent = emailResult.success || whatsappResult.success;

        if (!isSent) {
            return { success: false, message: "Failed to deliver OTP to the provided email/phone. Please check email address." };
        }

        return { 
            success: true,
            emailSent: emailResult.success,
            whatsappSent: whatsappResult.success
        };
    } catch (err) {
        console.error("OTP Generation Error:", err);
        return { success: false, message: err.message };
    }
};




module.exports = { sendVerificationOTP, verifyOTP, clearOTP };

