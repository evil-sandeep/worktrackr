import React, { useState } from 'react';
import { X, Building2, Users, IndianRupee, Mail, Phone, Edit2, Trash2, ShieldCheck, DollarSign } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import adminService from '../../services/adminService';

const OrganizationDetailModal = ({ organization, onClose, onUpdate }) => {
  const { addToast, showLoader } = useUI();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name || '',
    email: organization.email || '',
    phone: organization.phone || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const confirmUpdate = window.confirm('Are you sure you want to update this organization?');
    if (!confirmUpdate) return;

    showLoader(true);
    try {
      await adminService.updateOrganization(organization._id, formData);
      addToast('Organization updated successfully', 'success');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update organization', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'WARNING: This will permanently delete the organization AND all associated employees and logs. Are you absolutely sure?'
    );
    if (!confirmDelete) return;

    showLoader(true);
    try {
      await adminService.deleteOrganization(organization._id);
      addToast('Organization completely deleted', 'success');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete organization', 'error');
    } finally {
      showLoader(false);
    }
  };

  if (!organization) return null;

  const stats = organization.stats || { totalStaff: 0, paidStaff: 0, unpaidStaff: 0, revenue: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-poppins">{organization.name}</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Organization Profile
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Revenue & Stats Snapshot */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Users className="h-5 w-5 text-indigo-500 mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Staff</p>
              <p className="text-2xl font-black text-slate-900 font-poppins">{stats.totalStaff}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
              <ShieldCheck className="h-5 w-5 text-green-500 mb-2" />
              <p className="text-[10px] font-bold text-green-600/70 uppercase tracking-wider mb-1">Paid Staff</p>
              <p className="text-2xl font-black text-green-700 font-poppins">{stats.paidStaff}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <Users className="h-5 w-5 text-orange-500 mb-2 opacity-50" />
              <p className="text-[10px] font-bold text-orange-600/70 uppercase tracking-wider mb-1">Unpaid Staff</p>
              <p className="text-2xl font-black text-orange-700 font-poppins">{stats.unpaidStaff}</p>
            </div>
            <div className="bg-indigo-600 p-4 rounded-2xl border border-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <IndianRupee className="h-5 w-5 text-indigo-200 mb-2" />
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider mb-1">Monthly Rev</p>
              <p className="text-2xl font-black font-poppins">₹{stats.revenue}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Admin Contact Details</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit2 className="h-3 w-3" />
                {isEditing ? 'Cancel Edit' : 'Edit Info'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organization Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization / Admin Name</p>
                    <p className="text-sm font-bold text-slate-900">{organization.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold text-slate-900">{organization.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-sm font-bold text-slate-900">{organization.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start justify-between">
            <div>
              <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest mb-1">Danger Zone</h3>
              <p className="text-xs font-bold text-rose-700/70">Permanently delete this organization and all its data.</p>
            </div>
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-3 w-3" />
              Delete Org
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailModal;
