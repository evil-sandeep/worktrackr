const { protect } = require('./authMiddleware');

const authorizeOrgAccess = (req, res, next) => {
  const requestedOrgId = req.params.orgId || req.query.orgId;

  if (!requestedOrgId) {
    return next(); // If no orgId is requested, proceed (might be handled by controller)
  }

  // Superadmin has access to everything
  if (req.user.role === "superadmin") {
    return next();
  }

  // Check if user belongs to the requested organization
  // For orgadmin, their organizationId is usually their own _id or a separate org _id
  // We check if their organizationId matches the requestedOrgId
  if (req.user.organizationId.toString() !== requestedOrgId.toString()) {
    return res.status(403).json({ message: "Access denied: You do not belong to this organization" });
  }

  next();
};

module.exports = {
  auth: protect,
  authorizeOrgAccess
};
