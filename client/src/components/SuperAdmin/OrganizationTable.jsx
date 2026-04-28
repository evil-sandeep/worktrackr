import React from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';

const OrganizationTable = ({ organizations, onSelect, onDelete }) => {
  return (
    <div className="bg-white border border-[#EDEBE9] shadow-sm">
      <div className="px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8]">
        <h3 className="text-sm font-semibold text-[#323130] flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#0078D4]" />
          Resource Management (Identity Pool)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF9F8] border-b border-[#EDEBE9] text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Role</th>
              <th className="py-3 px-6">Email Address</th>
              <th className="py-3 px-6">Staff Metrics</th>
              <th className="py-3 px-6 text-right">Revenue Cont.</th>
              <th className="py-3 px-6 text-right">Operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEBE9]">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-[#605E5C] italic text-sm">
                  No resources found.
                </td>
              </tr>
            ) : (
              organizations.map(user => (
                <tr 
                  key={user._id} 
                  onClick={() => onSelect(user)}
                  className="hover:bg-[#F3F2F1] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#DEECF9] flex items-center justify-center text-xs font-bold text-[#0078D4]">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[13px] text-[#323130] hover:text-[#0078D4] transition-colors">{user.name}</span>
                        <span className="text-[10px] text-[#605E5C]">{user.empId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-[#DFF6DD] text-[#107C10]' :
                      user.role === 'orgadmin' ? 'bg-[#FFF4CE] text-[#797673]' :
                      'bg-[#DEECF9] text-[#0078D4]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-[13px] text-[#605E5C]">{user.email}</td>
                  <td className="py-3 px-6">
                    {user.role === 'admin' || user.role === 'orgadmin' ? (
                      <div className="flex flex-col">
                        <span className="text-[12px] font-semibold text-[#323130]">{user.stats?.totalStaff || 0} Instances</span>
                        <span className="text-[10px] text-[#605E5C]">{user.stats?.paidStaff || 0} Paid</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#A19F9D] uppercase font-bold">Standard User</span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-right text-[13px] font-semibold text-[#323130]">
                    ₹{user.stats?.revenue || 0}
                  </td>
                  <td className="py-3 px-6 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end">
                      {user.role !== 'superadmin' && (
                        <button 
                          onClick={() => onDelete(user._id, user.name)}
                          className="p-1.5 text-[#605E5C] hover:text-[#E81123] hover:bg-red-50 rounded-sm transition-colors flex items-center gap-2 group"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-[#EDEBE9] bg-[#FAF9F8] text-[11px] text-[#605E5C] font-semibold flex justify-between">
        <span>Showing {organizations.length} organizations</span>
        <span>Region: Global (Platform)</span>
      </div>
    </div>
  );
};

export default OrganizationTable;
