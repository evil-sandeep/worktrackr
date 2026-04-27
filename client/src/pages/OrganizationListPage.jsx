import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Users,
  Trash2,
  Search,
  RotateCcw,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';
import AddEmployeeModal from '../components/Admin/AddEmployeeModal';

const OrganizationListPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { showLoader, addToast } = useUI();
  const navigate = useNavigate();

  const fetchData = async () => {
    showLoader(true);
    try {
      const data = await adminService.getOrganizations();
      if (Array.isArray(data)) {
        const orgAdmins = data.filter(user => 
          user && (user.role === 'orgadmin' || user.role === 'admin' || user.role === 'superadmin')
        );
        setOrganizations(orgAdmins);
        setFilteredOrgs(orgAdmins);
      } else {
        setOrganizations([]);
        setFilteredOrgs([]);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch organizations', 'error');
    } finally {
      showLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (Array.isArray(organizations)) {
      const results = organizations.filter(org => 
        (org.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrgs(results);
    }
  }, [searchTerm, organizations]);

  const handleToggleAdmin = async (orgId, orgName, currentRole) => {
    const isCurrentlyAdmin = currentRole === 'admin';
    const confirmMsg = isCurrentlyAdmin
      ? `Revoke admin dashboard access from "${orgName}"?`
      : `Grant admin dashboard access to "${orgName}"?`;
    
    if (!window.confirm(confirmMsg)) return;

    showLoader(true);
    try {
      if (isCurrentlyAdmin) {
        await adminService.revokeAdmin(orgId);
      } else {
        await adminService.grantAdmin(orgId);
      }
      addToast(`Permissions updated for ${orgName}`, 'success');
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Permission update failed', 'error');
    } finally {
      showLoader(false);
    }
  };

  const handleDelete = async (orgId, orgName) => {
    if (!window.confirm(`CRITICAL: This will permanently delete the organization "${orgName}" and ALL its associated data. Proceed?`)) return;

    showLoader(true);
    try {
      await adminService.deleteOrganization(orgId);
      addToast(`Organization ${orgName} has been removed`, 'success');
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete organization', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <div className="h-full bg-[#F3F2F1] animate-in fade-in duration-300 overflow-y-auto">
      {/* Azure Style Breadcrumb/Header */}
      <div className="bg-white border-b border-[#EDEBE9] px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#0078D4] hover:underline cursor-pointer font-medium" onClick={() => navigate('/')}>Home</span>
          <span className="text-[#605E5C]">/</span>
          <span className="text-[#323130] font-semibold">Organizations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#605E5C] group-focus-within:text-[#0078D4]" />
            <input 
              type="text" 
              placeholder="Filter resources..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-[#F3F2F1] border border-transparent rounded-sm text-sm focus:bg-white focus:border-[#0078D4] outline-none w-48 transition-all"
            />
          </div>
          <div className="w-[1px] h-4 bg-[#EDEBE9] mx-1"></div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F2F1] rounded-sm text-sm text-[#323130] transition-colors border border-transparent hover:border-[#EDEBE9]"
          >
            <RotateCcw className="h-4 w-4 text-[#0078D4]" />
            Refresh
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#0078D4] text-white rounded-sm text-sm font-semibold hover:bg-[#005A9E] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <div className="bg-white border border-[#EDEBE9] shadow-sm">
           <div className="px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#323130] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#0078D4]" />
                Resource List (Organizations)
              </h3>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-[#FAF9F8] border-b border-[#EDEBE9] text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">
                   <th className="py-3 px-6 w-12">#</th>
                   <th className="py-3 px-6">Resource Name</th>
                   <th className="py-3 px-6">ID / Status</th>
                   <th className="py-3 px-6">Contact Endpoint</th>
                   <th className="py-3 px-6">Metrics</th>
                   <th className="py-3 px-6 text-right">Operation</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#EDEBE9]">
                 {filteredOrgs.length === 0 ? (
                   <tr>
                     <td colSpan="6" className="py-12 text-center text-[#605E5C] italic text-sm">
                       No resources found matching the criteria.
                     </td>
                   </tr>
                 ) : (
                   filteredOrgs.map((org, index) => (
                     <tr 
                       key={org?._id || index} 
                       className="hover:bg-[#F3F2F1] cursor-pointer transition-colors group"
                       onClick={() => org?._id && navigate(`/org/${org._id}`)}
                     >
                       <td className="py-3 px-6 text-[11px] font-semibold text-[#A19F9D]">
                         {String(index + 1).padStart(2, '0')}
                       </td>
                       <td className="py-3 px-6">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-sm bg-[#DEECF9] flex items-center justify-center text-xs font-bold text-[#0078D4]">
                             {org?.name?.charAt(0).toUpperCase()}
                           </div>
                           <div className="flex flex-col">
                             <span className="font-semibold text-[13px] text-[#0078D4] hover:underline">{org?.name}</span>
                             <span className="text-[10px] text-[#605E5C] font-mono">{org?._id?.substring(0, 8)}...</span>
                           </div>
                         </div>
                       </td>
                       <td className="py-3 px-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold text-[#323130]">{org?.empId || 'N/A'}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-semibold uppercase w-fit ${
                              org?.role === 'admin' ? 'bg-[#DFF6DD] text-[#107C10]' :
                              org?.role === 'orgadmin' ? 'bg-[#FFF4CE] text-[#797673]' :
                              'bg-[#DEECF9] text-[#0078D4]'
                            }`}>
                              {org?.role === 'admin' ? 'Promoted' : 
                               org?.role === 'orgadmin' ? 'Tenant' : 'Standard'}
                            </span>
                         </div>
                       </td>
                       <td className="py-3 px-6">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 text-[12px] text-[#323130]">
                              <Mail className="h-3 w-3 text-[#605E5C]" />
                              {org?.email}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#605E5C]">
                              <Phone className="h-3 w-3" />
                              {org?.phone}
                            </div>
                          </div>
                       </td>
                       <td className="py-3 px-6">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-semibold text-[#323130]">{org?.stats?.totalStaff || 0} Instances</span>
                            <div className="w-full h-1 bg-[#EDEBE9] rounded-full mt-1 overflow-hidden">
                               <div className="h-full bg-[#107C10]" style={{ width: `${Math.min(100, (org?.stats?.paidStaff || 0) / (org?.stats?.totalStaff || 1) * 100)}%` }}></div>
                            </div>
                          </div>
                       </td>
                       <td className="py-3 px-6 text-right" onClick={e => e.stopPropagation()}>
                         <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleToggleAdmin(org._id, org.name, org.role)}
                             className={`px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                               org?.role === 'admin' 
                                 ? 'bg-white border-[#E81123] text-[#E81123] hover:bg-[#E81123] hover:text-white' 
                                 : 'bg-[#0078D4] border-[#0078D4] text-white hover:bg-[#005A9E]'
                             }`}
                           >
                             {org?.role === 'admin' ? 'Revoke' : 'Promote'}
                           </button>
                           {org?.role !== 'superadmin' && (
                             <button 
                               onClick={() => handleDelete(org._id, org.name)}
                               className="p-1.5 text-[#605E5C] hover:text-[#E81123] hover:bg-red-50 rounded-sm transition-colors"
                             >
                               <Trash2 className="h-4 w-4" />
                             </button>
                           )}
                           <button 
                             onClick={() => navigate(`/org/${org._id}`)}
                             className="p-1.5 text-[#605E5C] hover:text-[#0078D4] hover:bg-blue-50 rounded-sm transition-colors"
                           >
                             <ArrowUpRight className="h-4 w-4" />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
           <div className="px-6 py-3 border-t border-[#EDEBE9] bg-[#FAF9F8] text-[11px] text-[#605E5C] font-semibold flex justify-between">
             <span>Total: {filteredOrgs.length} resources</span>
             <span>Identity Region: Global</span>
           </div>
        </div>
      </div>

      <AddEmployeeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default OrganizationListPage;
