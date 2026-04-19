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
  const [view, setView] = React.useState('month');
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
    <div className="w-full flex flex-col h-full overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        view={view}
        setView={setView}
      />
      <div className="flex-1 overflow-hidden">
        <CalendarGrid
          days={calendarDays}
          currentDate={currentDate}
          selectedDate={selectedDate}
          attendanceData={attendanceData}
          onDateClick={handleDateClick}
        />
      </div>
    </div>
  );
};

export default Calendar;
