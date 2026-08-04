const router = require('express').Router();
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('../middleware/auth');
const { sendCustomerIdNotification } = require('../services/customerIdNotification');
const { sendEmail } = require('../services/mailService');
const rateLimit = require('express-rate-limit');

// Strict Auth Limiter: Max 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
    standardHeaders: true, 
    legacyHeaders: false, 
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendVerificationOTP, verifyOTP, clearOTP } = require('../services/otpService');


const generateId = () => {
    return `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
};

const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
};

// REGISTER (Only Patients)
router.post('/register', authLimiter, async (req, res) => {
    try {
        let role = 'patient';
        if (req.body.email && req.body.email.endsWith('@DiagnoLabs.ac.in')) {
            role = 'admin';
        }

        // PASSWORD WILL BE HASHED BY MONGOOSE PRE-SAVE HOOK

        // GENERATE UNIQUE CUSTOMER ID: DL-[YEAR][MONTH]-[2 CHARS]
        // Pattern: DL-202607-Ab  (Reg Year + Reg Month + 2 random characters)
        const generateCustomerId = async () => {
            const now = new Date();
            const year = now.getFullYear().toString();          // e.g. 2026
            const month = String(now.getMonth() + 1).padStart(2, '0'); // e.g. 07
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()';
            let id, existing;
            do {
                const rnd = chars.charAt(Math.floor(Math.random() * chars.length))
                           + chars.charAt(Math.floor(Math.random() * chars.length));
                id = `DL-${year}${month}-${rnd}`;
                existing = await User.findOne({ customerId: id });
            } while (existing);
            return id;
        };
        const customerId = await generateCustomerId();

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password, // Pre-save hook hashes this
            phone: req.body.phone,
            role: role,
            customerId,
            isVerified: true
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

// LOGIN (Patient & Admin via MongoDB)
router.post('/login', authLimiter, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).json("Wrong credentials!");

        // Staff are no longer blocked from regular login to support double-roles (Patient + Staff)

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

            // GENERATE UNIQUE CUSTOMER ID: DL-[YEAR][MONTH]-[2 CHARS]
            const genId = async () => {
                const now = new Date();
                const year = now.getFullYear().toString();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()';
                let id, existing;
                do {
                    const rnd = chars.charAt(Math.floor(Math.random() * chars.length))
                               + chars.charAt(Math.floor(Math.random() * chars.length));
                    id = `DL-${year}${month}-${rnd}`;
                    existing = await User.findOne({ customerId: id });
                } while (existing);
                return id;
            };
            const customerId = await genId();

            user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                phone: "Not Provided",
                role: role,
                customerId
            });
            await user.save();
        } else if (!user.customerId) {
            // Backfill: generate new-style ID for existing users who don't have one
            const now = new Date();
            const year = now.getFullYear().toString();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()';
            let customerId, existing;
            do {
                const rnd = chars.charAt(Math.floor(Math.random() * chars.length))
                           + chars.charAt(Math.floor(Math.random() * chars.length));
                customerId = `DL-${year}${month}-${rnd}`;
                existing = await User.findOne({ customerId });
            } while (existing);
            user.customerId = customerId;
            await user.save();
        }

        // Staff are no longer blocked from Patient Google Login to support double-roles

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

// CUSTOMER ID LOOKUP (Admin only) — find full user + bookings by customerId
router.get('/lookup/:customerId', verifyTokenAndAdmin, async (req, res) => {
    try {
        const { customerId } = req.params;
        console.log(`[LOOKUP] Request received for customerId: ${customerId}`);
        const user = await User.findOne({ customerId: new RegExp(`^${customerId}$`, 'i') }).select('-password');
        console.log(`[LOOKUP] Found user:`, user ? user.name : 'Not Found');
        if (!user) {
            return res.status(404).json({ message: `No customer found with ID: ${customerId}` });
        }
        const Booking = require('../models/Booking');
        const bookings = await Booking.find({ patient: user._id })
            .populate('lab', 'name city')
            .sort({ createdAt: -1 });
        res.status(200).json({ user, bookings });
    } catch (err) {
        console.error('Customer Lookup Error:', err);
        res.status(500).json({ message: 'Lookup failed', error: err.message });
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

        // Clear any active OTP records for deleted user so re-adding works instantly
        const { clearOTP } = require('../services/otpService');
        if (deletedUser.email) clearOTP(deletedUser.email);
        if (deletedUser.phone) clearOTP(deletedUser.phone);

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
            res.status(400).json({ message: result.message || "Failed to send OTP", error: result });
        }
    } catch (err) {
        res.status(500).json({ message: err.message || "Failed to send verification OTP" });
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

        // (Removed DOB-based Customer ID generation)

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



// ==========================================
// ADMIN PROVISIONING & LOGIN (MISSION SECRET)
// ==========================================

// REGISTER ADMIN / STAFF (Restricted to authenticated Admins only)
router.post('/admin-register', verifyTokenAndAdmin, authLimiter, async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;
        
        let employeeId = generateId();
        let idExists = await User.findOne({ employeeId });
        while (idExists) {
            employeeId = generateId();
            idExists = await User.findOne({ employeeId });
        }

        const tempPassword = generatePassword();

        let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            if (existingUser.role !== 'patient') {
                return res.status(400).json({ 
                    message: "This email or phone number is already assigned to another Staff member."
                });
            }
            
            // Upgrade existing Patient account to Staff account
            existingUser.name = name || existingUser.name;
            existingUser.email = email;
            existingUser.phone = phone || existingUser.phone;
            existingUser.role = role;
            existingUser.employeeId = employeeId;
            existingUser.password = tempPassword;
            existingUser.isVerified = true;
            existingUser.isFirstLogin = true;

            await existingUser.save();
        } else {
            // If not existing, create a new User document
            const newUser = new User({
                name,
                email,
                phone,
                role,
                employeeId,
                password: tempPassword,
                isVerified: true,
                isFirstLogin: true
            });

            await newUser.save();
        }

        clearOTP(email);
        clearOTP(phone);

        const frontendUrl = process.env.FRONTEND_URL || 'https://diagnolabs-platform.vercel.app';
        const emailText = `Hello ${name},\n\nWelcome to the DiagnoLabs Team!\n\nYour account has been successfully provisioned. Please use the following credentials to access the internal staff portal.\n\nLogin Portal: ${frontendUrl}/adminlogin\nEmployee ID: ${employeeId}\nTemporary Password: ${tempPassword}\n\nYou will be required to change your password upon your first login.\n\nBest Regards,\nDiagnoLabs Admin`;
        
        const emailHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-bottom: 4px solid #0a1e46;">
            <img src="https://diagnolabs-platform.vercel.app/email-logo.png" alt="DiagnoLabs Logo" style="height: 60px; width: auto;" />
          </div>
              <div style="padding: 32px 24px; background-color: #ffffff; color: #1e293b;">
                <h2 style="margin-top: 0; color: #0a1e46; font-size: 20px;">Welcome to the Team, ${name}!</h2>
                <p style="font-size: 16px; line-height: 1.5; color: #475569;">Your account has been successfully provisioned. Please use the credentials below to access the internal staff portal.</p>
                <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 24px 0;">
                  <p style="margin: 0 0 12px 0; font-size: 15px;"><strong>Employee ID:</strong> <span style="color: #0f172a; font-family: monospace; font-size: 16px;">${employeeId}</span></p>
                  <p style="margin: 0; font-size: 15px;"><strong>Temporary Password:</strong> <span style="color: #0f172a; font-family: monospace; font-size: 16px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
                </div>
                <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;"><em>* You will be required to change your password upon your first login.</em></p>
                <div style="text-align: center;">
                  <a href="${frontendUrl}/adminlogin" style="display: inline-block; background-color: #0a1e46; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px;">Login to Portal</a>
                </div>
              </div>
              <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} DiagnoLabs. All rights reserved.<br>
                This is an automated message, please do not reply.
              </div>
            </div>`;

            await sendEmail(email, 'Welcome to DiagnoLabs - Your Access Credentials', emailText, emailHtml);

            return res.status(200).json({ message: "Staff provisioned successfully", employeeId });
        }

        const newUser = new User({
            name,
            email,
            password: tempPassword,
            phone,
            role,
            employeeId,
            isFirstLogin: true,
            isVerified: true
        });

        const savedUser = await newUser.save();

        // Clear OTP store after successful registration
        clearOTP(email);
        clearOTP(phone);

        // Send Email
        const frontendUrl = process.env.FRONTEND_URL || 'https://diagnolabs-platform.vercel.app';
        const emailText = `Hello ${name},\n\nWelcome to the DiagnoLabs Team!\n\nYour account has been successfully provisioned. Please use the following credentials to access the internal staff portal.\n\nLogin Portal: ${frontendUrl}/adminlogin\nEmployee ID: ${employeeId}\nTemporary Password: ${tempPassword}\n\nYou will be required to change your password upon your first login.\n\nBest Regards,\nDiagnoLabs Admin`;
        
        const emailHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-bottom: 4px solid #0a1e46;">
            <img src="https://diagnolabs-platform.vercel.app/email-logo.png" alt="DiagnoLabs Logo" style="max-height: 55px; width: auto;" />
          </div>
          <div style="padding: 32px 24px; background-color: #ffffff; color: #1e293b;">
            <h2 style="margin-top: 0; color: #0a1e46; font-size: 20px;">Welcome to the Team, ${name}!</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #475569;">Your account has been successfully provisioned. Please use the credentials below to access the internal staff portal.</p>
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 12px 0; font-size: 15px;"><strong>Employee ID:</strong> <span style="color: #0f172a; font-family: monospace; font-size: 16px;">${employeeId}</span></p>
              <p style="margin: 0; font-size: 15px;"><strong>Temporary Password:</strong> <span style="color: #0f172a; font-family: monospace; font-size: 16px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
            </div>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;"><em>* You will be required to change your password upon your first login.</em></p>
            <div style="text-align: center;">
              <a href="${frontendUrl}/adminlogin" style="display: inline-block; background-color: #0a1e46; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px;">Login to Portal</a>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
            &copy; ${new Date().getFullYear()} DiagnoLabs. All rights reserved.<br>
            This is an automated message, please do not reply.
          </div>
        </div>`;
        
        await sendEmail(email, 'Welcome to DiagnoLabs - Your Access Credentials', emailText, emailHtml);

        res.status(201).json({ message: "Staff provisioned successfully", employeeId });
    } catch (err) {
        console.error("Admin Register Error:", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'credential';
            return res.status(400).json({ message: `An account with this ${field} already exists in the system.` });
        }
        res.status(500).json({ message: err.message || "Error saving employee details" });
    }
});



// STAFF / ADMIN LOGIN (PostgreSQL admins table + MongoDB Hybrid Engine)
router.post('/admin-login', authLimiter, async (req, res) => {
    try {
        const { employeeId, password } = req.body;
        
        if (!employeeId || !password) return res.status(400).json({ message: "Missing credentials." });

        const cleanEmployeeId = employeeId.trim().toUpperCase();
        let userObj = null;

        // 1. Query PostgreSQL 'admins' Table First (Ultra-Fast 10ms Authentication)
        try {
            const { pool } = require('../services/pgService');
            const pgResult = await pool.query(
                'SELECT * FROM admins WHERE UPPER(TRIM(employee_id)) = $1 OR UPPER(TRIM(email)) = $2',
                [cleanEmployeeId, cleanEmployeeId]
            );
            console.log(`[ADMIN-LOGIN PG] Queried admins table for ${cleanEmployeeId}, found ${pgResult.rows.length} rows`);
            if (pgResult.rows.length > 0) {
                const pgUser = pgResult.rows[0];
                userObj = {
                    _id: `pg_admin_${pgUser.id}`,
                    employeeId: pgUser.employee_id,
                    email: pgUser.email,
                    password: pgUser.password,
                    name: pgUser.name,
                    phone: pgUser.phone,
                    role: pgUser.role,
                    isFirstLogin: pgUser.is_first_login,
                    isVerified: true
                };
            }
        } catch (pgErr) {
            console.error("[ADMIN-LOGIN PG ERROR]:", pgErr.message);
            return res.status(500).json({ message: "PostgreSQL Error: " + pgErr.message });
        }


        // 2. Fallback to MongoDB only if connected and not found in PostgreSQL admins table
        const mongoose = require('mongoose');
        if (!userObj && mongoose.connection.readyState === 1) {
            try {
                const mongoUser = await User.findOne({ employeeId: cleanEmployeeId });
                if (mongoUser) {
                    const { password: pw, ...info } = mongoUser._doc;
                    userObj = { ...info, password: mongoUser.password };
                }
            } catch (mErr) {
                console.error("[ADMIN-LOGIN MONGO ERROR]:", mErr.message);
            }
        }

        if (!userObj) return res.status(401).json({ message: "Invalid Employee ID!" });

        const isPasswordCorrect = await bcrypt.compare(password, userObj.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid Password!" });

        const accessToken = jwt.sign(
            { id: userObj._id, role: userObj.role },
            process.env.JWT_SEC || 'diagnolabs_secure_jwt_secret_2024',
            { expiresIn: "3d" }
        );

        const { password: pw, ...info } = userObj;
        res.status(200).json({ ...info, accessToken });
    } catch (err) {
        console.error("Admin Login Error Detailed:", err);
        res.status(500).json({ message: err.message || "Admin Login Failed" });
    }
});

// GOOGLE AUTH FOR ADMIN / STAFF PORTAL
router.post('/admin-google', async (req, res) => {
    const { token } = req.body;
    try {
        if (!token) return res.status(400).json({ message: "Google ID Token is missing." });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;
        const cleanEmail = email.trim().toLowerCase();

        let userObj = null;

        // 1. Query PostgreSQL 'admins' Table First (Ultra-Fast 10ms Authentication)
        try {
            const { pool } = require('../services/pgService');
            const pgResult = await pool.query(
                'SELECT * FROM admins WHERE LOWER(TRIM(email)) = $1',
                [cleanEmail]
            );
            console.log(`[ADMIN-GOOGLE PG] Queried admins for ${cleanEmail}, found ${pgResult.rows.length} rows`);
            if (pgResult.rows.length > 0) {
                const pgUser = pgResult.rows[0];
                userObj = {
                    _id: `pg_admin_${pgUser.id}`,
                    employeeId: pgUser.employee_id,
                    email: pgUser.email,
                    name: pgUser.name,
                    phone: pgUser.phone,
                    role: pgUser.role,
                    isFirstLogin: pgUser.is_first_login,
                    isVerified: true
                };
            }
        } catch (pgErr) {
            console.error("[ADMIN-GOOGLE PG ERROR]:", pgErr.message);
        }

        // 2. Query PostgreSQL 'users' Table for Staff Roles if not found in admins
        if (!userObj) {
            try {
                const { pool } = require('../services/pgService');
                const pgUserResult = await pool.query(
                    'SELECT * FROM users WHERE LOWER(TRIM(email)) = $1 AND role != $2',
                    [cleanEmail, 'patient']
                );
                if (pgUserResult.rows.length > 0) {
                    const pgUser = pgUserResult.rows[0];
                    userObj = {
                        _id: `pg_${pgUser.id}`,
                        email: pgUser.email,
                        name: pgUser.name,
                        phone: pgUser.phone,
                        role: pgUser.role,
                        isVerified: true
                    };
                }
            } catch (e) {}
        }

        // 3. Fallback to MongoDB User model for Staff/Admin Roles
        const mongoose = require('mongoose');
        if (!userObj && mongoose.connection.readyState === 1) {
            try {
                const mongoUser = await User.findOne({ email: cleanEmail });
                if (mongoUser && mongoUser.role !== 'patient') {
                    const { password: pw, ...info } = mongoUser._doc;
                    userObj = info;
                }
            } catch (mErr) {
                console.error("[ADMIN-GOOGLE MONGO ERROR]:", mErr.message);
            }
        }

        if (!userObj) {
            return res.status(403).json({
                message: `Access Denied! The Google email (${cleanEmail}) is not registered as an authorized Admin or Staff member.`
            });
        }

        // Enforce First Time Login with ID & Password
        if (userObj.isFirstLogin) {
            return res.status(403).json({
                message: "First-time login requires your Employee ID and Temporary Password. Please use the standard login form."
            });
        }

        const accessToken = jwt.sign(
            { id: userObj._id, role: userObj.role },
            process.env.JWT_SEC || 'diagnolabs_secure_jwt_secret_2024',
            { expiresIn: "3d" }
        );

        const { password: pw, ...info } = userObj;
        res.status(200).json({ ...info, accessToken });
    } catch (err) {
        console.error("Admin Google Auth Error:", err);
        res.status(500).json({ message: "Google Authentication Failed: " + err.message });
    }
});






// ADMIN ACCOUNT RECOVERY
router.post('/admin-recover', async (req, res) => {
    try {
        const { email, phone, role } = req.body;
        
        // Ensure all fields are provided
        if (!email || !phone || !role) {
            return res.status(400).json("Please provide email, phone number, and role to recover account.");
        }

        // Search for user matching all 3 exact criteria (for security)
        const user = await User.findOne({ email, phone, role });
        
        if (!user) {
            return res.status(404).json("No matching account found. Please check your details.");
        }

        // Generate temporary password
        const tempPassword = generatePassword();
        
        // Update user
        user.password = tempPassword; // Mongoose pre-save hook will hash it
        user.isFirstLogin = true;
        await user.save();

        // Send email with recovery details
        const frontendUrl = process.env.FRONTEND_URL || 'https://diagnolabs-platform.vercel.app';
        const emailText = `Hello ${user.name},\n\nYour DiagnoLabs Admin Portal account has been successfully recovered.\n\nYour Employee ID is: ${user.employeeId}\nYour new Temporary Password is: ${tempPassword}\n\nPlease login immediately and you will be prompted to set a new secure password.\n\nBest Regards,\nDiagnoLabs Security System`;
        
        const emailHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-bottom: 4px solid #0a1e46;">
            <img src="https://diagnolabs-platform.vercel.app/email-logo.png" alt="DiagnoLabs Logo" style="max-height: 55px; width: auto;" />
          </div>
          <div style="padding: 32px 24px; background-color: #ffffff; color: #1e293b;">
            <h2 style="margin-top: 0; color: #0a1e46; font-size: 20px;">Account Recovered</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #475569;">Hello ${user.name}, your DiagnoLabs Admin Portal account has been successfully recovered.</p>
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 12px 0; font-size: 15px;"><strong>Employee ID:</strong> <span style="color: #0f172a; font-family: monospace; font-size: 16px;">${user.employeeId}</span></p>
              <p style="margin: 0; font-size: 15px;"><strong>New Temporary Password:</strong> <span style="color: #0f172a; font-family: monospace; font-size: 16px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
            </div>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;"><em>* Please login immediately. You will be prompted to set a new secure password upon login.</em></p>
            <div style="text-align: center;">
              <a href="${frontendUrl}/adminlogin" style="display: inline-block; background-color: #0a1e46; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px;">Login to Portal</a>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
            &copy; ${new Date().getFullYear()} DiagnoLabs. All rights reserved.<br>
            This is an automated message, please do not reply.
          </div>
        </div>`;

        await sendEmail(email, 'Account Recovery - DiagnoLabs Access Credentials', emailText, emailHtml);

        res.status(200).json("Account details sent successfully. Please check your email.");
    } catch (err) {
        console.error("Recovery Error:", err);
        res.status(500).json("Failed to process account recovery.");
    }
});

