const express = require('express');
const router = express.Router();
const { saveLocation, getLocationLogs } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/location/save
 * @desc    Save employee location every hour
 * @access  Private
 */
router.post('/save', protect, saveLocation);

/**
 * @route   GET /api/location/:employeeId?date=YYYY-MM-DD
 * @desc    Return all location logs for an employee on a specific day
 * @access  Private
 */
router.get('/:employeeId', protect, getLocationLogs);

module.exports = router;
