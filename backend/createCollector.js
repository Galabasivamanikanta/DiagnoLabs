const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    // Delete existing collector if any to avoid duplicates
    await User.deleteMany({ employeeId: 'COL-001' });

    const collector = await User.create({
        name: 'Ravi Collector',
        email: 'collector@diagnolabs.com',
        phone: '9999988888',
        password: password,
        role: 'phlebotomist',
        employeeId: 'COL-001',
        isVerified: true,
        isFirstLogin: false
    });

    console.log('Collector created successfully:', collector.employeeId, collector.name);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

