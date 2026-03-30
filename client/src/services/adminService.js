import api from './api';

const getEmployees = async () => {
  const response = await api.get('/auth/employees');
  return response.data;
};

const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/auth/employees/${id}`, employeeData);
  return response.data;
};

const deleteEmployee = async (id) => {
  const response = await api.delete(`/auth/employees/${id}`);
  return response.data;
};

const getEmployeeAttendance = async (userId) => {
  const response = await api.get(`/attendance/${userId}`);
  return response.data;
};

const getDashboardStats = async () => {
  const response = await api.get('/auth/admin-stats');
  return response.data;
};

const adminService = {
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeAttendance,
  getDashboardStats
};

export default adminService;
