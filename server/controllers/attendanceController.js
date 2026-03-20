const Attendance = require('../models/Attendance');
const { uploadImage } = require('../utils/cloudinary');

// @desc    Mark daily attendance
const markAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { image, latitude, longitude, date, time } = req.body;

    if (!image || !latitude || !longitude || !date || !time) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // 1. Upload image to Cloudinary
    let imageUrl;
    try {
      imageUrl = await uploadImage(image);
    } catch (uploadError) {
      console.error('Controller Error - Cloudinary:', uploadError.message);
      return res.status(500).json({ 
        message: 'Failed to upload image to Cloudinary',
        details: uploadError.message 
      });
    }

    // 2. Save data in MongoDB
    const attendance = await Attendance.create({
      userId,
      imageUrl,
      latitude,
      longitude,
      date,
      time,
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Attendance Controller General Error:', error);
    res.status(500).json({ message: 'Server error while marking attendance' });
  }
};

module.exports = {
  markAttendance,
};
