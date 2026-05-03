const User = require('../models/User');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id, dbName) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  console.log(`Debug - Controller Generating Token with secret prefix: ${secret.substring(0, 3)}...`);
  return jwt.sign({ id, dbName }, secret, {
    expiresIn: '30d',
  });
};

// @desc    Get public list of organizations (for registration)
const getPublicOrganizations = async (req, res) => {
  try {
    const orgs = await User.find({ role: { $in: ['orgadmin', 'admin'] } }).select('name _id');
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, empId, password, role, secretCode } = req.body;

    if (!name || !email || !phone || !empId || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { empId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or Employee ID already exists' });
    }

    // Automatically set superadmin role for admin@worktrackr.com
    let assignedRole = 'employee';
    if (email.toLowerCase() === 'admin@worktrackr.com') {
      assignedRole = 'superadmin';
    } else if (role === 'orgadmin') {
      assignedRole = 'orgadmin';
    }

    let assignedOrgId = undefined;
    if (assignedRole === 'employee' && secretCode) {
      const Organization = require('../models/Organization');
      const org = await Organization.findOne({ joinCode: secretCode.trim() });
      if (org) {
        assignedOrgId = org._id;
      }
    }

    const user = await User.create({
      name,
      email,
      phone,
      empId,
      password,
      role: assignedRole,
      organizationId: assignedOrgId
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        empId: user.empId,
        role: user.role,
        token: generateToken(user._id, user.dbName),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // 1. Check Main Database (Super Admins, Org Admins)
    let user = await User.findOne({ email });
    let resolvedDbName = user?.dbName || null;

    // 2. If not found in Main DB, search all Tenant Databases
    if (!user) {
      const { getTenantDb } = require('../config/tenantConnection');
      const { getTenantModels } = require('../models/tenantModels');
      
      const orgs = await User.find({ role: 'orgadmin' }).select('dbName');
      console.log(`[LOGIN DEBUG] User ${email} not in Main DB. Searching ${orgs.length} tenants...`);
      
      for (const org of orgs) {
        if (!org.dbName) continue;
        try {
          const connection = await getTenantDb(org.dbName);
          const { User: TenantUser } = getTenantModels(connection);
          user = await TenantUser.findOne({ email });
          if (user) {
            console.log(`[LOGIN DEBUG] User found in tenant DB: ${org.dbName}`);
            resolvedDbName = org.dbName;
            break;
          }
        } catch (tenantErr) {
          console.error(`Error searching tenant ${org.dbName}:`, tenantErr.message);
        }
      }
    }

    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (user && isMatch) {
      // For employees in tenant DBs, they might not have dbName on their record, 
      // but we resolved it during login from the organization.
      if (!resolvedDbName && user.organizationId) {
        const org = await User.findById(user.organizationId).select('dbName');
        resolvedDbName = org?.dbName;
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        empId: user.empId,
        role: user.role,
        organizationId: user.organizationId,
        isPaid: user.isPaid,
        status: user.status,
        token: generateToken(user._id, resolvedDbName),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { name, phone, address, designation, profileImg } = req.body;

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      if (designation) user.designation = designation;

      // Handle profile image upload if provided as base64
      if (profileImg && profileImg.startsWith('data:image')) {
        const { uploadImage } = require('../utils/cloudinary');
        try {
          const imageUrl = await uploadImage(profileImg);
          user.profileImg = imageUrl;
        } catch (uploadError) {
          console.error('Profile image upload failed:', uploadError);
          // Continue without updating image if upload fails
        }
      } else if (profileImg === '') {
        // Clear profile image if explicitly set to empty string
        user.profileImg = '';
      } else if (profileImg) {
        // If it's already a URL or other string, just save it
        user.profileImg = profileImg;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        empId: updatedUser.empId,
        role: updatedUser.role,
        address: updatedUser.address,
        designation: updatedUser.designation,
        profileImg: updatedUser.profileImg,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error during profile update' });
  }
};

// @desc    Update employee (Admin Only)
const updateEmployee = async (req, res) => {
  try {
    const { User: TenantUser } = req.tenantModels || {};
    const MainUser = require('../models/User');
    
    let user = null;
    
    // 1. Try finding in Tenant DB if available
    if (TenantUser) {
      console.log(`[AUTH DEBUG] updateEmployee: Searching in TENANT DB: ${TenantUser.db.name}`);
      user = await TenantUser.findById(req.params.id);
    }
    
    // 2. Fallback to Main DB
    if (!user) {
      console.log(`[AUTH DEBUG] updateEmployee: Falling back to MAIN DB for ID: ${req.params.id}`);
      user = await MainUser.findById(req.params.id);
    }

    if (user) {
      console.log(`[AUTH DEBUG] updateEmployee: User ${user.name} found. Applying updates...`);
      const { name, phone, address, designation, role, salary, isPaid, password } = req.body;

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      if (designation) user.designation = designation;
      if (role) user.role = role;
      if (salary !== undefined) user.salary = salary;
      if (isPaid !== undefined) user.isPaid = isPaid;
      if (password) user.password = password;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Identity not found in any database domain' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee (Admin Only)
const deleteEmployee = async (req, res) => {
  try {
    const { User: TenantUser, Attendance: TenantAttendance } = req.tenantModels || {};
    const MainUser = require('../models/User');
    const MainAttendance = require('../models/Attendance');
    
    let user = null;
    let UserModel = null;
    
    // 1. Try finding in Tenant DB if available
    if (TenantUser) {
      console.log(`[AUTH DEBUG] deleteEmployee: Searching in TENANT DB: ${TenantUser.db.name}`);
      user = await TenantUser.findById(req.params.id);
      UserModel = TenantUser;
    }
    
    // 2. Fallback to Main DB
    if (!user) {
      console.log(`[AUTH DEBUG] deleteEmployee: Falling back to MAIN DB for ID: ${req.params.id}`);
      user = await MainUser.findById(req.params.id);
      UserModel = MainUser;
    }

    if (user) {
      console.log(`[AUTH DEBUG] deleteEmployee: User ${user.name} found. Deleting...`);
      // Also delete all attendance associated with this user
      const AttendanceModel = TenantAttendance || MainAttendance;
      await AttendanceModel.deleteMany({ userId: user._id });
      
      await UserModel.deleteOne({ _id: user._id });
      res.json({ message: 'User and associated data removed' });
    } else {
      res.status(404).json({ message: 'Identity not found in any database domain' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployees = async (req, res) => {
  try {
    const { User } = req.tenantModels;
    console.log('Fetching all database users for tenant...');
    let query = {};
    if (req.user && req.user.role === 'orgadmin') {
      query = { organizationId: req.user._id };
    }
    const employees = await User.find(query).sort({ createdAt: -1 }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminDashboardStats = async (req, res) => {
  try {
    const { User, Attendance } = req.tenantModels;
    const now = new Date();
    const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    let userQuery = { role: 'employee' };
    let attendanceQuery = { date: today };

    if (req.user && req.user.role === 'orgadmin') {
      userQuery.organizationId = req.user._id;
      const orgUsers = await User.find(userQuery).select('_id');
      const orgUserIds = orgUsers.map(u => u._id.toString());
      attendanceQuery.userId = { $in: orgUserIds };
    }

    const totalEmployees = await User.countDocuments(userQuery);
    
    attendanceQuery.status = 'present';
    const presentToday = await Attendance.countDocuments(attendanceQuery);
    
    delete attendanceQuery.status;
    const recentActivity = await Attendance.find(attendanceQuery)
      .sort({ updatedAt: -1 })
      .limit(8);

    const activityWithNames = await Promise.all(recentActivity.map(async (record) => {
      const user = await User.findById(record.userId).select('name empId profileImg');
      return {
        ...record._doc,
        user
      };
    }));

    const Organization = require('../models/Organization');
    const orgData = req.user.organizationId ? await Organization.findById(req.user.organizationId) : null;

    res.status(200).json({
      totalEmployees,
      presentToday,
      absentToday: totalEmployees - presentToday,
      recentActivity: activityWithNames,
      joinCode: orgData ? orgData.joinCode : 'N/A'
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
};

// @desc    Verify if user exists by empId and phone (for forgot password)
const verifyUser = async (req, res) => {
  try {
    const { empId, phone } = req.body;

    if (!empId || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide both Employee ID and Mobile Number' });
    }

    // Clean the phone number for DB search (remove +91 if user search has it but DB might not)
    const phoneNoPrefix = phone.startsWith('+91') ? phone.substring(3) : phone;
    const phoneWithPrefix = phone.startsWith('+91') ? phone : `+91${phone}`;

    // Case-insensitive check for empId and check both phone formats
    const user = await User.findOne({ 
      empId: { $regex: new RegExp(`^${empId}$`, 'i') }, 
      $or: [
        { phone: phoneNoPrefix },
        { phone: phoneWithPrefix },
        { phone: phone }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with these credentials' });
    }

    res.status(200).json({ success: true, message: 'User verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password (after OTP verification)
const resetPassword = async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword) {
      return res.status(400).json({ success: false, message: 'Missing mobile number or password' });
    }

    const phoneNoPrefix = phone.startsWith('+91') ? phone.substring(3) : phone;
    const phoneWithPrefix = phone.startsWith('+91') ? phone : `+91${phone}`;

    const user = await User.findOne({ 
      $or: [
        { phone: phoneNoPrefix },
        { phone: phoneWithPrefix },
        { phone: phone }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update password (pre-save middleware in User model handles hashing)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getAdminDashboardStats,
  verifyUser,
  resetPassword,
  getPublicOrganizations
};
