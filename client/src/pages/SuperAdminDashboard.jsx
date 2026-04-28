import React, { useState, useEffect } from 'react';
import { Activity, Plus, ShieldCheck } from 'lucide-react';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';
import axios from 'axios';

// Modular Components
import DashboardStats from '../components/SuperAdmin/DashboardStats';
import OrganizationTable from '../components/SuperAdmin/OrganizationTable';
import AddOrganizationModal from '../components/SuperAdmin/AddOrganizationModal';
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { showLoader, addToast } = useUI();
  
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

  const handleDeleteOrg = async (id) => {
    if (window.confirm('Are you sure you want to delete this organization? This action is irreversible.')) {
      try {
        await adminService.deleteOrganization(id);
        addToast('Organization deleted successfully', 'success');
        fetchData();
      } catch (error) {
        addToast('Failed to delete organization', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2F1] p-6 space-y-6 animate-in fade-in duration-300 overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-[#EDEBE9] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0078D4] text-white rounded-sm flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#323130] tracking-tight">Super Admin Control Plane</h1>
            <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mt-0.5">
              Global Subscription & Resource Fleet Management
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-[#0078D4] text-white rounded-sm font-semibold text-sm hover:bg-[#005A9E] transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Tenant Subscription
        </button>
      </div>

      {/* Stats Snapshot */}
      <DashboardStats stats={stats} />

      {/* Main Content Area */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Activity className="h-4 w-4 text-[#0078D4]" />
          <h2 className="text-sm font-bold text-[#323130] uppercase tracking-wider">Operational Identity Hub</h2>
        </div>
        
        <OrganizationTable 
          organizations={organizations} 
          onSelect={setSelectedOrg}
          onDelete={handleDeleteOrg}
        />
      </div>

      {/* Modals */}
      <AddOrganizationModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchData}
      />

      {selectedOrg && (
        <OrganizationDetailModal 
          organization={selectedOrg} 
          onClose={() => setSelectedOrg(null)} 
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
