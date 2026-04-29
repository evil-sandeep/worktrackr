import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OrganizationListPage from './pages/OrganizationListPage';
import EmployeeListPage from './pages/EmployeeListPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StoreVisit from './pages/StoreVisit';
import AttendanceCalendar from './pages/AttendanceCalendar';
import PaymentPage from './pages/PaymentPage';
import OrgDetailsPage from './pages/OrgDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Toast from './components/Toast';
import Loader from './components/Loader';
import { UIProvider, useUI } from './context/UIContext';

import authService from './services/authService';

const HomeRedirect = () => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'superadmin') {
    return <Navigate to="/superadmin/dashboard" replace />;
  } else if (user.role === 'orgadmin' || user.role === 'admin') {
    return <Navigate to="/orgadmin/dashboard" replace />;
  }
  return <Navigate to="/employee/dashboard" replace />;
};

const GlobalUI = () => {
  const { loading } = useUI();
  return (
    <>
      <Toast />
      {loading && <Loader fullScreen />}
    </>
  );
};

const AppRoutes = () => {
  return (
    <UIProvider>
      <GlobalUI />
      <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/payment" element={<PaymentPage />} />
      
      {/* Super Admin Routes */}
      <Route 
        path="/superadmin/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <SuperAdminDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizations" 
        element={
          <ProtectedRoute>
            <Layout>
              <OrganizationListPage />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Org Admin Routes */}
      <Route 
        path="/orgadmin/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orgadmin/employee" 
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeeListPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Employee Routes */}
      <Route 
        path="/employee/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <Layout>
              <AttendanceCalendar />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/storevisit" 
        element={
          <ProtectedRoute>
            <Layout>
              <StoreVisit />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Shared Protected Routes */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/org/:orgId" 
        element={
          <ProtectedRoute>
            <Layout>
              <OrgDetailsPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Legacy/Redirect Routes */}
      <Route path="/admin/employee" element={<Navigate to="/orgadmin/employee" replace />} />
      <Route path="/admindashboard" element={<Navigate to="/orgadmin/dashboard" replace />} />
      <Route path="/superadmindashboard" element={<Navigate to="/superadmin/dashboard" replace />} />
      <Route path="/employeedashboard" element={<Navigate to="/employee/dashboard" replace />} />
      
      {/* Default Redirect Logic */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </UIProvider>
  );
};

function App() {
  return (
    <AppRoutes />
  );
}

export default App;
