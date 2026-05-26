const axios = require('axios');
const Lab = require('../models/Lab');
const cities = require('./indianCities');
const fs = require('fs');
const csv = require('csv-parser');

// Performance Utility: Manual Sleep to honor API rules
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const collect = async () => {
    console.log("[INIT] INITIALIZING ALL-INDIA FREE DATA COLLECTION...");

    for (const city of cities) {
        console.log(`\n[CITY-SCAN] Processing: ${city.name}`);

        // SOURCE 1: Overpass API (OSM)
        try {
            const query = `[out:json];node(${city.bbox.join(',')})["healthcare"="laboratory"];out;`;
            // Note: Sending query as application/x-www-form-urlencoded
            const osmRes = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            const ops = osmRes.data.elements.map(el => ({
                updateOne: {
                    filter: { 
                        $or: [
                            { googlePlaceId: `osm_${el.id}` },
                            { name: el.tags.name || `Clinic_${el.id}`, city: city.name }
                        ]
                    },
                    update: { $setOnInsert: {
                        name: el.tags.name || `Clinic_${el.id}`,
                        city: city.name,
                        address: el.tags['addr:full'] || el.tags['addr:street'] || `Discovery in ${city.name}`,
                        location: { type: 'Point', coordinates: [el.lon, el.lat] },
                        source: 'osm',
                        scale: 'small',
                        googlePlaceId: `osm_${el.id}`
                    }},
                    upsert: true
                }
            }));
            
            if (ops.length) {
                await Lab.bulkWrite(ops);
                console.log(`[SUCCESS] OSM: Discovered and attempted record for ${ops.length} labs.`);
            }
        } catch (e) { 
            console.error("[ERROR] OSM Error for " + city.name + ":", e.message); 
        }

        await sleep(1500); // Respect OSM servers

        // SOURCE 2: Nominatim (OSM Search)
        try {
            const nomUrl = `https://nominatim.openstreetmap.org/search?q=diagnostic+lab+in+${encodeURIComponent(city.name)}+India&format=json&limit=15`;
            const nomRes = await axios.get(nomUrl, { 
                headers: { 'User-Agent': 'DiagnoLabs-Clinical-System/1.0 (contact@diagnolabs.com)' } 
            });
            
            const ops = nomRes.data.map(p => ({
                updateOne: {
                    filter: { 
                        $or: [
                            { googlePlaceId: `nom_${p.place_id}` },
                            { name: p.display_name.split(',')[0], city: city.name }
                        ]
                    },
                    update: { $setOnInsert: {
                        name: p.display_name.split(',')[0],
                        city: city.name,
                        address: p.display_name,
                        location: { type: 'Point', coordinates: [parseFloat(p.lon), parseFloat(p.lat)] },
                        source: 'osm',
                        labType: 'standalone',
                        googlePlaceId: `nom_${p.place_id}`
                    }},
                    upsert: true
                }
            }));
            
            if (ops.length) {
                await Lab.bulkWrite(ops);
                console.log(`[SUCCESS] Nominatim: Refined discovery for ${ops.length} labs.`);
            }
        } catch (e) { 
            console.error("[ERROR] Nominatim Error for " + city.name + ":", e.message); 
        }

        await sleep(2000); // Be respectful to Nominatim terms of service
    }
    
    // SOURCE 4: NABL Local Data (Bulk Import)
    const nablPath = 'backend/data/nabl_labs.csv';
    if (fs.existsSync(nablPath)) {
        console.log("[FILE-SYNC] Processing NABL CSV Registry...");
        let nablOps = [];
        fs.createReadStream(nablPath)
            .pipe(csv())
            .on('data', (row) => {
                nablOps.push({
                    updateOne: {
                        filter: { name: row.LabName },
                        update: { $set: { nabl: true, isVerified: true, scale: 'medium' } },
                        upsert: true
                    }
                });
            })
            .on('end', async () => {
                if (nablOps.length) {
                    await Lab.bulkWrite(nablOps);
                    console.log(`[SUCCESS] NABL Sync Complete: ${nablOps.length} records updated.`);
                }
            });
    }

    console.log("\n[COMPLETE] COLLECTION CYCLE FINISHED SUCCESSFULLY.");
};

module.exports = { collect };
