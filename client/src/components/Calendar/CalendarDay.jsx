import React from 'react';

const CalendarDay = ({ day, isCurrentMonth, isToday, isSelected, attendanceStatus, onClick }) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkDay = new Date(day);
  checkDay.setHours(0, 0, 0, 0);
  const isFuture = checkDay > now;

  return (
    <div
      onClick={() => !isFuture && onClick(day)}
      className={`relative h-24 sm:h-28 p-3 border-r border-b transition-all duration-300 group
        ${!isCurrentMonth ? 'bg-slate-50/30 text-slate-300' : 'bg-white text-slate-600'}
        ${isSelected ? 'bg-blue-50/30 z-10' : 'hover:bg-slate-50/50'}
        ${isFuture ? 'cursor-not-allowed opacity-40 bg-slate-50/10' : 'cursor-pointer'}
      `}
    >
      <div className="flex justify-between items-start">
        <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-300
          ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : ''}
          ${isSelected && !isToday ? 'bg-slate-900 text-white shadow-md' : ''}
          ${!isSelected && !isToday && isCurrentMonth && !isFuture ? 'group-hover:bg-slate-100' : ''}
        `}>
          {day.getDate()}
        </span>
        
        {isToday && (
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest hidden sm:block">Today</span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-1.5 px-2">
        {!isFuture && attendanceStatus === 'present' && (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Present</span>
          </>
        )}
        {!isFuture && attendanceStatus === 'absent' && (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Absent</span>
          </>
        )}
      </div>
      
      {isSelected && !isFuture && (
        <div className="absolute inset-0 border-2 border-blue-500/20 pointer-events-none"></div>
      )}
    </div>
  );
};

export default CalendarDay;
