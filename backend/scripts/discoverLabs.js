const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const Lab = require('../models/Lab');

dotenv.config();

// Connect to your existing DiagnoLabs DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to DiagnoLabs Cloud Database"))
    .catch(err => console.error("Database connection failed", err));

/**
 * SOURCE 1: OPEN STREET MAP (OSM) - For Small Clinics & Rural Areas
 * No API KEY required, 100% Free.
 */
const fetchFromOSM = async (city) => {
    console.log(`🔍 Scouting OSM for small clinics in ${city}...`);
    const query = `
        [out:json];
        area[name="${city}"]->.searchArea;
        (
          node["amenity"="clinic"](area.searchArea);
          node["healthcare"="laboratory"](area.searchArea);
          way["amenity"="clinic"](area.searchArea);
          way["healthcare"="laboratory"](area.searchArea);
        );
        out center;
    `;
    
    try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', { data: query }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const elements = response.data.elements;
        
        let count = 0;
        for (const el of elements) {
            const name = el.tags.name || `Clinic (Lat: ${el.lat || el.center.lat}, Lon: ${el.lon || el.center.lon})`;
            
            // Avoid duplicates
            const exists = await Lab.findOne({ name, city });
            if (exists) continue;

            await Lab.create({
                name: name,
                address: el.tags['addr:full'] || el.tags['addr:street'] || `Located in ${city}`,
                city: city,
                location: {
                    type: 'Point',
                    coordinates: [el.lon || el.center.lon, el.lat || el.center.lat]
                },
                source: 'osm',
                scale: 'small',
                labType: 'clinic',
                isVerified: false
            });
            count++;
        }
        console.log(`✅ OSM: Added ${count} new clinics in ${city}`);
    } catch (err) {
        console.error("OSM Discovery failed for " + city, err.message);
    }
};

/**
 * SOURCE 2: GOOGLE PLACES API - For Advanced & Chain Labs
 * Requires GOOGLE_MAPS_API_KEY in .env
 */
const fetchFromGoogle = async (city) => {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        console.log("⚠️ Skipping Google: No GOOGLE_MAPS_API_KEY found in .env");
        return;
    }

    console.log(`📡 Querying Google Cloud for high-advanced labs in ${city}...`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=diagnostic+labs+in+${city}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    try {
        const res = await axios.get(url);
        const results = res.data.results;
        
        let count = 0;
        for (const place of results) {
            const exists = await Lab.findOne({ googlePlaceId: place.place_id });
            if (exists) continue;

            await Lab.create({
                name: place.name,
                googlePlaceId: place.place_id,
                address: place.formatted_address,
                city: city,
                rating: place.rating,
                reviewCount: place.user_ratings_total,
                location: {
                    type: 'Point',
                    coordinates: [place.geometry.location.lng, place.geometry.location.lat]
                },
                source: 'google',
                scale: place.user_ratings_total > 100 ? 'large' : 'medium',
                labType: 'standalone',
                isVerified: true 
            });
            count++;
        }
        console.log(`✅ Google: Added ${count} labs/hospitals in ${city}`);
    } catch (err) {
        console.error("Google Discovery failed", err.message);
    }
};

// MASTER RUNNER - Start with Top Cities
const runDiscovery = async () => {
    // Starting with a few cities for the demonstration
    const targetCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Nagpur'];
    
    for (const city of targetCities) {
        await fetchFromOSM(city);
        await fetchFromGoogle(city);
    }

    console.log("🏁 All-India Discovery Phase 1 Complete. DiagnoLabs Network is now populated!");
    process.exit(0);
};

runDiscovery();
