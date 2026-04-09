const StoreVisit = require('../models/StoreVisit');
const { uploadImage } = require('../utils/cloudinary');

// @desc    Submit a store visit with outside and inside photos
// @route   POST /api/store-visits
// @access  Private
const submitVisit = async (req, res) => {
  try {
    const { outsideImage, insideImage, location, date } = req.body;
    const userId = req.user._id;

    if (!outsideImage || !insideImage || !location || !date) {
      return res.status(400).json({ message: 'Missing required visit data (images, location, or date).' });
    }

    if (!location.latitude || !location.longitude || !location.address) {
      return res.status(400).json({ message: 'Location must include latitude, longitude, and address.' });
    }

    // 1. Upload both base64 images to Cloudinary in parallel
    let outsideImageUrl, insideImageUrl;
    try {
      const [outsideRes, insideRes] = await Promise.all([
        uploadImage(outsideImage),
        uploadImage(insideImage)
      ]);
      outsideImageUrl = outsideRes;
      insideImageUrl = insideRes;
    } catch (uploadError) {
      console.error('Cloudinary Upload Error (Store Visit):', uploadError.message);
      return res.status(500).json({ 
        message: 'Failed to upload images. Please try again.',
        details: uploadError.message 
      });
    }

    // 2. Save the complete visit record in DB
    const storeVisit = await StoreVisit.create({
      userId,
      date,
      location,
      photos: {
        outside: outsideImageUrl,
        inside: insideImageUrl
      }
    });

    res.status(201).json({
      success: true,
      message: 'Store visit recorded successfully',
      data: storeVisit
    });

  } catch (error) {
    console.error('Submit Visit Error:', error);
    res.status(500).json({ message: 'Internal server error while saving store visit' });
  }
};

// @desc    Get user's personal store visits
// @route   GET /api/store-visits/my-visits
// @access  Private
const getMyVisits = async (req, res) => {
  try {
    const visits = await StoreVisit.find({ userId: req.user._id }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    console.error('Get My Visits Error:', error);
    res.status(500).json({ message: 'Failed to fetch your visits' });
  }
};

module.exports = {
  submitVisit,
  getMyVisits
};
