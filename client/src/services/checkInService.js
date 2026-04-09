import api from './api';

const checkInService = {
  /**
   * Submit a new multi-photo check-in
   * @param {Object} data - { outsidePhoto, insidePhoto, latitude, longitude, locationName, timestamp }
   */
  submitCheckIn: async (data) => {
    try {
      const response = await api.post('/checkin', data);
      return response.data;
    } catch (error) {
      console.error('Error in checkInService.submitCheckIn:', error);
      throw error;
    }
  }
};

export default checkInService;
