import React from 'react';

const CalendarDay = ({ day, isCurrentMonth, isToday, isSelected, record, onClick }) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkDay = new Date(day);
  checkDay.setHours(0, 0, 0, 0);
  const isFuture = checkDay > now;

  const isAbsent = !isFuture && record?.status === 'absent';
  const isIncomplete = !isFuture && record?.status === 'present' && !record?.checkOut?.imageUrl;
  const isPresent = !isFuture && record?.status === 'present' && record?.checkOut?.imageUrl;
  const hasStatus = isAbsent || isIncomplete || isPresent;

  return (
    <div
      onClick={() => !isFuture && onClick(day)}
      className={`relative w-full h-full p-2 sm:p-3 transition-all duration-300 group
        ${!isFuture ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
    >
      <div className={`h-full w-full p-2 sm:p-3 rounded-[1.25rem] transition-all duration-500 flex flex-col items-start justify-start
        ${isPresent ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 
          isIncomplete ? 'bg-amber-500 shadow-lg shadow-amber-500/20' :
          isAbsent ? 'bg-red-600 shadow-lg shadow-red-600/20' : 
          !isCurrentMonth ? 'opacity-20' : 'bg-white group-hover:bg-slate-50'}
        ${isSelected && !hasStatus ? 'ring-2 ring-blue-500/50 scale-[0.98]' : ''}
        ${!isFuture ? 'group-hover:-translate-y-1.5 group-hover:shadow-xl group-active:scale-95' : 'opacity-10'}
      `}>
        <span className={`text-[10px] sm:text-[11px] font-black w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all duration-300
          ${hasStatus ? 'text-white' : 'text-slate-600'}
          ${isToday && !hasStatus ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110' : ''}
          ${isToday && hasStatus ? 'ring-2 ring-white scale-110' : ''}
          ${isSelected && !isToday && !hasStatus ? 'bg-slate-900 text-white' : ''}
        `}>
          {day.getDate()}
        </span>
      </div>
      
      {isSelected && !hasStatus && (
        <div className="absolute inset-2 sm:inset-3 rounded-[1.25rem] ring-2 ring-blue-500/10 pointer-events-none"></div>
      )}
    </div>
  );
};

export default CalendarDay;
