import { useState, useEffect, useMemo } from 'react';
import adminService from '../services/adminService';

/**
 * Hook for managing attendance data and calculating statistics
 */
const useEmployeeAttendance = (employeeId, viewDate) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!employeeId) return;
      setLoading(true);
      try {
        const response = await adminService.getEmployeeAttendance(employeeId);
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error('Failed to fetch employee attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [employeeId]);

  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach(record => {
      map[record.date] = record.status || 'present';
    });
    return map;
  }, [attendanceRecords]);

  const stats = useMemo(() => {
    let present = 0;
    let totalEarning = 0;
    let totalMinutes = 0;
    
    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    attendanceRecords.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate.getMonth() !== viewMonth || recordDate.getFullYear() !== viewYear) return;
      
      if (record.status === 'present' || !record.status) {
        present++;
        totalEarning += (record.earning || 0);
        if (record.totalHours && record.totalHours.includes(':')) {
            const [h, m] = record.totalHours.split(':').map(Number);
            totalMinutes += (h * 60) + m;
        }
      }
    });

    let daysToCount = 0;
    if (viewYear < currentYear || (viewYear === currentYear && viewMonth < currentMonth)) {
      daysToCount = new Date(viewYear, viewMonth + 1, 0).getDate();
    } else if (viewYear === currentYear && viewMonth === currentMonth) {
      daysToCount = today.getDate();
    }
    
    const absent = Math.max(0, daysToCount - present);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    return { 
      present, 
      absent, 
      totalEarning, 
      totalHoursStr: `${hours}h ${mins}m` 
    };
  }, [attendanceRecords, viewDate]);

  return {
    attendanceRecords,
    attendanceMap,
    stats,
    loading
  };
};

export default useEmployeeAttendance;
