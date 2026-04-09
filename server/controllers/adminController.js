const User = require('../models/User');
const LocationLog = require('../models/LocationLog');
const CheckIn = require('../models/CheckIn');
const DailySummary = require('../models/DailySummary');
const Visit = require('../models/Visit');

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private/Admin
const getAllEmployees = async (req, res) => {
  try {
    // Fetch all users from the database, excluding their passwords
    const employees = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Return the response in JSON format
    return res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ message: 'Server Error: Unable to fetch employees' });
  }
};

// @desc    Get employee by ID
// @route   GET /api/admin/employees/:id
// @access  Private/Admin
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    return res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    return res.status(500).json({ message: 'Server Error: Unable to fetch employee' });
  }
};

/**
 * @desc    Get complete daily tracking data for an employee
 * @route   GET /api/admin/employees/:id/daily?date=YYYY-MM-DD
 * @access  Private/Admin
 */
const getEmployeeDailyTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!id || !date) {
      return res.status(400).json({ message: 'Employee ID and date are required' });
    }

    // Construct date range that is inclusive of the client's local day
    // We treat the 'YYYY-MM-DD' as the start of the day in local time
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59.999`);

    const rangeQuery = {
      employeeId: id,
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    };

    // Note: Visit model uses 'createdAt' instead of 'timestamp'
    const visitRangeQuery = {
      employeeId: id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    };

    // Fetch all data in parallel
    const [locations, checkIns, visits, summary] = await Promise.all([
      LocationLog.find(rangeQuery).sort({ timestamp: 1 }),
      CheckIn.find({ employeeId: id, date }).sort({ timestamp: 1 }), // Uses 'date' string
      Visit.find(visitRangeQuery).sort({ createdAt: 1 }),
      DailySummary.findOne({ employeeId: id, date })
    ]);

    return res.status(200).json({
      success: true,
      employeeId: id,
      date,
      data: {
        locations,
        checkIns,
        visits: visits || [],
        summary: summary || { totalCheckins: 0, lastLocation: null, lastActiveTime: null }
      }
    });
  } catch (error) {
    console.error('Daily Tracking Error:', error);
    return res.status(500).json({ message: 'Failed to fetch daily tracking data' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getEmployeeDailyTracking,
};
