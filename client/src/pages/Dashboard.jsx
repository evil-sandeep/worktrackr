import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import AttendanceCamera from '../components/AttendanceCamera';
import { Calendar } from 'lucide-react';

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Capture your daily presence with precision.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm text-slate-500 text-sm font-bold">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Attendance Capture */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <AttendanceCamera />
        </div>

        {/* Right Column: Statistics & Logs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Total Present', value: '22', color: 'blue' },
              { label: 'Late Arrivals', value: '02', color: 'amber' },
              { label: 'Avg. Punch In', value: '09:12 AM', color: 'indigo' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full -mr-12 -mt-12 opacity-50`}></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Activity Logs Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-900 tracking-tight">Recent Activity Logs</h3>
              <button className="text-xs font-black text-blue-600 hover:text-white px-5 py-2 hover:bg-blue-600 rounded-full transition-all border border-blue-100 shadow-sm">Review All</button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-16 text-center h-full space-y-4">
               <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-2 transform -rotate-6">
                 <Calendar className="h-10 w-10 text-slate-300" />
               </div>
               <div>
                  <p className="text-slate-900 font-black text-lg">No records yet</p>
                  <p className="text-slate-400 text-sm font-medium mt-1 mx-auto max-w-[240px]">You haven't logged any attendance for the current cycle.</p>
               </div>
               <button className="text-blue-600 text-sm font-bold bg-blue-50/50 px-6 py-2 rounded-xl hover:bg-blue-50 transition-all border border-blue-50 mt-4">Manual Sync</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
