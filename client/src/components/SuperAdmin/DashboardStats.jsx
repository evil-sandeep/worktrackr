import React from 'react';
import { Building2, Users, ShieldCheck, IndianRupee } from 'lucide-react';

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 border border-[#EDEBE9] shadow-sm flex items-center gap-4 group hover:border-[#0078D4] transition-colors">
        <div className="w-12 h-12 bg-[#F3F2F1] rounded-sm flex items-center justify-center group-hover:bg-[#DEECF9] transition-colors">
          <Building2 className="h-6 w-6 text-[#0078D4]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mb-1">Organizations</p>
          <p className="text-2xl font-bold text-[#323130]">{stats.totalOrganizations}</p>
        </div>
      </div>

      <div className="bg-white p-5 border border-[#EDEBE9] shadow-sm flex items-center gap-4 group hover:border-[#0078D4] transition-colors">
        <div className="w-12 h-12 bg-[#F3F2F1] rounded-sm flex items-center justify-center group-hover:bg-[#DEECF9] transition-colors">
          <Users className="h-6 w-6 text-[#0078D4]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mb-1">Total Workforce</p>
          <p className="text-2xl font-bold text-[#323130]">{stats.totalEmployees}</p>
        </div>
      </div>

      <div className="bg-white p-5 border border-[#EDEBE9] shadow-sm flex items-center gap-4 group hover:border-[#0078D4] transition-colors">
        <div className="w-12 h-12 bg-[#F3F2F1] rounded-sm flex items-center justify-center group-hover:bg-[#DEECF9] transition-colors">
          <ShieldCheck className="h-6 w-6 text-[#107C10]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mb-1">Active Licenses</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-[#323130]">{stats.paidEmployees}</p>
            <span className="text-[10px] text-orange-600 font-bold mb-1 bg-orange-50 px-1.5 py-0.5 border border-orange-100">{stats.unpaidEmployees} Pending</span>
          </div>
        </div>
      </div>

      <div className="bg-[#0078D4] p-5 border border-[#005A9E] shadow-sm flex items-center gap-4 text-white">
        <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center">
          <IndianRupee className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider mb-1">Global Revenue</p>
          <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
