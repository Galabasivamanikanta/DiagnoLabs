const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/auth');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

// File Filter for security
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf, .jpg, .jpeg and .png files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// UPLOAD ENDPOINT (Authenticated)
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded or file type not allowed" });
        }

        const bookingId = req.body.bookingId;
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // Update the Booking Status and Report URL
        if (bookingId) {
            await Booking.findByIdAndUpdate(bookingId, {
                status: 'Report Uploaded',
                reportUrl: fileUrl,
                reportUploadedAt: new Date()
            });
        }

        res.status(200).json({
            message: 'File uploaded successfully',
            url: fileUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
});

module.exports = router;

