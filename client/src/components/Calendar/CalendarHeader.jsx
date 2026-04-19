import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-4 px-4 relative z-20">
      {/* Left side: Navigation & Today */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-5 group">
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white p-3.5 rounded-[1.25rem] shadow-2xl shadow-emerald-500/40 transform -rotate-3 hover:rotate-0 transition-all duration-700 group-hover:scale-110">
            <CalendarIcon size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-4xl font-black gradient-text-premium tracking-tighter leading-none font-poppins drop-shadow-sm">
              {monthNames[currentDate.getMonth()]}
            </h2>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[10px] font-black text-emerald-600/40 uppercase tracking-[0.5em] font-poppins">
                 Operations Phase {currentDate.getFullYear()}
               </span>
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-white/40 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/60 shadow-xl shadow-black/[0.03] ml-2 ring-1 ring-slate-200/50">
          <button
            onClick={onPrevMonth}
            className="p-2.5 hover:bg-white transition-all rounded-xl group active:scale-90 relative overflow-hidden"
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </button>
          
          <button
            onClick={onToday}
            className="px-6 py-2 text-[11px] font-black text-slate-900 hover:text-emerald-600 transition-all uppercase tracking-[0.2em] relative group/today"
          >
            <span className="relative z-10 transition-transform group-hover/today:scale-110 block font-poppins">Today</span>
            <div className="absolute inset-x-3 bottom-0 h-0.5 bg-emerald-600 scale-x-0 group-hover/today:scale-x-100 transition-transform duration-500 origin-center"></div>
            <div className="absolute inset-x-0 inset-y-1 bg-emerald-50 rounded-lg opacity-0 group-hover/today:opacity-100 scale-90 group-hover/today:scale-100 transition-all -z-10"></div>
          </button>

          <button
            onClick={onNextMonth}
            className="p-2.5 hover:bg-white transition-all rounded-xl group active:scale-90 relative overflow-hidden"
            aria-label="Next Month"
          >
            <ChevronRight size={20} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Right side: (Empty/Reserved for future actions) */}
      <div className="hidden lg:block w-[180px]"></div>
    </div>
  );
};

export default CalendarHeader;
