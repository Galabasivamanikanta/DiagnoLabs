const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    phone: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: {
        type: String,
        enum: [
            'patient', 
            'admin', 
            'lab_partner', 
            'employee',
            'doctor', 
            'phlebotomist', 
            'nurse', 
            'receptionist', 
            'inventory_manager', 
            'finance_manager', 
            'marketing_head', 
            'support_staff', 
            'delivery_partner', 
            'quality_auditor', 
            'it_specialist'
        ],
        default: 'patient'
    },
    address: {
        street: String,
        city: String,
        pincode: String,
        coordinates: { 
            lat: Number,
            lng: Number
        }
    },
    createdAt: { type: Date, default: Date.now }
});

// AUTO-HASH PASSWORD BEFORE SAVING
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// SECURE: NEVER RETURN PASSWORD IN JSON
userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);

