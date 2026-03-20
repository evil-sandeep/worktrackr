import api from './api';

const markAttendance = async (attendanceData) => {
  // attendanceData should contain: image (base64/url), latitude, longitude, date, time
  const response = await api.post('/attendance', attendanceData);
  return response.data;
};

const attendanceService = {
  markAttendance,
};

export default attendanceService;
