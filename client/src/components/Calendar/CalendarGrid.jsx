import React from 'react';
import CalendarDay from './CalendarDay';
import { formatDateKey } from './useCalendar';

const CalendarGrid = ({ days, currentDate, selectedDate, attendanceData, onDateClick }) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    const sDate = new Date(selectedDate);
    return date.getDate() === sDate.getDate() &&
      date.getMonth() === sDate.getMonth() &&
      date.getFullYear() === sDate.getFullYear();
  };

  return (
    <div 
      key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
      className="w-full h-full flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl overflow-hidden animate-slide-right"
    >
      {/* Week Day Header - Premium Spacing */}
      <div className="grid grid-cols-7 mb-3 mt-1">
        {weekDays.map(day => (
          <div key={day} className="text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-outfit">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Cells Grid - Forced 100% height with repeat(6, 1fr) */}
      <div className="grid grid-cols-7 grid-rows-[repeat(6,1fr)] gap-1.5 flex-1 h-full min-h-0 overflow-hidden px-1 pb-1">
        {days.map((date, index) => (
          <div 
            key={index} 
            className="h-full animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
            style={{ animationDelay: `${index * 8}ms` }}
          >
            <CalendarDay
              day={date}
              isCurrentMonth={date.getMonth() === currentDate.getMonth()}
              isToday={isToday(date)}
              isSelected={isSelected(date)}
              record={attendanceData[formatDateKey(date)]}
              onClick={onDateClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
