const mongoose = require('mongoose');

const masterTestSchema = new mongoose.Schema({
    testName: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Blood', 'Urine', 'Imaging', 'Cardiology'
    basePrice: { type: Number, required: true },
    fastingRequired: { type: Boolean, default: false },
    sampleType: { type: String, required: true }, // e.g., 'Serum', 'Plasma', 'Whole Blood'
    turnaroundTimeHours: { type: Number, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MasterTest', masterTestSchema);
