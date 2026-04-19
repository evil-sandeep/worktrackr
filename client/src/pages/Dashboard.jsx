import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BiometricTerminal from '../components/BiometricTerminal';
import AttendanceDetailModal from '../components/AttendanceDetailModal';
import attendanceService from '../services/attendanceService';
import authService from '../services/authService';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
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
    <div className="space-y-8 pb-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="subheading-premium">{greeting}</p>
          <h1 className="text-4xl font-bold text-slate-900 tracking-[-0.04em] pr-2">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 font-medium text-[11px] uppercase tracking-widest opacity-70">
            {isCheckedIn ? 'Status: Active Session' : 'No active session detected'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-premium px-6 py-3 rounded-2xl border-white/40 flex flex-col items-end">
            <span className="subheading-premium !text-[8px]">Current Session</span>
            <span className="text-sm font-black text-slate-900 tabular-nums">{todayKey}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Biometric Terminal Card */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="card-premium h-full !p-0 overflow-hidden group border-slate-900/5 shadow-2xl shadow-slate-950/20 relative">
             <div className="p-6 sm:p-10 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 transform group-hover:rotate-6 transition-transform duration-500">
                    <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-xs sm:text-sm">Security Hub</h3>
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-80 mt-1">Biometric Protocol Active</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-green-50 rounded-full border border-green-100">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em]">Ready for Auth</span>
                </div>
             </div>
             
             <div className="p-0">
                {!isCheckedIn ? (
                  <BiometricTerminal mode="checkin" onSuccess={fetchAttendance} />
                ) : !isCheckedOut ? (
                  <BiometricTerminal mode="checkout" onSuccess={fetchAttendance} />
                ) : (
                  <div className="p-16 flex flex-col items-center text-center space-y-10 bg-slate-50/20 group/verified">
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-200/50 relative transform group-hover/verified:scale-110 transition-transform duration-700">
                       <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl animate-pulse"></div>
                       <CheckCircle2 className="h-14 w-14 text-green-500 relative z-10" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="heading-premium !text-2xl uppercase tracking-tighter">Session Verified</h2>
                      <p className="text-slate-400 text-[11px] font-medium uppercase tracking-[0.2em] leading-relaxed max-w-[240px] mx-auto opacity-70">Log synchronization complete. System standby.</p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* High-Contrast Stats Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
           {/* Progress Card */}
           <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-950/40 relative overflow-hidden group border border-white/5">
              <div className="relative z-10">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-5">Monthly Yield</p>
                <p className="text-5xl font-black tracking-tighter text-white mb-8 pr-10">
                   ₹{Object.values(attendanceMap).reduce((acc, curr) => acc + (curr.earning || 0), 0)}
                </p>
                <div className="space-y-4">
                   <div className="flex items-center justify-between text-[9px] uppercase font-black tracking-widest text-white/30">
                      <span className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"></div> Target</span>
                      <span className="text-white/60">65%</span>
                   </div>
                   <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-[2px]">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[65%] rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                   </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px] transition-all duration-1000 group-hover:bg-blue-600/30 group-hover:scale-125"></div>
           </div>

           {/* Session Details */}
           <div className="space-y-4">
              <div className="glass-premium p-7 rounded-[2rem] border-white/50 flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group bg-white/40">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center ring-4 ring-blue-50/30 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500"><Clock size={20} /></div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Active Hours</p>
                      <p className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">{todayLog?.totalHours || '0h 0m'}</p>
                   </div>
                </div>
              </div>

              <div className="glass-premium p-7 rounded-[2rem] border-white/50 flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group bg-white/40">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-colors duration-500"><span className="font-bold text-lg">₹</span></div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Daily Accrued</p>
                      <p className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">₹{todayLog?.earning || 0}</p>
                   </div>
                </div>
              </div>
           </div>
           
           <div className="p-6 bg-slate-100/50 rounded-[2rem] border border-slate-200/50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="h-4 w-4 text-blue-600" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol Stats</span>
                </div>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Locked</span>
              </div>
              <div className="flex gap-1">
                 {Array.from({length: 8}).map((_, i) => (
                   <div key={i} className={`h-1 flex-1 rounded-full ${i < 5 ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* History & Calendar */}
      <div className="card-premium !p-0 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                <CalendarIcon className="h-6 w-6" />
             </div>
             <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-tight text-xs">Attendance Ledger</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none opacity-80">Activity Archive</p>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/50 rounded-xl border border-slate-100 shadow-inner">
               <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <LayoutGrid size={16} />
               </button>
               <button 
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <List size={16} />
               </button>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                <select 
                  value={filterDate.month} 
                  onChange={(e) => setFilterDate(p=>({...p, month: e.target.value}))} 
                  className="bg-white border-none rounded-xl text-[10px] font-black uppercase px-4 py-2.5 outline-none shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('en-US',{month:'short'})}</option>)}
                </select>
                <select 
                  value={filterDate.year} 
                  onChange={(e) => setFilterDate(p=>({...p, year: e.target.value}))} 
                  className="bg-white border-none rounded-xl text-[10px] font-black px-4 py-2.5 outline-none shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                >
                   <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                </select>
             </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
           {viewMode === 'grid' ? (
             <Calendar attendanceData={attendanceMap} onDateSelect={handleDateSelect} />
           ) : (
             <AttendanceTable 
               attendanceData={attendanceMap} 
               viewDate={new Date(parseInt(filterDate.year), parseInt(filterDate.month) - 1)} 
               onDateSelect={handleDateSelect} 
             />
           )}
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
