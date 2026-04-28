import React from 'react';
import { ArrowLeft, Building2, Users, Mail, Plus } from 'lucide-react';

const OrgHeader = ({ orgDetails, employeesCount, onBack, onAddEmployee }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 border border-[#EDEBE9] shadow-sm">
      <div className="flex items-center gap-5">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-[#F3F2F1] text-[#323130] rounded-sm flex items-center justify-center hover:bg-[#EDEBE9] transition-colors border border-[#D2D0CE]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        
        <div className="w-16 h-16 bg-[#0078D4] rounded-sm flex items-center justify-center text-2xl font-bold text-white shadow-sm">
          {orgDetails?.name?.charAt(0) || <Building2 className="h-8 w-8" />}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#323130] tracking-tight">
              {orgDetails?.name || 'Organization Details'}
            </h1>
            <span className="px-2 py-0.5 bg-[#DFF6DD] text-[#107C10] rounded-sm text-[10px] font-semibold uppercase tracking-wider border border-[#107C10]/10">
              Active
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1.5 text-[#605E5C] font-semibold text-xs">
              <Users className="h-3.5 w-3.5 text-[#0078D4]" />
              {employeesCount} Employees Registered
            </div>
            <div className="w-1 h-1 rounded-full bg-[#D2D0CE]" />
            <div className="flex items-center gap-1.5 text-[#605E5C] font-semibold text-xs">
              <Mail className="h-3.5 w-3.5 text-[#0078D4]" />
              {orgDetails?.email || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onAddEmployee}
        className="flex items-center gap-2 px-6 py-2 bg-[#0078D4] text-white rounded-sm font-semibold text-sm hover:bg-[#005A9E] transition-all shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Register Employee
      </button>
    </div>
  );
};

export default OrgHeader;
