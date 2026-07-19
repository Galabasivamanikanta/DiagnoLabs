const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');
const labController = require('../controllers/labController');
const { verifyToken, verifyTokenAndAdmin } = require('../middleware/auth');

// @route   GET api/labs/debug-google (Admin only)
router.get('/debug-google', verifyTokenAndAdmin, async (req, res) => {
    try {
        const { pincode } = req.query;
        const coords = await labController.getPincodeCoordinates(pincode);
        if (!coords || coords.error) {
            return res.json({ 
                success: false, 
                message: 'Geocoding failed for ' + pincode,
                diagnostics: coords ? coords.details : 'System Timeout'
            });
        }
        
        const existingLabs = await Lab.find({ servicePincodes: pincode });
        
        res.json({ 
            search_pincode: pincode,
            detected_city: coords.city,
            persistence_count: existingLabs.length,
            coords: { lat: coords.lat, lng: coords.lng }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/labs/search-live (Public - Discovery Engine)
router.get('/search-live', labController.searchNearbyLabsWithGoogle);

// @route   GET api/labs (Public)
router.get('/', async (req, res) => {
    try {
        const { pincode } = req.query;
        let query = { isVerified: true }; 
        
        if (pincode) {
            query.$or = [
                { servicePincodes: { $in: [pincode] } },
                { city: { $regex: `^${pincode}$`, $options: 'i' } }
            ];
        }
        
        let labs = await Lab.find(query).populate('ownerId', 'name email').limit(100);
        
        if (pincode && (labs.length < 15 || !labs.some(l => l.isVerified))) {
            return labController.searchNearbyLabsWithGoogle(req, res);
        }
        
        const tieredLabs = labs.map(lab => {
            const labObj = typeof lab.toObject === 'function' ? lab.toObject() : { ...lab };
            const r = labObj.rating || 3.5;
            const v = labObj.totalReviews || 0;
            const isOpen = labObj.isOpenNow ?? true;

            if (r >= 4.4 && v >= 10 && isOpen) labObj.category = "Premium";
            else if (r >= 3.8 || v > 2) labObj.category = "Scalable";
            else labObj.category = "Low Category";
            
            return labObj;
        });

        res.json(tieredLabs);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/labs/all-discovery (Admin only)
router.get('/all-discovery', verifyTokenAndAdmin, async (req, res) => {
    try {
        const labs = await Lab.find({ isVerified: false });
        res.json(labs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/labs/search (Public)
router.get('/search', async (req, res) => {
    try {
        const { q, city } = req.query;
        let query = { isVerified: true };
        if (q) query.name = { $regex: q, $options: 'i' };
        if (city) query.city = { $regex: city, $options: 'i' };

        const labs = await Lab.find(query);

        const currentHour = new Date().getHours();
        let dynamicMultiplier = 1.0;
        if (currentHour >= 7 && currentHour <= 10) dynamicMultiplier = 1.2;
        else if (currentHour >= 14 && currentHour <= 16) dynamicMultiplier = 0.9;

        const results = labs.map(lab => {
            const labObj = lab.toObject();
            return {
                ...labObj,
                currentMultiplier: (lab.pricingMultiplier || 1.0) * dynamicMultiplier,
                isSurge: dynamicMultiplier > 1
            };
        });

        res.json(results);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

const Test = require('../models/Test');

// @route   GET api/labs/nearby (Public)
router.get('/nearby', async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const testName = req.query.test;

    if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ msg: 'Invalid coordinates' });
    }

    try {
        const labs = await Lab.find({
            isVerified: true,
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] }
                }
            }
        });

        if (labs.length === 0) return res.json([]);

        const labIds = labs.map(lab => lab._id);
        let testFilter = { lab: { $in: labIds } };
        if (testName) testFilter.testName = { $regex: testName, $options: 'i' };

        const tests = await Test.find(testFilter).populate('lab');

        tests.sort((a, b) => {
            const indexA = labIds.findIndex(id => id.toString() === a.lab._id.toString());
            const indexB = labIds.findIndex(id => id.toString() === b.lab._id.toString());
            return indexA - indexB;
        });

        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// @route   GET api/labs/:id (Public)
router.get('/:id', async (req, res) => {
    try {
        const lab = await Lab.findById(req.params.id);
        if (!lab) return res.status(404).json({ msg: 'Lab not found' });
        res.json(lab);
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Lab not found' });
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/labs/:id (Staff/Admin only)
router.put('/:id', verifyToken, async (req, res) => {
    if (req.user.role === 'patient') return res.status(403).json("Unauthorized");
    
    try {
        const lab = await Lab.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!lab) return res.status(404).json({ msg: 'Lab not found' });
        res.json(lab);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

