const express = require('express');
const router = express.Router();
const { createEmployee, getEmployeesByOrg, markAsPaid } = require('../controllers/user.controller');
const { auth, authorizeOrgAccess } = require('../middleware/auth');

// @route   POST /api/users/org/:orgId/employees
// @desc    Add employee to a specific organization
// @access  Private (Admin/SuperAdmin)
router.post("/org/:orgId/employees", auth, authorizeOrgAccess, createEmployee);

// @route   GET /api/users/org/:orgId/employees
// @desc    Get employees for a specific organization
// @access  Private
router.get("/org/:orgId/employees", auth, authorizeOrgAccess, getEmployeesByOrg);

// @route   PUT /api/users/pay/:id
// @desc    Mark an employee as paid
// @access  Private
router.put("/pay/:id", auth, markAsPaid);

module.exports = router;
