const mongoose = require('mongoose');

const LocationLogSchema = new mongoose.Schema({
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
  timestamp: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: String, // Format: YYYY-MM-DD for easier indexing/querying
    required: true,
  },
  isGpsEnabled: {
    type: Boolean,
    default: true,
  },
  isDataEnabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient querying by employee and date
LocationLogSchema.index({ employeeId: 1, date: -1 });
// Index on timestamp for chronological ordering
LocationLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('LocationLog', LocationLogSchema);
