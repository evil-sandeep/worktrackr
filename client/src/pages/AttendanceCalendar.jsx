import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar/Calendar';
import AttendanceDetailModal from '../components/AttendanceDetailModal';
import attendanceService from '../services/attendanceService';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import { formatDateKey } from '../components/Calendar/useCalendar';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  FileText,
  Filter
} from 'lucide-react';

// Simple CountUp hook for premium feel
const useCountUp = (end, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

const StatsBar = ({ stats }) => {
  const pCount = useCountUp(stats.present);
  const iCount = useCountUp(stats.incomplete);
  const aCount = useCountUp(stats.absent);

  return (
    <div className="flex flex-wrap items-center gap-4 mb-5 shrink-0 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white/40 shadow-sm ring-1 ring-slate-200/50">
      <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
          <CheckCircle2 size={16} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 font-outfit">Present</p>
          <p className="text-sm font-black text-slate-900 leading-none font-outfit">{pCount}</p>
        </div>
      </div>

      <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="w-8 h-8 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
          <AlertCircle size={16} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 font-outfit">Incomplete</p>
          <p className="text-sm font-black text-slate-900 leading-none font-outfit">{iCount}</p>
        </div>
      </div>

      <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
          <XCircle size={16} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 font-outfit">Absent</p>
          <p className="text-sm font-black text-slate-900 leading-none font-outfit">{aCount}</p>
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
  const { setCalendarStats } = useUI();

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
        // Incomplete = Entry but no Exit
        const isIncomplete = record.status === 'incomplete' || (record.checkIn && !record.checkOut);
        
        if (isIncomplete) {
          stats.incomplete++;
        } else if (record.status === 'present') {
          stats.present++;
        } else {
          stats.absent++;
        }
      } else {
        // Automatically count missing records as absent
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

  return (
    <div className="flex-1 h-full flex flex-col p-2 sm:p-4 pb-2 overflow-hidden bg-dot-pattern relative animate-in fade-in duration-1000">
      {/* Background Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px] -z-10"></div>
      
      {/* Main Calendar Viewport - Maximized Height */}
      <div className="flex-grow glass-premium-blur rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col min-h-0 ring-1 ring-white/60">
        <div className="flex-grow flex flex-col p-2 sm:p-6 relative min-h-0 overflow-hidden">
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
