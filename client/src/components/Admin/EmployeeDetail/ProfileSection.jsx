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
    <div className="flex flex-col h-full bg-[#FAF9F8] p-6 overflow-y-auto custom-scrollbar">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#323130] tracking-tight">Resource Profile</h2>
        <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Identity Instance Management</p>
      </div>

      <div className="space-y-6">
        {/* Profile Identity Card */}
        <div className="bg-white border border-[#EDEBE9] p-4 shadow-sm relative group">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#F3F2F1] rounded-sm flex items-center justify-center font-bold text-xl text-[#A19F9D] border border-[#EDEBE9] relative overflow-hidden shrink-0">
              {employee.profileImg ? (
                <img src={employee.profileImg} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                employee.name?.charAt(0) || 'U'
              )}
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${status.color}`}></div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider mb-0.5">Instance ID</p>
              <p className="text-sm font-bold text-[#323130] flex items-center gap-1.5 truncate">
                <IdCard className="h-3.5 w-3.5 text-[#0078D4]" />
                {employee.empId}
              </p>
              <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                <RoleIcon className="h-2.5 w-2.5" />
                {roleBadge.label}
              </div>
            </div>
          </div>
        </div>

        {/* Lifecycle Status */}
        <div className={`bg-white border border-[#EDEBE9] p-4 shadow-sm space-y-3`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider">Provisioning State</p>
            <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider text-white ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="bg-[#FAF9F8] p-2 border border-[#EDEBE9] rounded-sm">
             <p className="text-[10px] font-medium text-[#605E5C] leading-tight">
              Last Telemetry: <br/>
              <span className="text-[#323130] font-semibold">
                {employee.lastSeen ? new Date(employee.lastSeen).toLocaleString() : 'Never Sync'}
              </span>
            </p>
          </div>
        </div>

        {/* Access Control Area */}
        {isSuperAdmin && (employee.role === 'orgadmin' || employee.role === 'admin') && (
          <div className="bg-white border border-[#EDEBE9] p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#0078D4]"></div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-[#323130] flex items-center gap-1.5 uppercase tracking-tight">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0078D4]" />
                  Elevate Permissions
                </label>
                <span className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">
                  {isAdmin ? 'System Admin Active' : 'Promotion Eligibility'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAdmin} 
                  onChange={handleToggleAdmin} 
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#F3F2F1] border border-[#8A8886] rounded-full peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-[#8A8886] after:border-white after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#0078D4] peer-checked:after:bg-white"></div>
              </label>
            </div>
          </div>
        )}

        {/* Configuration Properties */}
        <div className="bg-white border border-[#EDEBE9] p-4 shadow-sm space-y-4">
          <p className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider mb-2">Properties</p>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">Identity Name</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={onFormChange} 
              className="w-full px-3 py-2 bg-white border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none transition-all font-semibold text-[13px] text-[#323130]" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">Auth Role</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={onFormChange} 
                className="w-full px-2 py-2 bg-[#FAF9F8] border border-[#8A8886] rounded-sm font-semibold text-xs text-[#323130] outline-none focus:border-[#0078D4]"
              >
                <option value="employee">Staff</option>
                <option value="orgadmin">Org Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">Job Title</label>
              <input 
                name="designation" 
                value={formData.designation} 
                onChange={onFormChange} 
                placeholder="Title" 
                className="w-full px-2 py-2 bg-white border border-[#8A8886] rounded-sm font-semibold text-xs text-[#323130] outline-none focus:border-[#0078D4]" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">Financial Rate (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#605E5C]" />
              <input 
                name="salary" 
                type="number" 
                value={formData.salary} 
                onChange={onFormChange} 
                className="w-full pl-9 pr-3 py-2 bg-[#FAF9F8] border border-[#8A8886] rounded-sm outline-none font-semibold text-[13px] text-[#323130] focus:border-[#0078D4]" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm">
            <div className="space-y-0.5">
               <label className="text-[11px] font-bold text-[#323130] tracking-tight block uppercase">Billing Cycle</label>
               <span className="text-[9px] font-semibold text-[#605E5C] uppercase">Paid Status</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="isPaid" 
                checked={formData.isPaid} 
                onChange={(e) => onFormChange({ target: { name: 'isPaid', value: e.target.checked } })} 
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#F3F2F1] border border-[#8A8886] rounded-full peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-[#8A8886] after:border-white after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#107C10] peer-checked:after:bg-white"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">Email Address</label>
              <input 
                name="email" 
                value={formData.email} 
                onChange={onFormChange} 
                placeholder="Email Address" 
                className="w-full px-3 py-2 bg-white border border-[#8A8886] rounded-sm font-semibold text-xs text-[#323130] focus:border-[#0078D4] outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">Contact Endpoint</label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={onFormChange} 
                placeholder="Phone" 
                className="w-full px-3 py-2 bg-white border border-[#8A8886] rounded-sm font-semibold text-xs text-[#323130] focus:border-[#0078D4] outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">Access Security</label>
              <input 
                name="password" 
                type="password"
                value={formData.password || ''} 
                onChange={onFormChange} 
                placeholder="Reset Authentication Key" 
                className="w-full px-3 py-2 bg-white border border-[#8A8886] rounded-sm font-semibold text-xs text-[#323130] focus:border-[#0078D4] outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#605E5C] uppercase tracking-wider">Location Metadata</label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={onFormChange} 
                rows="2" 
                placeholder="Physical Address" 
                className="w-full px-3 py-2 bg-white border border-[#8A8886] rounded-sm outline-none font-semibold text-xs text-[#323130] focus:border-[#0078D4] resize-none" 
              />
            </div>
          </div>
        </div>

        {/* Management Operations */}
        <div className="flex flex-col gap-3 pt-2 pb-6">
          <button 
            onClick={onUpdate} 
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0078D4] text-white rounded-sm font-bold text-[11px] uppercase tracking-widest hover:bg-[#005A9E] transition-all shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            Apply Changes
          </button>
          <button 
            onClick={onDelete} 
            className="flex items-center justify-center gap-2 w-full py-2.5 text-[#E81123] bg-white border border-[#E81123] rounded-sm font-bold text-[11px] uppercase tracking-widest hover:bg-[#E81123] hover:text-white transition-all shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            De-provision
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
