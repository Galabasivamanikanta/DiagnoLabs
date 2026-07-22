const router = require('express').Router();
const Booking = require('../models/Booking');
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendTransactionReceipt } = require('../services/notificationService');
let generateClinicalReport;
try {
    const reportGen = require('../utils/reportGenerator');
    generateClinicalReport = reportGen.generateClinicalReport;
} catch (err) {
    console.warn("⚠️ PDF Engine (pdfkit) not found. Clinical reports will be disabled until installed.");
}



// CREATE NEW BOOKING (Authenticated)
router.post('/', verifyToken, async (req, res) => {
    // Ensure the patient ID matches the authenticated user (unless admin)
    if (req.user.role !== 'admin' && req.body.patient !== req.user.id) {
        return res.status(403).json("You can only book for yourself!");
    }

    const newBooking = new Booking(req.body);
    try {
        const savedBooking = await newBooking.save();

        // Update User's address if provided
        if (req.body.sampleCollectionAddress && req.body.patient) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.body.patient, {
                $set: { "address.street": req.body.sampleCollectionAddress }
            });
        }

        res.status(200).json(savedBooking);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET ALL BOOKINGS (Admin only)
router.get('/all', verifyTokenAndAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('patient', 'name email phone')
            .populate('lab', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET USER'S BOOKINGS (Self or Admin)
router.get('/user/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const bookings = await Booking.find({ patient: req.params.id })
            .populate('lab')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET MY LAB'S BOOKINGS (For Lab Partner Dashboard)
router.get('/my-lab', verifyToken, async (req, res) => {
    // Basic verification: Only employees/admins can see lab bookings
    if (req.user.role === 'patient') {
        return res.status(403).json("Only staff can view lab orders");
    }
    
    try {
        // Since it's a project and the lab partner wants to view all, return all bookings
        const bookings = await Booking.find()
            .populate('patient', 'name email phone')
            .populate('lab', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// GET LAB'S BOOKINGS (For Lab Partner Dashboard)
router.get('/lab/:labId', verifyToken, async (req, res) => {
    try {
        let bookings = await Booking.find({ lab: req.params.labId })
            .populate('patient', 'name email phone address')
            .populate('lab', 'name email phone')
            .sort({ createdAt: -1 });

        // Fallback: If no lab-specific bookings found, return recent bookings populated with patient details
        if (bookings.length === 0) {
            bookings = await Booking.find()
                .populate('patient', 'name email phone address')
                .populate('lab', 'name email phone')
                .sort({ createdAt: -1 })
                .limit(20);
        }

        res.status(200).json(bookings);
    } catch (err) {
        console.error("Fetch Lab Bookings Error:", err);
        res.status(500).json(err);
    }
});

// UPDATE STATUS (Staff, Admin, or Lab Partner)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate('patient', 'name email phone address').populate('lab', 'name');

        // TRIGGER: PDF Report Generation
        if (req.body.status === 'Report Uploaded') {
            if (!generateClinicalReport) {
                console.error("❌ Cannot generate report: PDF Engine (pdfkit) is not installed.");
            } else {
                try {
                    // Populate full data for high-fidelity PDF
                    const fullBooking = await Booking.findById(req.params.id)
                        .populate('patient', 'name')
                        .populate('lab', 'name address city');
                    
                    const reportUrlPath = await generateClinicalReport(fullBooking);

                    // TRIGGER: AI CLINICAL MENTORSHIP
                    const { generateMentorNote } = require('../services/mentorService');
                    const mentorNote = await generateMentorNote(fullBooking);
                    
                    // Update booking with the new report link and mentor note
                    await Booking.findByIdAndUpdate(req.params.id, {
                        reportUrl: reportUrlPath,
                        reportUploadedAt: new Date(),
                        mentorNote: mentorNote
                    });
                    
                    console.log(`✅ PDF Report & Mentor Note Generated for Booking: ${req.params.id}`);

                } catch (pdfErr) {
                    console.error("❌ PDF Generation Error:", pdfErr);
                }
            }
        }


        // REAL-TIME NOTIFICATION
        const io = req.app.get('socketio');

        if (io && req.body.status) {
            io.to(req.params.id).emit('status_update', {
                newStatus: req.body.status,
                timestamp: new Date()
            });
        }

        res.status(200).json(updatedBooking);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// RAZORPAY: GET PUBLIC KEY
router.get('/razorpay-key', (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

// RAZORPAY: CREATE ORDER (Authenticated)
router.post('/razorpay-order', verifyToken, async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ error: "Payment configuration missing" });
        }

        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await rzp.orders.create(options);
        res.status(200).json(order);
    } catch (err) {
        console.error("Razorpay Order Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// RAZORPAY: VERIFY PAYMENT (Authenticated)
router.post('/verify-payment', verifyToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
        
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) return res.status(500).json("Payment secret missing");
        
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return res.status(400).json({ success: false, msg: 'Transaction not legitimate!' });
        }

        const booking = await Booking.findById(bookingId).populate('patient', 'name email phone');
        if (booking) {
            booking.paymentStatus = 'Paid';
            booking.razorpayOrderId = razorpay_order_id;
            booking.razorpayPaymentId = razorpay_payment_id;
            booking.razorpaySignature = razorpay_signature;
            booking.status = 'Confirmed';
            await booking.save();

            // Notify all parties via multi-channel notification engine
            try {
                // Ensure lab is populated for the notification
                const populatedBooking = await Booking.findById(bookingId).populate('patient', 'name email phone').populate('lab', 'name email phone');
                
                // Fallback for synthetic labs not in DB
                const labData = populatedBooking.lab || { name: 'DAA Network Lab', email: 'network@diagnolabs.in', phone: 'N/A' };
                
                if (populatedBooking.patient) {
                    await sendTransactionReceipt(populatedBooking, populatedBooking.patient, labData);
                }
            } catch (notifyErr) {
                console.error("Notification Engine Error:", notifyErr);
                // Non-blocking error
            }
        }

        res.status(200).json({
            success: true,
            msg: 'Payment verified successfully'
        });
    } catch (err) {
        console.error("Payment Verification Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

