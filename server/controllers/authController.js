const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, empId, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !empId || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { empId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or Employee ID already exists' });
    }

    // Creating the user. The password hashing is already handled natively by 
    // the pre-save hook configured in the User model.
    const user = await User.create({
      name,
      email,
      phone,
      empId,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        empId: user.empId,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Compare passwords using bcrypt
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (user && isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        empId: user.empId,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
