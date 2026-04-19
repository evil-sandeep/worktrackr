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
    <div className="w-full border-t border-l border-slate-100 rounded-[2.5rem] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {weekDays.map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80 border-r border-slate-100">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date, index) => (
          <div key={index} className="border-r border-b border-slate-100 relative">
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
