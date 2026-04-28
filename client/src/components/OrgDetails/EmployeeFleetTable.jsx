import React from 'react';
import { Search, Users, ShieldCheck, CreditCard, MoreVertical } from 'lucide-react';

const EmployeeFleetTable = ({ employees, searchTerm, onSearchChange, onSelectEmployee, onPay }) => {
  return (
    <div className="col-span-12 lg:col-span-9 space-y-4">
      <div className="bg-white border border-[#EDEBE9] shadow-sm">
        {/* Search & Filter Bar */}
        <div className="px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#605E5C]" />
            <input 
              type="text" 
              placeholder="Search resource fleet (Name, ID)..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#8A8886] rounded-sm text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Filtered: {employees.length}</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#FAF9F8] border-b border-[#EDEBE9]">
          <div className="col-span-4 text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Identity Pool</div>
          <div className="col-span-2 text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider text-center">Status</div>
          <div className="col-span-3 text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Operational Role</div>
          <div className="col-span-3 text-right text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#EDEBE9]">
          {employees.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-[#F3F2F1] rounded-sm flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-[#A19F9D]" />
              </div>
              <p className="text-[#605E5C] text-sm font-semibold italic">No fleet members identified.</p>
            </div>
          ) : (
            employees.map((emp, index) => (
              <div 
                key={emp?._id || index} 
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#F3F2F1] transition-all duration-200 group border-l-2 border-transparent hover:border-[#0078D4]"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div 
                    onClick={() => onSelectEmployee(emp)}
                    className="w-9 h-9 bg-[#DEECF9] rounded-sm flex items-center justify-center text-xs font-bold text-[#0078D4] border border-[#0078D4]/10 cursor-pointer"
                  >
                    {emp?.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <h4 
                      onClick={() => onSelectEmployee(emp)}
                      className="font-bold text-[13px] text-[#323130] truncate cursor-pointer hover:text-[#0078D4] transition-colors"
                    >
                      {emp?.name || 'Unnamed Employee'}
                    </h4>
                    <span className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">
                      {emp?.empId || 'TEMP-ID'}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 flex justify-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider border ${
                    emp.isPaid ? 'bg-[#DFF6DD] text-[#107C10] border-[#107C10]/10' : 'bg-[#FFF4CE] text-[#797673] border-[#797673]/10'
                  }`}>
                    {emp.isPaid ? 'Licensed' : 'Pending'}
                  </span>
                </div>

                <div className="col-span-3">
                  <p className="text-[12px] font-semibold text-[#605E5C]">
                    {emp?.designation || 'Staff Member'}
                  </p>
                </div>

                <div className="col-span-3 flex justify-end items-center gap-2">
                  {!emp.isPaid ? (
                    <button 
                      onClick={() => onPay(emp)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#0078D4] text-white rounded-sm font-semibold text-[11px] uppercase tracking-wider hover:bg-[#005A9E] transition-all shadow-sm"
                    >
                      <CreditCard className="h-3 w-3" />
                      Pay ₹2k
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#107C10] font-bold text-[10px] uppercase tracking-wider bg-[#DFF6DD] px-3 py-1.5 rounded-sm border border-[#107C10]/10">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                  <button 
                    onClick={() => onSelectEmployee(emp)}
                    className="p-1.5 text-[#605E5C] hover:text-[#323130] hover:bg-[#EDEBE9] rounded-sm transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeFleetTable;
