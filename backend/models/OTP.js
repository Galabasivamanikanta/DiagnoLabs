const mongoose = require('mongoose');

// MongoDB-backed OTP storage so OTPs survive server restarts
const otpSchema = new mongoose.Schema({
    identifier: { type: String, required: true, unique: true }, // email or phone
    otp:        { type: String, required: true },
    expiry:     { type: Date,   required: true },
    lastSent:   { type: Date,   required: true },
});

// Auto-delete expired OTPs via MongoDB TTL index
otpSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
