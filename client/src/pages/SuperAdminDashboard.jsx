import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Activity,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';
import axios from 'axios';

const SuperAdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showLoader, addToast } = useUI();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    password: '',
    isOrgAdmin: false
  });

  const fetchEmployees = async () => {
    showLoader(true);
    try {
      const data = await adminService.getEmployees();
      setEmployees(data);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    showLoader(true);
    try {
      // Use axios directly with auth header, since adminService might not have createEmployee
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/admin/employees', formData, config);
      addToast('User created successfully', 'success');
      setShowAddModal(false);
      setFormData({
        name: '', email: '', phone: '', empId: '', password: '', isOrgAdmin: false
      });
      fetchEmployees();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      showLoader(false);
    }
  };

  const orgAdminsCount = employees.filter(e => e.role === 'orgadmin').length;
  const regularEmployeesCount = employees.filter(e => e.role === 'employee').length;

  return (
    <div className="h-full overflow-y-auto space-y-10 animate-in fade-in duration-700 custom-scrollbar pr-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1 font-poppins">Super Admin Console</h2>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter font-poppins">
            Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Control</span>
          </h1>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wide opacity-60">Global organization management</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Organization / User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-start mb-4">
             <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center">
               <Building2 className="h-5 w-5 text-indigo-600" />
             </div>
          </div>
          <h3 className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] font-poppins">Organizations</h3>
          <p className="text-3xl font-black text-slate-900 tracking-tighter font-poppins">{orgAdminsCount}</p>
        </div>

        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-start mb-4">
             <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
               <Users className="h-5 w-5 text-blue-600" />
             </div>
          </div>
          <h3 className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] font-poppins">Global Workforce</h3>
          <p className="text-3xl font-black text-slate-900 tracking-tighter font-poppins">{regularEmployeesCount}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[1.5rem] p-6 text-white shadow-xl shadow-indigo-500/20">
            <ShieldCheck className="h-8 w-8 text-indigo-200 mb-4" />
            <h3 className="font-bold text-indigo-100 text-[9px] uppercase tracking-widest mb-2 font-poppins">Platform Status</h3>
            <p className="text-lg font-black leading-tight mb-2 font-poppins">All Systems Secure</p>
            <p className="text-[10px] font-medium text-indigo-200 opacity-80">Data isolation protocol active</p>
        </div>
      </div>

      {/* Global Directory */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-5">
         <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3 font-poppins mb-6">
            <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
            Global User Directory
         </h3>
         <div className="divide-y divide-slate-100">
           {employees.map(emp => (
             <div key={emp._id} className="py-3 flex justify-between items-center hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                     {emp.name.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                      <p className="text-[10px] font-bold text-slate-500">{emp.email}</p>
                   </div>
                </div>
                <div className="text-right">
                   <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${emp.role === 'orgadmin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                     {emp.role}
                   </span>
                </div>
             </div>
           ))}
         </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-xl font-black text-slate-900 mb-6">Register New Identity</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500">Full Name / Organization Name</label>
                  <input required type="text" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500">Email Address</label>
                  <input required type="email" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500">Phone</label>
                  <input required type="text" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500">ID / Org Code</label>
                  <input required type="text" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" value={formData.empId} onChange={e => setFormData({...formData, empId: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500">Password</label>
                  <input required type="password" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
               </div>
               <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg mt-4">
                  <input type="checkbox" id="isOrgAdmin" className="w-4 h-4 text-indigo-600 rounded" checked={formData.isOrgAdmin} onChange={e => setFormData({...formData, isOrgAdmin: e.target.checked})} />
                  <label htmlFor="isOrgAdmin" className="text-xs font-bold text-indigo-900 cursor-pointer">Register as Organization Admin (Tenant)</label>
               </div>
               <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs uppercase hover:bg-slate-200">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-indigo-700">Create Entity</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
