const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    testName: { type: String, required: true }, // e.g., "Thyroid Profile"
    price: { type: Number, required: true }, // e.g., 500
    discountedPrice: { type: Number }, // e.g., 450
    category: { type: String }, // e.g., "Blood", "Urine", "Scan"
    description: { type: String }, // e.g., "Fasting Required"
    turnaroundTime: { type: String }, // e.g., "24 Hours"

    // RELATIONSHIP: Which lab offers this test?
    lab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: true
    }
});

module.exports = mongoose.model('Test', testSchema);
