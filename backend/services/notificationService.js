const { sendEmail, getDiagnoLabsEmailTemplate } = require('./mailService');

const sendTransactionReceipt = async (booking, patient, lab) => {
    console.log('\n======================================================');
    console.log(`🚀 INITIATING MULTI-CHANNEL NOTIFICATIONS FOR BOOKING: ${booking._id}`);
    console.log('======================================================\n');

    const transactionId = booking.razorpayPaymentId || "N/A";
    const amount = booking.totalAmount;
    const testNames = booking.testDetails.map(t => t.testName).join(', ');
    const bookingCode = `DH-${booking._id.toString().slice(-8).toUpperCase()}`;

    // 1. Patient Notification (HTML Email)
    if (patient.email) {
        const patientHtml = getDiagnoLabsEmailTemplate({
            title: `Booking Confirmed (${bookingCode}) - DiagnoLabs`,
            recipientName: patient.name,
            messageHtml: `<p>Your diagnostic test booking has been <strong>successfully confirmed</strong>!</p><p>Our certified phlebotomist team is preparing your sample collection. Please ensure you are available at your registered collection address on your appointment date.</p>`,
            bookingDetails: {
                bookingId: bookingCode,
                testName: testNames,
                labName: lab.name || 'DiagnoLabs Clinical Partner',
                amount: amount,
                transactionId: transactionId
            },
            actionUrl: 'https://diagnolabs.vercel.app/bookings',
            actionText: 'View My Booking & Instructions'
        });

        await sendEmail(patient.email, `✅ Booking Confirmed [${bookingCode}] - DiagnoLabs`, `Your booking for ${testNames} is confirmed! Amount: ₹${amount}`, patientHtml);
    }

    // 2. Lab Partner Notification (HTML Email)
    if (lab.email) {
        const labHtml = getDiagnoLabsEmailTemplate({
            title: `New Sample Collection Order (${bookingCode})`,
            recipientName: lab.name || 'Lab Manager',
            messageHtml: `<p>A new diagnostic booking has been dispatched to your center. Please assign a certified phlebotomist for sample collection.</p>`,
            bookingDetails: {
                bookingId: bookingCode,
                testName: testNames,
                labName: patient.name,
                amount: amount,
                transactionId: transactionId
            },
            actionUrl: 'https://diagnolabs.vercel.app/partner/dashboard',
            actionText: 'Open Lab Partner Console'
        });

        await sendEmail(lab.email, `🔬 New Order Assigned [${bookingCode}] - DiagnoLabs`, `New booking for ${testNames} by ${patient.name}`, labHtml);
    }

    console.log('✅ ALL DIAGNOLABS HTML EMAIL NOTIFICATIONS DISPATCHED SUCCESSFULLY\n');
    return true;
};

module.exports = {
    sendTransactionReceipt
};

