const Attendance = require('../models/Attendance');
const { uploadImage } = require('../utils/cloudinary');
const { calculateWorkingHours, calculateEarnings } = require('../utils/timeCalculator');



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
      return res.status(500).json({ 
        message: 'Attendance capture failed (Cloudinary error). Please verify server setup.',
        details: uploadError.message,
        help: 'Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in production.'
      });
    }

    // 2. Save record in MongoDB with nested structure
    const attendance = await Attendance.create({
      userId,
      date,
      checkIn: {
        imageUrl,
        location,
        time,
      },
      status: 'present'
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

    const attendance = await Attendance.find(query).sort({ date: -1 });

    // Auto-heal records that were created before the calculation logic was added
    for (const record of attendance) {
      const needsHealing = !record.totalHours || record.totalHours === 'In Progress' || record.earning === 0;
      const canHeal = record.checkIn?.time && record.checkOut?.time;

      if (needsHealing && canHeal) {
        console.log(`Auto-healing record for date: ${record.date}`);
        const duration = calculateWorkingHours(record.checkIn.time, record.checkOut.time);
        record.totalHours = duration;
        record.earning = calculateEarnings(duration);
        await record.save();
        console.log(`Healed: ${duration}, ₹${record.earning}`);
      }
    }

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
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
      return res.status(404).json({ message: 'Please check-in first' });
    }

    if (attendance.checkOut && attendance.checkOut.time) {
      return res.status(400).json({ message: 'Check-out already completed' });
    }

    // 2. Upload to Cloudinary
    let uploadedImage;
    try {
      uploadedImage = await uploadImage(image);
    } catch (uploadError) {
      console.error('Checkout Cloudinary Error:', uploadError.message);
      return res.status(500).json({ 
        message: 'Checkout capture failed (Cloudinary error). Please verify server setup.',
        details: uploadError.message,
        help: 'Ensure Cloudinary environment variables are correctly set in your host dashboard.'
      });
    }

    // 3. Update record with checkout data and calculate working hours
    attendance.checkOut = {
      imageUrl: uploadedImage,
      location,
      time
    };

    // Calculate duration and earnings
    if (attendance.checkIn && attendance.checkIn.time) {
      const duration = calculateWorkingHours(attendance.checkIn.time, time);
      attendance.totalHours = duration;
      attendance.earning = calculateEarnings(duration);
    }

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
