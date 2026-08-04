const nodemailer = require('nodemailer');
const dns = require('dns');

// Configure Google Public DNS for reliable IPv4 resolution on Cloud Containers
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
    }
} catch (e) {
    console.warn("DNS Server override notice:", e.message);
}

// Dynamically resolve Gmail SMTP IPv4 address to bypass Cloud IPv6 routing errors
const getGmailIpv4Host = () => {
    return new Promise((resolve) => {
        dns.resolve4('smtp.gmail.com', (err, addresses) => {
            if (!err && addresses && addresses.length > 0) {
                resolve(addresses[0]);
            } else {
                resolve('192.178.211.108'); // High-availability Gmail IPv4 fallback
            }
        });
    });
};






const getDiagnoLabsEmailTemplate = ({ title, recipientName, messageHtml, bookingDetails, actionUrl, actionText }) => {
    const primaryColor = "#0284c7";
    const darkBlue = "#0369a1";
    const tealColor = "#0f766e";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title || 'DiagnoLabs Clinical Notification'}</title>
        <style>
            body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
            .email-wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(2, 132, 199, 0.1); border: 1px solid #e2e8f0; }
            .email-header { background: linear-gradient(135deg, ${primaryColor} 0%, ${darkBlue} 60%, ${tealColor} 100%); padding: 32px; text-align: center; color: #ffffff; }
            .brand-title { font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
            .brand-subtitle { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #e0f2fe; margin-top: 4px; }
            .email-body { padding: 36px 32px; }
            .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; }
            .content-text { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px; }
            .details-box { background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 14px; padding: 20px; margin: 24px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px border-dashed #e0f2fe; font-size: 14px; }
            .details-row:last-child { border-bottom: none; }
            .details-label { color: #64748b; font-weight: 600; }
            .details-val { color: #0f172a; font-weight: 800; }
            .btn-action { display: inline-block; background: ${primaryColor}; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 15px; box-shadow: 0 8px 16px rgba(2, 132, 199, 0.3); transition: all 0.2s; }
            .email-footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            .footer-links { margin-top: 12px; }
            .footer-links a { color: ${primaryColor}; text-decoration: none; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-header">
                <div class="brand-title">🧪 DiagnoLabs</div>
                <div class="brand-subtitle">NABL Accredited Clinical Pathology Network</div>
            </div>
            <div class="email-body">
                <h3 class="greeting">Hello ${recipientName || 'Valued Patient'}, 👋</h3>
                <div class="content-text">
                    ${messageHtml}
                </div>

                ${bookingDetails ? `
                <div class="details-box">
                    <div style="font-weight: 800; color: ${darkBlue}; margin-bottom: 12px; font-size: 15px;">📋 Clinical Booking Receipt Summary</div>
                    ${bookingDetails.bookingId ? `<div class="details-row"><span class="details-label">Booking ID:</span><span class="details-val">${bookingDetails.bookingId}</span></div>` : ''}
                    ${bookingDetails.testName ? `<div class="details-row"><span class="details-label">Test(s):</span><span class="details-val">${bookingDetails.testName}</span></div>` : ''}
                    ${bookingDetails.labName ? `<div class="details-row"><span class="details-label">Diagnostic Center:</span><span class="details-val">${bookingDetails.labName}</span></div>` : ''}
                    ${bookingDetails.amount ? `<div class="details-row"><span class="details-label">Amount Paid:</span><span class="details-val" style="color: #10b981;">₹${bookingDetails.amount} (Paid Online)</span></div>` : ''}
                    ${bookingDetails.transactionId ? `<div class="details-row"><span class="details-label">Transaction ID:</span><span class="details-val">${bookingDetails.transactionId}</span></div>` : ''}
                </div>
                ` : ''}

                ${actionUrl ? `
                <div style="text-align: center; margin: 30px 0 10px 0;">
                    <a href="${actionUrl}" class="btn-action">${actionText || 'Open Patient Dashboard'}</a>
                </div>
                ` : ''}
            </div>
            <div class="email-footer">
                <div>© 2026 DiagnoLabs Diagnostic Services Ltd. All Rights Reserved.</div>
                <div>AWS ap-south-1 Mumbai Cloud Node | ISO 15189:2022 Certified</div>
                <div class="footer-links">
                    <a href="https://diagnolabs.vercel.app">Patient Portal</a> • 
                    <a href="mailto:admin@diagnolabs.in">Support Center</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const sendEmail = async (to, subject, text, html) => {
    try {
        const axios = require('axios');
        const emailContent = html || getDiagnoLabsEmailTemplate({ title: subject, messageHtml: `<p>${text}</p>` });

        // 1. Resend HTTPS API (Port 443 - Unblockable on Render)
        if (process.env.RESEND_API_KEY) {
            console.log('🚀 Sending Email via Resend HTTPS API (Port 443)...');
            const resendRes = await axios.post('https://api.resend.com/emails', {
                from: 'DiagnoLabs Diagnostics <onboarding@resend.dev>',
                to: [to],
                subject: subject,
                html: emailContent
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Resend HTTPS Email sent successfully:', resendRes.data.id);
            return { success: true, messageId: resendRes.data.id };
        }

        // 2. Brevo (Sendinblue) HTTPS API (Port 443 - 300 free emails/day)
        if (process.env.BREVO_API_KEY) {
            console.log('🚀 Sending Email via Brevo HTTPS API (Port 443)...');
            const brevoRes = await axios.post('https://api.brevo.com/v3/smtp/email', {
                sender: { name: 'DiagnoLabs Diagnostics', email: (process.env.EMAIL_USER || 'diagnolabs.official@gmail.com').trim() },
                to: [{ email: to }],
                subject: subject,
                htmlContent: emailContent
            }, {
                headers: {
                    'api-key': process.env.BREVO_API_KEY.trim(),
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Brevo HTTPS Email sent successfully:', brevoRes.data.messageId);
            return { success: true, messageId: brevoRes.data.messageId };
        }

        // 3. Nodemailer SMTP Fallback
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn(`[MAIL WARNING] EMAIL_USER or EMAIL_PASS is not set in environment variables. Email to ${to} skipped.`);
            return { success: false, error: "EMAIL_USER or EMAIL_PASS environment variable is not configured on the backend server." };
        }

        const gmailIp = await getGmailIpv4Host();

        const transporter = nodemailer.createTransport({
            host: gmailIp,
            port: 587,
            secure: false, // STARTTLS
            auth: {
                user: (process.env.EMAIL_USER || '').trim(),
                pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, '')
            },
            tls: {
                servername: 'smtp.gmail.com',
                rejectUnauthorized: false
            },
            connectionTimeout: 12000,
            greetingTimeout: 12000,
            socketTimeout: 12000
        });

        const mailOptions = {
            from: `"DiagnoLabs Diagnostics" <${process.env.EMAIL_USER.trim()}>`,
            to,
            subject,
            text,
            html: emailContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ DiagnoLabs HTML Email sent successfully to:', to, info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};





module.exports = { sendEmail, getDiagnoLabsEmailTemplate };

