const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./backend/models/User');

mongoose.connect(process.env.MONGO_URL).then(async () => {
    try {
        const newUser = new User({
            name: 'Test',
            email: 'test500@example.com',
            password: 'password123',
            phone: '9999999999',
            role: 'patient',
            customerId: 'DL-202607-Xx'
        });
        await newUser.save();
        console.log('Success');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
});
