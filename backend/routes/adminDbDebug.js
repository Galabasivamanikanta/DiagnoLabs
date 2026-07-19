// NOTE: This file intentionally added as a helper to keep backend/routes/admin.js small.
// It exports a function that registers DB debug routes on the given router.

const Lab = require('../models/Lab');
const Test = require('../models/Test');
const User = require('../models/User');
const Booking = require('../models/Booking');

function registerAdminDbDebugRoutes(router, verifyTokenAndAdmin) {
  // WARNING: These endpoints return full DB data.
  // Keep behind verifyTokenAndAdmin only.

  // Simple pagination controls to avoid response crashes.
  // If you really want full data, omit limit.
  router.get('/db/labs', verifyTokenAndAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

      const query = Lab.find({});
      if (Number.isFinite(skip) && skip > 0) query.skip(skip);
      if (Number.isFinite(limit) && limit > 0) query.limit(limit);

      const labs = await query;
      res.json({ count: labs.length, labs });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/db/tests', verifyTokenAndAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

      const query = Test.find({});
      if (Number.isFinite(skip) && skip > 0) query.skip(skip);
      if (Number.isFinite(limit) && limit > 0) query.limit(limit);

      const tests = await query.populate('lab');
      res.json({ count: tests.length, tests });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/db/users', verifyTokenAndAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

      const query = User.find({}).select('-password');
      if (Number.isFinite(skip) && skip > 0) query.skip(skip);
      if (Number.isFinite(limit) && limit > 0) query.limit(limit);

      const users = await query;
      res.json({ count: users.length, users });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/db/bookings', verifyTokenAndAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;

      const query = Booking.find({})
        .populate('patient', 'name email phone')
        .populate('lab', 'name address city state pincode servicePincodes googlePlaceId');

      if (Number.isFinite(skip) && skip > 0) query.skip(skip);
      if (Number.isFinite(limit) && limit > 0) query.limit(limit);

      const bookings = await query.sort({ createdAt: -1 });
      res.json({ count: bookings.length, bookings });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

module.exports = { registerAdminDbDebugRoutes };

