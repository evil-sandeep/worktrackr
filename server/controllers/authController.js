const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  console.log(`Debug - Controller Generating Token with secret prefix: ${secret.substring(0, 3)}...`);
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, empId, password, role } = req.body;

    if (!name || !email || !phone || !empId || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { empId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or Employee ID already exists' });
    }

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
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email });
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

// @desc    Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { name, phone, address, designation, profileImg } = req.body;

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      if (designation) user.designation = designation;

      // Handle profile image upload if provided as base64
      if (profileImg && profileImg.startsWith('data:image')) {
        const { uploadImage } = require('../utils/cloudinary');
        try {
          const imageUrl = await uploadImage(profileImg);
          user.profileImg = imageUrl;
        } catch (uploadError) {
          console.error('Profile image upload failed:', uploadError);
          // Continue without updating image if upload fails
        }
      } else if (profileImg === '') {
        // Clear profile image if explicitly set to empty string
        user.profileImg = '';
      } else if (profileImg) {
        // If it's already a URL or other string, just save it
        user.profileImg = profileImg;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        empId: updatedUser.empId,
        role: updatedUser.role,
        address: updatedUser.address,
        designation: updatedUser.designation,
        profileImg: updatedUser.profileImg,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error during profile update' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
};
