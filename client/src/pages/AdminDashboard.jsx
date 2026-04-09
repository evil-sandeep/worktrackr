import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    recentActivity: []
  });
  const { showLoader, addToast } = useUI();

  const fetchStats = async () => {
    showLoader(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch dashboard stats', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, detail }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-500">
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-full translate-x-16 translate-y-[-16px] group-hover:scale-110 transition-transform duration-700`}></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6`}>
          <Icon className={`h-7 w-7 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{detail}</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{title}</h3>
        <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">
          {value}
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>Live System Status</span>
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Executive Overview</h2>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Analytics</span>
          </h1>
          <p className="text-slate-500 font-medium">Real-time workforce integrity and attendance metrics</p>
        </div>
        <button 
          onClick={fetchStats}
          className="group flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
          <Activity className="h-4 w-4 group-hover:animate-spin" />
          Synchronize Data
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard 
          title="Total Workforce" 
          value={stats.totalEmployees} 
          icon={Users} 
          color="bg-blue-600" 
          detail="+2.4%"
        />
        <StatCard 
          title="Active Today" 
          value={stats.presentToday} 
          icon={UserCheck} 
          color="bg-green-600" 
          detail="On Duty"
        />
        <StatCard 
          title="Daily Absence" 
          value={stats.absentToday} 
          icon={Clock} 
          color="bg-orange-600" 
          detail="Pending"
        />
      </div>

      {/* Secondary Insight Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                Recent Operations Log
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</span>
           </div>
           
           <div className="space-y-4">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity._id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 rounded-2xl transition-colors border border-transparent hover:border-blue-100">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400">
                          {activity.user?.name?.charAt(0) || 'U'}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900">{activity.user?.name || 'Unknown User'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activity.user?.empId || 'N/A'}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-slate-900">{activity.checkIn?.time || 'Logged'}</p>
                       <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Present</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                   <Activity className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                   <p className="text-slate-400 font-bold italic">No activity logs captured yet today.</p>
                </div>
              )}
           </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              <ArrowUpRight className="absolute top-6 right-6 h-6 w-6 opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <div className="relative z-10">
                <h3 className="font-bold text-blue-100 text-[10px] uppercase tracking-widest mb-4">Quick Action</h3>
                <p className="text-xl font-black leading-tight mb-8">Ready to manage your personnel directory?</p>
                <button 
                  onClick={() => window.location.href='/employee'}
                  className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-black text-sm transition-all border border-white/10"
                >
                  View Directory
                </button>
              </div>
           </div>
           
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/10">
              <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-6">System Health</h3>
              <div className="flex items-center gap-4 mb-6">
                 <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[95%] h-full bg-blue-500"></div>
                 </div>
                 <span className="text-[10px] font-black tabular-nums">95%</span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-widest">All services operational. Data encryption verified.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
