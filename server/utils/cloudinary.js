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
 * @param {string} imageContent - The image path or base64 string
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadImage = async (imageContent) => {
  try {
    const result = await cloudinary.uploader.upload(imageContent, {
      folder: 'worktrackr_attendance',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = {
  uploadImage,
};
