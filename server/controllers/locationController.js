const locationService = require('../services/locationService');

const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude, isGpsEnabled } = req.body;
    const employeeId = req.user ? req.user._id : req.body.employeeId;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    if (isGpsEnabled && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({ message: 'Latitude and Longitude are required when GPS is enabled' });
    }

    const gpsStatus = isGpsEnabled !== undefined ? isGpsEnabled : true;

    const log = await locationService.saveLocationLog(
      employeeId,
      latitude,
      longitude,
      gpsStatus
    );

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

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
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
