const mongoose = require('mongoose');
const User = require('./backend/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/diagnolabs_mission').then(async () => {
    try {
        const user = await User.findOne({ role: 'admin' });
        console.log('Found user:', user._id);
        
        // Simulating exactly what the route does
        const updateData = {
            name: user.name,
            phone: user.phone,
            recovery_email: "test@example.com",
            recovery_phone: "12345",
            address: {
                street: "123 Test St",
                city: "Test City",
                pincode: "12345"
            },
            profilePic: "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        };

        const res = await User.findByIdAndUpdate(user._id, { $set: updateData }, { new: true, runValidators: true });
        console.log('Updated User successfully!');
    } catch(e) { 
        console.error('ERROR DURING UPDATE:', e.message); 
    }
    process.exit(0);
}).catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
});
