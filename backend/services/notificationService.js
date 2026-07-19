/**
 * Simulated Notification Service for DiagnoLabs
 * In a production environment, this would integrate with Twilio, SendGrid, Gupshup, etc.
 */

const sendTransactionReceipt = async (booking, patient, lab) => {
    console.log('\n======================================================');
    console.log(`🚀 INITIATING MULTI-CHANNEL NOTIFICATIONS FOR BOOKING: ${booking._id}`);
    console.log('======================================================\n');

    const transactionId = booking.razorpayPaymentId || "N/A";
    const amount = booking.totalAmount;
    const testNames = booking.testDetails.map(t => t.testName).join(', ');

    // 1. Patient Notification
    const patientMsg = `
Hi ${patient.name},
Your booking for ${testNames} at ${lab.name} is confirmed!
Transaction ID: ${transactionId}
Amount Paid: ₹${amount}
View your detailed receipt and test instructions in your DiagnoLabs Dashboard.
Thank you for choosing DiagnoLabs!`;

    console.log(`[SMS - PATIENT] Sending to ${patient.phone || 'Patient Phone'}...`);
    console.log(`[WHATSAPP - PATIENT] Sending to ${patient.phone || 'Patient WhatsApp'}...`);
    console.log(`[EMAIL - PATIENT] Sending receipt PDF to ${patient.email}...`);
    console.log(`Message Content: ${patientMsg}\n`);

    // 2. Lab Notification
    const labMsg = `
NEW BOOKING ALERT
Patient: ${patient.name}
Test(s): ${testNames}
Booking ID: ${booking._id}
Amount: ₹${amount} (Paid online via Razorpay)
Please prepare for sample collection at: ${booking.sampleCollectionAddress}`;

    console.log(`[EMAIL - LAB] Sending alert to ${lab.email || 'Lab Partner Email'}...`);
    console.log(`[SMS - LAB] Sending to Lab Manager...`);
    console.log(`Message Content: ${labMsg}\n`);

    // 3. Admin Notification
    const adminMsg = `
DiagnoLabs Transaction Alert:
A new transaction of ₹${amount} was completed successfully.
Booking ID: ${booking._id}
Transaction ID: ${transactionId}
Patient: ${patient.email}
Lab: ${lab.name}`;

    console.log(`[EMAIL - ADMIN] Sending transaction log to admin@diagnolabs.in...`);
    console.log(`Message Content: ${adminMsg}\n`);

    console.log('✅ ALL NOTIFICATIONS DISPATCHED SUCCESSFULLY\n');
    return true;
};

module.exports = {
    sendTransactionReceipt
};
