const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const Lab = require('../backend/models/Lab');

const checkLabs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Lab.countDocuments({});
        const verifiedCount = await Lab.countDocuments({ isVerified: true });
        console.log(`Total Labs: ${count}`);
        console.log(`Verified Labs: ${verifiedCount}`);
        
        if (verifiedCount === 0 && count > 0) {
            console.log('MARKING ONE LAB AS VERIFIED FOR TESTING');
            await Lab.findOneAndUpdate({}, { isVerified: true });
            console.log('One lab marked as verified.');
        }
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkLabs();
