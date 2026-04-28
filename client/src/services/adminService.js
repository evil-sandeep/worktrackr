import api from './api';

const getEmployees = async (params = {}) => {
  const response = await api.get('/admin/employees', { params });
  return response.data;
};

const createEmployee = async (employeeData) => {
  const response = await api.post('/admin/employees', employeeData);
  return response.data;
};

const getEmployeeById = async (id, orgId) => {
  const params = orgId ? { orgId } : {};
  const response = await api.get(`/admin/employees/${id}`, { params });
  return response.data;
};

const updateEmployee = async (id, employeeData, orgId) => {
  const params = orgId ? { orgId } : {};
  const response = await api.put(`/auth/employees/${id}`, employeeData, { params });
  return response.data;
};

const deleteEmployee = async (id, orgId) => {
  const params = orgId ? { orgId } : {};
  const response = await api.delete(`/auth/employees/${id}`, { params });
  return response.data;
};

const getEmployeeAttendance = async (userId, orgId) => {
  const params = orgId ? { orgId } : {};
  const response = await api.get(`/attendance/${userId}`, { params });
  return response.data;
};

const getDashboardStats = async () => {
  const response = await api.get('/auth/admin-stats');
  return response.data;
};

const getDailyTracking = async (id, date, orgId) => {
  const params = { date };
  if (orgId) params.orgId = orgId;
  const response = await api.get(`/admin/employees/${id}/daily`, { params });
  return response.data;
};

// --- SUPER ADMIN ENDPOINTS ---

const getSuperAdminStats = async () => {
  const response = await api.get('/admin/super/stats');
  return response.data;
};

const getOrganizations = async () => {
  const response = await api.get('/admin/super/organizations');
  return response.data;
};

const updateOrganization = async (id, orgData) => {
  const response = await api.put(`/admin/super/organizations/${id}`, orgData);
  return response.data;
};

const deleteOrganization = async (id) => {
  const response = await api.delete(`/admin/super/organizations/${id}`);
  return response.data;
};

const grantAdmin = async (id) => {
  const response = await api.put(`/admin/super/organizations/${id}/grant-admin`);
  return response.data;
};

const revokeAdmin = async (id) => {
  const response = await api.put(`/admin/super/organizations/${id}/revoke-admin`);
  return response.data;
};

// --- NEW MODULAR USER ENDPOINTS ---
const getEmployeesByOrg = async (orgId) => {
  const response = await api.get(`/users/org/${orgId}/employees`);
  return response.data;
};

const createOrgEmployee = async (orgId, employeeData) => {
  const response = await api.post(`/users/org/${orgId}/employees`, employeeData);
  return response.data;
};

const markAsPaid = async (id) => {
  const response = await api.put(`/users/pay/${id}`);
  return response.data;
};

const adminService = {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeAttendance,
  getDashboardStats,
  getDailyTracking,
  getSuperAdminStats,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
  grantAdmin,
  revokeAdmin,
  getEmployeesByOrg,
  createOrgEmployee,
  markAsPaid,
};

export default adminService;
