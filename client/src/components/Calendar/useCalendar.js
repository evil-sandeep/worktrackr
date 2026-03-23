import { useState, useMemo } from 'react';

/**
 * Custom hook for calendar logic
 * @param {Date} initialDate - The initial date to show 
 */
export const useCalendar = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Day of the week the month starts on
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    const days = [];
    
    // Padding from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Padding for next month to fill exactly 42 slots (6 weeks)
    const totalSlots = 42;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }, [currentDate]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return {
    currentDate,
    selectedDate,
    calendarDays,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    setSelectedDate,
    formatDateKey
  };
};

export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

