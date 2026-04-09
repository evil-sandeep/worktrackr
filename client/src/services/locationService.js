import api from './api';

const locationService = {
  /**
   * Save current employee location log
   * @param {Object} data - { latitude, longitude, isGpsEnabled, employeeId, timestamp }
   */
  saveLocation: async (data) => {
    try {
      const response = await api.post('/location/save', data);
      return response.data;
    } catch (error) {
      console.error('Error in locationService.saveLocation:', error);
      throw error;
    }
  },

  /**
   * Fetch location logs for a specific employee and date
   * @param {string} employeeId 
   * @param {string} date - YYYY-MM-DD
   */
  getLocationLogs: async (employeeId, date) => {
    try {
      const response = await api.get(`/location/${employeeId}`, { params: { date } });
      return response.data;
    } catch (error) {
      console.error('Error in locationService.getLocationLogs:', error);
      throw error;
    }
  }
};

export default locationService;
