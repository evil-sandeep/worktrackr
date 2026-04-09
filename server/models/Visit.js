const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Visit', visitSchema);
