import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  IdCard, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  ExternalLink,
  Shield,
  Briefcase
} from 'lucide-react';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';
import EmployeeDetailModal from '../components/Admin/EmployeeDetailModal';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [stats, setStats] = useState({ total: 0, admins: 0, staff: 0 });
  const { setLoading, showToast } = useUI();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await adminService.getEmployees();
      setEmployees(data);
      
      // Calculate basic stats
      const adminCount = data.filter(e => e.role === 'admin').length;
      setStats({
        total: data.length,
        admins: adminCount,
        staff: data.length - adminCount
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [setLoading, showToast]);

  const handleUpdateEmployee = (updatedEmp) => {
    setEmployees(prev => prev.map(emp => emp._id === updatedEmp._id ? updatedEmp : emp));
    setSelectedEmployee(null);
    fetchEmployees(); // Refresh stats
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp._id !== id));
    setSelectedEmployee(null);
    fetchEmployees(); // Refresh stats
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRole === 'all') return matchesSearch;
    return matchesSearch && emp.role === filterRole;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Workforce Directory</h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">Manage and monitor your enterprise team</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-blue-200 group">
          <UserPlus className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/30 flex items-center gap-6 group hover:border-blue-200 transition-all">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
               <Users className="h-8 w-8" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Workforce</p>
               <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.total}</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/30 flex items-center gap-6 group hover:border-indigo-200 transition-all">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
               <Shield className="h-8 w-8" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Admins Access</p>
               <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.admins}</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/30 flex items-center gap-6 group hover:border-emerald-200 transition-all">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
               <Users className="h-8 w-8" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Staff</p>
               <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.staff}</p>
            </div>
         </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by Employee Name or ID..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
             </div>
             <select 
              className="w-full pl-11 pr-8 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-black text-[10px] uppercase tracking-widest appearance-none text-slate-600"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
             >
               <option value="all">All Roles</option>
               <option value="employee">Employees Only</option>
               <option value="admin">Admins Only</option>
             </select>
          </div>
          
          <button className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-100 border border-transparent hover:border-slate-200">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Employee Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp) => (
            <div 
              key={emp._id} 
              onClick={() => setSelectedEmployee(emp)}
              className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
               {/* Card Header/Profile */}
               <div className="p-8 pb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400 shadow-inner group-hover:scale-105 transition-transform overflow-hidden ring-4 ring-white ring-offset-1 ring-offset-slate-50">
                        {emp.profileImg ? (
                          <img src={emp.profileImg} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          emp.name.charAt(0)
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-black text-lg text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors uppercase">{emp.name}</h3>
                      <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                        <Briefcase className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.designation || 'Specialist'}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
               </div>

               {/* Card Stats/Details */}
               <div className="px-8 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1 text-blue-500 opacity-60">
                        <IdCard className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Employee ID</span>
                      </div>
                      <p className="font-black text-slate-900 text-sm tracking-tight">{emp.empId}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1 text-blue-500 opacity-60">
                        <Shield className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Access Level</span>
                      </div>
                      <p className="font-black text-slate-900 text-sm tracking-tight capitalize">{emp.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pb-8">
                     <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group/item">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm group-hover/item:border-blue-100 transition-all">
                           <Mail className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-blue-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 group-hover/item:text-slate-900 truncate">{emp.email}</span>
                     </div>
                     <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group/item">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm group-hover/item:border-blue-100 transition-all">
                           <Phone className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-blue-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 group-hover/item:text-slate-900">{emp.phone}</span>
                     </div>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100">
               <Users className="h-12 w-12 text-slate-300" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Employees Found</h3>
               <p className="text-slate-400 font-medium max-w-[280px]">We couldn't find any team members matching your current search or filters.</p>
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setFilterRole('all'); }}
              className="text-blue-600 font-black text-[10px] uppercase tracking-widest py-2 px-4 hover:bg-blue-50 rounded-lg transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal 
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={handleUpdateEmployee}
          onDelete={handleDeleteEmployee}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
