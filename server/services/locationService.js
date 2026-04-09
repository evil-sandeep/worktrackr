const LocationLog = require('../models/LocationLog');
const DailySummary = require('../models/DailySummary');

/**
 * Service to handle location-related business logic
 */
class LocationService {
  /**
   * Save a new location log and update daily summary
   */
  async saveLocationLog(data) {
    const { employeeId, latitude, longitude, timestamp, isGpsEnabled, date } = data;

    let finalLat = latitude;
    let finalLng = longitude;
    let gpsStatus = isGpsEnabled;

    // Use current date if not provided
    const logDate = date || new Date().toISOString().split('T')[0];

    // If GPS is OFF, fetch last known location
    if (!gpsStatus) {
      const lastLog = await LocationLog.findOne({ employeeId })
        .sort({ timestamp: -1 })
        .select('latitude longitude');
      
      if (lastLog) {
        finalLat = lastLog.latitude;
        finalLng = lastLog.longitude;
      } else {
        // If no previous logs found, default to 0,0 or keep as provided
        finalLat = latitude || 0;
        finalLng = longitude || 0;
      }
    }

    // 1. Create the location log
    const locationLog = await LocationLog.create({
      employeeId,
      latitude: finalLat,
      longitude: finalLng,
      timestamp: timestamp || new Date(),
      date: logDate,
      isGpsEnabled: gpsStatus,
    });

    // 2. Update Daily Summary
    // Update last location and last active time
    await DailySummary.findOneAndUpdate(
      { employeeId, date: logDate },
      { 
        $set: { 
          lastLocation: { latitude: finalLat, longitude: finalLng },
          lastActiveTime: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return locationLog;
  }

  /**
   * Get all location logs for an employee on a specific date
   */
  async getLocationLogsByDate(employeeId, date) {
    return await LocationLog.find({ employeeId, date }).sort({ timestamp: 1 });
  }
}

module.exports = new LocationService();
