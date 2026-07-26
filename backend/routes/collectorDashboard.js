const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────
// GET /api/collector-dashboard/assignments
// Fetch all pending/confirmed bookings assigned for sample collection
// Access: phlebotomist / admin / employee roles
// ─────────────────────────────────────────────────────────────
router.get('/assignments', verifyToken, async (req, res) => {
    try {
        const allowedRoles = ['admin', 'phlebotomist', 'employee', 'nurse', 'lab_partner'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Only sample collectors can access this.' });
        }

        const bookings = await Booking.find({
            status: { $in: ['Pending', 'Confirmed', 'Out for Collection', 'Sample Collected', 'Sample Processing'] }
        })
        .populate('patient', 'name phone email address')
        .sort({ appointmentDate: 1, createdAt: -1 })
        .limit(100);

        res.status(200).json(bookings);
    } catch (err) {
        console.error('[COLLECTOR] Failed to fetch assignments:', err.message);
        res.status(500).json({ message: 'Failed to fetch assignments', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/collector-dashboard/stats
// Summary stats for the collector's dashboard
// ─────────────────────────────────────────────────────────────
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const allowedRoles = ['admin', 'phlebotomist', 'employee', 'nurse', 'lab_partner'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const [pending, confirmed, collected, processing] = await Promise.all([
            Booking.countDocuments({ status: 'Pending' }),
            Booking.countDocuments({ status: 'Confirmed' }),
            Booking.countDocuments({ status: 'Sample Collected' }),
            Booking.countDocuments({ status: 'Sample Processing' }),
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCollections = await Booking.countDocuments({
            status: 'Sample Collected',
            updatedAt: { $gte: today }
        });

        res.status(200).json({ pending, confirmed, collected, processing, todayCollections });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/collector-dashboard/collect/:bookingId
// Mark booking as "Sample Collected" — main action for collector
// ─────────────────────────────────────────────────────────────
router.put('/collect/:bookingId', verifyToken, async (req, res) => {
    try {
        const allowedRoles = ['admin', 'phlebotomist', 'employee', 'nurse', 'lab_partner'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { collectorNote } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            {
                status: 'Sample Collected',
                mentorNote: collectorNote || `Sample collected by ${req.user.name || 'Collector'} on ${new Date().toLocaleDateString('en-IN')}`,
            },
            { new: true }
        ).populate('patient', 'name phone email');

        if (!booking) return res.status(404).json({ message: 'Booking not found.' });

        console.log(`[COLLECTOR] Sample collected for booking ${booking._id} by ${req.user.name}`);
        res.status(200).json({ message: 'Sample marked as collected!', booking });
    } catch (err) {
        console.error('[COLLECTOR] Failed to update collection status:', err.message);
        res.status(500).json({ message: 'Failed to update status', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/collector-dashboard/status/:bookingId
// General status update by collector
// ─────────────────────────────────────────────────────────────
router.put('/status/:bookingId', verifyToken, async (req, res) => {
    try {
        const allowedRoles = ['admin', 'phlebotomist', 'employee', 'nurse', 'lab_partner'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { status, collectorNote } = req.body;
        const validStatuses = ['Confirmed', 'Out for Collection', 'Sample Collected', 'Sample Processing'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Allowed: ' + validStatuses.join(', ') });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            { status, ...(collectorNote && { mentorNote: collectorNote }) },
            { new: true }
        ).populate('patient', 'name phone email');

        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        res.status(200).json({ message: 'Status updated!', booking });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update status', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/collector-dashboard/payment/:bookingId
// Collect Cash/UPI
// ─────────────────────────────────────────────────────────────
router.put('/payment/:bookingId', verifyToken, async (req, res) => {
    try {
        const { paymentMethod } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            { paymentStatus: 'Paid', paymentMethod: paymentMethod || 'Cash' },
            { new: true }
        );
        res.status(200).json({ message: 'Payment collected successfully!', booking });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update payment', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/collector-dashboard/barcode/:bookingId
// Save Barcode
// ─────────────────────────────────────────────────────────────
router.put('/barcode/:bookingId', verifyToken, async (req, res) => {
    try {
        const { barcode } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            { vialBarcode: barcode },
            { new: true }
        );
        res.status(200).json({ message: 'Barcode saved!', booking });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save barcode', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/collector-dashboard/proof/:bookingId
// Save Collection Proof URL (Image)
// ─────────────────────────────────────────────────────────────
router.put('/proof/:bookingId', verifyToken, async (req, res) => {
    try {
        const { proofUrl } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            { collectionProofUrl: proofUrl },
            { new: true }
        );
        res.status(200).json({ message: 'Proof uploaded!', booking });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save proof', error: err.message });
    }
});

module.exports = router;
