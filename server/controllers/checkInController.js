const CheckIn = require('../models/CheckIn');
const DailySummary = require('../models/DailySummary');
const { uploadImage } = require('../utils/cloudinary');

/**
 * Controller for Check-In APIs
 */
const createCheckIn = async (req, res) => {
  try {
    const { 
      outsidePhoto, 
      insidePhoto, 
      latitude, 
      longitude, 
      locationName,
      timestamp 
    } = req.body;

    const employeeId = req.user ? req.user._id : req.body.employeeId;

    if (!outsidePhoto || !insidePhoto || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Outside photo, inside photo, and GPS coordinates are required' });
    }

    const checkInDate = new Date().toISOString().split('T')[0];

    // 1. Upload both photos to Cloudinary
    console.log('[CheckIn] Uploading photos to Cloudinary...');
    let outsidePhotoUrl, insidePhotoUrl;
    try {
      [outsidePhotoUrl, insidePhotoUrl] = await Promise.all([
        uploadImage(outsidePhoto),
        uploadImage(insidePhoto)
      ]);
    } catch (uploadError) {
      console.error('Cloudinary Upload Error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload images to cloud storage', error: uploadError.message });
    }

    // 2. Create the CheckIn record
    const checkIn = await CheckIn.create({
      employeeId,
      locationName: locationName || 'Unknown Location',
      outsidePhoto: outsidePhotoUrl,
      insidePhoto: insidePhotoUrl,
      latitude,
      longitude,
      timestamp: timestamp || new Date(),
      date: checkInDate
    });

    // 3. Update Daily Summary
    // Increment totalCheckins and update last seen info
    await DailySummary.findOneAndUpdate(
      { employeeId, date: checkInDate },
      { 
        $inc: { totalCheckins: 1 },
        $set: { 
          lastLocation: { latitude, longitude, name: locationName },
          lastActiveTime: new Date()
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: checkIn
    });
  } catch (error) {
    console.error('Create Check-In Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  createCheckIn
};
