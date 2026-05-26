const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const viewStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('\n=======================================');
        console.log('[SYSTEM] BHARAT-ULTRA: NATIONAL DATA REPORT');
        console.log('=======================================');

        const totalLabs = await mongoose.connection.db.collection('labs').countDocuments();
        console.log(`[SUMMARY] TOTAL LABORATORIES CAPTURED: ${totalLabs}`);
        console.log('---------------------------------------');

        // Group by State
        const stateStats = await mongoose.connection.db.collection('labs').aggregate([
            { $group: { _id: "$state", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        console.log('[ANALYSIS] STATE-WISE DISTRIBUTION:');
        stateStats.forEach((s, i) => {
            console.log(`   ${i+1}. ${s._id || 'Standard'}: ${s.count} Units`);
        });

        console.log('---------------------------------------');

        // Group by City/District
        const stats = await mongoose.connection.db.collection('labs').aggregate([
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();


        console.log('[METRICS] TOP COVERAGE REGIONS:');
        stats.forEach((s, i) => {
            console.log(`   ${i+1}. ${s._id || 'Unknown'}: ${s.count} Units`);
        });

        console.log('\n[REGISTRY] RECENT CLINICAL ENTRIES:');
        const latest = await mongoose.connection.db.collection('labs')
            .find().sort({ _id: -1 }).limit(5).toArray();
            
        latest.forEach((l, i) => {
            console.log(`   - ${l.name} (${l.city})`);
        });

        console.log('=======================================\n');
        process.exit(0);
    } catch (err) {
        console.error("[ERROR] DATA ANALYSIS FAILED:", err.message);
        process.exit(1);
    }
};

viewStats();
