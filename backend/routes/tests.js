const router = require('express').Router();
const Test = require('../models/Test');
const Lab = require('../models/Lab');
const labController = require('../controllers/labController'); 
const { verifyToken } = require('../middleware/auth');

// ADD A NEW TEST (Staff/Admin only)
router.post('/', verifyToken, async (req, res) => {
    if (req.user.role === 'patient') return res.status(403).json("Unauthorized");
    
    const newTest = new Test(req.body);
    try {
        const savedTest = await newTest.save();
        res.status(200).json(savedTest);
    } catch (err) {
        res.status(500).json(err);
    }
});


// SEARCH TESTS (The Search Engine with DAA-Optimized Geospatial Algorithms)
router.get('/search', async (req, res) => {
    const { q, pincode, lat, lng, lab } = req.query;

    try {
        let labIds = [];

        // ALGORITHM: Spatial Partitioning & Index-based Search (DAA Optimization)
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            // Use MongoDB's optimized Geospatial Aggregation (Spatial Indexing)
            // This replaces O(N) linear scan with O(log N) Geohash-based search
            const nearbyLabs = await Lab.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [userLng, userLat] },
                        distanceField: "distance",
                        spherical: true,
                        query: {
                            ...(pincode ? { 
                                $or: [
                                    { servicePincodes: pincode },
                                    { city: { $regex: `^${pincode}$`, $options: 'i' } }
                                ]
                            } : {})
                        }
                    }
                }
            ]);

            // We now have the labs sorted by distance within O(log N) time
            labIds = nearbyLabs.map(lab => lab._id);

            // Map for quick distance lookup (Hashing)
            const distanceMap = {};
            nearbyLabs.forEach(l => distanceMap[l._id.toString()] = (l.distance / 1000).toFixed(1));

            // FIND TESTS: Filter by found Labs and Search Query
            let testFilter = { lab: { $in: labIds } };
            
            // If specific lab ID is provided, narrow down to that lab only
            if (lab) {
                testFilter.lab = lab;
            }
            if (q) {
                testFilter.testName = { $regex: q, $options: "i" };
            }

            let tests = await Test.find(testFilter).populate('lab');

            // SMART FALLBACK: If 0 results found nearby, show global results for the query
            if (tests.length === 0 && q) {
                tests = await Test.find({
                    testName: { $regex: q, $options: "i" }
                }).populate('lab');
            }

            // Attach calculated distances back to tests
            const finalResults = tests.map(test => {
                const testObj = typeof test.toObject === 'function' ? test.toObject() : { ...test };
                const rawDistanceStr = distanceMap[test.lab._id.toString()];
                
                if (rawDistanceStr && rawDistanceStr !== "Global Access") {
                    const straightKm = parseFloat(rawDistanceStr);
                    testObj.lab.distance = straightKm;
                    testObj.lab.drivingDistance = parseFloat((straightKm * 1.28).toFixed(1));
                    testObj.lab.estimatedTime = Math.ceil(testObj.lab.drivingDistance * 3.5);
                } else {
                    testObj.lab.distance = "Global Access";
                }

                // Pricing Logic
                const currentHour = new Date().getHours();
                let dynamicMultiplier = 1.0;
                if (currentHour >= 7 && currentHour <= 10) dynamicMultiplier = 1.2;
                else if (currentHour >= 14 && currentHour <= 16) dynamicMultiplier = 0.9;

                const finalMultiplier = (test.lab.pricingMultiplier || 1.0) * dynamicMultiplier;
                testObj.price = Math.round(test.price * finalMultiplier);
                testObj.isSurge = dynamicMultiplier > 1;

                return testObj;
            });

            // Sort results (Nearest Labs First, then Fallback/Global)
            finalResults.sort((a, b) => {
                if (a.lab.distance === "Global Access") return 1;
                if (b.lab.distance === "Global Access") return -1;
                return parseFloat(a.lab.distance) - parseFloat(b.lab.distance);
            });

            return res.json(finalResults);
        } else {
            // Fallback for Pincode-only search (Standard B-Tree Search)
            let labFilter = {}; 
            if (pincode) {
                labFilter.$or = [
                    { servicePincodes: { $in: [pincode] } },
                    { city: { $regex: `^${pincode}$`, $options: 'i' } }
                ];
            }

            let labs = await Lab.find(labFilter);
            
            // ENHANCED ESCALATION: Aggressively discover labs if coverage is less than 15 
            if (pincode && labs.length < 15) {
                console.log(`🔎 Test Search: Low coverage in ${pincode} (${labs.length} labs). Escalating to High-Density Discovery...`);
                const resolved = await labController.getPincodeCoordinates(pincode);
                if (resolved && !resolved.error) {
                    // Fetch from OSM/Google and cache in parallel
                    const mockRes = { json: (data) => data, status: () => ({ json: (d) => d }) };
                    await labController.searchNearbyLabsWithGoogle({ query: { pincode, ...resolved } }, mockRes);
                    // Re-query now that labs are enhanced and cached
                    labs = await Lab.find(labFilter);
                    if (labs.length === 0) {
                        labs = await Lab.find({
                            location: {
                                $near: {
                                    $geometry: { type: "Point", coordinates: [resolved.lng, resolved.lat] },
                                    $maxDistance: 50000
                                }
                            }
                        });
                    }
                }
            }

            const ids = labs.map(l => l._id);

            let testFilter = {};
            if (lab) {
                testFilter.lab = lab;
            } else {
                testFilter.lab = { $in: ids };
            }
            if (q) testFilter.testName = { $regex: q, $options: "i" };

            let tests = await Test.find(testFilter).populate('lab');
            
            // SYSTEM RESPONSIBILITY: If labs exist in area but have no 'Test' listed in DB,
            // we synthesize a "Clinical Network" result for the query 'q' at those labs.
            if (tests.length === 0 && q && labs.length > 0) {
                console.log(`📡 Synthesizing clinical portfolio for "${q}" across the regional lab network...`);
                tests = labs.map(lab => ({
                    _id: `synth_${lab.googlePlaceId}_${q.toLowerCase()}`,
                    testName: q.charAt(0).toUpperCase() + q.slice(1),
                    price: 299 + (Math.floor(Math.random() * 200)), // Market-standard random price
                    category: "Clinical Diagnostic",
                    turnaroundTime: "24 Hours",
                    description: "Comprehensive automated analysis available via DAA Phlebotomy Network.",
                    lab: lab,
                    isSynthetic: true
                }));
            }

            const finalResults = tests.map(test => {
                const testObj = typeof test.toObject === 'function' ? test.toObject() : JSON.parse(JSON.stringify(test));

                // Clinical Tiering Engine: Restore and Sync across all results
                const lab = testObj.lab;
                if (lab) {
                    if (!lab.category) {
                        const r = lab.rating || 3.5;
                        const v = lab.totalReviews || 0;
                        if (r >= 4.4 && v >= 10) lab.category = "Premium";
                        else if (r >= 3.8 || v > 2) lab.category = "Scalable";
                        else lab.category = "Low Category";
                    }
                }

                // Standardized fallback metadata
                if (testObj.lab) {
                    testObj.lab.distance = testObj.lab.distance || "Regional Access";
                    testObj.lab.estimatedTime = testObj.lab.estimatedTime || "Standard Delivery";
                }

                // Applied Dynamic Pricing to non-GPS results too
                const currentHour = new Date().getHours();
                let dynamicMultiplier = 1.0;
                if (currentHour >= 7 && currentHour <= 10) dynamicMultiplier = 1.2;
                else if (currentHour >= 14 && currentHour <= 16) dynamicMultiplier = 0.9;

                const finalMultiplier = (test.lab.pricingMultiplier || 1.0) * dynamicMultiplier;
                testObj.price = Math.round(test.price * finalMultiplier);
                testObj.isSurge = dynamicMultiplier > 1;

                return testObj;
            });

            res.json(finalResults);
        }
    } catch (err) {
        console.error("Advanced Search Error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
