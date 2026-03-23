import api from './api';

/**
 * Save new attendance record
 * @param {Object} attendanceData - { image, location, date, time, status }
 */
const markAttendance = async (attendanceData) => {
  const response = await api.post('/attendance', attendanceData);
  return response.data;
};

/**
 * Fetch all attendance records for a user
 * @param {string} userId - ID of the user
 */
const getAttendanceByUserId = async (userId) => {
  const response = await api.get(`/attendance/${userId}`);
  return response.data;
};

const attendanceService = {
  markAttendance,
  getAttendanceByUserId,
};

export default attendanceService;
