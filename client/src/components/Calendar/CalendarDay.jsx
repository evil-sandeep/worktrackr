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
      className={`relative h-16 sm:h-20 p-3 rounded-[1.25rem] transition-all duration-300 group
        ${isPresent ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 
          isIncomplete ? 'bg-amber-500 shadow-lg shadow-amber-500/20' :
          isAbsent ? 'bg-red-600 shadow-lg shadow-red-600/20' : 
          !isCurrentMonth ? 'bg-slate-50/10 text-slate-300 opacity-40' : 'bg-white text-slate-600 shadow-sm border border-slate-100/60'}
        ${isSelected && !hasStatus ? 'ring-2 ring-blue-500/50 z-10' : ''}
        ${!isFuture ? 'hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-20'}
      `}
    >
      <div className="flex h-full items-start justify-start">
        <span className={`text-[10px] sm:text-[11px] font-black w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all duration-300
          ${hasStatus ? 'text-white' : ''}
          ${isToday && !hasStatus ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110' : ''}
          ${isToday && hasStatus ? 'ring-2 ring-white scale-110' : ''}
          ${isSelected && !isToday && !hasStatus ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : ''}
        `}>
          {day.getDate()}
        </span>
      </div>
      
      {isSelected && !hasStatus && (
        <div className="absolute inset-0 rounded-[1.25rem] ring-2 ring-blue-500/10 pointer-events-none"></div>
      )}
    </div>
  );
};

export default CalendarDay;
