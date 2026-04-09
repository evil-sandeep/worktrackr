const express = require('express');
const router = express.Router();
const { createCheckIn } = require('../controllers/checkInController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/checkin
 * @desc    Create a new check-in with outside and inside photos
 * @access  Private
 */
router.post('/', protect, createCheckIn);

module.exports = router;
