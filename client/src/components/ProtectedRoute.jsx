import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Access Control Logic
  const isAdminArea = location.pathname === '/admindashboard' || location.pathname === '/employee';
  const isSuperAdminArea = location.pathname === '/superadmindashboard';

  // 1. Block unauthorized access to Admin Areas (Only orgadmin/admin/superadmin allowed)
  const isAuthorizedAdmin = ['orgadmin', 'admin', 'superadmin'].includes(user.role);
  if (isAdminArea && !isAuthorizedAdmin) {
    return <Navigate to="/employeedashboard" replace />;
  }

  // 2. Block unauthorized access to Super Admin Area (Only superadmin allowed)
  if (isSuperAdminArea && user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
