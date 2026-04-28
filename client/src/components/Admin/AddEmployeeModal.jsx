import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, Hash, Shield, Building2, Plus } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-200">
      <div className="bg-white border border-[#EDEBE9] w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8] flex justify-between items-center">
          <h2 className="text-sm font-bold text-[#323130] uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#0078D4]" />
            Provision New Resource
          </h2>
          <button onClick={onClose} className="p-1 text-[#605E5C] hover:text-[#323130] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Identity Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Email Address</label>
            <input
              required
              type="email"
              name="email"
              placeholder="john@worktrackr.com"
              className="w-full px-3 py-1.5 border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold transition-all"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Mobile Contact</label>
            <input
              required
              type="tel"
              name="phone"
              placeholder="+91 00000 00000"
              className="w-full px-3 py-1.5 border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold transition-all"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Employee ID</label>
            <input
              required
              type="text"
              name="empId"
              placeholder="EMP001"
              className="w-full px-3 py-1.5 border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold transition-all"
              value={formData.empId}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Access Key</label>
            <input
              required
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full px-3 py-1.5 border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold transition-all"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">System Role</label>
            <select
              name="role"
              className="w-full px-3 py-1.5 border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold transition-all bg-white"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="employee">Standard Employee</option>
              <option value="admin">System Admin</option>
              <option value="orgadmin">Organization Admin</option>
            </select>
          </div>

          {organizations.length > 0 && formData.role !== 'orgadmin' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Assigned Organization</label>
              <select
                name="organizationId"
                className="w-full px-3 py-1.5 border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold transition-all bg-white"
                value={formData.organizationId}
                onChange={handleChange}
              >
                <option value="">No Organization (Direct Parent)</option>
                {organizations.map(org => (
                  <option key={org._id} value={org._id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-[#F3F2F1] text-[#605E5C] rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-[#EDEBE9] transition-all border border-[#D2D0CE]"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-[2] py-2 bg-[#0078D4] text-white rounded-sm font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-[#005A9E] transition-all disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Provision Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
