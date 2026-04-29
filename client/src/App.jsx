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
    return <Navigate to="/superadmindashboard" replace />;
  } else if (user.role === 'orgadmin' || user.role === 'admin') {
    // Both orgadmin (promoted) and admin see the admin dashboard
    return <Navigate to="/admindashboard" replace />;
  }
  return <Navigate to="/employeedashboard" replace />;
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
      {/* Public Routes - No Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/payment" element={<PaymentPage />} />
      
      {/* Protected Routes - With Global Layout */}
      <Route 
        path="/employeedashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
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
      <Route 
        path="/admindashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmindashboard" 
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
      <Route 
        path="/admin/employee" 
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeeListPage />
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
