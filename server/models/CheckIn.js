const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  locationName: {
    type: String,
    optional: true, // Defined as optional by user
  },
  outsidePhoto: {
    type: String,
    required: true, // String URL
  },
  insidePhoto: {
    type: String,
    required: true, // String URL
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
}, {
  timestamps: true,
});

// Compound index for efficient querying by employee and date
CheckInSchema.index({ employeeId: 1, date: -1 });
// Index on timestamp for chronological ordering
CheckInSchema.index({ timestamp: -1 });

module.exports = mongoose.model('CheckIn', CheckInSchema);
