const User = require('../models/User');

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

module.exports = {
  getAllEmployees,
  getEmployeeById,
};
