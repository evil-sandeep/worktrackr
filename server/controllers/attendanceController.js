const Attendance = require('../models/Attendance');
const { uploadImage } = require('../utils/cloudinary');
const { calculateWorkingHours, calculateEarnings } = require('../utils/timeCalculator');



// @desc    Mark daily attendance
const markAttendance = async (req, res) => {
  try {
    const { Attendance } = req.tenantModels;
    const { image, location, date, time, status = 'present' } = req.body;

    const userId = req.user ? req.user._id.toString() : req.body.userId;

    // PAYMENT RESTRICTION: Employees with an organization cannot check-in until they have paid 2000 units
    if (req.user && req.user.role === 'employee' && req.user.organizationId && !req.user.isPaid) {
      return res.status(403).json({ 
        message: 'CHECK-IN RESTRICTED: Full account activation (2000 Units) required. Please contact your administrator.',
        isPaymentRequired: true 
      });
    }

    const now = new Date();
    // Use ISO string to get YYYY-MM-DD safely
    const serverToday = now.toISOString().split('T')[0];
    
    // Calculate yesterday and tomorrow to allow for timezone differences
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const serverYesterday = yesterday.toISOString().split('T')[0];
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const serverTomorrow = tomorrow.toISOString().split('T')[0];

    // Allow the client's local date as long as it's within 1 day of the server's UTC date
    if (date !== serverToday && date !== serverYesterday && date !== serverTomorrow) {
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

    // PAYMENT RESTRICTION: Employees with an organization cannot view attendance logs until they have paid
    if (req.user && req.user.role === 'employee' && req.user.organizationId && !req.user.isPaid) {
      return res.status(403).json({ 
        message: 'CALENDAR RESTRICTED: Full account activation (2000 Units) required.',
        isPaymentRequired: true 
      });
    }

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
    // Use ISO string to get YYYY-MM-DD safely
    const serverToday = now.toISOString().split('T')[0];
    
    // Calculate yesterday and tomorrow to allow for timezone differences
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const serverYesterday = yesterday.toISOString().split('T')[0];
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const serverTomorrow = tomorrow.toISOString().split('T')[0];

    if (date !== serverToday && date !== serverYesterday && date !== serverTomorrow) {
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
