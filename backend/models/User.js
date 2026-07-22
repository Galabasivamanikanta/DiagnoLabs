const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    phone: { type: String, required: true },
    customerId: { type: String, unique: true, sparse: true },
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
    dob: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''], default: '' },
    emergencyContact: { type: String, default: '' },
    profilePic: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

// AUTO-HASH PASSWORD BEFORE SAVING
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// SECURE: NEVER RETURN PASSWORD IN JSON
userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);

