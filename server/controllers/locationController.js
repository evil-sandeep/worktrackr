const locationService = require('../services/locationService');

/**
 * Controller for Location APIs
 */
const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude, employeeId, timestamp, isGpsEnabled } = req.body;

    // Use authenticated user ID if available, otherwise use employeeId from body
    const targetEmployeeId = req.user ? req.user._id : employeeId;

    if (!targetEmployeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Validation for GPS being ON
    if (isGpsEnabled && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({ message: 'Latitude and Longitude are required when GPS is enabled' });
    }

    const log = await locationService.saveLocationLog({
      employeeId: targetEmployeeId,
      latitude,
      longitude,
      timestamp,
      isGpsEnabled: isGpsEnabled !== undefined ? isGpsEnabled : true,
    });

    res.status(201).json({
      success: true,
      message: 'Location saved successfully',
      data: log
    });
  } catch (error) {
    console.error('Save Location Error:', error);
    res.status(500).json({ message: 'Failed to save location', error: error.message });
  }
};

const getLocationLogs = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;

    if (!employeeId || !date) {
      return res.status(400).json({ message: 'Employee ID and date (YYYY-MM-DD) are required' });
    }

    const logs = await locationService.getLocationLogsByDate(employeeId, date);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get Location Logs Error:', error);
    res.status(500).json({ message: 'Failed to fetch location logs', error: error.message });
  }
};

module.exports = {
  saveLocation,
  getLocationLogs
};
