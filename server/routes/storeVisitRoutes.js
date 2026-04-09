const express = require('express');
const router = express.Router();
const { submitVisit, getMyVisits } = require('../controllers/storeVisitController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/store-visits
// @desc    Submit a store visit with outside and inside photos
router.post('/', protect, submitVisit);

// @route   GET /api/store-visits/my-visits
// @desc    Get current user's visits
router.get('/my-visits', protect, getMyVisits);

module.exports = router;
