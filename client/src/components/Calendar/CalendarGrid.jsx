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
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-4">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days.map((date, index) => (
          <CalendarDay
            key={index}
            day={date}
            isCurrentMonth={date.getMonth() === currentDate.getMonth()}
            isToday={isToday(date)}
            isSelected={isSelected(date)}
            record={attendanceData[formatDateKey(date)]}
            onClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
