import React from 'react';
import Calendar from '../../Calendar/Calendar';
import { AlertCircle, CheckCircle2, Clock, IndianRupee } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, bgClass, iconClass }) => (
  <div className={`p-5 ${bgClass} rounded-3xl border flex flex-col gap-2`}>
    <Icon className={`h-5 w-5 ${iconClass}`} />
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const AttendanceTab = ({ stats, attendanceMap, onViewDateChange, onDateSelect }) => {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={CheckCircle2} 
          label="Present" 
          value={stats.present} 
          bgClass="bg-blue-50/50 border-blue-100" 
          iconClass="text-blue-600" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Absent" 
          value={stats.absent} 
          bgClass="bg-rose-50/50 border-rose-100" 
          iconClass="text-rose-600" 
        />
        <StatCard 
          icon={IndianRupee} 
          label="Earnings" 
          value={`₹${stats.totalEarning}`} 
          bgClass="bg-emerald-50/50 border-emerald-100" 
          iconClass="text-emerald-600" 
        />
        <StatCard 
          icon={Clock} 
          label="Hours" 
          value={stats.totalHoursStr} 
          bgClass="bg-slate-50 border-slate-100" 
          iconClass="text-slate-600" 
        />
      </div>
      
      <div className="bg-white p-2 border border-slate-100 rounded-[2.5rem]">
        <Calendar 
          attendanceData={attendanceMap} 
          onViewDateChange={onViewDateChange} 
          onDateSelect={onDateSelect} 
        />
      </div>
    </>
  );
};

export default AttendanceTab;
