const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  updateUserProfile, 
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getAdminDashboardStats
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ... existing routes ...

// @route   GET /api/auth/admin-stats
// @desc    Get dashboard metrics for admins
router.get('/admin-stats', protect, getAdminDashboardStats);

// @route   POST /api/auth/register
// @desc    Register a user
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user
router.post('/login', loginUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', protect, updateUserProfile);

// @route   GET /api/auth/employees
// @desc    Get all employees (Admin Only)
router.get('/employees', protect, getEmployees);

// @route   PUT /api/auth/employees/:id
// @desc    Update employee (Admin Only)
router.put('/employees/:id', protect, updateEmployee);

// @route   DELETE /api/auth/employees/:id
// @desc    Delete employee (Admin Only)
router.delete('/employees/:id', protect, deleteEmployee);

module.exports = router;
