const router = require('express').Router();
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendVerificationOTP, verifyOTP } = require('../services/otpService');

// REGISTER USER
router.post('/register', async (req, res) => {
    try {
        let role = 'patient';
        if (req.body.email && req.body.email.endsWith('@DiagnoLabs.ac.in')) {
            role = 'admin';
        }

        // HASH THE PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            phone: req.body.phone,
            role: role
        });
        const savedUser = await newUser.save();
        
        // Remove password from response
        const { password, ...others } = savedUser._doc;
        res.status(201).json(others);
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).json("Wrong credentials!");

        // CHECK PASSWORD
        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json("Wrong credentials!");
        }

        // GENERATE JWT TOKEN
        const accessToken = jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SEC || 'fallback_secret',
            { expiresIn: "3d" }
        );


        // Return user info (excluding password) and accessToken
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
    } catch (err) {
        res.status(500).json(err);
    }
});

// GOOGLE AUTH LOGIN
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        let user = await User.findOne({ email: email });

        if (!user) {
            // Register new Google user
            let role = 'patient';
            if (email.endsWith('@DiagnoLabs.ac.in')) {
                role = 'admin';
            }

            // For OAuth users, generate a random secure password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), salt);

            user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                phone: "Not Provided",
                role: role
            });
            await user.save();
        }

        // GENERATE JWT TOKEN
        const accessToken = jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SEC || 'fallback_secret',
            { expiresIn: "3d" }
        );



        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
    } catch (err) {
        console.error("Google Auth Error Detailed:", err);
        res.status(500).json({ 
            error: "Google Authentication Failed", 
            message: err.message
        });
    }
});

// GET ALL USERS (Admin only)
router.get('/users', verifyTokenAndAdmin, async (req, res) => {
    try {
        const query = req.query.role ? { role: req.query.role } : {};
        const users = await User.find(query).select('-password'); // Securely exclude password
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE ACCOUNT (User themselves or Admin)
router.delete('/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const userId = req.params.id;

        // 1. Delete all bookings associated with this user
        const Booking = require('../models/Booking');
        await Booking.deleteMany({ patient: userId });

        // 2. Delete the user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Account and all associated data deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json(err);
    }
});

// SEND OTP
router.post('/send-otp', async (req, res) => {
    const { phone, email } = req.body;
    try {
        const result = await sendVerificationOTP(phone, email);
        if (result.success) {
            res.status(200).json({ message: "OTP sent successfully", data: result });
        } else {
            res.status(500).json({ message: "Failed to send OTP", error: result });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
    const { phone, email, otp } = req.body;
    const identifier = phone || email;
    try {
        const result = verifyOTP(identifier, otp);
        if (result.success) {
            // Update user verification status if user exists
            const user = await User.findOneAndUpdate(
                { $or: [{ phone: phone }, { email: email }] },
                { $set: { isVerified: true } },
                { new: true }
            );
            res.status(200).json({ message: "OTP verified successfully", user });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// UPDATE USER PROFILE (User themselves or Admin)
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        // Prevent password and role update via this route
        delete updateData.password;
        delete updateData.role;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Update User Error:", err);
        res.status(500).json({ message: "Failed to update user profile", error: err.message });
    }
});

module.exports = router;

