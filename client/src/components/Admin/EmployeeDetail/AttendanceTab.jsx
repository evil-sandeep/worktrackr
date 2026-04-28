import React from 'react';
import Calendar from '../../Calendar/Calendar';
import { AlertCircle, CheckCircle2, Clock, IndianRupee } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, bgClass, iconClass, borderClass }) => (
  <div className={`p-4 ${bgClass} rounded-sm border ${borderClass} shadow-sm flex flex-col gap-1 transition-all hover:shadow-md`}>
    <Icon className={`h-4 w-4 ${iconClass} mb-1`} />
    <div>
      <p className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-[#323130] tracking-tight">{value}</p>
    </div>
  </div>
);

const AttendanceTab = ({ stats, attendanceMap, onViewDateChange, onDateSelect }) => {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={CheckCircle2} 
          label="Present Nodes" 
          value={stats.present} 
          bgClass="bg-white" 
          borderClass="border-[#EDEBE9]"
          iconClass="text-[#107C10]" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Absent Nodes" 
          value={stats.absent} 
          bgClass="bg-white" 
          borderClass="border-[#EDEBE9]"
          iconClass="text-[#E81123]" 
        />
        <StatCard 
          icon={IndianRupee} 
          label="Estimated Rev" 
          value={`₹${stats.totalEarning}`} 
          bgClass="bg-white" 
          borderClass="border-[#EDEBE9]"
          iconClass="text-[#0078D4]" 
        />
        <StatCard 
          icon={Clock} 
          label="Compute Time" 
          value={stats.totalHoursStr} 
          bgClass="bg-[#FAF9F8]" 
          borderClass="border-[#EDEBE9]"
          iconClass="text-[#605E5C]" 
        />
      </div>
      
      <div className="bg-white p-1 border border-[#EDEBE9] rounded-sm shadow-sm overflow-hidden mt-2">
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
