const Attendance = require('../models/Attendance');
const { uploadImage } = require('../utils/cloudinary');
const { calculateWorkingHours, calculateEarnings } = require('../utils/timeCalculator');



// @desc    Mark daily attendance
const markAttendance = async (req, res) => {
  try {
    const { Attendance } = req.tenantModels;
    const { image, location, date, time, status = 'present' } = req.body;

    const userId = req.user ? req.user._id.toString() : req.body.userId;

    const now = new Date();
    const serverToday = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    if (date !== serverToday) {
      return res.status(400).json({ message: 'Backdated attendance is not allowed. Capture today only.' });
    }

    const existingRecord = await Attendance.findOne({ userId, date });
    if (existingRecord) {
      return res.status(400).json({ message: 'Attendance already marked for today.' });
    }

    if (!image || !location || !date || !time || !userId) {
      return res.status(400).json({ message: 'Missing required attendance data' });
    }

    let imageUrl;
    try {
      imageUrl = await uploadImage(image);
    } catch (uploadError) {
      console.error('Cloudinary Upload Error:', uploadError.message);
      return res.status(500).json({ 
        message: 'Attendance capture failed (Cloudinary error). Please verify server setup.',
        details: uploadError.message
      });
    }

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

const getAttendanceByUserId = async (req, res) => {
  try {
    const { Attendance } = req.tenantModels;
    const { userId } = req.params;
    const { month, year } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    let query = { userId };

    if (year && month) {
      const monthStr = `${year}-${month.padStart(2, '0')}`;
      query.date = { $regex: `^${monthStr}` };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    for (const record of attendance) {
      const needsHealing = !record.totalHours || record.totalHours === 'In Progress' || record.earning === 0;
      const canHeal = record.checkIn?.time && record.checkOut?.time;

      if (needsHealing && canHeal) {
        const duration = calculateWorkingHours(record.checkIn.time, record.checkOut.time);
        record.totalHours = duration;
        record.earning = calculateEarnings(duration);
        await record.save();
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

const markCheckout = async (req, res) => {
  try {
    const { Attendance } = req.tenantModels;
    const { image, location, date, time } = req.body;
    const userId = req.user ? req.user._id.toString() : req.body.userId;

    if (!image || !location || !date || !time || !userId) {
      return res.status(400).json({ message: 'Missing required checkout data' });
    }

    const now = new Date();
    const serverToday = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    if (date !== serverToday) {
      return res.status(400).json({ message: 'Backdated checkout is not allowed.' });
    }

    const attendance = await Attendance.findOne({ userId, date });
    if (!attendance) {
      return res.status(404).json({ message: 'Please check-in first' });
    }

    if (attendance.checkOut && attendance.checkOut.time) {
      return res.status(400).json({ message: 'Check-out already completed' });
    }

    let uploadedImage;
    try {
      uploadedImage = await uploadImage(image);
    } catch (uploadError) {
      console.error('Checkout Cloudinary Error:', uploadError.message);
      return res.status(500).json({ 
        message: 'Checkout capture failed (Cloudinary error).',
        details: uploadError.message
      });
    }

    attendance.checkOut = {
      imageUrl: uploadedImage,
      location,
      time
    };

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
