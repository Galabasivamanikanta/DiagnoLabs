require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const dns = require('node:dns');
const mongoose = require('mongoose');
const User = require('../models/User');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const [rawEmail, password, name = 'DiagnoLabs Admin'] = process.argv.slice(2);
const email = (rawEmail || '').trim().toLowerCase();
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const run = async () => {
    if (!email || !password) {
        console.error('Usage: node scripts/resetAdminPassword.js admin@diagnolabs.in NewPassword123!');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
        family: 4,
        serverSelectionTimeoutMS: 15000
    });

    const user = await User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') });
    if (user) {
        user.password = password;
        user.role = 'admin';
        user.isVerified = true;
        if (!user.name) user.name = name;
        if (!user.phone) user.phone = 'Not Provided';
        await user.save();
        console.log(`Admin password reset for ${email}`);
    } else {
        await User.create({
            name,
            email,
            password,
            phone: 'Not Provided',
            role: 'admin',
            isVerified: true
        });
        console.log(`Admin created for ${email}`);
    }

    await mongoose.disconnect();
};

run().catch(async (err) => {
    console.error(err.message);
    try {
        await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
});
