const mongoose = require('mongoose');
const Lab = require('./models/Lab');

const categories = ['Pathology', 'Diagnostics', 'X-Ray', 'Blood Collection', 'Radiology', 'Clinic'];

const seed = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/diagnolabs');
        console.log("Connected to local database...");
        
        const labs = await Lab.find({});
        let updated = 0;
        
        for (const lab of labs) {
            const numTags = Math.floor(Math.random() * 2) + 2; // 2 or 3 tags
            const shuffled = [...categories].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, numTags);
            
            const newTags = lab.tags ? [...lab.tags] : [];
            selected.forEach(t => {
                if (!newTags.includes(t)) newTags.push(t);
            });
            
            await Lab.updateOne({_id: lab._id}, { $set: { tags: newTags } });
            updated++;
        }
        
        console.log(`Updated ${updated} labs with new UI categories.`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
};

seed();
