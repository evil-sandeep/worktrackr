/**
 * Geocoder utility for reverse geocoding (Lat/Lng to Address)
 */

/**
 * Resolves latitude and longitude to a human-readable address
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Promise<string>}
 */
const reverseGeocode = async (lat, lng) => {
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    // 1. Try Google Maps if API Key is available
    if (googleKey) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
    }

    // 2. Fallback to OpenStreetMap (Nominatim) - Free but slower
    // Note: Nominatim requires a User-Agent header and has a strict usage policy
    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'WorkTrackr-Location-Auditor'
        }
      }
    );
    const osmData = await osmResponse.json();
    
    if (osmData && osmData.display_name) {
      return osmData.display_name;
    }

    // 3. Last Resort: Return formatted coordinates
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('[Geocoder Error]', error.message);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

module.exports = {
  reverseGeocode
};
