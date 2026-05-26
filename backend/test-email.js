require('dotenv').config();
const { sendEmail } = require('./services/mailService');

async function test() {
    console.log("Testing email sending...");
    const res = await sendEmail('sivamanikanta1013@gmail.com', 'Test Subject', 'Test body OTP 123456');
    console.log("Result:", res);
}

test();
