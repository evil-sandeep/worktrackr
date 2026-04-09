import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const TrackingCalendar = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const d = new Date();
    return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate);
    return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  };

  const formatDate = (day) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-blue-600" />
          Select Date
        </h4>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft className="h-4 w-4 text-slate-400" /></button>
          <span className="text-xs font-black text-slate-600 min-w-[100px] text-center uppercase tracking-widest">
            {currentMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight className="h-4 w-4 text-slate-400" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[10px] font-black text-slate-400 text-center py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => (
          <div key={idx} className="aspect-square">
            {day && (
              <button
                onClick={() => onDateChange(formatDate(day))}
                className={`w-full h-full rounded-xl text-xs font-bold transition-all flex items-center justify-center
                  ${isSelected(day) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110 z-10' : 
                    isToday(day) ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingCalendar;
