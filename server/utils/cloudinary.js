const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const api_key = process.env.CLOUDINARY_API_KEY?.trim();
const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloud_name || !api_key || !api_secret) {
  console.warn('--- CLOUDINARY CONFIG WARNING ---');
  console.warn('Missing Cloudinary credentials. Image uploads will fail.');
  console.warn(`NAME: ${!!cloud_name}, KEY: ${!!api_key}, SECRET: ${!!api_secret}`);
  console.warn('---------------------------------');
}

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
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
