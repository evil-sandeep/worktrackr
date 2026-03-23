import React from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { useCalendar } from './useCalendar';

/**
 * Modern Responsive Calendar Component
 * 
 * @param {Object} attendanceData - Object: { 'YYYY-MM-DD': 'present' | 'absent' }
 * @param {Function} onDateSelect - Callback when a date is clicked
 */
const Calendar = ({ attendanceData = {}, onDateSelect }) => {
  const {
    currentDate,
    selectedDate,
    calendarDays,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    setSelectedDate
  } = useCalendar();

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) onDateSelect(date);
  };

  return (
    <div className="w-full bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />
      <CalendarGrid
        days={calendarDays}
        currentDate={currentDate}
        selectedDate={selectedDate}
        attendanceData={attendanceData}
        onDateClick={handleDateClick}
      />
      
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]"></span>
            <span className="font-semibold text-slate-700">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]"></span>
            <span className="font-semibold text-slate-700">Absent</span>
          </div>
        </div>
        <p className="font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
           {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
};

export default Calendar;
