import api from './api';

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const getProfile = async () => {
  const response = await api.get('/auth/profile');
  const currentUser = getCurrentUser();
  localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data }));
  return response.data;
};

const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    // Merge existing user data with updated data to preserve any fields not returned by the API
    const currentUser = getCurrentUser();
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data }));
  }
  return response.data;
};

const verifyUser = async (empId, phone) => {
  const response = await api.post('/auth/verify-user', { empId, phone });
  return response.data;
};

const resetPassword = async (phone, newPassword) => {
  const response = await api.post('/auth/reset-password', { phone, newPassword });
  return response.data;
};

const getPublicOrganizations = async () => {
  const response = await api.get('/auth/organizations');
  return response.data;
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getProfile,
  updateProfile,
  verifyUser,
  resetPassword,
  getPublicOrganizations,
};

export default authService;
