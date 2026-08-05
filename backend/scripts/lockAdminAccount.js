const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function lockAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const updateRes = await User.updateOne(
            { employeeId: 'ADM-001' },
            { $set: { email: 'diagnolabs.official@gmail.com', phone: '9000000001' } }
        );
        console.log('✅ Update Result:', updateRes);
        const admin = await User.findOne({ employeeId: 'ADM-001' });
        console.log('VERIFIED MASTER ADMIN ADM-001:', {
            employeeId: admin.employeeId,
            email: admin.email,
            phone: admin.phone,
            role: admin.role,
            name: admin.name
        });
    } catch (e) {
        console.error('Lock Error:', e.message);
    } finally {
        await mongoose.disconnect();
    }
}

lockAdmin();
