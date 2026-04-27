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

  return (
    <div className="h-full overflow-y-auto space-y-8 animate-in fade-in duration-700 custom-scrollbar pr-4">
      {/* Clean Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter font-poppins">Employees</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] opacity-60">Directory Management & Control</p>
        </div>
        <button 
          onClick={fetchEmployees}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          Refresh List
        </button>
      </div>

      {/* Directory Filter Panel */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full pl-11 pr-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="w-full lg:w-40 pl-5 pr-9 py-3 bg-slate-50 border-none rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="employee">Staff</option>
          <option value="orgadmin">Org Admin</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Add Employee Button Section */}
      <div className="flex justify-start px-2">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group flex items-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
            <Users className="h-3 w-3" />
          </div>
          Add Employee
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
          <div className="col-span-2 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider text-center">ROLE</div>
          <div className="col-span-3 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider">EMAIL / ID</div>
          <div className="col-span-2 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider text-center">ORG STATS</div>
          <div className="col-span-2 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider text-right">REVENUE</div>
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
                <div className="col-span-2 flex justify-center">
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
                <div className="col-span-3">
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
