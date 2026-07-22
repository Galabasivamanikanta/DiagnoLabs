const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const checkBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Booking = require('./models/Booking');
        const bookings = await Booking.find({});
        console.log(`Found ${bookings.length} bookings total:`);
        bookings.forEach(b => {
            console.log(`Booking ID: ${b._id}, Lab ID: ${b.lab}, Status: ${b.status}`);
        });
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
};

checkBookings();
