import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6 px-4 relative z-20">
      {/* Left side: Navigation & Identity */}
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-4">
          <div className="bg-[#0078D4] text-white p-3 rounded-sm shadow-sm">
            <CalendarIcon size={20} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-[#323130] tracking-tight leading-none uppercase">
              {monthNames[currentDate.getMonth()]}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider">
                 Reporting Period FY{currentDate.getFullYear()}
               </span>
               <div className="w-1.5 h-1.5 bg-[#107C10] rounded-full animate-pulse shadow-sm"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-white p-1 rounded-sm border border-[#EDEBE9] shadow-sm">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-[#F3F2F1] text-[#605E5C] transition-all rounded-sm active:scale-95 border border-transparent hover:border-[#EDEBE9]"
            aria-label="Previous Month"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button
            onClick={onToday}
            className="px-6 py-1.5 text-[11px] font-bold text-[#323130] hover:text-[#0078D4] transition-all uppercase tracking-wider border-x border-[#EDEBE9] mx-1"
          >
            Current Cycle
          </button>

          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-[#F3F2F1] text-[#605E5C] transition-all rounded-sm active:scale-95 border border-transparent hover:border-[#EDEBE9]"
            aria-label="Next Month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
