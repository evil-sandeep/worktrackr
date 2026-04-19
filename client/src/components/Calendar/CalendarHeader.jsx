import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6 px-4">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
            {monthNames[currentDate.getMonth()]}
          </h2>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] mt-1.5 opacity-80">{currentDate.getFullYear()}</span>
        </div>
        
        <button
          onClick={onToday}
          className="px-5 py-1.5 text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-100 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-md transition-all uppercase tracking-widest active:scale-95"
        >
          Today
        </button>
      </div>

      <div className="flex items-center bg-white p-1 border border-slate-100 rounded-[1.25rem] shadow-sm">
        <button
          onClick={onPrevMonth}
          className="p-2.5 hover:bg-slate-50 transition-all rounded-xl group active:scale-90"
          aria-label="Previous Month"
        >
          <ChevronLeft size={18} className="text-slate-400 group-hover:text-blue-600" />
        </button>
        <div className="w-px h-5 bg-slate-100 mx-1"></div>
        <button
          onClick={onNextMonth}
          className="p-2.5 hover:bg-slate-50 transition-all rounded-xl group active:scale-90"
          aria-label="Next Month"
        >
          <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
