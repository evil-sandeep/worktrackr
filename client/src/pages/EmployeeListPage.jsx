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
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const { showLoader, addToast } = useUI();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orgId = queryParams.get('orgId');
  const currentUser = authService.getCurrentUser();

  // 70 min threshold for OFFLINE check
  const getStatus = (emp) => {
    if (!emp || !emp.lastSeen) return { label: 'OFFLINE', color: 'bg-slate-400', font: 'text-slate-400' };
    
    const lastSeen = new Date(emp.lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeen) / 60000);

    if (diffInMinutes > 70) {
      return { label: 'OFFLINE', color: 'bg-slate-400', font: 'text-slate-400' };
    }

    if (emp.trackingStatus === 'GPS OFF') {
      return { label: 'GPS OFF', color: 'bg-amber-500', font: 'text-amber-500' };
    }

    return { label: 'ONLINE', color: 'bg-green-500', font: 'text-green-500' };
  };

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedEmployees = employees
    .filter(emp => {
      const matchesSearch = 
        (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (emp.empId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const roleFilter = filterRole.toLowerCase();
      if (roleFilter === 'all') return matchesSearch;
      return matchesSearch && emp.role?.toLowerCase().trim() === roleFilter;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const SortHeader = ({ field, children }) => (
    <button 
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-colors group ${
        sortField === field ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {children}
      <ArrowUpDown className={`h-3 w-3 transition-all ${
        sortField === field ? 'text-blue-500 opacity-100' : 'opacity-0 group-hover:opacity-50'
      } ${sortField === field && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
    </button>
  );

  const handleToggleAdmin = async (empId, empName, currentRole) => {
    const isCurrentlyAdmin = currentRole === 'admin' || currentRole === 'orgadmin';
    const confirmMsg = isCurrentlyAdmin
      ? `Revoke admin dashboard access from "${empName}"?`
      : `Grant admin dashboard access to "${empName}"? (This will allow them to manage their own organization)`;
    
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
    <div className="h-full overflow-y-auto space-y-8 animate-in fade-in duration-700 custom-scrollbar pr-4">
      {/* Clean Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-[#323130] tracking-tighter font-poppins">Employees</h1>
          <p className="text-[#605e5c] font-bold uppercase tracking-widest text-[9px] opacity-60">Directory Management & Control</p>
        </div>
        <button 
          onClick={fetchEmployees}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#edebe9] text-[#323130] rounded-sm font-semibold text-[11px] uppercase tracking-widest hover:bg-[#f3f2f1] transition-all shadow-sm active:scale-95"
        >
          Refresh List
        </button>
      </div>

      {/* Platform Identities Header */}
      <div className="flex items-center gap-3 border-l-4 border-[#0078d4] pl-4 py-1">
        <h1 className="text-xl font-bold text-[#323130] tracking-tight font-poppins">
          Platform Identities (Employees & Admins)
        </h1>
      </div>

      {/* Identity Table */}
      <div className="bg-white rounded-sm border border-[#edebe9] shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-[#faf9f8] border-b border-[#edebe9]">
          <div className="col-span-3 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider">NAME</div>
          <div className="col-span-1 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider text-center">ROLE</div>
          <div className="col-span-2 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider">EMAIL / ID</div>
          <div className="col-span-2 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider text-center">ORG STATS</div>
          <div className="col-span-2 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider text-right">REVENUE</div>
          <div className="col-span-2 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider text-right">ADMIN ACCESS</div>
        </div>

        <div className="divide-y divide-[#edebe9]">
          {filteredAndSortedEmployees.length > 0 ? (
            filteredAndSortedEmployees.map((emp, index) => (
              <div 
                key={emp._id || index} 
                className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-[#f3f2f1]/50 transition-all cursor-pointer group"
                onClick={() => setSelectedEmployee(emp)}
              >
                {/* NAME COLUMN */}
                <div className="col-span-3 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#eff6fc] text-[#0078d4] rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-[#deecf9]">
                    {emp.profileImg ? (
                      <img src={emp.profileImg} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      emp.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px] text-[#323130] truncate group-hover:text-[#0078d4] transition-colors">
                      {emp.name}
                    </p>
                    <p className="text-[11px] font-medium text-[#605e5c] truncate uppercase tracking-tight">
                      {emp.empId || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* ROLE COLUMN */}
                <div className="col-span-1 flex justify-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    emp.role === 'superadmin' ? 'bg-[#f4f4fc] text-[#5c2d91] border-[#d8d8f7]' :
                    emp.role === 'orgadmin' ? 'bg-[#fff4ce] text-[#8a662e] border-[#fde7a6]' :
                    'bg-[#eff6fc] text-[#0078d4] border-[#deecf9]'
                  }`}>
                    {emp.role === 'superadmin' ? 'SuperAdmin' : 
                     emp.role === 'orgadmin' || emp.role === 'admin' ? 'Admin' : 'Employee'}
                  </span>
                </div>

                {/* EMAIL / ID COLUMN */}
                <div className="col-span-2">
                  <p className="text-[13px] font-medium text-[#323130] truncate">{emp.email}</p>
                </div>

                {/* ORG STATS COLUMN */}
                <div className="col-span-2 flex justify-center">
                  <span className="text-[11px] font-semibold text-[#a19f9d] uppercase tracking-wider">
                    {emp.organizationName || 'EMPLOYEE'}
                  </span>
                </div>

                {/* REVENUE COLUMN */}
                <div className="col-span-2 text-right">
                  <span className="text-[15px] font-black text-[#323130]">
                    ₹0
                  </span>
                </div>

                {/* ADMIN ACCESS COLUMN */}
                <div className="col-span-2 flex justify-end items-center gap-3">
                   <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (emp.role !== 'superadmin') {
                        handleToggleAdmin(emp._id, emp.name, emp.role);
                      }
                    }}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                      (emp.role === 'admin' || emp.role === 'orgadmin') ? 'bg-[#0078d4]' : 'bg-[#c8c6c4]'
                    } ${emp.role === 'superadmin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                        (emp.role === 'admin' || emp.role === 'orgadmin') ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                   </div>
                   <span className="text-[9px] font-bold text-[#605e5c] uppercase tracking-tight whitespace-nowrap">
                      MAKE ORG ADMIN
                   </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
               <Users className="h-12 w-12 text-[#edebe9] mx-auto mb-4" />
               <p className="text-[#605e5c] font-medium">No identities found in the global directory.</p>
            </div>
          )}
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

      {/* Add Employee Modal */}
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
