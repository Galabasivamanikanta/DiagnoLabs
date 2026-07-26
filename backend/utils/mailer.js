const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
        user: process.env.EMAIL_USER || 'admin@diagnolabs.com', // Replace with real email if testing
        pass: process.env.EMAIL_PASS || 'dummy_password' // Replace with app password
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('\n--- MOCK EMAIL DISPATCH ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body:\n${text}`);
            console.log('---------------------------\n');
            return true;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };

        if (to.endsWith('@diagnolabs.in')) {
            console.log(`\n[DEV MODE] Skipping actual email to ${to} (Domain not yet purchased)`);
            console.log(`Subject: ${subject}\nText:\n${text}`);
            return true;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = sendEmail;
