/**
 * Utility to add a secure watermark (timestamp, date, location) to an image using Canvas API.
 * 
 * @param {string} imageDataUrl - The source image as a Data URL.
 * @param {Object} metadata - { latitude, longitude, address }
 * @returns {Promise<string>} - The watermarked image as a Data URL.
 */
export const addWatermark = (imageDataUrl, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageDataUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Maintain high resolution (1280x720 standard)
      canvas.width = img.width || 1280;
      canvas.height = img.height || 720;

      // 1. Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Add Dark Gradient/Overlay at bottom for text visibility
      const gradientHeight = 100;
      const gradient = ctx.createLinearGradient(0, canvas.height - gradientHeight, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - gradientHeight, canvas.width, gradientHeight);

      // 3. Setup Font Styles
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'bottom';
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB'); // DD-MM-YYYY
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const { latitude, longitude, address } = metadata;
      const locationStr = address 
        ? address 
        : (latitude && longitude ? `LAT: ${latitude.toFixed(6)}, LON: ${longitude.toFixed(6)}` : 'Location Unavailable');

      // 4. Draw Date and Time
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(`${dateStr} | ${timeStr}`, 30, canvas.height - 50);

      // 5. Draw Location
      ctx.font = '18px Inter, sans-serif';
      ctx.globalAlpha = 0.8;
      ctx.fillText(locationStr, 30, canvas.height - 20);
      ctx.globalAlpha = 1.0;

      // 6. Add "Verified" Badge
      ctx.fillStyle = '#3b82f6'; // Blue
      const badgeWidth = 140;
      const badgeHeight = 30;
      const badgeX = canvas.width - badgeWidth - 30;
      const badgeY = canvas.height - 50;
      
      // Draw rounded rect manually or just simple rect
      ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VERIFIED CAPTURE', badgeX + (badgeWidth / 2), badgeY + 20);

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    img.onerror = (err) => {
      console.error('Watermark Error: Failed to load image', err);
      reject(new Error('Failed to load image for watermarking'));
    };
  });
};
