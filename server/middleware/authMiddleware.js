const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verifying secret for debug (will only log first 3 chars)
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      console.log(`Debug - AuthMiddleware Secret prefix: ${secret.substring(0, 3)}...`);

      // Verify token
      const decoded = jwt.verify(token, secret);
      console.log(`Debug - Token decoded for user ID: ${decoded.id}`);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.warn(`Debug - User not found for ID: ${decoded.id}`);
        return res.status(401).json({ message: 'User not found' });
      }

      // --- MULTI-TENANCY LOGIC ---
      let targetDbName = req.user.dbName;
      
      // If employee, get dbName from their organization (admin)
      if (!targetDbName && req.user.organizationId) {
        const org = await User.findById(req.user.organizationId).select('dbName');
        targetDbName = org?.dbName;
      }

      // If Super Admin is viewing a specific org via query param or path param
      const superAdminOrgId = req.query.orgId || req.query.organizationId || req.params.orgId;
      console.log(`[TENANT DEBUG] SuperAdmin Check - OrgId Input: ${superAdminOrgId} (Role: ${req.user.role})`);
      
      if (req.user.role === 'superadmin' && superAdminOrgId && mongoose.Types.ObjectId.isValid(superAdminOrgId)) {
        console.log(`[TENANT DEBUG] SuperAdmin resolving tenant for ID: ${superAdminOrgId}`);
        // Try finding by direct user ID first (if it's an org admin's user ID)
        let targetOrgUser = await User.findById(superAdminOrgId).select('dbName name');
        
        // If not found, try finding the org admin user by their organizationId
        if (!targetOrgUser || !targetOrgUser.dbName) {
           console.log(`[TENANT DEBUG] Direct User lookup failed or missing dbName. Trying OrganizationId lookup...`);
           targetOrgUser = await User.findOne({ 
             organizationId: superAdminOrgId, 
             role: { $in: ['orgadmin', 'admin'] }
           }).select('dbName name role organizationId');
           console.log(`[TENANT DEBUG] OrganizationId lookup result for ${superAdminOrgId}: ${targetOrgUser ? `FOUND (${targetOrgUser.name})` : 'NOT FOUND'}`);
        } else {
           console.log(`[TENANT DEBUG] Direct User lookup success: FOUND (Name: ${targetOrgUser.name}, DB: ${targetOrgUser.dbName})`);
        }

        if (targetOrgUser?.dbName) {
           targetDbName = targetOrgUser.dbName;
           console.log(`[TENANT DEBUG] Resolved Target Database: ${targetDbName}`);
        } else {
           console.warn(`[TENANT DEBUG] FAILED to resolve tenant DB for ID: ${superAdminOrgId}`);
        }
      } else if (req.user.role === 'superadmin' && superAdminOrgId) {
        console.warn(`[TENANT DEBUG] SuperAdmin provided orgId but it is INVALID: ${superAdminOrgId}`);
      }

      // Get tenant connection and models
      const { getTenantDb } = require('../config/tenantConnection');
      const { getTenantModels } = require('../models/tenantModels');
      
      const connection = await getTenantDb(targetDbName);
      req.tenantModels = getTenantModels(connection);
      // --- END MULTI-TENANCY LOGIC ---

      const fs = require('fs');
      const logMsg = `\n[AUTH TRACE] ${new Date().toISOString()} - User: ${req.user.email} - Role: ${req.user.role} - OrgId: ${superAdminOrgId} - TargetDB: ${targetDbName || 'Main'}\n`;
      fs.appendFileSync('auth_debug.log', logMsg);

      console.log(`Debug - Authorized: ${req.user.email} (Tenant DB: ${targetDbName || 'Main'})`);
      return next();
    } catch (error) {
      const fs = require('fs');
      const logMsg = `\n[AUTH ERROR] ${new Date().toISOString()} - ${error.message}\n${error.stack}\n`;
      fs.appendFileSync('auth_debug.log', logMsg);
      console.error('Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'orgadmin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a super admin' });
  }
};

module.exports = { protect, admin, superAdmin };
