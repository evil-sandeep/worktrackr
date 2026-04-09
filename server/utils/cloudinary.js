const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const api_key = process.env.CLOUDINARY_API_KEY?.trim();
const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloud_name || !api_key || !api_secret) {
  console.warn('--- CLOUDINARY CONFIG WARNING ---');
  console.warn('Missing Cloudinary credentials. Image uploads will fail in production.');
  console.warn(`Environment: ${process.env.NODE_ENV}`);
  console.warn(`NAME: ${cloud_name ? 'SET' : 'MISSING'}, KEY: ${api_key ? 'SET' : 'MISSING'}, SECRET: ${api_secret ? 'SET' : 'MISSING'}`);
  console.warn('Action required: Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your production dashboard.');
  console.warn('---------------------------------');
} else {
  // Safe diagnostic: Log masked credentials
  console.log('--- CLOUDINARY DIAGNOSTIC ---');
  console.log(`Cloud Name: ${cloud_name.substring(0, 3)}...${cloud_name.substring(cloud_name.length - 2)}`);
  console.log(`API Key: ${api_key.substring(0, 3)}...${api_key.substring(api_key.length - 2)}`);
  console.log(`API Secret: ${api_secret.substring(0, 2)}...***`);
  console.log(`Environment Detection: ${process.env.NODE_ENV}`);
  console.log('-----------------------------');
}

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true
});

/**
 * Uploads an image to Cloudinary
 * Handles base64 data URLs
 */
const uploadImage = async (imageContent) => {
  try {
    if (!cloud_name || !api_key || !api_secret) {
      throw new Error('Cloudinary is not configured. Please check environment variables.');
    }

    console.log('Starting Cloudinary upload...');
    const result = await cloudinary.uploader.upload(imageContent, {
      folder: 'worktrackr_attendance',
      resource_type: 'auto'
    });
    console.log('Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('--- CLOUDINARY ERROR DETAILS ---');
    console.error('Error Code:', error.http_code || 'N/A');
    console.error('Message:', error.message);
    
    // Help identify specific common errors
    if (error.message?.includes('Must supply api_key')) {
      console.error('FIX: CLOUDINARY_API_KEY is missing or invalid.');
    } else if (error.message?.includes('cloud_name')) {
      console.error('FIX: CLOUDINARY_CLOUD_NAME is missing or invalid.');
    } else if (error.http_code === 401) {
      console.error('FIX: Invalid API Key or Secret.');
    } else if (error.http_code === 413) {
      console.error('FIX: Image size too large for your Cloudinary plan.');
    }
    
    console.error('--------------------------------');
    throw error;
  }
};

module.exports = {
  uploadImage,
};
