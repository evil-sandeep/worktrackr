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

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
};

export default authService;
