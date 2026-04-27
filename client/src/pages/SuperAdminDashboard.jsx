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
    isOrgAdmin: true
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
    <div className="h-full overflow-y-auto bg-[#F3F2F1] animate-in fade-in duration-300">
      {/* Azure Style Breadcrumb/Header */}
      <div className="bg-white border-b border-[#EDEBE9] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#0078D4] hover:underline cursor-pointer font-medium">Home</span>
          <span className="text-[#605E5C]">/</span>
          <span className="text-[#323130] font-semibold">Super Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-sm text-sm text-[#323130] transition-colors border border-transparent hover:border-[#EDEBE9]"
          >
            <Activity className="h-4 w-4 text-[#0078D4]" />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#0078D4] text-white rounded-sm text-sm font-semibold hover:bg-[#005A9E] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Organization
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
        {/* Stats Grid - Azure Tile Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 border border-[#EDEBE9] shadow-sm flex items-center gap-4 group hover:border-[#0078D4] transition-colors">
            <div className="w-12 h-12 bg-[#F3F2F1] rounded-sm flex items-center justify-center group-hover:bg-[#DEECF9] transition-colors">
              <Building2 className="h-6 w-6 text-[#0078D4]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mb-1">Organizations</p>
              <p className="text-2xl font-bold text-[#323130]">{stats.totalOrganizations}</p>
            </div>
          </div>

          <div className="bg-white p-5 border border-[#EDEBE9] shadow-sm flex items-center gap-4 group hover:border-[#0078D4] transition-colors">
            <div className="w-12 h-12 bg-[#F3F2F1] rounded-sm flex items-center justify-center group-hover:bg-[#DEECF9] transition-colors">
              <Users className="h-6 w-6 text-[#0078D4]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mb-1">Total Workforce</p>
              <p className="text-2xl font-bold text-[#323130]">{stats.totalEmployees}</p>
            </div>
          </div>

          <div className="bg-white p-5 border border-[#EDEBE9] shadow-sm flex items-center gap-4 group hover:border-[#0078D4] transition-colors">
            <div className="w-12 h-12 bg-[#F3F2F1] rounded-sm flex items-center justify-center group-hover:bg-[#DEECF9] transition-colors">
              <ShieldCheck className="h-6 w-6 text-[#107C10]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mb-1">Active Licenses</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-[#323130]">{stats.paidEmployees}</p>
                <span className="text-[10px] text-orange-600 font-bold mb-1 bg-orange-50 px-1.5 py-0.5 border border-orange-100">{stats.unpaidEmployees} Pending</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0078D4] p-5 border border-[#005A9E] shadow-sm flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider mb-1">Global Revenue</p>
              <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Resources Table - Azure Portal Resource Style */}
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
                   <th className="py-3 px-6 text-center">Admin Status</th>
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
                       onClick={() => setSelectedOrg(user)}
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
                       <td className="py-3 px-6 text-center" onClick={e => e.stopPropagation()}>
                         <div className="flex items-center justify-center">
                           <label className="relative inline-flex items-center cursor-pointer group/toggle">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={user.role === 'orgadmin' || user.role === 'admin'}
                                onChange={() => handleGrantAdmin(user._id, user.name, user.role)}
                              />
                              <div className="relative w-10 h-5 bg-[#C8C6C4] peer-focus:outline-none rounded-full peer peer-checked:bg-[#0078D4] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#8A8886] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                              <span className="ml-2 text-[10px] font-semibold text-[#605E5C] uppercase group-hover/toggle:text-[#0078D4] transition-colors">
                                {user.role === 'orgadmin' || user.role === 'admin' ? 'Active Admin' : 'Grant Access'}
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
           <div className="px-6 py-3 border-t border-[#EDEBE9] bg-[#FAF9F8] text-[11px] text-[#605E5C] font-semibold flex justify-between">
             <span>Showing {organizations.length} organizations</span>
             <span>Region: Global (Platform)</span>
           </div>
        </div>
      </div>

      {/* Add User Modal - Azure Side Panel / Center Panel Style */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[1px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-sm shadow-2xl border border-[#EDEBE9] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#323130]">Register New Identity</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#605E5C] hover:text-[#323130]">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
               <div>
                  <label className="text-[12px] font-semibold text-[#605E5C] mb-1 block">Display Name / Identity</label>
                  <input required type="text" className="w-full px-3 py-1.5 bg-white border border-[#8A8886] rounded-sm text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[12px] font-semibold text-[#605E5C] mb-1 block">Email Address</label>
                    <input required type="email" className="w-full px-3 py-1.5 bg-white border border-[#8A8886] rounded-sm text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[12px] font-semibold text-[#605E5C] mb-1 block">Contact Phone</label>
                    <input required type="text" className="w-full px-3 py-1.5 bg-white border border-[#8A8886] rounded-sm text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[12px] font-semibold text-[#605E5C] mb-1 block">Unique Employee ID</label>
                    <input required type="text" className="w-full px-3 py-1.5 bg-white border border-[#8A8886] rounded-sm text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none" value={formData.empId} onChange={e => setFormData({...formData, empId: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[12px] font-semibold text-[#605E5C] mb-1 block">Access Password</label>
                    <input required type="password" className="w-full px-3 py-1.5 bg-white border border-[#8A8886] rounded-sm text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                 </div>
               </div>
               <div className="flex items-center gap-3 p-4 bg-[#F3F2F1] border border-[#EDEBE9] mt-6">
                  <input type="checkbox" id="isOrgAdmin" className="w-4 h-4 text-[#0078D4] rounded-sm" checked={formData.isOrgAdmin} onChange={e => setFormData({...formData, isOrgAdmin: e.target.checked})} />
                  <label htmlFor="isOrgAdmin" className="text-[12px] font-semibold text-[#323130] cursor-pointer">Register as Organization Admin (Tenant Access)</label>
               </div>
               <div className="flex gap-2 pt-6">
                  <button type="submit" className="flex-1 py-2 bg-[#0078D4] text-white rounded-sm font-semibold text-sm hover:bg-[#005A9E] transition-all shadow-sm">Review + Create</button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-white border border-[#8A8886] text-[#323130] rounded-sm font-semibold text-sm hover:bg-[#F3F2F1] transition-all">Cancel</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
