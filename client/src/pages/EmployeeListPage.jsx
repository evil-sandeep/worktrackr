import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Briefcase,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import adminService from '../services/adminService';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import EmployeeDetailModal from '../components/Admin/EmployeeDetailModal';
import AddEmployeeModal from '../components/Admin/AddEmployeeModal';
import { useLocation } from 'react-router-dom';

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const { showLoader, addToast } = useUI();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orgId = queryParams.get('orgId');
  const currentUser = authService.getCurrentUser();

  const fetchEmployees = async () => {
    showLoader(true);
    try {
      const params = {};
      if (orgId) params.organizationId = orgId;
      const data = await adminService.getEmployees(params);
      setEmployees(data);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch employees', 'error');
    } finally {
      showLoader(false);
    }
  };

  const fetchOrganizations = async () => {
    if (currentUser.role !== 'superadmin') return;
    try {
      const data = await adminService.getOrganizations();
      setOrganizations(data.filter(u => u.role === 'orgadmin' || u.role === 'admin'));
    } catch (error) {
      console.error('Failed to fetch organizations', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchOrganizations();
  }, [orgId]);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (emp.empId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const roleFilter = filterRole.toLowerCase();
    if (roleFilter === 'all') return matchesSearch;
    return matchesSearch && emp.role?.toLowerCase().trim() === roleFilter;
  });

  const handleToggleAdmin = async (empId, empName, currentRole) => {
    const isCurrentlyAdmin = currentRole === 'admin' || currentRole === 'orgadmin';
    const confirmMsg = isCurrentlyAdmin
      ? `Revoke admin dashboard access from "${empName}"?`
      : `Grant admin dashboard access to "${empName}"?`;
    
    if (!window.confirm(confirmMsg)) return;

    showLoader(true);
    try {
      if (isCurrentlyAdmin) {
        await adminService.revokeAdmin(empId);
      } else {
        await adminService.grantAdmin(empId);
      }
      addToast(`Permissions updated for ${empName}`, 'success');
      fetchEmployees();
    } catch (error) {
      addToast(error.response?.data?.message || 'Permission update failed', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#F3F2F1] min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-[#EDEBE9] pb-4 bg-white -mx-6 -mt-6 px-6 py-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#323130]">Personnel Directory</h1>
          <p className="text-[12px] text-[#605E5C]">Manage identities and access control</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#605E5C]" />
            <input 
              type="text" 
              placeholder="Filter identities..."
              className="pl-9 pr-3 py-1.5 bg-[#F3F2F1] border border-[#8A8886] rounded-sm text-[12px] focus:border-[#0078D4] outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#0078D4] text-white rounded-sm text-[12px] font-semibold hover:bg-[#005A9E] transition-all"
          >
            Provision User
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white border border-[#EDEBE9] rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F8] border-b border-[#EDEBE9]">
                <th className="px-6 py-3 text-[11px] font-bold text-[#605E5C] uppercase tracking-wider">Identity</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#605E5C] uppercase tracking-wider text-center">Role</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#605E5C] uppercase tracking-wider">Credentials</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#605E5C] uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#605E5C] uppercase tracking-wider text-center">Admin Access</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#605E5C] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEBE9]">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr 
                    key={emp._id} 
                    className="hover:bg-[#F3F2F1] transition-colors cursor-pointer group"
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#DEECF9] text-[#0078D4] rounded-sm flex items-center justify-center font-bold text-[11px]">
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#323130] group-hover:text-[#0078D4] transition-colors">{emp.name}</p>
                          <p className="text-[11px] text-[#605E5C]">{emp.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm ${
                        emp.role === 'superadmin' ? 'bg-[#5C2D91]/10 text-[#5C2D91]' :
                        emp.role === 'orgadmin' || emp.role === 'admin' ? 'bg-[#0078D4]/10 text-[#0078D4]' :
                        'bg-[#605E5C]/10 text-[#605E5C]'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[12px] text-[#323130]">{emp.email}</p>
                      <span className={`text-[9px] font-bold uppercase ${emp.isPaid ? 'text-[#107C10]' : 'text-[#D83B01]'}`}>
                        {emp.isPaid ? '• Licensed' : '• Pending License'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-medium text-[#605E5C] uppercase">
                        {emp.organizationName || 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (emp.role !== 'superadmin') {
                              handleToggleAdmin(emp._id, emp.name, emp.role);
                            }
                          }}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                            (emp.role === 'admin' || emp.role === 'orgadmin') ? 'bg-[#0078D4]' : 'bg-[#C8C6C4]'
                          } ${emp.role === 'superadmin' ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                            (emp.role === 'admin' || emp.role === 'orgadmin') ? 'translate-x-4.5' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-[#605E5C] hover:bg-[#EDEBE9] rounded-sm transition-all">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-[#605E5C]">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-[13px]">No identities found matching the current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal 
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={fetchEmployees}
          onDelete={fetchEmployees}
        />
      )}

      {/* Add User Modal */}
      <AddEmployeeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchEmployees}
        organizations={organizations}
      />
    </div>
  );
};

export default EmployeeListPage;
