import React from 'react';
import { Check, AlertCircle, XCircle } from 'lucide-react';

const CalendarDay = ({ day, isCurrentMonth, isToday, isSelected, record, onClick }) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkDay = new Date(day);
  checkDay.setHours(0, 0, 0, 0);
  const isFuture = checkDay > now;

  const status = record?.status;
  
  const isPresent = status === 'present';
  const isIncomplete = status === 'incomplete' || (record?.checkIn && !record?.checkCheckout);
  const isAbsent = status === 'absent';

  return (
    <div
      onClick={() => !isFuture && onClick(day)}
      className={`relative h-full flex flex-col items-center justify-center glass-premium-blur rounded-[1.3rem] border border-white/20 transition-all duration-500 group ripple-effect
        ${!isFuture ? 'cursor-pointer hover:bg-slate-50/50 hover:z-30' : 'cursor-not-allowed opacity-20'}
        ${isSelected ? 'selected-pop' : 'neu-inset-shadow'}
        ${!isCurrentMonth ? 'opacity-10 grayscale' : ''}
      `}
    >
      {/* Today Neutral Ring Indicator */}
      {isToday && (
        <div className="absolute inset-0 ring-2 ring-slate-200/50 -z-10 rounded-[1.3rem]"></div>
      )}

      {/* Centered Date Number Box */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className={`aspect-square w-12 h-12 flex items-center justify-center rounded-[1.1rem] transition-all duration-700 font-poppins shadow-premium-layered
          ${isPresent ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-110' : 
            (isIncomplete ? 'bg-yellow-500 text-white shadow-yellow-500/20 scale-110' :
              (isToday ? 'bg-slate-900 text-white shadow-xl shadow-black/10' : 
                (isSelected ? 'bg-slate-200 text-slate-900' : 'bg-white/40 text-slate-400 group-hover:text-slate-900 group-hover:bg-white')))}
        `}>
          <span className="text-xl font-black tracking-tight">
            {day.getDate()}
          </span>
        </div>
      </div>

      {/* Top Right Status Status icons removed for ultra-clean look */}
    </div>
  );
};

export default CalendarDay;
