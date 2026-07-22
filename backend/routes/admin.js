const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { verifyTokenAndAdmin } = require('../middleware/auth');

// GET ALL EMPLOYEES (Admin only)
router.get('/employees', verifyTokenAndAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'patient' } }).select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ADD NEW EMPLOYEE (Admin only)
router.post('/employees', verifyTokenAndAdmin, async (req, res) => {
    try {
        // HASH THE PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password || 'TemporaryPassword123!', salt);

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            phone: req.body.phone,
            role: req.body.role || 'employee',
            isVerified: true
        });
        const savedUser = await newUser.save();
        const { password, ...others } = savedUser._doc;
        res.status(201).json(others);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email is already registered under another account." });
        }
        res.status(500).json({ message: err.message || "Failed to create employee" });
    }
});

// UPDATE EMPLOYEE (Admin only)
router.put('/employees/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        let updateData = { ...req.body };
        
        if (req.body.password && req.body.password !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.password, salt);
        } else {
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).select('-password');
        
        res.status(200).json(updatedUser);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email is already registered under another account." });
        }
        res.status(500).json({ message: err.message || "Failed to update employee details" });
    }
});

// DELETE EMPLOYEE (Admin only)
router.delete('/employees/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Employee deleted successfully");
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- ADVANCED ADMIN MODULES ---

const AuditLog = require('../models/AuditLog');
const MasterTest = require('../models/MasterTest');

// 1. AUDIT LOGS
router.get('/audit-logs', verifyTokenAndAdmin, async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/audit-logs', verifyTokenAndAdmin, async (req, res) => {
    try {
        const newLog = new AuditLog({
            adminId: req.user.id,
            adminName: req.user.name || 'Admin',
            action: req.body.action,
            details: req.body.details,
            targetId: req.body.targetId,
            ipAddress: req.ip
        });
        await newLog.save();
        res.status(201).json(newLog);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 2. MASTER TESTS
router.get('/master-tests', verifyTokenAndAdmin, async (req, res) => {
    try {
        const tests = await MasterTest.find().sort({ testName: 1 });
        res.status(200).json(tests);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/master-tests', verifyTokenAndAdmin, async (req, res) => {
    try {
        const newTest = new MasterTest(req.body);
        const savedTest = await newTest.save();
        res.status(201).json(savedTest);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put('/master-tests/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedTest = await MasterTest.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.status(200).json(updatedTest);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/master-tests/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await MasterTest.findByIdAndDelete(req.params.id);
        res.status(200).json("Master test deleted successfully");
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. SYSTEM TELEMETRY (Mock data for dashboard)
router.get('/telemetry', verifyTokenAndAdmin, async (req, res) => {
    try {
        res.status(200).json({
            status: 'online',
            dbLatency: Math.floor(Math.random() * 50) + 10,
            activeWebSockets: Math.floor(Math.random() * 200) + 50,
            cpuUsage: Math.floor(Math.random() * 40) + 10,
            memoryUsage: Math.floor(Math.random() * 30) + 40
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// 4. BROADCAST ENGINE
router.post('/broadcast', verifyTokenAndAdmin, async (req, res) => {
    try {
        // In a real app, this would send Emails / WhatsApps via Twilio/SendGrid.
        // For now, we simulate success and log it.
        const newLog = new AuditLog({
            adminId: req.user.id,
            adminName: req.user.name || 'Admin',
            action: 'SYSTEM_BROADCAST',
            details: `Broadcast sent to ${req.body.targetAudience} - Subject: ${req.body.subject}`,
            ipAddress: req.ip
        });
        await newLog.save();
        res.status(200).json({ message: "Broadcast sent successfully!" });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;

