const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const User = require('../backend/models/User');

const fetchAdminDetails = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            console.log('Admin Email:', adminUser.email);
            console.log('Admin Password:', adminUser.password);
        } else {
            console.log('No admin user found.');
        }
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fetchAdminDetails();
