const express = require('express');
const router = express.Router();
const { collect } = require('../data/freeLabCollector');
const { verifyTokenAndAdmin } = require('../middleware/auth');

/**
 * @route   POST /api/collector/start
 * @desc    Manually trigger the nationwide lab discovery engine
 * @access  Private (Admin Only)
 */
router.post('/start', verifyTokenAndAdmin, async (req, res) => {
    try {
        console.log(`🛡️  Admin ${req.user.name} initiated manual network discovery.`);
        
        // Start in background to avoid API timeout (Discovery takes time)
        collect().catch(err => {
            console.error("🚨 CRITICAL: Background Collector Crashed!", err);
        });

        res.json({ 
            success: true, 
            message: "All-India Discovery Engine started. Check server logs for progress." 
        });
    } catch (err) {
        console.error("Collector Route Error:", err);
        res.status(500).json({ error: "Failed to initiate collector." });
    }
});

module.exports = router;
