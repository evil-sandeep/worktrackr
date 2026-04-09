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
import { useUI } from '../context/UIContext';
import EmployeeDetailModal from '../components/Admin/EmployeeDetailModal';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const { showLoader, addToast } = useUI();

  const fetchEmployees = async () => {
    showLoader(true);
    try {
      const data = await adminService.getEmployees();
      setEmployees(data);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch employees', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Clean Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Employees</h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">Directory Management & Control</p>
        </div>
        <button 
          onClick={fetchEmployees}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          Refresh List
        </button>
      </div>

      {/* Directory Filter Panel */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="w-full lg:w-48 pl-6 pr-10 py-4 bg-slate-50 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="employee">Staff</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Employee List Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-10 py-6 bg-slate-50/80 border-b border-slate-100">
          <div className="col-span-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</div>
          <div className="col-span-4"><SortHeader field="name">Team Member</SortHeader></div>
          <div className="col-span-3"><SortHeader field="empId">Employee ID</SortHeader></div>
          <div className="col-span-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredAndSortedEmployees.length > 0 ? (
            filteredAndSortedEmployees.map((emp, index) => (
              <div 
                key={emp._id} 
                className="grid grid-cols-12 gap-4 px-10 py-6 items-center hover:bg-blue-50/30 transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedEmployee(emp)}
              >
                <div className="col-span-1 text-xs font-bold text-slate-300 group-hover:text-blue-400">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="col-span-4 flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-400 overflow-hidden ring-2 ring-white shadow-sm group-hover:ring-blue-100 transition-all">
                    {emp.profileImg ? (
                      <img src={emp.profileImg} className="w-full h-full object-cover" />
                    ) : (
                      emp.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                      {emp.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">
                      {emp.designation || 'Staff'}
                    </p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 border border-slate-200/50 rounded-xl text-[10px] font-black text-slate-600 tracking-widest group-hover:bg-blue-50 group-hover:text-blue-700 transition-all">
                    {emp.empId}
                  </span>
                </div>
                <div className="col-span-4 flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    <Eye className="h-4 w-4" />
                    <span>View Detail</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
               <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold italic">No records found matching your query.</p>
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
    </div>
  );
};

export default AdminDashboard;
