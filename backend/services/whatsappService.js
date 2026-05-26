const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number

let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

const sendWhatsAppMessage = async (to, body) => {
    try {
        if (!client) {
            console.log(`[WHATSAPP MOCK] To: ${to}, Body: ${body}`);
            return { success: true, mock: true };
        }

        const message = await client.messages.create({
            from: whatsappNumber,
            to: `whatsapp:${to}`,
            body: body
        });

        console.log(`WhatsApp message sent: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendWhatsAppMessage };
