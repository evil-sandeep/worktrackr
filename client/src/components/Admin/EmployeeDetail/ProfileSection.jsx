import React, { useState } from 'react';
import { IdCard, IndianRupee, Save, Trash2, ShieldCheck, ShieldAlert, Crown } from 'lucide-react';
import { getEmployeeStatus } from '../../../utils/employeeUtils';
import authService from '../../../services/authService';
import adminService from '../../../services/adminService';
import { useUI } from '../../../context/UIContext';

const ProfileSection = ({ employee, formData, onFormChange, onUpdate, onDelete, onRefresh }) => {
  const status = getEmployeeStatus(employee);
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const { showLoader, addToast } = useUI();
  const [isAdmin, setIsAdmin] = useState(employee.role === 'admin');

  // Determine role badge
  const getRoleBadge = () => {
    const role = isAdmin ? 'admin' : employee.role;
    if (role === 'superadmin') return { label: 'Super Admin', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: Crown };
    if (role === 'admin') return { label: 'Admin', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: ShieldCheck };
    if (role === 'orgadmin') return { label: 'Org Admin', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: ShieldAlert };
    return { label: 'Employee', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: IdCard };
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  const handleToggleAdmin = async () => {
    const newState = !isAdmin;
    const action = newState ? 'grant admin dashboard access to' : 'revoke admin dashboard access from';
    if (!window.confirm(`Are you sure you want to ${action} "${employee.name}"?`)) return;

    showLoader(true);
    try {
      if (newState) {
        await adminService.grantAdmin(employee._id);
      } else {
        await adminService.revokeAdmin(employee._id);
      }
      setIsAdmin(newState);
      addToast(`${employee.name} has been ${newState ? 'promoted to Admin' : 'demoted to Org Admin'}`, 'success');
      // Use onRefresh to just re-fetch the list without triggering a full profile save
      if (onRefresh) onRefresh();
    } catch (error) {
      addToast(error.response?.data?.message || 'Permission update failed', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <div className="w-full xl:w-80 p-6 md:p-8 border-b xl:border-b-0 xl:border-r border-slate-100 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-shrink-0">
      <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">Profile</h2>
      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-6">Employee Management</p>

      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400 shadow-inner overflow-hidden ring-4 ring-slate-50 relative">
            {employee.profileImg ? (
              <img src={employee.profileImg} alt={employee.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              employee.name?.charAt(0) || 'U'
            )}
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${status.color}`}></div>
          </div>
          <div className="space-y-1 truncate">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emp ID</p>
            <p className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
              <IdCard className="h-3.5 w-3.5 text-blue-500" />
              {employee.empId}
            </p>
            {/* Role Badge */}
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
              <RoleIcon className="h-2.5 w-2.5" />
              {roleBadge.label}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-[1.5rem] border ${status.bg} space-y-2`}>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white ${status.color}`}>
              {status.label}
            </span>
            <span className="text-[9px] font-bold text-slate-400">
              {employee.lastSeen ? new Date(employee.lastSeen).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-600 leading-tight">
            Last active pulse: <br/>
            <span className="text-slate-400 font-medium">
              {employee.lastSeen ? new Date(employee.lastSeen).toLocaleString() : 'Never Active'}
            </span>
          </p>
        </div>

        {/* Make as Admin Toggle — Super Admin Only */}
        {isSuperAdmin && (employee.role === 'orgadmin' || employee.role === 'admin') && (
          <div className="flex items-center justify-between p-4 bg-white border border-indigo-100 rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="space-y-0.5">
              <label className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                Make as Admin
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {isAdmin ? 'Has admin access' : 'Pending approval'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={handleToggleAdmin} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={onFormChange} 
              className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm text-slate-900 shadow-sm" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role & Title</label>
            <div className="grid grid-cols-2 gap-2">
              <select 
                name="role" 
                value={formData.role} 
                onChange={onFormChange} 
                className="px-3 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-900 shadow-sm appearance-none cursor-pointer"
              >
                <option value="employee">Staff</option>
                <option value="orgadmin">Org Admin</option>
                <option value="admin">Admin</option>
              </select>
              <input 
                name="designation" 
                value={formData.designation} 
                onChange={onFormChange} 
                placeholder="Title" 
                className="px-3 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                name="salary" 
                type="number" 
                value={formData.salary} 
                onChange={onFormChange} 
                className="w-full pl-9 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm text-slate-900 shadow-sm" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
            <div className="space-y-0.5">
               <label className="text-xs font-black text-slate-900 tracking-tight block">Payment Status</label>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Is this employee paid?</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="isPaid" 
                checked={formData.isPaid} 
                onChange={(e) => onFormChange({ target: { name: 'isPaid', value: e.target.checked } })} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact</label>
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={onFormChange} 
              placeholder="Phone" 
              className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-sm text-slate-900 shadow-sm mb-2" 
            />
            <input 
              name="password" 
              type="password"
              value={formData.password || ''} 
              onChange={onFormChange} 
              placeholder="New Password (Leave blank to keep current)" 
              className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-sm text-slate-900 shadow-sm mb-2 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
            />
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={onFormChange} 
              rows="2" 
              placeholder="Street Address" 
              className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm text-slate-900 shadow-sm resize-none text-xs" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button 
            onClick={onUpdate} 
            className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Save className="h-3.5 w-3.5" />
            Update Profile
          </button>
          <button 
            onClick={onDelete} 
            className="flex items-center justify-center gap-2 w-full py-4 text-rose-500 bg-white border border-rose-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
