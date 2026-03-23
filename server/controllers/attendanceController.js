const Attendance = require('../models/Attendance');
const { uploadImage } = require('../utils/cloudinary');

// @desc    Mark daily attendance
const markAttendance = async (req, res) => {
  try {
    const { image, location, date, time, status = 'present' } = req.body;
    
    // Use userId from authenticated user or fallback to body
    const userId = req.user ? req.user._id.toString() : req.body.userId;

    if (!image || !location || !date || !time || !userId) {
      return res.status(400).json({ message: 'Missing required attendance data' });
    }

    // 1. Upload base64 image to Cloudinary
    let imageUrl;
    try {
      imageUrl = await uploadImage(image);
    } catch (uploadError) {
      console.error('Cloudinary Upload Error:', uploadError.message);
      return res.status(500).json({ message: 'Cloudinary upload failed' });
    }

    // 2. Save record in MongoDB
    const attendance = await Attendance.create({
      userId,
      imageUrl,
      location,
      status,
      date,
      time,
    });

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Attendance Controller Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Fetch all attendance for a specific user
const getAttendanceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const records = await Attendance.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Fetch Attendance Error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance logs' });
  }
};

module.exports = {
  markAttendance,
  getAttendanceByUserId,
};
