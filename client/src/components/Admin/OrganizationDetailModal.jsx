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
    password: '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-200">
      <div className="bg-white border border-[#EDEBE9] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-none">
        {/* Azure Header Section */}
        <div className="bg-[#FAF9F8] p-6 border-b border-[#EDEBE9] flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#DEECF9] text-[#0078D4] rounded-sm flex items-center justify-center border border-[#0078D4]/10">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#323130] tracking-tight">{organization.name}</h2>
              <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mt-0.5">
                Organizational Identity & Resource Allocation Control
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#605E5C] hover:text-[#323130] hover:bg-[#EDEBE9] rounded-sm transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clinical Content Area */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-8">
          <OrgDetailStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4 px-1">
               <div className="w-1.5 h-4 bg-[#0078D4]"></div>
               <h3 className="text-sm font-bold text-[#323130] uppercase tracking-wider">Workforce Instances</h3>
            </div>
            <OrgFleetTable 
              employees={employees}
              onPay={handlePay}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailModal;
