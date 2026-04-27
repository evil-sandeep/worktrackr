const User = require('../models/User');

// @desc    Create a new employee tied to an organization
// @route   POST /api/users/org/:orgId/employees
// @access  Private
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, empId, designation, salary } = req.body;
    const orgId = req.params.orgId || req.user.organizationId;

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { empId }] });
    if (userExists) {
      return res.status(400).json({ message: "User with this email or Employee ID already exists" });
    }

    const employee = await User.create({
      name,
      email,
      password,
      phone: phone || 'N/A',
      empId: empId || `EMP${Date.now().toString().slice(-6)}`,
      role: "employee",
      organizationId: orgId,
      designation: designation || '',
      salary: salary || 0
    });

    res.status(201).json(employee);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employees strictly filtered by organization
// @route   GET /api/users/org/:orgId/employees
// @access  Private
const getEmployeesByOrg = async (req, res) => {
  try {
    const orgId = req.params.orgId || req.query.orgId || req.user.organizationId;

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID required" });
    }

    const employees = await User.find({
      organizationId: orgId,
      role: "employee"
    }).lean();

    res.status(200).json(employees);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployeesByOrg
};
