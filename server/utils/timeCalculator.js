/**
 * Calculates the duration between two time strings in "hh:mm AM/PM" format.
 * Returns a formatted string like "7h 30m" or "In Progress" if times are missing.
 * 
 * @param {string} startTimeStr - Format "09:00 AM"
 * @param {string} endTimeStr - Format "05:30 PM"
 * @returns {string} 
 */
const calculateWorkingHours = (startTimeStr, endTimeStr) => {
  if (!startTimeStr || !endTimeStr) return 'In Progress';

  try {
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (modifier === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }

      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(startTimeStr);
    const endMinutes = parseTime(endTimeStr);

    let durationMinutes = endMinutes - startMinutes;

    // Handle night shifts (crossing midnight)
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }

    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;

    return `${h}h ${m}m`;
  } catch (error) {
    console.error('Time Calculation Error:', error);
    return 'Invalid Time';
  }
};

module.exports = { calculateWorkingHours };
