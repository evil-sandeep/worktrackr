import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 px-2">
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            {monthNames[currentDate.getMonth()]}
          </h2>
          <span className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mt-1">{currentDate.getFullYear()}</span>
        </div>
        
        <button
          onClick={onToday}
          className="px-6 py-2 text-[10px] font-black text-slate-900 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest active:scale-95"
        >
          Today
        </button>
      </div>

      <div className="flex items-center bg-white p-1.5 border border-slate-100 rounded-2xl shadow-sm">
        <button
          onClick={onPrevMonth}
          className="p-3 hover:bg-slate-50 transition-all rounded-xl group active:scale-90"
          aria-label="Previous Month"
        >
          <ChevronLeft size={20} className="text-slate-400 group-hover:text-blue-600" />
        </button>
        <div className="w-px h-6 bg-slate-100 mx-1"></div>
        <button
          onClick={onNextMonth}
          className="p-3 hover:bg-slate-50 transition-all rounded-xl group active:scale-90"
          aria-label="Next Month"
        >
          <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
