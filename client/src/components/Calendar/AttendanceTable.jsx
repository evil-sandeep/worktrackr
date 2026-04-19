import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';

const AttendanceTable = ({ attendanceData, viewDate, onDateSelect }) => {
  // Generate days for the current viewMonth
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };


  return (
    <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm bg-white/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Date</th>
            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Entry</th>
            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Exit</th>
            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Shift</th>
            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">yield</th>
            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Status</th>
            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {days.map((date) => {
            const key = formatDateKey(date);
            const record = attendanceData[key];
            const isFuture = date > new Date();
            
            // Re-render getStatusInfo with date context
            const getStatus = (r, f) => {
                if (f) return { label: 'Queue', color: 'text-slate-300', bg: 'bg-slate-50/50' };
                if (!r) return { label: 'Absent', color: 'text-red-500', bg: 'bg-red-50/50' };
                const isP = r.status === 'present' && r.checkOut?.imageUrl;
                const isI = r.status === 'present' && !r.checkOut?.imageUrl;
                if (isP) return { label: 'Verified', color: 'text-emerald-500', bg: 'bg-emerald-50/50' };
                if (isI) return { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-50/50' };
                return { label: 'Absent', color: 'text-red-500', bg: 'bg-red-50/50' };
            };

            const status = getStatus(record, isFuture);
            
            return (
              <tr 
                key={key} 
                className={`group hover:bg-white transition-all duration-300 ${isFuture ? 'bg-slate-50/20' : ''}`}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-500 ${isFuture ? 'bg-slate-50 text-slate-300' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'}`}>
                        {date.getDate()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    </div>
                  </div>
                </td>
                
                <td className="px-8 py-5 text-center">
                  <span className="text-xs font-black text-slate-700 tracking-tighter tabular-nums">
                    {record?.checkIn?.time || '--:--'}
                  </span>
                </td>
                
                <td className="px-8 py-5 text-center">
                   <span className="text-xs font-black text-slate-700 tracking-tighter tabular-nums">
                    {record?.checkOut?.time || '--:--'}
                  </span>
                </td>

                <td className="px-8 py-5 text-center">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    {record?.totalHours || '0h 0m'}
                  </span>
                </td>
                
                <td className="px-8 py-5 text-center">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-all duration-500">
                      <span className="text-[10px] font-black text-slate-900 group-hover:text-white tracking-widest tabular-nums">₹{record?.earning || 0}</span>
                   </div>
                </td>
                
                <td className="px-8 py-5">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-current/10 ${status.bg} ${status.color} transition-all duration-500 group-hover:scale-105`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text', 'bg')} animate-pulse-subtle`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">{status.label}</span>
                  </div>
                </td>
                
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => !isFuture && onDateSelect(date)}
                    disabled={isFuture}
                    className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:shadow-xl hover:-translate-x-1 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                  >
                    <ChevronRight className="h-4 w-4 transform transition-transform group-hover/btn:scale-125" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
