const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: String, // String as per user request
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  location: {
    type: String, // Combined string "lat,long"
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  time: {
    type: String, // HH:MM:SS
    required: true,
  },
}, {
  timestamps: true,
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
