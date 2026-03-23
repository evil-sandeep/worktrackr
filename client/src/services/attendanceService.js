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
 * Fetch all attendance records for a user with optional filtering
 * @param {string} userId - ID of the user
 * @param {Object} filters - { month, year }
 */
const getAttendanceByUserId = async (userId, filters = {}) => {
  const { month, year } = filters;
  let url = `/attendance/${userId}`;
  if (month && year) {
    url += `?month=${month}&year=${year}`;
  }
  const response = await api.get(url);
  return response.data;
};

const attendanceService = {
  markAttendance,
  getAttendanceByUserId,
};

export default attendanceService;
