const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    labName: { type: String, required: true },
    grossBookings: { type: Number, required: true },
    commissionPct: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    netPayout: { type: Number, required: true },
    cycle: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Processed'], default: 'Pending' }
}, { timestamps: true });

const refundSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    patient: { type: String, required: true },
    bookingId: { type: String, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    gatewayTxn: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

const invoiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    entity: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Issued', 'Paid', 'Overdue'], default: 'Issued' }
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true }
}, { timestamps: true });

const auditLogSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    action: { type: String, required: true },
    user: { type: String, required: true },
    details: { type: String, required: true },
    amount: { type: Number },
    status: { type: String, default: 'Success' }
});

module.exports = {
    Payout: mongoose.model('Payout', payoutSchema),
    Refund: mongoose.model('Refund', refundSchema),
    Invoice: mongoose.model('Invoice', invoiceSchema),
    Expense: mongoose.model('Expense', expenseSchema),
    AuditLog: mongoose.model('AuditLog', auditLogSchema)
};
