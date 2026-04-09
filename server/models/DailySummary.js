const mongoose = require('mongoose');

const DailySummarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  totalCheckins: {
    type: Number,
    default: 0,
  },
  lastLocation: {
    type: {
      latitude: Number,
      longitude: Number,
      name: String,
    },
    default: null,
  },
  lastActiveTime: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound unique index: Only one summary per employee per day
DailySummarySchema.index({ employeeId: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('DailySummary', DailySummarySchema);
