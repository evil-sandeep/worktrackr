import React from 'react';

const CalendarDay = ({ day, isCurrentMonth, isToday, isSelected, indicators, onClick }) => {
  return (
    <div
      onClick={() => onClick(day)}
      className={`relative h-20 sm:h-24 p-2 border-r border-b cursor-pointer transition-all duration-200 hover:bg-gray-50 group
        ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white text-gray-700'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <span className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full transition-colors
          ${isToday ? 'bg-blue-600 text-white' : ''}
          ${isSelected && !isToday ? 'bg-blue-100 text-blue-700' : ''}
        `}>
          {day.getDate()}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {indicators && indicators.map((indicator, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full ${indicator.color || 'bg-blue-400'} shadow-sm`}
            title={indicator.label}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarDay;
