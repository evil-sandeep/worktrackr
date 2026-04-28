const jwt = require('jsonwebtoken');
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
      if (req.user.role === 'superadmin' && superAdminOrgId) {
        console.log(`[TENANT DEBUG] SuperAdmin resolving tenant for ID: ${superAdminOrgId}`);
        // Try finding by direct user ID first (if it's an org admin's user ID)
        let targetOrgUser = await User.findById(superAdminOrgId).select('dbName');
        
        // If not found, try finding the org admin user by their organizationId
        if (!targetOrgUser || !targetOrgUser.dbName) {
           targetOrgUser = await User.findOne({ 
             organizationId: superAdminOrgId, 
             role: { $in: ['orgadmin', 'admin'] }
           }).select('dbName');
           console.log(`[TENANT DEBUG] Resolved via organizationId check: ${targetOrgUser ? 'FOUND' : 'NOT FOUND'}`);
        } else {
           console.log(`[TENANT DEBUG] Resolved via direct user ID check: FOUND`);
        }

        if (targetOrgUser?.dbName) {
           targetDbName = targetOrgUser.dbName;
           console.log(`[TENANT DEBUG] Target Database established: ${targetDbName}`);
        } else {
           console.warn(`[TENANT DEBUG] FAILED to resolve tenant DB for ID: ${superAdminOrgId}`);
        }
      }

      // Get tenant connection and models
      const { getTenantDb } = require('../config/tenantConnection');
      const { getTenantModels } = require('../models/tenantModels');
      
      const connection = await getTenantDb(targetDbName);
      req.tenantModels = getTenantModels(connection);
      // --- END MULTI-TENANCY LOGIC ---

      console.log(`Debug - Authorized: ${req.user.email} (Tenant DB: ${targetDbName || 'Main'})`);
      return next();
    } catch (error) {
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
