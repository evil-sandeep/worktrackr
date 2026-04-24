const User = require('../models/User');

// @desc    Get global statistics for Super Admin
// @route   GET /api/admin/super/stats
// @access  Private/SuperAdmin
const getSuperAdminStats = async (req, res) => {
  try {
    const totalOrganizations = await User.countDocuments({ role: 'orgadmin' });
    
    const employees = await User.find({ role: 'employee' });
    const totalEmployees = employees.length;
    const paidEmployees = employees.filter(emp => emp.isPaid).length;
    const unpaidEmployees = totalEmployees - paidEmployees;
    
    // Revenue is ₹100 per paid employee
    const totalRevenue = paidEmployees * 100;

    res.json({
      totalOrganizations,
      totalEmployees,
      paidEmployees,
      unpaidEmployees,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all organizations and their statistics
// @route   GET /api/admin/super/organizations
// @access  Private/SuperAdmin
const getOrganizations = async (req, res) => {
  try {
    const organizations = await User.find({ role: 'orgadmin' }).select('-password');
    
    // Attach employee stats to each organization
    const orgsWithStats = await Promise.all(organizations.map(async (org) => {
      const orgEmployees = await User.find({ organizationId: org._id, role: 'employee' });
      const totalStaff = orgEmployees.length;
      const paidStaff = orgEmployees.filter(emp => emp.isPaid).length;
      const unpaidStaff = totalStaff - paidStaff;
      const revenue = paidStaff * 100;

      return {
        ...org._doc,
        stats: {
          totalStaff,
          paidStaff,
          unpaidStaff,
          revenue
        }
      };
    }));

    res.json(orgsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update organization
// @route   PUT /api/admin/super/organizations/:id
// @access  Private/SuperAdmin
const updateOrganization = async (req, res) => {
  try {
    const org = await User.findById(req.params.id);
    if (!org || org.role !== 'orgadmin') {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const { name, email, phone } = req.body;
    if (name) org.name = name;
    if (email) org.email = email;
    if (phone) org.phone = phone;

    const updatedOrg = await org.save();
    res.json(updatedOrg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete organization and its employees
// @route   DELETE /api/admin/super/organizations/:id
// @access  Private/SuperAdmin
const deleteOrganization = async (req, res) => {
  try {
    const org = await User.findById(req.params.id);
    if (!org || org.role !== 'orgadmin') {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Find all employees belonging to this org
    const employees = await User.find({ organizationId: org._id });
    const employeeIds = employees.map(emp => emp._id);

    // Delete attendance/checkins for these employees
    const Attendance = require('../models/Attendance');
    const CheckIn = require('../models/CheckIn');
    await Attendance.deleteMany({ userId: { $in: employeeIds } });
    await CheckIn.deleteMany({ userId: { $in: employeeIds } });

    // Delete the employees
    await User.deleteMany({ organizationId: org._id });

    // Delete the organization
    await User.deleteOne({ _id: org._id });

    res.json({ message: 'Organization and all associated data removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSuperAdminStats,
  getOrganizations,
  updateOrganization,
  deleteOrganization
};
