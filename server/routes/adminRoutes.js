const express = require('express');
const router = express.Router();
const { 
  getAllEmployees, 
  getEmployeeById, 
  getEmployeeDailyTracking,
  createEmployee
} = require('../controllers/adminController');
const {
  getSuperAdminStats,
  getOrganizations,
  updateOrganization,
  deleteOrganization
} = require('../controllers/superAdminController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

// --- SUPER ADMIN ROUTES ---
router.get('/super/stats', protect, superAdmin, getSuperAdminStats);
router.get('/super/organizations', protect, superAdmin, getOrganizations);
router.put('/super/organizations/:id', protect, superAdmin, updateOrganization);
router.delete('/super/organizations/:id', protect, superAdmin, deleteOrganization);

// --- ADMIN ROUTES ---
// @route   GET /api/admin/employees
// @desc    Fetch all registered employees from database
router.get('/employees', protect, admin, getAllEmployees);

// @route   POST /api/admin/employees
// @desc    Create a new employee/orgadmin
router.post('/employees', protect, admin, createEmployee);

// @route   GET /api/admin/employees/:id/daily?date=YYYY-MM-DD
// @desc    Fetch complete tracking log for an employee on a specific date
router.get('/employees/:id/daily', protect, admin, getEmployeeDailyTracking);

// @route   GET /api/admin/employees/:id
// @desc    Fetch individual employee by ID
router.get('/employees/:id', protect, admin, getEmployeeById);

module.exports = router;
