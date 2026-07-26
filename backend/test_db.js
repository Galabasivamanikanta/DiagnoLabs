require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const User = require('./models/User');
    const users = await User.find({ employeeId: { $in: ['ADM-001', 'LAB-001', 'DOC-001'] } });
    console.log(users.map(u => ({ id: u.employeeId, role: u.role, pass: u.password })));
    process.exit();
}).catch(console.error);
