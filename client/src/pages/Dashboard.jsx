import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BiometricTerminal from '../components/BiometricTerminal';
import AttendanceDetailModal from '../components/AttendanceDetailModal';
import attendanceService from '../services/attendanceService';
import authService from '../services/authService';
import adminService from '../services/adminService';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  LogOut,
  MoreVertical
} from 'lucide-react';
import Calendar from '../components/Calendar/Calendar';
import { formatDateKey } from '../components/Calendar/useCalendar';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [adminStats, setAdminStats] = useState(null);
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

  const fetchAdminStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setAdminStats(response.data);
    } catch (err) {
      console.error('Admin stats fetch error:', err);
    }
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      if (currentUser.role === 'admin') {
        fetchAdminStats();
      }
      fetchAttendance();
    }
  }, [navigate, filterDate]);

  const stats = [
    {
      title: 'Monthly Present',
      value: Object.values(attendanceMap).filter(r => r.status === 'present').length,
      icon: CheckCircle2,
      color: 'bg-green-500',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Monthly Absent',
      value: Object.values(attendanceMap).filter(r => r.status === 'absent').length,
      icon: AlertCircle,
      color: 'bg-red-500',
      trend: '-5%',
      trendUp: false
    },
  ];

  const todayKey = formatDateKey(new Date());
  const todayLog = attendanceMap[todayKey];
  const isCheckedIn = !!todayLog;
  const isCheckedOut = !!(todayLog?.checkOut?.time || todayLog?.checkoutTime);

  const handleDateSelect = (date) => {
    if (new Date(date) > new Date()) return;
    setSelectedLogDate(formatDateKey(date));
    setIsLogModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome & Quick Analytics Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Workspace Overview</h2>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name.split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {user.role === 'admin' ? "You're viewing the organization's real-time pulse." : `Here's a summary of your activity for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-center min-w-[120px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Session Date</p>
              <p className="text-sm font-black text-slate-800 tabular-nums">{todayKey}</p>
           </div>
        </div>
      </div>

      {/* Main Grid: Terminal or Admin Pulse */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {user.role === 'admin' ? (
          /* --- ADMIN VIEW: WORKFORCE PULSE --- */
          <div className="xl:col-span-12 space-y-8 animate-in slide-in-from-top-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/20 flex items-center gap-6 group hover:border-blue-200 transition-all">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Workforce</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{adminStats?.totalEmployees || 0}</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/20 flex items-center gap-6 group hover:border-green-200 transition-all">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Today</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{adminStats?.presentToday || 0}</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/20 flex items-center gap-6 group hover:border-rose-200 transition-all">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unreported / Absent</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{adminStats?.absentToday || 0}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                       <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-900 tracking-tight">Recent Pulse Activity</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Real-time workforce biometric logs</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors">View All Logs</button>
               </div>
               <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Event</th>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {adminStats?.recentActivity.length > 0 ? adminStats.recentActivity.map(activity => (
                        <tr key={activity._id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 border-none">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs overflow-hidden">
                                  {activity.user?.profileImg ? <img src={activity.user.profileImg} className="w-full h-full object-cover" /> : activity.user?.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{activity.user?.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activity.user?.empId}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-none">
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${activity.checkOut ? 'bg-orange-400' : 'bg-green-500'}`} />
                                <span className="text-xs font-bold text-slate-600">{activity.checkOut ? 'Check-out' : 'Check-in'}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 border-none text-xs font-black text-slate-900 tabular-nums">
                             {activity.checkOut ? activity.checkOut.time : activity.checkIn?.time}
                          </td>
                          <td className="px-6 py-4 border-none">
                             <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg border border-green-100">Verified</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="text-center py-12 text-slate-400 font-bold italic text-sm">No recent activity detected for today.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        ) : (
          /* --- EMPLOYEE VIEW: BIOMETRIC TERMINAL --- */
          <div className="xl:col-span-12">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-50">
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
                    <BiometricTerminal mode="checkin" onSuccess={() => { fetchAttendance(); if (user.role === 'admin') fetchAdminStats(); }} />
                  ) : !isCheckedOut ? (
                    <BiometricTerminal mode="checkout" onSuccess={() => { fetchAttendance(); if (user.role === 'admin') fetchAdminStats(); }} />
                  ) : (
                    <div className="bg-slate-50/50 rounded-[2rem] p-12 flex flex-col items-center text-center space-y-6 border border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                         <CheckCircle2 className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shift Complete</h2>
                    </div>
                  )}
                </div>

                <div className="p-8 lg:p-12 bg-slate-50/30">
                  <h3 className="font-black text-slate-900 tracking-tight mb-8">Daily Insights</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Clock className="h-6 w-6" /></div>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours</p><p className="text-xl font-black text-slate-900">{todayLog?.totalHours || '0h 0m'}</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-black text-xl">₹</div>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay</p><p className="text-xl font-black text-slate-900">₹{todayLog?.earning || 0}</p></div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Valuation</p>
                     <p className="text-3xl font-black tracking-tight">₹{Object.values(attendanceMap).reduce((acc, curr) => acc + (curr.earning || 0), 0)}</p>
                     <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Monitoring: History Log Column */}
        <div className="xl:col-span-12">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="font-black text-slate-900 tracking-tight">{user.role === 'admin' ? 'Workforce Attendance Logs' : 'My Attendance Logs'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user.role === 'admin' ? 'Monitoring organization-wide health' : 'Monthly History Overview'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <select value={filterDate.month} onChange={(e) => setFilterDate(p=>({...p, month: e.target.value}))} className="bg-white border-none rounded-lg text-[10px] font-black uppercase p-2 outline-none">
                    {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('en-US',{month:'short'})}</option>)}
                  </select>
                  <select value={filterDate.year} onChange={(e) => setFilterDate(p=>({...p, year: e.target.value}))} className="bg-white border-none rounded-lg text-[10px] font-black p-2 outline-none">
                     <option value="2025">2025</option><option value="2026">2026</option>
                  </select>
               </div>
            </div>
            
            <div className="p-8">
               <Calendar attendanceData={attendanceMap} onDateSelect={handleDateSelect} />
            </div>
          </div>
        </div>

        <AttendanceDetailModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} date={selectedLogDate} record={attendanceMap[selectedLogDate]} />
      </div>
    </div>
  );
};

export default Dashboard;
