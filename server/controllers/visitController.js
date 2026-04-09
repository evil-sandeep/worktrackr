const visitService = require('../services/visitService');

const startVisit = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const employeeId = req.user._id;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required to start a visit.' });
    }

    const visit = await visitService.startVisit(employeeId, latitude, longitude);

    res.status(201).json({
      success: true,
      message: 'Visit started successfully',
      data: visit
    });
  } catch (error) {
    console.error('Start Visit Error:', error);
    res.status(500).json({ message: 'Failed to start visit', error: error.message });
  }
};

const submitVisit = async (req, res) => {
  try {
    const { visitId, outsidePhoto, insidePhoto } = req.body;
    const employeeId = req.user._id;

    if (!visitId || !outsidePhoto || !insidePhoto) {
      return res.status(400).json({ message: 'Missing required visit data (visitId, outsidePhoto, insidePhoto).' });
    }

    const visit = await visitService.submitVisit(visitId, employeeId, outsidePhoto, insidePhoto);

    res.status(200).json({
      success: true,
      message: 'Visit submitted successfully',
      data: visit
    });
  } catch (error) {
    console.error('Submit Visit Error:', error);
    res.status(500).json({ message: 'Failed to submit visit', error: error.message });
  }
};

const getEmployeeVisits = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;

    const visits = await visitService.getVisits(employeeId, date);

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits
    });
  } catch (error) {
    console.error('Get Employee Visits Error:', error);
    res.status(500).json({ message: 'Failed to fetch visits', error: error.message });
  }
};

module.exports = {
  startVisit,
  submitVisit,
  getEmployeeVisits
};
