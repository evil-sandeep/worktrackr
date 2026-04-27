const { uploadImage } = require('../utils/cloudinary');

class CheckInService {
  async processCheckIn(models, data) {
    const { CheckIn, DailySummary } = models;
    const { 
      employeeId, 
      outsidePhoto, 
      insidePhoto, 
      latitude, 
      longitude, 
      accuracy,
      locationName,
      addressComponents,
      timestamp 
    } = data;

    const checkInDate = new Date().toISOString().split('T')[0];

    // 1. Upload both photos to Cloudinary in parallel
    console.log('[CheckInService] Uploading photos to Cloudinary...');
    let outsidePhotoUrl, insidePhotoUrl;
    
    try {
      [outsidePhotoUrl, insidePhotoUrl] = await Promise.all([
        uploadImage(outsidePhoto),
        uploadImage(insidePhoto)
      ]);
    } catch (uploadError) {
      console.error('Cloudinary Upload Error:', uploadError);
      throw new Error('Failed to upload images to cloud storage');
    }

    // 2. Create the CheckIn record
    const checkIn = await CheckIn.create({
      employeeId,
      locationName: locationName || 'Unknown Location',
      outsidePhoto: outsidePhotoUrl,
      insidePhoto: insidePhotoUrl,
      latitude,
      longitude,
      accuracy,
      address: addressComponents,
      timestamp: timestamp || new Date(),
      date: checkInDate
    });

    // 3. Update Daily Summary (Atomic update)
    await DailySummary.findOneAndUpdate(
      { employeeId, date: checkInDate },
      { 
        $inc: { totalCheckins: 1 },
        $set: { 
          lastLocation: { latitude, longitude, name: locationName },
          lastActiveTime: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return checkIn;
  }
}

module.exports = new CheckInService();
