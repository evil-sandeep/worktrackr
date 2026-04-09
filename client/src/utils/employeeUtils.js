/**
 * Calculates current online/offline status based on lastSeen timestamp
 * @param {Object} employee 
 * @returns {Object} { label, color, bg }
 */
export const getEmployeeStatus = (employee) => {
  if (!employee || !employee.lastSeen) {
    return { 
      label: 'OFFLINE', 
      color: 'bg-slate-400', 
      bg: 'bg-slate-50 border-slate-100' 
    };
  }

  const lastSeen = new Date(employee.lastSeen);
  const now = new Date();
  const diffInMinutes = Math.floor((now - lastSeen) / 60000);

  // Consider offline if no heartbeat for > 70 minutes
  if (diffInMinutes > 70) {
    return { 
      label: 'OFFLINE', 
      color: 'bg-slate-400', 
      bg: 'bg-slate-50 border-slate-100' 
    };
  }

  if (employee.trackingStatus === 'GPS OFF') {
    return { 
      label: 'GPS OFF', 
      color: 'bg-amber-500', 
      bg: 'bg-amber-50 border-amber-100' 
    };
  }

  return { 
    label: 'ONLINE', 
    color: 'bg-green-500', 
    bg: 'bg-green-50 border-green-100' 
  };
};

/**
 * Formats date into YYYY-MM-DD
 */
export const formatDateISO = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};
