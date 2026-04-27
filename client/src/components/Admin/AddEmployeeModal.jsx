import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, Hash, Shield, Building2 } from 'lucide-react';
import adminService from '../../services/adminService';
import { useUI } from '../../context/UIContext';

const AddEmployeeModal = ({ isOpen, onClose, onSuccess, organizations = [], orgId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    password: '',
    role: 'employee',
    organizationId: orgId || ''
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useUI();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (orgId) {
        await adminService.createOrgEmployee(orgId, formData);
      } else {
        const payload = { 
          ...formData, 
          isOrgAdmin: formData.role === 'orgadmin' 
        };
        await adminService.createEmployee(payload);
      }
      addToast(formData.role === 'orgadmin' ? 'Organization added successfully' : 'Employee added successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to add employee', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-white">
        {/* Header - Fixed at top */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-poppins">Add Team Member</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Security Access Initialization</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl flex items-center justify-center transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="e.g. John Wick"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="john@worktrackr.com"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="+91 00000 00000"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Emp ID */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="text"
                  name="empId"
                  placeholder="EMP001"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.empId}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role - Optional/Auto for OrgAdmin */}
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <select
                  name="role"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-sm text-slate-900 appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="employee">Standard Employee</option>
                  <option value="admin">System Admin</option>
                  <option value="orgadmin">Organization Admin</option>
                </select>
              </div>
            </div>

            {/* Organization Select (Only for SuperAdmin) */}
            {organizations.length > 0 && formData.role !== 'orgadmin' && (
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Organization</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    name="organizationId"
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-sm text-slate-900 appearance-none cursor-pointer"
                    value={formData.organizationId}
                    onChange={handleChange}
                  >
                    <option value="">No Organization (Direct Parent)</option>
                    {organizations.map(org => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? 'Initializing...' : 'Authorize Member'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
