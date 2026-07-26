const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Ticket = require('../models/Ticket');
const PromoCode = require('../models/PromoCode');

// Middleware to ensure staff access
const staffAuth = [verifyToken, (req, res, next) => {
    const validRoles = ['admin', 'employee', 'doctor', 'receptionist', 'inventory_manager', 'finance_manager', 'marketing_head', 'support_staff', 'delivery_partner', 'quality_auditor', 'it_specialist', 'lab_partner', 'phlebotomist', 'nurse'];
    if (!validRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access Denied. Staff only." });
    }
    next();
}];

// GET STAFF DASHBOARD STATS
router.get('/dashboard-stats', ...staffAuth, async (req, res) => {
    try {
        const role = req.user.role;
        const stats = { role: role };

        if (role === 'doctor') {
            stats.pendingReviews = await Booking.countDocuments({ status: 'Report Uploaded', qualityStatus: 'Approved' });
            stats.completedConsultations = await Booking.countDocuments({ doctorNotes: { $exists: true, $ne: "" } });
        } else if (role === 'receptionist') {
            stats.todayAppointments = await Booking.countDocuments({ appointmentDate: { $gte: new Date().setHours(0,0,0,0) } });
            stats.pendingPayments = await Booking.countDocuments({ paymentStatus: 'Pending' });
        } else if (role === 'inventory_manager') {
            stats.lowStockItems = await Inventory.countDocuments({ $expr: { $lte: ["$quantity", "$minimumStockLevel"] } });
            stats.totalItems = await Inventory.countDocuments();
        } else if (role === 'finance_manager') {
            const revenue = await Booking.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
            stats.totalRevenue = revenue[0] ? revenue[0].total : 0;
            stats.pendingCollections = await Booking.countDocuments({ paymentStatus: 'Pending' });
        } else if (role === 'marketing_head') {
            stats.activePromos = await PromoCode.countDocuments({ isActive: true });
            stats.totalUsers = await User.countDocuments({ role: 'patient' });
        } else if (role === 'support_staff') {
            stats.openTickets = await Ticket.countDocuments({ status: 'Open' });
            stats.resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
        } else if (role === 'delivery_partner') {
            stats.pendingPickups = await Booking.countDocuments({ status: 'Sample Collected', deliveryPartnerId: null });
            stats.myDeliveries = await Booking.countDocuments({ deliveryPartnerId: req.user.id });
        } else if (role === 'quality_auditor') {
            stats.pendingAudits = await Booking.countDocuments({ status: 'Report Uploaded', qualityStatus: 'Pending' });
            stats.approvedReports = await Booking.countDocuments({ qualityApprovedBy: req.user.id });
        } else if (role === 'it_specialist') {
            stats.activeSessions = await User.countDocuments({ isVerified: true });
            stats.systemErrors = 0; // Dummy
        }

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// DOCTOR ROUTES
router.get('/doctor/patients', ...staffAuth, async (req, res) => {
    try {
        const bookings = await Booking.find({ status: { $in: ['Report Uploaded', 'Completed'] }, qualityStatus: 'Approved' }).populate('patient', 'name email phone').populate('lab', 'name').sort({ appointmentDate: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.post('/doctor/note/:bookingId', ...staffAuth, async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.bookingId, { doctorNotes: req.body.notes });
        res.json({ success: true });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// RECEPTION ROUTES
router.get('/reception/bookings', ...staffAuth, async (req, res) => {
    try {
        const bookings = await Booking.find().populate('patient', 'name phone').sort({ appointmentDate: -1 }).limit(50);
        res.json(bookings);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// INVENTORY ROUTES
router.get('/inventory/items', ...staffAuth, async (req, res) => {
    try {
        const items = await Inventory.find().sort({ quantity: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.post('/inventory/items', ...staffAuth, async (req, res) => {
    try {
        const newItem = new Inventory({ ...req.body, lastUpdatedBy: req.user.id });
        await newItem.save();
        res.json(newItem);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// SUPPORT ROUTES
router.get('/support/tickets', ...staffAuth, async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('userId', 'name').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// QUALITY CONTROL ROUTES
router.get('/quality/pending', ...staffAuth, async (req, res) => {
    try {
        const reports = await Booking.find({ status: 'Report Uploaded', qualityStatus: 'Pending' }).populate('patient', 'name');
        res.json(reports);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.post('/quality/approve/:bookingId', ...staffAuth, async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.bookingId, { qualityStatus: 'Approved', qualityApprovedBy: req.user.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// MARKETING ROUTES
router.get('/marketing/promos', ...staffAuth, async (req, res) => {
    try {
        const promos = await PromoCode.find().sort({ createdAt: -1 });
        res.json(promos);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
