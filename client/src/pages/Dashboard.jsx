import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BiometricTerminal from '../components/BiometricTerminal';
import AttendanceDetailModal from '../components/AttendanceDetailModal';
import StoreVisitTerminal from '../components/StoreVisit/StoreVisitTerminal';
import attendanceService from '../services/attendanceService';
import authService from '../services/authService';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import Calendar from '../components/Calendar/Calendar';
import { formatDateKey } from '../components/Calendar/useCalendar';
import useLocationTracker from '../hooks/useLocationTracker';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedLogDate, setSelectedLogDate] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString()
  });
  const navigate = useNavigate();

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

  // Initialize hourly location tracking if checked in and not checked out
  useLocationTracker(isCheckedIn, isCheckedOut);

  const handleDateSelect = (date) => {
    if (new Date(date) > new Date()) return;
    setSelectedLogDate(formatDateKey(date));
    setIsLogModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Employee Portal</h2>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name.split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Summary for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-center min-w-[120px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Session Date</p>
              <p className="text-sm font-black text-slate-800 tabular-nums">{todayKey}</p>
           </div>
        </div>
      </div>

      {/* Main Grid: Biometric Terminal */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-12">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-4 sm:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 tracking-tight">Biometric Terminal</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Status: Active</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse">Online</div>
                </div>

                {!isCheckedIn ? (
                  <BiometricTerminal mode="checkin" onSuccess={fetchAttendance} />
                ) : !isCheckedOut ? (
                  <BiometricTerminal mode="checkout" onSuccess={fetchAttendance} />
                ) : (
                  <div className="bg-slate-50/50 rounded-[2rem] p-12 flex flex-col items-center text-center space-y-6 border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                       <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shift Complete</h2>
                    <p className="text-slate-500 font-medium">Great job today! Your attendance has been logged.</p>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-8 lg:p-12 bg-slate-50/30">
                <h3 className="font-black text-slate-900 tracking-tight mb-8">Daily Insights</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Clock className="h-6 w-6" /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours</p><p className="text-xl font-black text-slate-900">{todayLog?.totalHours || '0h 0m'}</p></div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-black text-xl">₹</div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay</p><p className="text-xl font-black text-slate-900">₹{todayLog?.earning || 0}</p></div>
                  </div>
                </div>
                
                <div className="mt-8 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Valuation</p>
                   <p className="text-3xl font-black tracking-tight">₹{Object.values(attendanceMap).reduce((acc, curr) => acc + (curr.earning || 0), 0)}</p>
                   <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Log Column */}
        <div className="xl:col-span-12">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="font-black text-slate-900 tracking-tight">Attendance Logs</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Monthly Personal Overview</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <select value={filterDate.month} onChange={(e) => setFilterDate(p=>({...p, month: e.target.value}))} className="bg-white border-none rounded-lg text-[10px] font-black uppercase p-2 outline-none">
                    {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('en-US',{month:'short'})}</option>)}
                  </select>
                  <select value={filterDate.year} onChange={(e) => setFilterDate(p=>({...p, year: e.target.value}))} className="bg-white border-none rounded-lg text-[10px] font-black p-2 outline-none">
                     <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                  </select>
               </div>
            </div>
            
            <div className="p-8">
               <Calendar attendanceData={attendanceMap} onDateSelect={handleDateSelect} />
            </div>
          </div>
        </div>

        {/* Store Visits Column */}
        <div className="xl:col-span-12">
           <StoreVisitTerminal onSuccess={() => {}} />
        </div>

        <AttendanceDetailModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} date={selectedLogDate} record={attendanceMap[selectedLogDate]} />
      </div>
    </div>
  );
};

export default Dashboard;
