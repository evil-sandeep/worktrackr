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
const Calendar = ({ attendanceData = {}, onDateSelect, onViewDateChange }) => {
  const {
    currentDate,
    selectedDate,
    calendarDays,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    setSelectedDate
  } = useCalendar();

  // Notify parent of view changes (month/year)
  React.useEffect(() => {
    if (onViewDateChange) {
      onViewDateChange(currentDate);
    }
  }, [currentDate, onViewDateChange]);

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
      
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 px-4 border-t border-slate-100/60 pt-8">
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <div className="flex items-center gap-3 group px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-lg shadow-emerald-500/20"></span>
            <span className="font-bold text-[9px] text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">Present</span>
          </div>
          <div className="flex items-center gap-3 group px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shadow-lg shadow-amber-500/20"></span>
            <span className="font-bold text-[9px] text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">Incomplete</span>
          </div>
          <div className="flex items-center gap-3 group px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="w-3.5 h-3.5 rounded-md bg-red-600 shadow-lg shadow-red-600/20"></span>
            <span className="font-bold text-[9px] text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">Absent</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900 px-6 py-2.5 rounded-[1.25rem] shadow-xl shadow-slate-900/10 border border-white/5 group active:scale-95 transition-all">
           <CalendarIcon className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
           <p className="text-[10px] font-black text-white uppercase tracking-widest">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
           </p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
