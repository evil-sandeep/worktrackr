const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verifying secret for debug (will only log first 3 chars)
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      console.log(`Debug - AuthMiddleware Secret prefix: ${secret.substring(0, 3)}...`);

      // Verify token
      const decoded = jwt.verify(token, secret);
      console.log(`Debug - Token decoded for user ID: ${decoded.id}`);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.warn(`Debug - User not found for ID: ${decoded.id}`);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log(`Debug - Authorized: ${req.user.email}`);
      return next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
