import React from 'react';
import { Users, ShieldCheck, CreditCard, ExternalLink } from 'lucide-react';

const OrgFleetTable = ({ employees, onPay }) => {
  return (
    <div className="bg-white border border-[#EDEBE9] shadow-sm mb-6">
      <div className="px-6 py-3 border-b border-[#EDEBE9] bg-[#FAF9F8] flex justify-between items-center">
        <h3 className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-[#0078D4]" />
          Managed Fleet Instances
        </h3>
        <span className="text-[10px] font-bold bg-[#DEECF9] text-[#0078D4] px-2 py-0.5 rounded-sm uppercase tracking-wider border border-[#0078D4]/10">
          {employees.length} Nodes
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF9F8] border-b border-[#EDEBE9] text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">
              <th className="py-3 px-6">Identity Node</th>
              <th className="py-3 px-6 text-center">Lifecycle</th>
              <th className="py-3 px-6 text-center">Authorization</th>
              <th className="py-3 px-6 text-right">Provisioning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEBE9]">
            {employees.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-[#605E5C] italic text-sm font-semibold">
                  No active instances found in this fleet.
                </td>
              </tr>
            ) : (
              employees.map(emp => (
                <tr key={emp._id} className="hover:bg-[#F3F2F1] transition-colors group">
                  <td className="py-3 px-6 border-l-2 border-transparent group-hover:border-[#0078D4]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#FAF9F8] text-[#605E5C] rounded-sm flex items-center justify-center text-[10px] font-bold border border-[#EDEBE9]">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[13px] text-[#323130]">{emp.name}</span>
                        <span className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-tight">{emp.empId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-semibold uppercase tracking-wider border ${
                      emp.status === 'active' ? 'bg-[#DFF6DD] text-[#107C10] border-[#107C10]/10' : 'bg-[#F3F2F1] text-[#605E5C] border-[#EDEBE9]'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {emp.isPaid ? (
                      <div className="flex items-center justify-center gap-1.5 text-[#107C10]">
                        <ShieldCheck className="h-3 w-3" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Licensed</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-[#D83B01]">
                        <CreditCard className="h-3 w-3" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider italic">Pending</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-6 text-right">
                    {!emp.isPaid ? (
                      <button 
                        onClick={() => onPay(emp)}
                        className="px-4 py-1.5 bg-[#0078D4] text-white rounded-sm font-semibold text-[10px] uppercase tracking-wider hover:bg-[#005A9E] shadow-sm transition-all flex items-center gap-2 ml-auto"
                      >
                        Authorize
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    ) : (
                      <div className="px-4 py-1.5 bg-[#F3F2F1] text-[#A19F9D] rounded-sm font-semibold text-[10px] uppercase tracking-wider border border-[#EDEBE9] ml-auto w-fit">
                        Provisioned
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrgFleetTable;
