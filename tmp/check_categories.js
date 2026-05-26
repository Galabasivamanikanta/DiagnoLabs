const axios = require('axios');
const API_BASE_URL = 'http://localhost:5000';

async function check() {
    try {
        console.log("Checking search results for categories...");
        const res = await axios.get(`${API_BASE_URL}/api/tests/search?q=cbc&pincode=vadodara`);
        const results = res.data;
        console.log(`Found ${results.length} results.`);
        
        results.forEach((t, i) => {
            console.log(`[${i}] Lab: ${t.lab?.name} | Rating: ${t.lab?.rating} | Reviews: ${t.lab?.totalReviews} | Category: ${t.lab?.category}`);
        });

        // Check if any have category
        const categories = results.map(t => t.lab?.category);
        console.log("Unique categories found:", [...new Set(categories)]);
    } catch (err) {
        console.error("Error:", err.message);
    }
}

check();
