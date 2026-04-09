import api from './api';

const submitVisit = async (visitData) => {
  const response = await api.post('/store-visits', visitData);
  return response.data;
};

const getMyVisits = async () => {
  const response = await api.get('/store-visits/my-visits');
  return response.data;
};

const storeVisitService = {
  submitVisit,
  getMyVisits
};

export default storeVisitService;
