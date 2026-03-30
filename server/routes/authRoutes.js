const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a user
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user
router.post('/login', loginUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', protect, updateUserProfile);

module.exports = router;
