import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import AttendanceCamera from '../components/AttendanceCamera';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import Calendar from '../components/Calendar/Calendar';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  if (!user) return null;

  const stats = [
    { 
      label: 'Total Attendance', 
      value: '22', 
      increase: '+12%', 
      icon: Users, 
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Present Days', 
      value: '20', 
      increase: '+5%', 
      icon: CheckCircle2, 
      color: 'bg-green-600',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      label: 'Absent Days', 
      value: '02', 
      increase: '-2%', 
      icon: AlertCircle, 
      color: 'bg-rose-600',
      lightColor: 'bg-rose-50',
      textColor: 'text-rose-600'
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Header with Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                Personnel Portal
             </span>
             <span className="text-slate-300 text-xs font-bold font-mono">/ dashboard</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            Welcome, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl">
            You've maintained an <span className="text-slate-900 font-bold">88% presence rate</span> this month. Keep it up!
          </p>
        </div>
        
        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-slate-400" />
           </div>
           <div className="pr-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session</p>
              <p className="text-sm font-black text-slate-900">
                 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div 
            key={stat.label} 
            className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.lightColor} rounded-full -mr-16 -mt-16 opacity-30 group-hover:scale-110 transition-transform duration-700`}></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className={`${stat.lightColor} p-4 rounded-2xl transition-transform group-hover:rotate-6`}>
                <stat.icon className={`h-7 w-7 ${stat.textColor}`} />
              </div>
              <div className={`flex items-center gap-1 ${stat.increase.startsWith('+') ? 'text-green-500' : 'text-rose-500'} text-xs font-black`}>
                <TrendingUp className="h-3 w-3" />
                {stat.increase}
              </div>
            </div>

            <div className="mt-8 relative z-10">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                   <div className={`h-full ${stat.color} w-3/4 animate-in slide-in-from-left duration-1000`}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Attendance Portal */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Terminal</h3>
             <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Clock className="h-3.5 w-3.5" /> Live Syncing
             </span>
          </div>
          <AttendanceCamera />
        </div>

        {/* Records & Activity */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden min-h-[500px] relative">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/40 sticky top-0 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                 </div>
                 <h3 className="font-black text-slate-900 tracking-tight">Real-time Logs</h3>
              </div>
              <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                 <MoreVertical className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 transition-all duration-700">
               <Calendar 
                attendanceData={{
                  "2026-03-23": "present",
                  "2026-03-22": "absent",
                  "2026-03-21": "present",
                  "2026-03-20": "present",
                  "2026-03-19": "absent",
                }}
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
