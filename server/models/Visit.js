const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  outsidePhoto: {
    type: String, // Cloudinary URL
    default: null,
  },
  insidePhoto: {
    type: String, // Cloudinary URL
    default: null,
  },
  address: {
    type: String, // Resolved street address
    default: null,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Visit', visitSchema);
