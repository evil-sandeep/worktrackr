import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Toast from './components/Toast';
import Loader from './components/Loader';
import { UIProvider, useUI } from './context/UIContext';

import authService from './services/authService';

const HomeRedirect = () => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' 
    ? <Navigate to="/admindashboard" replace /> 
    : <Navigate to="/employeedashboard" replace />;
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
        path="/admindashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
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
