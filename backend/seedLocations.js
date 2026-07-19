const mongoose = require('mongoose');
const Lab = require('./models/Lab');

const cities = [
    { city: "Bangalore", pincodes: ["560001", "560002", "560034"] },
    { city: "Delhi", pincodes: ["110001", "110002", "110020"] },
    { city: "Mumbai", pincodes: ["400001", "400002", "400050"] },
    { city: "Hyderabad", pincodes: ["500001", "500002", "500032"] },
    { city: "Chennai", pincodes: ["600001", "600002", "600020"] },
];

const seedLocations = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/diagnolabs');
        console.log("Connected to local database...");
        
        const labs = await Lab.find({});
        let updated = 0;
        
        for (const lab of labs) {
            // Pick a random city
            const randomCityObj = cities[Math.floor(Math.random() * cities.length)];
            const randomPincode = randomCityObj.pincodes[Math.floor(Math.random() * randomCityObj.pincodes.length)];
            
            await Lab.updateOne({_id: lab._id}, { 
                $set: { 
                    city: randomCityObj.city,
                    pincode: randomPincode,
                    servicePincodes: [randomPincode]
                } 
            });
            updated++;
        }
        
        console.log(`Updated ${updated} labs with dummy cities and pincodes for search testing.`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
};

seedLocations();
