import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar/Calendar';
import AttendanceDetailModal from '../components/AttendanceDetailModal';
import attendanceService from '../services/attendanceService';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import { formatDateKey } from '../components/Calendar/useCalendar';
import PaymentBlock from '../components/PaymentBlock';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  FileText,
  Filter
} from 'lucide-react';

const StatsBar = ({ stats }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 shrink-0">
      <div className="px-4 py-1.5 bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm flex items-center gap-3 min-w-[140px]">
        <div className="w-8 h-8 bg-[#DFF6DD] text-[#107C10] rounded-sm flex items-center justify-center border border-[#107C10]/10">
          <CheckCircle2 size={16} />
        </div>
        <div>
          <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider leading-none mb-1">Authenticated</p>
          <p className="text-sm font-bold text-[#323130] leading-none">{stats.present}</p>
        </div>
      </div>

      <div className="px-4 py-1.5 bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm flex items-center gap-3 min-w-[140px]">
        <div className="w-8 h-8 bg-[#FFF4CE] text-[#797673] rounded-sm flex items-center justify-center border border-[#797673]/10">
          <AlertCircle size={16} />
        </div>
        <div>
          <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider leading-none mb-1">Partial Sync</p>
          <p className="text-sm font-bold text-[#323130] leading-none">{stats.incomplete}</p>
        </div>
      </div>

      <div className="px-4 py-1.5 bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm flex items-center gap-3 min-w-[140px]">
        <div className="w-8 h-8 bg-[#FDE7E9] text-[#A4262C] rounded-sm flex items-center justify-center border border-[#A4262C]/10">
          <XCircle size={16} />
        </div>
        <div>
          <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider leading-none mb-1">Terminal Missing</p>
          <p className="text-sm font-bold text-[#323130] leading-none">{stats.absent}</p>
        </div>
      </div>
    </div>
  );
};

const AttendanceCalendar = () => {
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedLogDate, setSelectedLogDate] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { setCalendarStats, calendarStats } = useUI();

  const fetchAttendance = async (date) => {
    if (!user) return;
    try {
      const month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();
      const response = await attendanceService.getAttendanceByUserId(user._id, { month, year });
      if (response.success && response.data) {
        setAttendanceMap(response.data.reduce((acc, curr) => ({ ...acc, [curr.date]: curr }), {}));
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchAttendance(viewDate);
    }
  }, [viewDate]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isCurrentMonth = viewDate.getMonth() === today.getMonth() && 
                          viewDate.getFullYear() === today.getFullYear();
    
    const lastDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const lastDayToCheck = isCurrentMonth ? today.getDate() : lastDayOfMonth;
    
    const stats = { present: 0, incomplete: 0, absent: 0 };
    
    for (let d = 1; d <= lastDayToCheck; d++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const dateKey = formatDateKey(date);
      const record = attendanceMap[dateKey];
      
      if (record) {
        const isIncomplete = record.status === 'incomplete' || (record.checkIn && !record.checkOut);
        
        if (isIncomplete) {
          stats.incomplete++;
        } else if (record.status === 'present') {
          stats.present++;
        } else {
          stats.absent++;
        }
      } else {
        stats.absent++;
      }
    }
    
    setCalendarStats(stats);
    
    return () => setCalendarStats(null);
  }, [attendanceMap, viewDate, setCalendarStats]);

  const handleDateSelect = (date) => {
    const dateKey = formatDateKey(date);
    if (new Date(date) > new Date()) return;
    setSelectedLogDate(dateKey);
    setIsLogModalOpen(true);
  };

  if (user?.role === 'employee' && !user?.isPaid) {
    return (
      <div className="flex-1 h-full flex flex-col p-4 bg-[#F3F2F1]">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDEBE9] pb-4 bg-white -mx-6 -mt-6 px-6 py-4 mb-4 shadow-sm">
            <div className="space-y-1">
              <h1 className="text-[20px] font-semibold text-[#323130] tracking-tight">Resource Attendance Log</h1>
              <p className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider">Telemtry Access Restricted</p>
            </div>
          </div>
          <PaymentBlock 
            title="Attendance Log Locked" 
            message="Your attendance history and telemetry logs are restricted until full account activation." 
          />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col p-4 pb-2 overflow-hidden bg-[#F3F2F1] relative animate-in fade-in duration-300">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDEBE9] pb-4 bg-white -mx-6 -mt-6 px-6 py-4 mb-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-[20px] font-semibold text-[#323130] tracking-tight">Resource Attendance Log</h1>
          <p className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider">Telemetry & Authorization History</p>
        </div>
        {calendarStats && <StatsBar stats={calendarStats} />}
      </div>
      
      {/* Main Calendar Viewport */}
      <div className="flex-grow bg-white border border-[#EDEBE9] rounded-sm shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="flex-grow flex flex-col p-4 relative min-h-0 overflow-hidden">
          <Calendar 
            attendanceData={attendanceMap} 
            onDateSelect={handleDateSelect}
            onViewDateChange={(date) => setViewDate(date)}
          />
        </div>
      </div>

      <AttendanceDetailModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        date={selectedLogDate} 
        record={attendanceMap[selectedLogDate]} 
      />
    </div>
  );
};

export default AttendanceCalendar;
