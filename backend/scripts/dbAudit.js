const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const audit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Count documents
        const labCount = await mongoose.connection.db.collection('labs').countDocuments();
        const userCount = await mongoose.connection.db.collection('users').countDocuments();
        const bookingCount = await mongoose.connection.db.collection('bookings').countDocuments();
        
        console.log('\n=======================================');
        console.log('[AUDIT] DIAGNOLABS DATABASE SNAPSHOT');
        console.log('=======================================');
        console.log(`[DATA] Laboratories     : ${labCount}`);
        console.log(`[USERS] User Accounts    : ${userCount}`);
        console.log(`[BOOKINGS] Total Bookings : ${bookingCount}`);
        console.log('---------------------------------------');
        
        const sampleLabs = await mongoose.connection.db.collection('labs').find().limit(5).toArray();
        console.log('[SAMPLES] DATABASE REGISTRY PREVIEW:');
        sampleLabs.forEach((l, i) => {
            console.log(`   ${i+1}. ${l.name} [${l.city || 'Standard'}]`);
        });
        console.log('=======================================\n');
        
        process.exit(0);
    } catch (err) {
        console.error("[ERROR] Audit Sync Failed:", err.message);
        process.exit(1);
    }
};

audit();
