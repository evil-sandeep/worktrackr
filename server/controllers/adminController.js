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
    const { organizationId } = req.query;
    
    // CASE 1: Super Admin Global Directory (No specific orgId provided)
    if (req.user.role === 'superadmin' && !organizationId) {
      const MainUser = require('../models/User');
      const { getTenantDb } = require('../config/tenantConnection');
      const { getTenantModels } = require('../models/tenantModels');

      // Get all organization admins to find their dbNames
      const orgs = await MainUser.find({ role: 'orgadmin' }).select('_id dbName name');
      let allEmployees = [];

      for (const org of orgs) {
        if (!org.dbName) continue;
        try {
          const connection = await getTenantDb(org.dbName);
          const { User: TenantUser } = getTenantModels(connection);
          const orgEmployees = await TenantUser.find({ role: 'employee' }).select('-password');
          
          // Attach org name for context in the global list
          const employeesWithOrg = orgEmployees.map(emp => ({
            ...emp._doc,
            organizationName: org.name
          }));
          
          allEmployees = [...allEmployees, ...employeesWithOrg];
        } catch (err) {
          console.error(`Error fetching employees for org ${org.name}:`, err);
        }
      }
      
      return res.status(200).json(allEmployees);
    }

    // CASE 2: Specific Tenant Directory
    const { User } = req.tenantModels;
    let query = {};

    if (req.user.role === 'orgadmin') {
      query = { organizationId: req.user._id, role: 'employee' };
    } else if (req.user.role === 'superadmin' && organizationId) {
      query = { organizationId, role: 'employee' };
    } else {
      query = { organizationId: req.user.organizationId, role: 'employee' };
    }

    const employees = await User.find(query).select('-password').sort({ createdAt: -1 });
    return res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ message: 'Server Error: Unable to fetch employees' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { User } = req.tenantModels;
    const { name, email, phone, empId, password, isOrgAdmin, organizationId } = req.body;

    // Check in tenant DB
    const userExists = await User.findOne({ $or: [{ email }, { empId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or Employee ID already exists in this organization' });
    }

    let assignedRole = 'employee';
    let assignedOrgId = req.user._id;

    if (req.user.role === 'superadmin') {
      if (isOrgAdmin) {
        assignedRole = 'orgadmin';
        assignedOrgId = null;
      } else {
        assignedOrgId = organizationId || null;
      }
    }

    const user = await User.create({
      name,
      email,
      phone,
      empId,
      password,
      role: assignedRole,
      organizationId: assignedRole === 'orgadmin' ? null : assignedOrgId,
      isPaid: false,
      status: 'inactive'
    });

    if (assignedRole === 'orgadmin') {
      user.organizationId = user._id;
      // Generate unique DB name: worktrackr_org_<sanitized_name>_<short_id>
      const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const shortId = user._id.toString().slice(-4);
      user.dbName = `worktrackr_org_${sanitizedName}_${shortId}`;
      await user.save();
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { User } = req.tenantModels;
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

const getEmployeeDailyTracking = async (req, res) => {
  try {
    const { LocationLog, CheckIn, Visit, DailySummary } = req.tenantModels;
    const { id } = req.params;
    const { date } = req.query;

    if (!id || !date) {
      return res.status(400).json({ message: 'Employee ID and date are required' });
    }

    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59.999`);

    const rangeQuery = {
      employeeId: id,
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    };

    const visitRangeQuery = {
      employeeId: id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    };

    const [locations, checkIns, visits, summary] = await Promise.all([
      LocationLog.find(rangeQuery).sort({ timestamp: 1 }),
      CheckIn.find({ employeeId: id, date }).sort({ timestamp: 1 }),
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
  createEmployee,
};
