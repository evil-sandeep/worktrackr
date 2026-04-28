import React from 'react';
import { Users, ShieldCheck, IndianRupee } from 'lucide-react';

const OrgDetailStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-[#FAF9F8] p-4 border border-[#EDEBE9]">
        <Users className="h-5 w-5 text-[#0078D4] mb-2" />
        <p className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider mb-1">Total Instances</p>
        <p className="text-2xl font-bold text-[#323130]">{stats.totalStaff}</p>
      </div>
      <div className="bg-[#DFF6DD] p-4 border border-[#107C10]/10">
        <ShieldCheck className="h-5 w-5 text-[#107C10] mb-2" />
        <p className="text-[10px] font-semibold text-[#107C10] uppercase tracking-wider mb-1">Licensed Staff</p>
        <p className="text-2xl font-bold text-[#107C10]">{stats.paidStaff}</p>
      </div>
      <div className="bg-[#FFF4CE] p-4 border border-[#797673]/10">
        <Users className="h-5 w-5 text-[#797673] mb-2 opacity-50" />
        <p className="text-[10px] font-semibold text-[#797673] uppercase tracking-wider mb-1">Unpaid Pool</p>
        <p className="text-2xl font-bold text-[#323130]">{stats.unpaidStaff}</p>
      </div>
      <div className="bg-[#0078D4] p-4 border border-[#005A9E] text-white shadow-md">
        <IndianRupee className="h-5 w-5 text-blue-100 mb-2" />
        <p className="text-[10px] font-semibold text-blue-100 uppercase tracking-wider mb-1">Monthly Billing</p>
        <p className="text-2xl font-bold">₹{stats.revenue}</p>
      </div>
    </div>
  );
};

export default OrgDetailStats;
