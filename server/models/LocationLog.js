const mongoose = require('mongoose');

const locationLogSchema = new mongoose.Schema({
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
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isGpsEnabled: {
    type: Boolean,
    default: true,
  }
});

// Index for querying by employee and timestamp
locationLogSchema.index({ employeeId: 1, timestamp: -1 });

module.exports = mongoose.model('LocationLog', locationLogSchema);
