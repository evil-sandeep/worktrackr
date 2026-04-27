const User = require('../models/User');

// @desc    Get global statistics for Super Admin
// @route   GET /api/admin/super/stats
// @access  Private/SuperAdmin
const getSuperAdminStats = async (req, res) => {
  try {
    const totalOrganizations = await User.countDocuments({ role: { $in: ['orgadmin', 'admin'] } });
    
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
    // Fetch all users to include orgadmins, admins, and potentially other superadmins
    const users = await User.find({}).select('-password');
    
    // Attach employee stats if they are an admin or orgadmin, or just return user data
    const usersWithContext = await Promise.all(users.map(async (user) => {
      // If user is a tenant/admin, get their org stats
      if (user.role === 'admin' || user.role === 'orgadmin') {
        const orgEmployees = await User.find({ organizationId: user._id, role: 'employee' });
        const totalStaff = orgEmployees.length;
        const paidStaff = orgEmployees.filter(emp => emp.isPaid).length;
        const unpaidStaff = totalStaff - paidStaff;
        const revenue = paidStaff * 100;

        return {
          ...user._doc,
          stats: {
            totalStaff,
            paidStaff,
            unpaidStaff,
            revenue
          }
        };
      }
      
      // If user is just an employee, return as is
      return {
        ...user._doc,
        stats: {
          totalStaff: 0,
          paidStaff: 0,
          unpaidStaff: 0,
          revenue: 0
        }
      };
    }));

    res.json(usersWithContext);
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
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // CRITICAL: Protect Super Admin accounts
    if (org.role === 'superadmin') {
      return res.status(403).json({ message: 'CRITICAL SECURITY: Super Admin accounts cannot be deleted.' });
    }

    if (org.role !== 'orgadmin' && org.role !== 'admin') {
      return res.status(400).json({ message: 'Only organization accounts can be deleted.' });
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

// @desc    Grant admin dashboard permission to a user
// @route   PUT /api/admin/super/organizations/:id/grant-admin
// @access  Private/SuperAdmin
const grantAdminPermission = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Role 'orgadmin' now indicates an approved admin who can see the admin dashboard
    user.role = 'orgadmin';
    user.organizationId = user._id;
    const sanitizedName = user.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const shortId = user._id.toString().slice(-4);
    user.dbName = `worktrackr_org_${sanitizedName}_${shortId}`;
    await user.save();

    res.json({ message: `${user.name} has been promoted to Organization Admin.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke admin dashboard permission (demote back to employee)
// @route   PUT /api/admin/super/organizations/:id/revoke-admin
// @access  Private/SuperAdmin
const revokeAdminPermission = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Demote back to regular employee
    user.role = 'employee';
    await user.save();

    res.json({ message: `${user.name} has been demoted back to employee.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSuperAdminStats,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
  grantAdminPermission,
  revokeAdminPermission,
};
