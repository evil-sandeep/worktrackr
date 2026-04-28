import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import adminService from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

// Modular Components
import OrgDetailStats from '../OrgModal/OrgDetailStats';
import OrgAdminContact from '../OrgModal/OrgAdminContact';
import OrgDangerZone from '../OrgModal/OrgDangerZone';
import OrgFleetTable from '../OrgModal/OrgFleetTable';

const OrganizationDetailModal = ({ organization, onClose, onUpdate }) => {
  const { addToast, showLoader } = useUI();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: organization.name || '',
    email: organization.email || '',
    phone: organization.phone || '',
  });

  const fetchEmployees = async () => {
    try {
      const orgId = organization.organizationId || organization._id;
      const data = await adminService.getEmployeesByOrg(orgId);
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchEmployees();
    }
  }, [organization]);

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

  const handlePay = (emp) => {
    navigate(`/payment?userId=${emp._id}&userName=${encodeURIComponent(emp.name)}`);
  };

  if (!organization) return null;

  const stats = organization.stats || { totalStaff: 0, paidStaff: 0, unpaidStaff: 0, revenue: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-poppins">{organization.name}</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Organization Profile & Fleet Management
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
          <OrgDetailStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <OrgAdminContact 
              organization={organization}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              formData={formData}
              onChange={handleChange}
              onUpdate={handleUpdate}
            />

            <OrgDangerZone onDelete={handleDelete} />
          </div>

          <OrgFleetTable 
            employees={employees}
            onPay={handlePay}
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailModal;
