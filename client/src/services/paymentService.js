import axios from 'axios';

const API_URL = '/api/payment';

const createOrder = async (amount, receipt) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/order`, { amount, receipt }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const verifyPayment = async (paymentData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/verify`, paymentData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const paymentService = {
  createOrder,
  verifyPayment
};

export default paymentService;
