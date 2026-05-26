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
        res.status(500).json(err);
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
        res.status(500).json(err);
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

module.exports = router;

