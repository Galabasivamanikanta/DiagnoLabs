const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminName: {
        type: String,
        required: true
    },
    action: {
        type: String, // e.g., 'UPDATE_LAB', 'ADD_TEST', 'BROADCAST_MESSAGE'
        required: true
    },
    details: {
        type: String, // Human readable details
        required: true
    },
    targetId: {
        type: String, // Optional ID of the entity affected
    },
    ipAddress: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
