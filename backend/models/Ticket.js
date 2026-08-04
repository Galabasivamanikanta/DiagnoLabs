const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'Patient / User' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    assignedRole: { 
        type: String, 
        enum: ['finance_manager', 'it_specialist', 'support_staff', 'quality_auditor', 'delivery_partner', 'inventory_manager', 'admin', 'employee', 'doctor', 'phlebotomist'],
        default: 'support_staff' 
    },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'High' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
