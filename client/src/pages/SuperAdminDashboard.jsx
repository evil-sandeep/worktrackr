import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Activity,
  Plus,
  IndianRupee,
  ShieldAlert,
  ShieldOff
} from 'lucide-react';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';
import axios from 'axios';
import OrganizationDetailModal from '../components/Admin/OrganizationDetailModal';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalEmployees: 0,
    paidEmployees: 0,
    unpaidEmployees: 0,
    totalRevenue: 0
  });
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showLoader, addToast } = useUI();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    password: '',
    isOrgAdmin: true // Default to true since they mostly add orgs here
  });

  const fetchData = async () => {
    showLoader(true);
    try {
      const [statsData, orgsData] = await Promise.all([
        adminService.getSuperAdminStats(),
        adminService.getOrganizations()
      ]);
      setStats(statsData);
      setOrganizations(orgsData);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch dashboard data', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrantAdmin = async (orgId, orgName, currentRole) => {
    const isCurrentlyAdmin = currentRole === 'admin';
    const action = isCurrentlyAdmin ? 'revoke-admin' : 'grant-admin';
    const confirmMsg = isCurrentlyAdmin
      ? `Revoke admin dashboard access from "${orgName}"?`
      : `Grant admin dashboard access to "${orgName}"?`;
    if (!window.confirm(confirmMsg)) return;

    showLoader(true);
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(
        `http://localhost:5000/api/admin/super/organizations/${orgId}/${action}`,
        {},
        config
      );
      addToast(data.message, 'success');
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Permission update failed', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    showLoader(true);
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/admin/employees', formData, config);
      addToast('User created successfully', 'success');
      setShowAddModal(false);
      setFormData({
        name: '', email: '', phone: '', empId: '', password: '', isOrgAdmin: true
      });
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto space-y-10 animate-in fade-in duration-700 custom-scrollbar pr-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1 font-poppins">Dashboard</h2>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter font-poppins">
            Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Control</span>
          </h1>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wide opacity-60">Global organization & revenue management</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Organization / User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
             <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center">
               <Building2 className="h-5 w-5 text-indigo-600" />
             </div>
          </div>
          <h3 className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] font-poppins">Total Organizations</h3>
          <p className="text-3xl font-black text-slate-900 tracking-tighter font-poppins">{stats.totalOrganizations}</p>
        </div>

        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
             <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
               <Users className="h-5 w-5 text-blue-600" />
             </div>
          </div>
          <h3 className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] font-poppins">Global Workforce</h3>
          <p className="text-3xl font-black text-slate-900 tracking-tighter font-poppins">{stats.totalEmployees}</p>
        </div>

        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
             <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
               <ShieldCheck className="h-5 w-5 text-green-600" />
             </div>
             <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">
               {stats.unpaidEmployees} Unpaid
             </span>
          </div>
          <h3 className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] font-poppins">Paid Employees</h3>
          <p className="text-3xl font-black text-slate-900 tracking-tighter font-poppins">{stats.paidEmployees}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[1.5rem] p-5 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-indigo-100 text-[9px] uppercase tracking-widest mb-1 font-poppins">Total Revenue</h3>
            <p className="text-3xl font-black leading-tight font-poppins">₹{stats.totalRevenue}</p>
        </div>
      </div>

      {/* Platform Identities Table */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-5 overflow-hidden">
         <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3 font-poppins mb-6">
            <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
            Platform Identities (Employees & Admins)
         </h3>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <th className="py-3 px-4">Name</th>
                 <th className="py-3 px-4">Role</th>
                 <th className="py-3 px-4">Email / ID</th>
                 <th className="py-3 px-4 text-center">Org Stats</th>
                 <th className="py-3 px-4 text-right">Revenue</th>
                 <th className="py-3 px-4 text-center">Admin Access</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {organizations.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="py-8 text-center text-slate-400 font-bold italic text-sm">
                     No users registered yet.
                   </td>
                 </tr>
               ) : (
                 organizations.map(user => (
                   <tr 
                     key={user._id} 
                     onClick={() => setSelectedOrg(user)}
                     className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                   >
                     <td className="py-4 px-4">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                           {user.name.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                           <span className="font-bold text-sm text-slate-900">{user.name}</span>
                           <span className="text-[10px] text-slate-400 font-medium">{user.empId}</span>
                         </div>
                       </div>
                     </td>
                     <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          user.role === 'admin' ? 'bg-green-100 text-green-700' :
                          user.role === 'orgadmin' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'admin' && <ShieldCheck className="h-3 w-3" />}
                          {user.role === 'orgadmin' && <ShieldAlert className="h-3 w-3" />}
                          {user.role === 'employee' && <Users className="h-3 w-3" />}
                          {user.role}
                        </span>
                     </td>
                     <td className="py-4 px-4 text-xs font-bold text-slate-500">{user.email}</td>
                     <td className="py-4 px-4 text-center">
                        {user.role === 'admin' || user.role === 'orgadmin' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-900">{user.stats?.totalStaff || 0} Staff</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">{user.stats?.paidStaff || 0} Paid</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Employee</span>
                        )}
                     </td>
                     <td className="py-4 px-4 text-right text-sm font-black text-slate-900 font-poppins">
                       ₹{user.stats?.revenue || 0}
                     </td>
                     <td className="py-4 px-4 text-center" onClick={e => e.stopPropagation()}>
                       <div className="flex items-center justify-center gap-3">
                         <label className="relative inline-flex items-center cursor-pointer group/toggle">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={user.role === 'orgadmin' || user.role === 'admin'}
                              onChange={() => handleGrantAdmin(user._id, user.name, user.role)}
                            />
                            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover/toggle:text-indigo-600 transition-colors">
                              {user.role === 'orgadmin' || user.role === 'admin' ? 'Org Admin' : 'Make Org Admin'}
                            </span>
                         </label>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
      </div>

      {/* Detail Modal */}
      {selectedOrg && (
        <OrganizationDetailModal 
          organization={selectedOrg} 
          onClose={() => setSelectedOrg(null)} 
          onUpdate={fetchData}
        />
      )}

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
