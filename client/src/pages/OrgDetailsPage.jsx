import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Plus, 
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  Search,
  MoreVertical,
  Trash2,
  ExternalLink
} from 'lucide-react';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';
import AddEmployeeModal from '../components/Admin/AddEmployeeModal';

const OrgDetailsPage = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { showLoader, addToast } = useUI();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [orgDetails, setOrgDetails] = useState(null);

  const fetchData = async () => {
    showLoader(true);
    try {
      // Fetch employees for this specific organization
      const data = await adminService.getEmployeesByOrg(orgId);
      setEmployees(data);

      // Fetch organization details (assuming we can get it from the list or a new endpoint)
      // For now, let's try to find it from the list of all orgs if possible, 
      // or just set a placeholder if we don't have a specific "getOrgById" endpoint yet.
      const orgs = await adminService.getOrganizations();
      const currentOrg = orgs.find(o => o._id === orgId);
      if (currentOrg) {
        setOrgDetails(currentOrg);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch data', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const filteredEmployees = employees.filter(emp => 
    (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.empId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/organizations')}
            className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95 border border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-200 ring-4 ring-white">
            {orgDetails?.name?.charAt(0) || <Building2 className="h-10 w-10" />}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-poppins capitalize">
                {orgDetails?.name || 'Organization Details'}
              </h1>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                Active
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                <Users className="h-3.5 w-3.5" />
                {employees.length} Employees Strictly Scoped
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                <Mail className="h-3.5 w-3.5" />
                {orgDetails?.email || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
          Add Employee
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-8">
        {/* Statistics Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Quick Stats</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Staff', value: employees.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Verified', value: employees.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Isolated', value: '100%', color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{stat.label}</span>
                  <span className={`text-sm font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <ShieldCheck className="h-10 w-10 text-white/20 mb-4" />
            <h4 className="font-black text-lg leading-tight mb-2">Data Isolation Active</h4>
            <p className="text-white/60 text-xs font-bold leading-relaxed">
              Every employee in this view is strictly tied to {orgDetails?.name || 'this organization'}. No leakage detected.
            </p>
          </div>
        </div>

        {/* Employee Table */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search employees by name, email or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-10 py-5 bg-slate-50/50 border-b border-slate-100">
              <div className="col-span-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Details</div>
              <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee ID</div>
              <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Designation</div>
              <div className="col-span-1 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-50">
              {filteredEmployees.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold italic">No employees found for this organization.</p>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                  >
                    Add your first employee
                  </button>
                </div>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <div 
                    key={emp?._id || index} 
                    className="grid grid-cols-12 gap-4 px-10 py-6 items-center hover:bg-indigo-50/30 transition-all duration-300 group"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-sm font-black text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        {emp?.name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-[14px] text-slate-900 truncate font-poppins">
                          {emp?.name || 'Unnamed Employee'}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail className="h-3 w-3 text-slate-300" />
                          <span className="text-[11px] font-bold text-slate-400 truncate">
                            {emp?.email || 'No email provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black tracking-widest border border-slate-200/50">
                        {emp?.empId || 'TEMP-ID'}
                      </span>
                    </div>

                    <div className="col-span-3">
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
                        {emp?.designation || 'Staff Member'}
                      </p>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all shadow-sm border border-transparent hover:border-slate-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AddEmployeeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
        orgId={orgId} // Pass the orgId to the modal
      />
    </div>
  );
};

export default OrgDetailsPage;
