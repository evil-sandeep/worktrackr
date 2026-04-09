const express = require('express');
const router = express.Router();
const { startVisit, submitVisit, getEmployeeVisits } = require('../controllers/visitController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/visit/start
// @desc    Start a new store visit (saves location only)
router.post('/start', protect, startVisit);

// @route   POST /api/visit/submit
// @desc    Submit photos for an existing store visit
router.post('/submit', protect, submitVisit);

// @route   GET /api/visit/:employeeId?date=YYYY-MM-DD
// @desc    Get visits for a specific employee
router.get('/:employeeId', protect, getEmployeeVisits);

module.exports = router;
