const saveLocationLog = async (LocationLog, employeeId, latitude, longitude, isGpsEnabled) => {
  const log = await LocationLog.create({
    employeeId,
    latitude,
    longitude,
    isGpsEnabled
  });
  return log;
};

/**
 * Get location logs for a specific day
 */
const getLocationLogsByDate = async (LocationLog, employeeId, dateStr) => {
  let query = { employeeId };

  if (dateStr) {
    const startOfDay = new Date(dateStr);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    query.timestamp = {
      $gte: startOfDay,
      $lt: endOfDay
    };
  }

  const logs = await LocationLog.find(query).sort({ timestamp: 1 });
  return logs;
};

module.exports = {
  saveLocationLog,
  getLocationLogsByDate
};
