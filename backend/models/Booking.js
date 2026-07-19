const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lab: {
        type: String,
        ref: 'Lab',
        required: true
    },
    testDetails: [
        {
            testId: { type: String, ref: 'Test' },
            testName: String,
            price: Number
        }
    ],
    totalAmount: { type: Number, required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true }, // e.g., "10:00 AM - 11:00 AM"

    // STATUS TRACKING
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Sample Collected', 'Report Uploaded', 'Cancelled'],
        default: 'Pending'
    },

    // LOGISTICS
    sampleCollectionAddress: { type: String, required: true },

    // THE FINAL OUTPUT
    reportUrl: { type: String }, // Link to PDF (S3/Cloudinary)
    reportUploadedAt: { type: Date },
    mentorNote: { type: String },


    // PAYMENT LOGISTICS (Razorpay)
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
