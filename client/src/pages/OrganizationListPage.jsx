import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Users,
  Trash2
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
      console.log('Fetching organizations...');
      const data = await adminService.getOrganizations();
      console.log('Orgs fetched:', data);
      
      if (Array.isArray(data)) {
        const orgAdmins = data.filter(user => 
          user && (user.role === 'orgadmin' || user.role === 'admin' || user.role === 'superadmin')
        );
        setOrganizations(orgAdmins);
        setFilteredOrgs(orgAdmins);
      } else {
        console.error('Data fetched is not an array:', data);
        setOrganizations([]);
        setFilteredOrgs([]);
      }
    } catch (error) {
      console.error('Fetch Orgs Error:', error);
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
    const action = isCurrentlyAdmin ? 'revoke-admin' : 'grant-admin';
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
    if (!window.confirm(`CRITICAL: This will permanently delete the organization "${orgName}" and ALL its associated data (employees, attendance, etc.). This cannot be undone. Proceed?`)) return;

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
    <div className="h-full space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Super Admin</h2>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 font-poppins">
            <Building2 className="h-7 w-7 text-indigo-600" />
            Organisation Management
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1 opacity-60">Manage organization administrators and their access levels</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-start px-2">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group flex items-center gap-3 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
            <Building2 className="h-3 w-3" />
          </div>
          Add Organisation
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50/80 border-b border-slate-100">
          <div className="col-span-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">#</div>
          <div className="col-span-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Organisation</div>
          <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">ID / Role</div>
          <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Info</div>
          <div className="col-span-2 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredOrgs.length === 0 ? (
            <div className="py-20 text-center">
              <Building2 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold italic">No organizations found.</p>
            </div>
          ) : (
            filteredOrgs.map((org, index) => (
              <div 
                key={org?._id || index} 
                className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-indigo-50/30 transition-all duration-300 group cursor-pointer"
                onClick={() => org?._id && navigate(`/org/${org._id}`)}
              >
                <div className="col-span-1 text-[10px] font-bold text-slate-300 group-hover:text-indigo-400">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-lg font-black text-indigo-600 ring-2 ring-white shadow-sm group-hover:ring-indigo-100 transition-all">
                    {org?.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[14px] text-slate-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight font-poppins">
                      {org?.name || 'Unnamed Org'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                        {org?.stats?.totalStaff || 0} Staff
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 border border-slate-200/50 rounded-md text-[9px] font-black text-slate-600 tracking-widest w-fit">
                      {org?.empId || 'N/A'}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                      org?.role === 'admin' ? 'text-indigo-600' : 'text-amber-600'
                    }`}>
                      {org?.role === 'admin' ? 'Promoted' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail className="h-3 w-3 opacity-50" />
                      <span className="text-[11px] font-bold truncate">{org?.email || 'No Email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-3 w-3 opacity-50" />
                      <span className="text-[10px] font-bold">{org?.phone || 'No Phone'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex justify-end gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAdmin(org._id, org.name, org.role);
                    }}
                    className={`px-3 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 border ${
                      org?.role === 'admin' 
                        ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white' 
                        : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {org?.role === 'admin' ? 'Revoke' : 'Promote'}
                  </button>
                  {org?.role !== 'superadmin' && (
                    <button 
                      className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(org._id, org.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/org/${org._id}`);
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
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
