import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BiometricTerminal from '../components/BiometricTerminal';
import AttendanceDetailModal from '../components/AttendanceDetailModal';
import attendanceService from '../services/attendanceService';
import authService from '../services/authService';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  LayoutGrid,
  List
} from 'lucide-react';
import Calendar from '../components/Calendar/Calendar';
import AttendanceTable from '../components/Calendar/AttendanceTable';
import { formatDateKey } from '../components/Calendar/useCalendar';
import useLocationTracker from '../hooks/useLocationTracker';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedLogDate, setSelectedLogDate] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [filterDate, setFilterDate] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString()
  });
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const fetchAttendance = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      const { month, year } = filterDate;
      const response = await attendanceService.getAttendanceByUserId(
        currentUser._id, 
        { month, year }
      );
      if (response.success && response.data) {
        setAttendanceMap(response.data.reduce((acc, curr) => ({ ...acc, [curr.date]: curr }), {}));
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
    }
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      fetchAttendance();
    }
  }, [navigate, filterDate]);

  const todayKey = formatDateKey(new Date());
  const todayLog = attendanceMap[todayKey];
  const isCheckedIn = !!todayLog;
  const isCheckedOut = !!(todayLog?.checkOut?.time || todayLog?.checkoutTime);

  useLocationTracker(isCheckedIn, isCheckedOut);

  const handleDateSelect = (date) => {
    if (new Date(date) > new Date()) return;
    setSelectedLogDate(formatDateKey(date));
    setIsLogModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden animate-in fade-in duration-700">
      
      {/* Viewport Locked Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
        
        {/* Main Hub Area (Flex: 2) */}
        <div className="flex-[2] h-full flex flex-col justify-center min-h-0">
          {/* Security Hub - Vertically Centered Core */}
          <div className="card-premium !p-0 overflow-hidden group shadow-md flex flex-col h-full max-h-[85vh]">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/10 transition-transform group-hover:-rotate-3">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 tracking-tight text-sm">Security Hub</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Biometric Protocol Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest">Ready for Auth</span>
                </div>
             </div>
             
             {/* Centered Action Center */}
             <div className="flex-1 flex flex-col items-stretch justify-center p-6 bg-slate-50/10 overflow-hidden w-full">
                {!isCheckedIn ? (
                  <BiometricTerminal mode="checkin" onSuccess={fetchAttendance} />
                ) : !isCheckedOut ? (
                  <BiometricTerminal mode="checkout" onSuccess={fetchAttendance} />
                ) : (
                  <div className="flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 rounded-[1.75rem] flex items-center justify-center relative">
                       <div className="absolute inset-0 bg-green-500/10 rounded-[1.75rem] blur-xl animate-pulse"></div>
                       <CheckCircle className="h-10 w-10 text-green-500 relative z-10" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Session Secured</h2>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-[240px]">Cryptographically synchronized.</p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Stats Column (Flex: 1) */}
        <div className="flex-1 h-full flex flex-col gap-3 min-h-0">
           {/* Monthly Yield Card */}
           <div className="card-premium !p-5 flex-1 min-h-0 flex flex-col justify-between group">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Yield</span>
                <span className="text-[9px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
              </div>
              <div className="py-2">
                <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none mb-2">
                   ₹{Object.values(attendanceMap).reduce((acc, curr) => acc + (curr.earning || 0), 0)}
                </p>
                <div className="flex items-center gap-2">
                   <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-[65%] rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)]"></div>
                   </div>
                   <span className="text-[9px] font-bold text-slate-400">65%</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                 <svg className="w-full h-8 text-indigo-500 opacity-20" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,15 L15,10 L30,18 L50,5 L70,12 L100,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                 </svg>
              </div>
           </div>

           {/* Active Hours Card */}
           <div className="card-premium !p-4 flex-1 min-h-0 flex items-center justify-between group hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Clock size={14} />
                 </div>
                 <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active Hours</p>
                    <p className="text-base font-black text-slate-900 tracking-tight tabular-nums">{todayLog?.totalHours || '0h 0m'}</p>
                 </div>
              </div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
           </div>

           {/* Daily Accrued Card */}
           <div className="card-premium !p-4 flex-1 min-h-0 flex items-center justify-between group hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors font-bold text-xs">₹</div>
                 <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Daily Accrued</p>
                    <p className="text-base font-black text-slate-900 tracking-tight tabular-nums">₹{todayLog?.earning || 0}</p>
                 </div>
              </div>
           </div>

           {/* Protocol Status Bar */}
           <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm flex-1 min-h-0 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-indigo-600" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.1em]">Protocol Stats</span>
                 </div>
                 <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest">Locked</span>
              </div>
              <div className="flex gap-1">
                 {Array.from({length: 12}).map((_, i) => (
                   <div key={i} className={`h-1 flex-1 rounded-full ${i < 9 ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)]' : 'bg-slate-100'}`}></div>
                 ))}
              </div>
           </div>
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


export default Dashboard;
