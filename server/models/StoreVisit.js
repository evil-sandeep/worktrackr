const mongoose = require('mongoose');

const storeVisitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    }
  },
  photos: {
    outside: {
      type: String, // Cloudinary URL
      required: true,
    },
    inside: {
      type: String, // Cloudinary URL
      required: true,
    }
  },
  status: {
    type: String,
    default: 'completed'
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('StoreVisit', storeVisitSchema);
