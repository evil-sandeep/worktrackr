import api from './api';

const startVisit = async (latitude, longitude) => {
  const response = await api.post('/visit/start', { latitude, longitude });
  return response.data;
};

const submitVisit = async (visitId, outsidePhoto, insidePhoto) => {
  const response = await api.post('/visit/submit', { visitId, outsidePhoto, insidePhoto });
  return response.data;
};

const getEmployeeVisits = async (employeeId, date) => {
  const response = await api.get(`/visit/${employeeId}`, { params: { date } });
  return response.data;
};

const visitService = {
  startVisit,
  submitVisit,
  getEmployeeVisits
};

export default visitService;
