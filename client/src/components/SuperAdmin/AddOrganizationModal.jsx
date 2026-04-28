import React, { useState } from 'react';
import { Building2, X } from 'lucide-react';
import adminService from '../../services/adminService';
import { useUI } from '../../context/UIContext';

const AddOrganizationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    password: '',
    isOrgAdmin: true
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
      await adminService.createEmployee(formData);
      addToast('Tenant resource provisioned successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Provisioning failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-200">
      <div className="bg-white border border-[#EDEBE9] w-full max-w-md shadow-2xl overflow-hidden flex flex-col rounded-none">
        <div className="px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8] flex justify-between items-center">
          <h2 className="text-sm font-bold text-[#323130] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#0078D4]" />
            Provision New Tenant
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
              placeholder="e.g., Acme Corp"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Email Address</label>
              <input
                required
                type="email"
                name="email"
                placeholder="admin@acme.com"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#F3F2F1] border border-[#EDEBE9] mt-2">
            <input 
              type="checkbox" 
              id="isOrgAdmin" 
              className="w-4 h-4 text-[#0078D4] border-[#8A8886] rounded-sm focus:ring-0" 
              checked={formData.isOrgAdmin} 
              onChange={e => setFormData({...formData, isOrgAdmin: e.target.checked})} 
            />
            <label htmlFor="isOrgAdmin" className="text-[11px] font-semibold text-[#323130] cursor-pointer">Provision as Organization Admin (Tenant Access)</label>
          </div>

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
              {loading ? 'Initializing...' : 'Deploy Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrganizationModal;
