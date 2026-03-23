const Attendance = require('../models/Attendance');
const { uploadImage } = require('../utils/cloudinary');

// @desc    Mark daily attendance
const markAttendance = async (req, res) => {
  try {
    const { image, location, date, time, status = 'present' } = req.body;
    
    // Use userId from authenticated user or fallback to body
    const userId = req.user ? req.user._id.toString() : req.body.userId;

    // 0. Security/Business Logic Validations
    const now = new Date();
    const serverToday = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    
    if (date !== serverToday) {
      return res.status(400).json({ message: 'Backdated attendance is not allowed. Capture today only.' });
    }

    // Check for existing record today
    const existingRecord = await Attendance.findOne({ userId, date });
    if (existingRecord) {
      return res.status(400).json({ message: 'Attendance already marked for today.' });
    }

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

// @desc    Fetch attendance logs for a specific user with optional filtering
const getAttendanceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query; // Optional filters: YYYY-MM
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    let query = { userId };
    
    // If filtering by specific month (YYYY-MM style regex)
    if (year && month) {
      const monthStr = `${year}-${month.padStart(2, '0')}`;
      query.date = { $regex: `^${monthStr}` };
    }

    const records = await Attendance.find(query).sort({ date: -1, time: -1 });

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

/**
 * Mark checkout for today
 */
const markCheckout = async (req, res) => {
  try {
    const { image, location, date, time } = req.body;
    const userId = req.user ? req.user._id.toString() : req.body.userId;

    if (!image || !location || !date || !time || !userId) {
      return res.status(400).json({ message: 'Missing required checkout data' });
    }

    // 0. Security: Today Only
    const now = new Date();
    const serverToday = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    if (date !== serverToday) {
      return res.status(400).json({ message: 'Backdated checkout is not allowed.' });
    }

    // 1. Find existing check-in for today
    const attendance = await Attendance.findOne({ userId, date });
    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today. Please check-in first.' });
    }

    if (attendance.checkoutTime) {
      return res.status(400).json({ message: 'You have already checked out for today.' });
    }

    // 2. Upload to Cloudinary
    const uploadedImage = await uploadImage(image);

    // 3. Update record
    attendance.checkoutImageUrl = uploadedImage;
    attendance.checkoutLocation = location;
    attendance.checkoutTime = time;

    await attendance.save();

    res.status(200).json({
      message: 'Checkout logged successfully!',
      attendance
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ message: 'Internal server error while logging checkout' });
  }
};

module.exports = {
  markAttendance,
  getAttendanceByUserId,
  markCheckout
};
