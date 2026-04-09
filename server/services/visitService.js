const Visit = require('../models/Visit');
const { uploadImage } = require('../utils/cloudinary');
const { reverseGeocode } = require('../utils/geocoder');

/**
 * Start a new visit with location only, returning the Visit ID
 */
const startVisit = async (employeeId, latitude, longitude) => {
  // Resolve address in background or await if needed for consistency
  // Awaiting here to ensure the record is complete upon return
  const address = await reverseGeocode(latitude, longitude);

  const visit = await Visit.create({
    employeeId,
    latitude,
    longitude,
    address
  });
  
  return visit;
};

/**
 * Submit complete visit proof to an existing visit
 */
const submitVisit = async (visitId, employeeId, outsidePhotoData, insidePhotoData) => {
  const visit = await Visit.findOne({ _id: visitId, employeeId });
  if (!visit) {
    throw new Error('Visit record not found or does not belong to this employee');
  }

  // Upload images concurrently
  const [outsidePhoto, insidePhoto] = await Promise.all([
    uploadImage(outsidePhotoData),
    uploadImage(insidePhotoData)
  ]);

  visit.outsidePhoto = outsidePhoto;
  visit.insidePhoto = insidePhoto;

  await visit.save();
  return visit;
};

/**
 * Get visits for an employee on a specific date string (YYYY-MM-DD)
 */
const getVisits = async (employeeId, dateStr) => {
  let query = { employeeId };

  if (dateStr) {
    // Determine start and end of the specified date
    const startOfDay = new Date(dateStr);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    query.createdAt = {
      $gte: startOfDay,
      $lt: endOfDay
    };
  }

  const visits = await Visit.find(query).sort({ createdAt: -1 });
  return visits;
};

module.exports = {
  startVisit,
  submitVisit,
  getVisits
};
