import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-2">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {monthNames[currentDate.getMonth()]}
          </h2>
          <span className="text-lg font-medium text-gray-400 -mt-1">{currentDate.getFullYear()}</span>
        </div>
        
        <button
          onClick={onToday}
          className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-all duration-200 active:scale-95"
        >
          Today
        </button>
      </div>

      <div className="flex items-center bg-white p-1 border rounded-2xl shadow-sm">
        <button
          onClick={onPrevMonth}
          className="p-2.5 hover:bg-gray-50 transition-colors rounded-xl group"
          aria-label="Previous Month"
        >
          <ChevronLeft size={22} className="text-gray-400 group-hover:text-blue-600" />
        </button>
        <div className="w-px h-6 bg-gray-100 mx-1"></div>
        <button
          onClick={onNextMonth}
          className="p-2.5 hover:bg-gray-50 transition-colors rounded-xl group"
          aria-label="Next Month"
        >
          <ChevronRight size={22} className="text-gray-400 group-hover:text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
