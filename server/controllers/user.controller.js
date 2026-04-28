const User = require('../models/User');

// @desc    Create a new employee tied to an organization
// @route   POST /api/users/org/:orgId/employees
// @access  Private
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, empId, designation, salary } = req.body;
    const orgId = req.params.orgId || req.query.orgId || req.user.organizationId;

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID required" });
    }

    const UserModel = req.tenantModels?.User || User;

    // Check if user already exists
    const userExists = await UserModel.findOne({ $or: [{ email }, { empId }] });
    if (userExists) {
      return res.status(400).json({ message: "User with this email or Employee ID already exists" });
    }

    const employee = await UserModel.create({
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

    const UserModel = req.tenantModels?.User || User;

    const employees = await UserModel.find({
      organizationId: orgId,
      role: "employee"
    }).lean();

    res.status(200).json(employees);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsPaid = async (req, res) => {
  try {
    const { User: TenantUser } = req.tenantModels || {};
    const MainUser = require('../models/User');
    const targetId = req.params.id;
    
    console.log(`[AUTH DEBUG] markAsPaid: Execution started for UserID: ${targetId}`);
    let user = null;
    
    // 1. Try finding in Tenant DB if available
    if (TenantUser) {
      console.log(`[AUTH DEBUG] markAsPaid: Searching in TENANT DB: ${TenantUser.db.name} for UserID: ${targetId}`);
      user = await TenantUser.findById(targetId);
      if (user) console.log(`[AUTH DEBUG] markAsPaid: FOUND user ${user.name} in Tenant DB.`);
    }
    
    // 2. Fallback to Main DB
    if (!user) {
      console.log(`[AUTH DEBUG] markAsPaid: Searching in MAIN DB for UserID: ${targetId}`);
      user = await MainUser.findById(targetId);
      if (user) console.log(`[AUTH DEBUG] markAsPaid: FOUND user ${user.name} in Main DB.`);
    }

    if (!user) {
      const fs = require('fs');
      const logMsg = `\n[CONTROLLER FAIL] ${new Date().toISOString()} - markAsPaid FAILED - TargetID: ${targetId} - TenantDB: ${TenantUser ? TenantUser.db.name : 'NONE'}\n`;
      fs.appendFileSync('auth_debug.log', logMsg);
      
      console.warn(`[AUTH DEBUG] markAsPaid: FAILED to find user ${targetId} in any database.`);
      return res.status(404).json({ message: "Identity not found in any database domain" });
    }

    user.isPaid = true;
    await user.save();
    
    const fs = require('fs');
    const logMsg = `\n[CONTROLLER TRACE] ${new Date().toISOString()} - markAsPaid SUCCESS - User: ${user.name} - DB: ${user.db.name}\n`;
    fs.appendFileSync('auth_debug.log', logMsg);

    console.log(`[AUTH DEBUG] markAsPaid: SUCCESS for ${user.name}. Status set to PAID.`);

    res.status(200).json({ message: "Payment successful", user });
  } catch (error) {
    console.error(`[AUTH DEBUG] markAsPaid: ERROR: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployeesByOrg,
  markAsPaid
};
