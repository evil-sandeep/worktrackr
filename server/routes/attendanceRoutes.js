const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getAttendanceByUserId,
  markCheckout
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/attendance
// @desc    Save attendance log
// @access  Private/Public (depending on requirement, usually Private)
router.post('/', protect, markAttendance);

// @route   GET /api/attendance/:userId
// @desc    Fetch all logs for a user
// @access  Private
router.get('/:userId', protect, getAttendanceByUserId);
router.post('/checkout', protect, markCheckout);

module.exports = router;
