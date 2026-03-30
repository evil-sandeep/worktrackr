import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { useCalendar } from './useCalendar';

/**
 * Modern Responsive Calendar Component
 * 
 * @param {Object} attendanceData - Object: { 'YYYY-MM-DD': 'present' | 'absent' }
 * @param {Function} onDateSelect - Callback when a date is clicked
 */
const Calendar = ({ attendanceData = {}, onDateSelect }) => {
  const {
    currentDate,
    selectedDate,
    calendarDays,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    setSelectedDate
  } = useCalendar();

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) onDateSelect(date);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />
      <CalendarGrid
        days={calendarDays}
        currentDate={currentDate}
        selectedDate={selectedDate}
        attendanceData={attendanceData}
        onDateClick={handleDateClick}
      />
      
      <div className="mt-10 flex flex-wrap items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></span>
            <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"></span>
            <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Absent</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
           <CalendarIcon className="h-4 w-4 text-slate-400" />
           <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
           </p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
