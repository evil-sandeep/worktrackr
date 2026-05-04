import api from './api';

const createOrder = async (amount, receipt) => {
  const response = await api.post('/payment/order', { amount, receipt });
  return response.data;
};

const verifyPayment = async (paymentData) => {
  const response = await api.post('/payment/verify', paymentData);
  return response.data;
};

const paymentService = {
  createOrder,
  verifyPayment
};

export default paymentService;
