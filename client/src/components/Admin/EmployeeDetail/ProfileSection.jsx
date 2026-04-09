import React from 'react';
import { IdCard, IndianRupee, Save, Trash2 } from 'lucide-react';
import { getEmployeeStatus } from '../../../utils/employeeUtils';

const ProfileSection = ({ employee, formData, onFormChange, onUpdate, onDelete }) => {
  const status = getEmployeeStatus(employee);

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
          <div className="space-y-0.5 truncate">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emp ID</p>
            <p className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
              <IdCard className="h-3.5 w-3.5 text-blue-500" />
              {employee.empId}
            </p>
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact</label>
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={onFormChange} 
              placeholder="Phone" 
              className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-sm text-slate-900 shadow-sm mb-2" 
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
