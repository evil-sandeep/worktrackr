const express = require('express');
const router = express.Router();
const { getAllEmployees, getEmployeeById } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/employees
// @desc    Fetch all registered employees from database
router.get('/employees', protect, admin, getAllEmployees);

// @route   GET /api/admin/employees/:id
// @desc    Fetch individual employee by ID
router.get('/employees/:id', protect, admin, getEmployeeById);

module.exports = router;
