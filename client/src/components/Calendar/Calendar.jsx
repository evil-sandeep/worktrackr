import React, { useState, useMemo } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';

/**
 * Modern Responsive Calendar Component
 * 
 * @param {Array} indicators - Array of objects: { date: Date|string, color: string, label: string }
 * @param {Function} onDateSelect - Callback when a date is clicked
 */
const Calendar = ({ indicators = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    if (onDateSelect) onDateSelect(today);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) onDateSelect(date);
  };

  return (
    <div className="w-full bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />
      <CalendarGrid
        days={calendarDays}
        currentDate={currentDate}
        selectedDate={selectedDate}
        indicators={indicators}
        onDateClick={handleDateClick}
      />
      
      <div className="mt-8 flex items-center justify-between text-sm text-gray-500 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-100 ring-1 ring-blue-500"></span>
            <span>Selected</span>
          </div>
        </div>
        <p>Click a date to select it</p>
      </div>
    </div>
  );
};

export default Calendar;
