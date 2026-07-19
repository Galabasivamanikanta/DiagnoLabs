const { sendEmail } = require('./mailService');
const { sendWhatsAppMessage } = require('./whatsappService');

/**
 * Sends a Customer ID welcome notification via Email + WhatsApp
 * when a user's Customer ID is generated for the first time.
 */
const sendCustomerIdNotification = async ({ name, email, phone, customerId }) => {
    const results = {};

    // ─── EMAIL ────────────────────────────────────────────────────────────────
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0a1e46,#0266ff);padding:36px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:1px;">DiagnoLabs</h1>
                  <p style="margin:6px 0 0;color:#a5c8ff;font-size:14px;font-weight:500;">Your Trusted Diagnostic Partner</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 20px;">
                  <h2 style="margin:0 0 8px;color:#0a1e46;font-size:20px;font-weight:800;">Hello, ${name}! 👋</h2>
                  <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px;">
                    Your unique <strong>DiagnoLabs Customer ID</strong> has been generated successfully.
                    Please save this ID — you will need it whenever you contact our support team.
                  </p>

                  <!-- ID Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:2px solid #bae6fd;border-radius:16px;margin-bottom:28px;">
                    <tr>
                      <td style="padding:24px;text-align:center;">
                        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:1px;">Your Customer ID</p>
                        <p style="margin:0;font-size:32px;font-weight:900;color:#0c4a6e;letter-spacing:4px;font-family:'Courier New',monospace;">${customerId}</p>
                      </td>
                    </tr>
                  </table>

                  <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 10px;">
                    📌 <strong>When to use this ID:</strong>
                  </p>
                  <ul style="color:#64748b;font-size:14px;line-height:1.8;padding-left:20px;margin:0 0 28px;">
                    <li>When calling or messaging our support team</li>
                    <li>When raising a query about your reports or bookings</li>
                    <li>For quick identity verification — no email needed</li>
                  </ul>

                  <p style="color:#94a3b8;font-size:13px;margin:0;">
                    You can also find your Customer ID anytime on your <strong>Profile Page</strong> and <strong>Booking History</strong> within the DiagnoLabs portal.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:12px;">
                    © ${new Date().getFullYear()} DiagnoLabs. All rights reserved.<br/>
                    This is an automated notification. Please do not reply to this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;

    const emailText = `Hello ${name},\n\nYour DiagnoLabs Customer ID has been generated: ${customerId}\n\nSave this ID — use it when contacting our support team for quick assistance.\n\nYou can view it anytime on your Profile page.\n\n© DiagnoLabs`;

    results.email = await sendEmail(
        email,
        `🎉 Your DiagnoLabs Customer ID: ${customerId}`,
        emailText,
        emailHtml
    );

    // ─── WHATSAPP / SMS ────────────────────────────────────────────────────────
    if (phone && phone !== 'Not Provided') {
        const smsText =
            `*DiagnoLabs* ✅\n\n` +
            `Hello ${name}! Your unique Customer ID has been created:\n\n` +
            `*🪪 ${customerId}*\n\n` +
            `Keep this ID handy — share it with our support team for quick assistance with any queries about your bookings or reports.\n\n` +
            `_View it anytime on your Profile page in the DiagnoLabs portal._`;

        results.whatsapp = await sendWhatsAppMessage(phone, smsText);
    }

    console.log(`[Customer ID Notification] Sent to ${email}`, results);
    return results;
};

module.exports = { sendCustomerIdNotification };