// CHANGE PASSWORD (FIRST LOGIN)
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json("User not found");

        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) return res.status(401).json("Incorrect old password");

        user.password = newPassword;
        user.isFirstLogin = false;
        await user.save();

        res.status(200).json("Password changed successfully");
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/dev/check-users', async (req, res) => {
    try {
        const users = await User.find({ employeeId: { $in: ['ADM-001', 'LAB-001', 'DOC-001'] } });
        res.json(users.map(u => ({ id: u.employeeId, role: u.role, pass: u.password })));
    } catch (e) {
        res.status(500).send(e.toString());
    }
});
router.get('/dev/test-pass', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const user = await User.findOne({ employeeId: 'LAB-001' });
        const isValid = await bcrypt.compare('123456', user.password);
        res.send('Is Valid: ' + isValid);
    } catch (e) {
        res.status(500).send(e.toString());
    }
});
router.get('/dev/test-login', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const user = await User.findOne({ employeeId: 'ADM-001' });
        const isValid = await bcrypt.compare('123456', user.password);
        res.send('ADM-001 Is Valid 123456: ' + isValid);
    } catch (e) {
        res.status(500).send(e.toString());
    }
});
router.get('/dev/test-admin-login-logic', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const user = await User.findOne({ employeeId: 'ADM-001' });
        if (!user) return res.send('User not found');
        const isPasswordCorrect = await bcrypt.compare('123456', user.password);
        res.json({
            isPasswordCorrect,
            isFirstLogin: user.isFirstLogin,
            userRole: user.role
        });
    } catch (e) {
        res.status(500).send(e.toString());
    }
});
router.get('/dev/reset-users-final', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const pass = await bcrypt.hash('123456', salt);
        await User.updateMany(
            { employeeId: { $in: ['COL-001', 'LAB-001', 'ADM-001'] } },
            { $set: { password: pass, isFirstLogin: true } }
        );
        res.send('Reset successful');
    } catch (e) {
        res.status(500).send(e.toString());
    }
});
// DEV: Reset any employee password to 123456 by employeeId
router.get('/dev/reset-employee/:empId', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const empId = req.params.empId.toUpperCase();
        const user = await User.findOne({ employeeId: empId });
        if (!user) return res.status(404).send(`Employee ${empId} not found`);
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('123456', salt);
        await User.updateOne({ employeeId: empId }, { $set: { password: hashed, isFirstLogin: true } });
        res.send(`✅ Password for ${empId} reset to 123456 successfully.`);
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

module.exports = router;




















