const express = require('express');
const router = express.Router();

const locationLabController = require('../controllers/locationLabController');

// GET /api/india-labs/find-by-location?state=...&city=...&pincode=...
router.get('/find-by-location', locationLabController.findLabsByStateCityWithTests);

// GET /api/india-labs/find-by-pincode?pincode=...
router.get('/find-by-pincode', locationLabController.findLabsByPincodeWithTests);

module.exports = router;

