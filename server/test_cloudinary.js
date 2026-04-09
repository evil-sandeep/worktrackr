const { uploadImage } = require('./utils/cloudinary');
const dotenv = require('dotenv');
dotenv.config();

async function testCloudinary() {
  console.log('Testing Cloudinary config...');
  try {
    // Testing with a small transparent pixel base64
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const url = await uploadImage(testImage);
    console.log('SUCCESS! Test image uploaded:', url);
  } catch (err) {
    console.error('FAILED! Cloudinary test failed.');
    // Error details are already logged by the utility
  }
}

testCloudinary();
