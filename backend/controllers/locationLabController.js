const Lab = require('../models/Lab');
const Test = require('../models/Test');

// GET /api/labs/find-by-location?state=...&city=...
// Returns: [{ lab: {...}, tests: [...] }]
exports.findLabsByStateCityWithTests = async (req, res) => {
  try {
    const { state, city, pincode } = req.query;

    const labQuery = { isVerified: true };

    if (state) {
      labQuery.state = { $regex: `^${state}$`, $options: 'i' };
    }

    if (city) {
      // lab.city is the primary place field in this app.
      labQuery.city = { $regex: `^${city}$`, $options: 'i' };
    }

    // Optional pincode filter: match service pincodes array OR lab.pincode (if populated)
    if (pincode) {
      labQuery.$or = [
        { servicePincodes: { $in: [pincode] } },
        { pincode: pincode }

      ];
    }

    const labs = await Lab.find(labQuery).populate('ownerId', 'name email');

    if (!labs.length) return res.json([]);

    const labIds = labs.map(l => l._id);

    const tests = await Test.find({ lab: { $in: labIds } });

    // Group tests by lab id
    const testsByLabId = new Map();
    for (const t of tests) {
      const id = t.lab.toString();
      if (!testsByLabId.has(id)) testsByLabId.set(id, []);
      testsByLabId.get(id).push({
        _id: t._id,
        testName: t.testName,
        price: t.price,
        discountedPrice: t.discountedPrice,
        category: t.category,
        description: t.description,
        turnaroundTime: t.turnaroundTime
      });
    }

    const results = labs.map(l => {
      const labObj = typeof l.toObject === 'function' ? l.toObject() : { ...l };

      // Display pincode: prefer lab.pincode, otherwise use servicePincodes[0] as a representative
      const representativePincode = labObj.pincode || (Array.isArray(labObj.servicePincodes) ? labObj.servicePincodes[0] : undefined);

      return {
        lab: {
          _id: labObj._id,
          name: labObj.name,
          address: labObj.address,
          city: labObj.city,
          state: labObj.state,
          pincode: representativePincode || null,
          servicePincodes: labObj.servicePincodes || [],
          phone: labObj.phone,
          email: labObj.email,
          rating: labObj.rating,
          totalReviews: labObj.reviewCount || labObj.totalReviews || 0,
          isVerified: labObj.isVerified,
          googlePlaceId: labObj.googlePlaceId
        },
        tests: testsByLabId.get(labObj._id.toString()) || []
      };
    });

    return res.json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/labs/find-by-pincode?pincode=...
// Returns: [{ lab: {...}, tests: [...] }]
exports.findLabsByPincodeWithTests = async (req, res) => {
  try {
    const { pincode } = req.query;
    if (!pincode) return res.status(400).json({ message: 'pincode is required' });

    const labs = await Lab.find({
      isVerified: true,
      $or: [
        { servicePincodes: { $in: [pincode] } },
        { pincode: pincode }
      ]
    });

    if (!labs.length) return res.json([]);

    const labIds = labs.map(l => l._id);
    const tests = await Test.find({ lab: { $in: labIds } });

    const testsByLabId = new Map();
    for (const t of tests) {
      const id = t.lab.toString();
      if (!testsByLabId.has(id)) testsByLabId.set(id, []);
      testsByLabId.get(id).push({
        _id: t._id,
        testName: t.testName,
        price: t.price,
        discountedPrice: t.discountedPrice,
        category: t.category,
        description: t.description,
        turnaroundTime: t.turnaroundTime
      });
    }

    const results = labs.map(l => {
      const labObj = typeof l.toObject === 'function' ? l.toObject() : { ...l };
      const representativePincode = labObj.pincode || (Array.isArray(labObj.servicePincodes) ? labObj.servicePincodes[0] : undefined);

      return {
        lab: {
          _id: labObj._id,
          name: labObj.name,
          address: labObj.address,
          city: labObj.city,
          state: labObj.state,
          pincode: representativePincode || pincode,
          servicePincodes: labObj.servicePincodes || [],
          phone: labObj.phone,
          email: labObj.email,
          rating: labObj.rating,
          totalReviews: labObj.reviewCount || labObj.totalReviews || 0,
          isVerified: labObj.isVerified,
          googlePlaceId: labObj.googlePlaceId
        },
        tests: testsByLabId.get(labObj._id.toString()) || []
      };
    });

    return res.json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

