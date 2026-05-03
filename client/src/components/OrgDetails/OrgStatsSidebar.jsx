import React from 'react';
import { ShieldCheck } from 'lucide-react';

const OrgStatsSidebar = ({ employees, orgName, joinCode }) => {
  const stats = [
    { label: 'Total Staff', value: employees.length, color: 'text-[#0078D4]', bg: 'bg-[#DEECF9]' },
    { label: 'Paid License', value: employees.filter(e => e.isPaid).length, color: 'text-[#107C10]', bg: 'bg-[#DFF6DD]' },
    { label: 'Pending', value: employees.filter(e => !e.isPaid).length, color: 'text-[#D83B01]', bg: 'bg-[#FDE7E9]' },
  ];

  return (
    <div className="col-span-12 lg:col-span-3 space-y-4">
      <div className="bg-white p-5 border border-[#EDEBE9] shadow-sm">
        <h3 className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mb-4">Instance Statistics</h3>
        <div className="space-y-3">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-sm bg-[#FAF9F8] border border-[#EDEBE9]">
              <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-tight">{stat.label}</span>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}

          <div className="pt-2 mt-2 border-t border-[#EDEBE9]">
            <div className="flex flex-col gap-1.5 p-3 rounded-sm bg-[#F3F9FF] border border-[#0078D4]/20">
              <span className="text-[10px] font-bold text-[#0078D4] uppercase tracking-wider">Secret Code</span>
              <span className="text-sm font-mono font-bold text-[#323130] tracking-wider">{joinCode || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0078D4] p-6 rounded-sm text-white shadow-md relative group overflow-hidden border border-[#005A9E]">
        <ShieldCheck className="h-8 w-8 text-white/30 mb-3" />
        <h4 className="font-bold text-base leading-tight mb-1">Resource Isolation</h4>
        <p className="text-blue-100 text-[11px] font-medium leading-relaxed">
          Operational boundaries strictly enforced for {orgName || 'this tenant'}. Data leakage prevention active.
        </p>
      </div>
    </div>
  );
};

export default OrgStatsSidebar;
