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
      className={`relative h-full flex flex-col items-center justify-center rounded-sm border transition-all duration-200 group
        ${!isFuture ? 'cursor-pointer hover:bg-[#F3F2F1] hover:border-[#0078D4]/30' : 'cursor-not-allowed bg-[#FAF9F8] opacity-30'}
        ${isSelected ? 'bg-[#DEECF9] border-[#0078D4]' : 'bg-white border-[#EDEBE9]'}
        ${!isCurrentMonth ? 'opacity-20' : ''}
      `}
    >
      {/* Today Indicator */}
      {isToday && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#0078D4]"></div>
      )}

      {/* Date Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <div className={`flex items-center justify-center rounded-sm transition-all duration-300
          ${isPresent ? 'text-[#107C10]' : 
            (isIncomplete ? 'text-[#D83B01]' :
              (isToday ? 'text-[#0078D4] font-bold' : 
                (isSelected ? 'text-[#0078D4]' : 'text-[#323130]')))}
        `}>
          <span className="text-lg font-semibold tracking-tight">
            {day.getDate()}
          </span>
        </div>
        
        {/* Status Dot */}
        {(isPresent || isIncomplete || isAbsent) && (
          <div className={`mt-1 w-1.5 h-1.5 rounded-full ${
            isPresent ? 'bg-[#107C10]' : 
            isIncomplete ? 'bg-[#D83B01]' : 'bg-[#A19F9D]'
          }`}></div>
        )}
      </div>
    </div>
  );
};

export default CalendarDay;
