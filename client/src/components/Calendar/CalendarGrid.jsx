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
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <div className="border-t border-l rounded-xl overflow-hidden shadow-sm bg-gray-50">
      <div className="grid grid-cols-7 border-b bg-gray-50/80 backdrop-blur-sm">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date, index) => (
          <CalendarDay
            key={index}
            day={date}
            isCurrentMonth={date.getMonth() === currentDate.getMonth()}
            isToday={isToday(date)}
            isSelected={isSelected(date)}
            attendanceStatus={attendanceData[formatDateKey(date)]}
            onClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
