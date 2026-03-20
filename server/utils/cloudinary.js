const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image to Cloudinary
 */
const uploadImage = async (imageContent) => {
  try {
    console.log('Starting Cloudinary upload...');
    const result = await cloudinary.uploader.upload(imageContent, {
      folder: 'worktrackr_attendance',
      resource_type: 'auto'
    });
    console.log('Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('--- CLOUDINARY ERROR DETAILS ---');
    console.error('Error Message:', error.message);
    if (error.http_code) console.error('HTTP Code:', error.http_code);
    console.error('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.error('--------------------------------');
    throw error;
  }
};

module.exports = {
  uploadImage,
};
