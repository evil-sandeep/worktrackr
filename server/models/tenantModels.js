const User = require('./User');
const Attendance = require('./Attendance');
const CheckIn = require('./CheckIn');
const DailySummary = require('./DailySummary');
const LocationLog = require('./LocationLog');
const Visit = require('./Visit');

/**
 * Attaches models to a specific tenant connection.
 * @param {mongoose.Connection} connection 
 */
const getTenantModels = (connection) => {
  return {
    User: connection.model('User', User.schema),
    Attendance: connection.model('Attendance', Attendance.schema),
    CheckIn: connection.model('CheckIn', CheckIn.schema),
    DailySummary: connection.model('DailySummary', DailySummary.schema),
    LocationLog: connection.model('LocationLog', LocationLog.schema),
    Visit: connection.model('Visit', Visit.schema),
  };
};

module.exports = { getTenantModels };
