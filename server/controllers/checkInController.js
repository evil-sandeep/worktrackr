const checkInService = require('../services/checkInService');

/**
 * Controller for Check-In APIs
 * Focuses on request validation and response handling
 */
const createCheckIn = async (req, res) => {
  try {
    const { 
      outsidePhoto, 
      insidePhoto, 
      latitude, 
      longitude, 
      accuracy,
      locationName,
      addressComponents,
      timestamp 
    } = req.body;

    // Use authenticated user ID if available, otherwise fallback to provided ID
    const employeeId = req.user ? req.user._id : req.body.employeeId;

    // 1. Validation
    if (!outsidePhoto || !insidePhoto) {
      return res.status(400).json({ message: 'Both outside and inside photos are required' });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'GPS coordinates are required' });
    }

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    if (accuracy && accuracy > 100) {
      return res.status(400).json({ message: `GPS accuracy is too low (${Math.round(accuracy)}m). Please move to an open area.` });
    }

    // 2. Delegate business logic to Service
    const checkIn = await checkInService.processCheckIn({
      employeeId,
      outsidePhoto,
      insidePhoto,
      latitude,
      longitude,
      accuracy,
      locationName,
      addressComponents,
      timestamp
    });

    // 3. Response
    res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: checkIn
    });
  } catch (error) {
    console.error('Check-In Controller Error:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      success: false 
    });
  }
};

module.exports = {
  createCheckIn
};
