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
      const timeParts = time.split(':').map(Number);
      let hours = timeParts[0];
      let minutes = timeParts[1] || 0;

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

/**
 * Calculates earnings based on duration string.
 * Salary: 20000/month, 8h/day, 30 days/month
 * 
 * @param {string} durationStr - Format "7h 30m"
 * @returns {number} 
 */
const calculateEarnings = (durationStr) => {
  if (!durationStr || durationStr === 'In Progress' || durationStr === 'Invalid Time') return 0;

  try {
    const parts = durationStr.split(' ');
    let hours = 0;
    let minutes = 0;

    parts.forEach(part => {
      if (part.includes('h')) hours = parseInt(part);
      if (part.includes('m')) minutes = parseInt(part);
    });

    const totalHours = hours + (minutes / 60);
    const monthlySalary = 20000;
    const stdDays = 30;
    const stdHoursPerDay = 8;
    
    // Hourly rate = Salary / (30 days * 8 hours)
    const hourlyRate = monthlySalary / (stdDays * stdHoursPerDay);
    
    return Math.round(totalHours * hourlyRate);
  } catch (error) {
    console.error('Earning Calculation Error:', error);
    return 0;
  }
};

module.exports = { calculateWorkingHours, calculateEarnings };
