const express = require('express');
const router = express.Router();
const { markAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/attendance
// @desc    Mark attendance (image, location, time)
// @access  Private
router.post('/', protect, markAttendance);

module.exports = router;
