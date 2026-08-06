const express = require('express');
const router = express.Router();
const { Payout, Refund, Invoice, Expense, FinanceAuditLog } = require('../models/Finance');
const { verifyTokenAndAdmin } = require('../middleware/auth'); // Require admin access

// GET all finance data (Dashboard View)
router.get('/dashboard', verifyTokenAndAdmin, async (req, res) => {
    try {
        const payouts = await Payout.find();
        const refunds = await Refund.find();
        const invoices = await Invoice.find();
        const expenses = await Expense.find();
        const auditLogs = await FinanceAuditLog.find().sort({ timestamp: -1 }).limit(20);

        res.status(200).json({ payouts, refunds, invoices, expenses, auditLogs });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching finance data', error: err.message });
    }
});

// POST - Seed initial data if empty (since we just removed mock data)
router.post('/seed', verifyTokenAndAdmin, async (req, res) => {
    try {
        const payoutCount = await Payout.countDocuments();
        if (payoutCount === 0) {
            await Payout.insertMany([
                { id: 'PAY-701', labName: 'Apollo Diagnostics', grossBookings: 84500, commissionPct: 20, platformFee: 16900, netPayout: 67600, cycle: 'July 2026', status: 'Pending' },
                { id: 'PAY-702', labName: 'Vijaya Diagnostic', grossBookings: 120000, commissionPct: 18, platformFee: 21600, netPayout: 98400, cycle: 'July 2026', status: 'Pending' }
            ]);
            await Refund.insertMany([
                { id: 'REF-301', patient: 'Rahul Sharma', bookingId: 'BK-8821', amount: 1450, reason: 'Patient cancelled', gatewayTxn: 'pay_N99281A', status: 'Pending' }
            ]);
            await Invoice.insertMany([
                { id: 'INV-001', entity: 'Rahul Sharma', type: 'Patient B2C', amount: 1450, gstAmount: 261, date: new Date(), status: 'Paid' }
            ]);
            await Expense.insertMany([
                { id: 'EXP-001', category: 'Salary', amount: 45000, description: 'Payroll', date: new Date() }
            ]);
            await FinanceAuditLog.insertMany([
                { id: 'AUD-001', action: 'System Init', user: 'System', details: 'Database Seeded', status: 'Success' }
            ]);
        }
        res.status(200).json({ message: "Seeded successfully" });
    } catch (err) {
        res.status(500).json({ message: "Seed failed", error: err.message });
    }
});

// PUT - Process Payout
router.put('/payout/:id/process', verifyTokenAndAdmin, async (req, res) => {
    try {
        const payout = await Payout.findOneAndUpdate(
            { id: req.params.id }, 
            { status: 'Processed' },
            { new: true }
        );
        
        // Log to Audit
        if (payout) {
            await FinanceAuditLog.create({
                id: `AUD-${Date.now()}`,
                action: 'Payout Processed',
                user: req.user.id || 'Admin',
                details: `Processed ${payout.id}`,
                amount: payout.netPayout
            });
        }
        res.status(200).json(payout);
    } catch (err) {
        res.status(500).json({ message: 'Error processing payout', error: err.message });
    }
});

// PUT - Approve Refund
router.put('/refund/:id/approve', verifyTokenAndAdmin, async (req, res) => {
    try {
        const refund = await Refund.findOneAndUpdate(
            { id: req.params.id }, 
            { status: 'Approved' },
            { new: true }
        );
        
        if (refund) {
            await FinanceAuditLog.create({
                id: `AUD-${Date.now()}`,
                action: 'Refund Approved',
                user: req.user.id || 'Admin',
                details: `Approved ${refund.id}`,
                amount: refund.amount
            });
        }
        res.status(200).json(refund);
    } catch (err) {
        res.status(500).json({ message: 'Error approving refund', error: err.message });
    }
});

module.exports = router;
