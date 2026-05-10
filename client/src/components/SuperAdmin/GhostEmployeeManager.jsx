import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Search, Building, User } from 'lucide-react';
import adminService from '../../services/adminService';
import { useUI } from '../../context/UIContext';

const GhostEmployeeManager = ({ organizations, onAssignmentSuccess }) => {
  const [ghostEmployees, setGhostEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [targetOrgId, setTargetOrgId] = useState('');
  const { showLoader, addToast } = useUI();

  const fetchGhostEmployees = async () => {
    try {
      const data = await adminService.getUnassignedEmployees();
      setGhostEmployees(data);
    } catch (error) {
      console.error('Failed to fetch ghost employees', error);
    }
  };

  useEffect(() => {
    fetchGhostEmployees();
  }, []);

  const handleAssign = async () => {
    if (!selectedEmployee || !targetOrgId) {
      addToast('Please select both an employee and an organization', 'warning');
      return;
    }

    showLoader(true);
    try {
      await adminService.assignEmployeeToOrg({
        employeeId: selectedEmployee._id,
        targetAdminId: targetOrgId
      });
      addToast('Employee assigned successfully', 'success');
      setSelectedEmployee(null);
      setTargetOrgId('');
      fetchGhostEmployees();
      if (onAssignmentSuccess) onAssignmentSuccess();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to assign employee', 'error');
    } finally {
      showLoader(false);
    }
  };

  // Filter out superadmins from organizations list for assignment
  const assignmentOrgs = organizations.filter(org => org.role === 'orgadmin' || org.role === 'admin');

  return (
    <div className="bg-white border border-[#EDEBE9] shadow-sm overflow-hidden">
      <div className="bg-[#FAF9F8] p-4 border-b border-[#EDEBE9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-[#0078D4]" />
          <h3 className="text-sm font-bold text-[#323130] uppercase tracking-wider">Unassigned Ghost Identities</h3>
        </div>
        <span className="bg-[#0078D4] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {ghostEmployees.length} Pending
        </span>
      </div>

      <div className="p-6">
        {ghostEmployees.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-[#F3F2F1] rounded-full flex items-center justify-center mx-auto mb-3">
              <UserCheck className="h-6 w-6 text-[#A19F9D]" />
            </div>
            <p className="text-sm text-[#605E5C]">No unassigned employees found. All identities are accounted for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Employee List */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider block">1. Select Ghost Employee</label>
              <div className="max-h-[300px] overflow-y-auto border border-[#EDEBE9] rounded-sm divide-y divide-[#EDEBE9]">
                {ghostEmployees.map((emp) => (
                  <div 
                    key={emp._id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${selectedEmployee?._id === emp._id ? 'bg-[#F3F9FF] border-l-4 border-l-[#0078D4]' : 'hover:bg-[#FAF9F8]'}`}
                  >
                    <div className="w-8 h-8 bg-[#EDEBE9] rounded-full flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-[#605E5C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#323130] truncate">{emp.name}</p>
                      <p className="text-[11px] text-[#605E5C] truncate">{emp.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Controls */}
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider block mb-2">2. Assign to Organization</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-[#A19F9D]" />
                  <select
                    value={targetOrgId}
                    onChange={(e) => setTargetOrgId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#8A8886] rounded-sm text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none transition-all appearance-none"
                  >
                    <option value="">Choose target fleet...</option>
                    {assignmentOrgs.map((org) => (
                      <option key={org._id} value={org._id}>
                        {org.name} ({org.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#FAF9F8] p-4 border border-[#EDEBE9] rounded-sm">
                <h4 className="text-[11px] font-bold text-[#323130] uppercase mb-3 flex items-center gap-2">
                  <Search className="h-3 w-3" /> Assignment Preview
                </h4>
                {selectedEmployee && targetOrgId ? (
                  <div className="text-[13px] text-[#323130] space-y-2">
                    <p>Moving <span className="font-bold">{selectedEmployee.name}</span></p>
                    <p>Into <span className="font-bold">{assignmentOrgs.find(o => o._id === targetOrgId)?.name}</span></p>
                    <p className="text-[11px] text-[#0078D4] italic mt-2">※ Identity will be migrated to the target tenant database.</p>
                  </div>
                ) : (
                  <p className="text-xs text-[#A19F9D] italic">Select an employee and organization to preview the operation.</p>
                )}
              </div>

              <button
                disabled={!selectedEmployee || !targetOrgId}
                onClick={handleAssign}
                className="w-full py-2.5 bg-[#0078D4] text-white font-bold text-sm rounded-sm shadow-sm hover:bg-[#005A9E] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Execute Identity Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GhostEmployeeManager;
