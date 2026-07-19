const mongoose = require('mongoose');
const Lab = require('./models/Lab');

const seedRatings = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/diagnolabs');
        console.log("Connected to local database...");
        
        const labs = await Lab.find({});
        let updated = 0;
        
        for (const lab of labs) {
            // Randomly assign one of three tiers for testing
            const tier = Math.random();
            let newRating, newReviews, isVerified;

            if (tier > 0.6) {
                // Premium
                newRating = (Math.random() * 0.5 + 4.5).toFixed(1); // 4.5 - 5.0
                newReviews = Math.floor(Math.random() * 100) + 15;
                isVerified = true;
            } else if (tier > 0.3) {
                // Scalable
                newRating = (Math.random() * 0.5 + 3.8).toFixed(1); // 3.8 - 4.3
                newReviews = Math.floor(Math.random() * 10) + 2;
                isVerified = false;
            } else {
                // Low Category
                newRating = (Math.random() * 1.5 + 2.0).toFixed(1); // 2.0 - 3.5
                newReviews = Math.floor(Math.random() * 2);
                isVerified = false;
            }
            
            await Lab.updateOne({_id: lab._id}, { 
                $set: { 
                    rating: parseFloat(newRating),
                    reviewCount: newReviews,
                    totalReviews: newReviews,
                    isVerified: isVerified
                } 
            });
            updated++;
        }
        
        console.log(`Updated ${updated} labs with randomized ratings for tier testing.`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
};

seedRatings();
