const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  checkIn: {
    imageUrl: { type: String },
    location: { type: String },
    time: { type: String }
  },
  checkOut: {
    imageUrl: { type: String },
    location: { type: String },
    time: { type: String }
  },
  totalHours: {
    type: String,
    default: 'In Progress'
  },
  earning: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present',
    required: true,
  }
}, {
  timestamps: true,
});

// Ensure one record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
