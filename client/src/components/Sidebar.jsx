import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  Store,
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Shield,
  X,
  Users,
  Calendar,
  Building2
} from 'lucide-react';
import authService from '../services/authService';
import adminService from '../services/adminService';
import { useState, useEffect } from 'react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    const isAdmin = user?.role === 'superadmin' || user?.role === 'orgadmin' || user?.role === 'admin';
    if (isAdmin) {
      const fetchOrgs = async () => {
        try {
          const data = await adminService.getOrganizations();
          setOrganizations(data.filter(u => u.role === 'orgadmin' || u.role === 'admin' || u.role === 'superadmin'));
        } catch (error) {
          console.error('Failed to fetch orgs for sidebar', error);
        }
      };
      fetchOrgs();
    }
  }, [user?.email]);

  const allMenuItems = [
    { name: 'Super Console', icon: ShieldCheck, path: '/superadmindashboard', roles: ['superadmin'] },
    { name: 'Organizations', icon: Building2, path: '/organizations', roles: ['superadmin'] },
    { name: 'Global Directory', icon: Users, path: '/admin/employee', roles: ['superadmin'] },
    { name: 'Profile', icon: UserCircle, path: '/profile', roles: ['superadmin'] },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admindashboard', roles: ['admin', 'orgadmin'] },
    { name: 'Employees', icon: Users, path: '/admin/employee', roles: ['admin', 'orgadmin'] },
    { name: 'Profile', icon: UserCircle, path: '/profile', roles: ['admin', 'orgadmin'] },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/employeedashboard', roles: ['employee'] },
    { name: 'Calendar', icon: Calendar, path: '/calendar', roles: ['employee'] },
    { name: 'Store Visit', icon: Store, path: '/storevisit', roles: ['employee'] },
    { name: 'Profile', icon: UserCircle, path: '/profile', roles: ['employee'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user.role));

  if (!user) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/60 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-300 ease-in-out shadow-sm`}>
        <div className="flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <ShieldCheck className="text-white h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 tracking-tight">WorkTrackr</span>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Enterprise</span>
                </div>
              </div>
              <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {/* Super Admin Section */}
            {user.role === 'superadmin' && (
              <div className="space-y-6">
                <div>
                   <p className="px-4 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 opacity-80">Global Insights</p>
                   {menuItems.filter(item => ['Super Console', 'Global Directory'].includes(item.name)).map((item) => {
                     const isActive = location.pathname === item.path;
                     return (
                       <Link
                         key={item.name}
                         to={item.path}
                         className={`flex items-center group px-4 py-3 rounded-xl transition-all relative mb-1 ${isActive 
                           ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                           : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'}`}
                       >
                         <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-white' : 'group-hover:text-indigo-600'}`} />
                         <span className="font-bold text-sm tracking-tight">{item.name}</span>
                       </Link>
                     );
                   })}
                </div>

                <div>
                   <p className="px-4 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 opacity-80">Organization Control</p>
                   
                   {/* Main Organizations Management Page Link */}
                   <Link
                     to="/organizations"
                     className={`flex items-center group px-4 py-3 rounded-xl transition-all relative mb-2 ${location.pathname === '/organizations' 
                       ? 'bg-indigo-600 text-white shadow-lg' 
                       : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'}`}
                   >
                     <Building2 className={`h-5 w-5 mr-3 transition-colors ${location.pathname === '/organizations' ? 'text-white' : 'group-hover:text-indigo-600'}`} />
                     <span className="font-bold text-sm tracking-tight">Organization List</span>
                   </Link>
                </div>
              </div>
            )}

            {/* Admin Section */}
            {(user.role === 'admin' || user.role === 'orgadmin') && (
              <div className="mb-6">
                <p className="px-4 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 opacity-80">Control Center</p>
                {menuItems.filter(item => ['Dashboard', 'Employees'].includes(item.name)).map((item) => {
                  const isActive = location.pathname === item.path;
                  const isOrgItem = item.name === 'Organizations';
                  
                  return (
                    <div key={item.name}>
                      <Link
                        to={item.path}
                        className={`flex items-center group px-4 py-3 rounded-xl transition-all relative mb-1 ${isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700'}`}
                      >
                        <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-white' : 'group-hover:text-blue-600'}`} />
                        <span className="font-bold text-sm tracking-tight">{item.name}</span>
                      </Link>

                      {/* Dynamic Sub-menu for Organizations */}
                      {isOrgItem && organizations.length > 0 && (
                        <div className="ml-9 mt-1 mb-4 space-y-1 border-l-2 border-slate-100 pl-3">
                          {organizations.map((org) => {
                            const orgPath = `/admin/employee?orgId=${org._id}`;
                            const isOrgActive = location.pathname === '/admin/employee' && new URLSearchParams(location.search).get('orgId') === org._id;
                            return (
                              <Link
                                key={org._id}
                                to={orgPath}
                                className={`block py-2 px-3 rounded-lg text-[11px] font-bold transition-all ${isOrgActive 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'}`}
                              >
                                {org.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>
            )}

            {/* Employee Section */}
            {user.role === 'employee' && (
              <div className="mb-6">
                <p className="px-4 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 opacity-80">Employee Hub</p>
                {menuItems.filter(item => ['Dashboard', 'Calendar', 'Store Visit'].includes(item.name)).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center group px-4 py-3 rounded-xl transition-all relative mb-1 ${isActive 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
                    >
                      <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-white' : 'group-hover:text-emerald-600'}`} />
                      <span className="font-bold text-sm tracking-tight">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Generic Section (Profile) */}
            <div>
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 opacity-80">Account</p>
              {menuItems.filter(item => item.name === 'Profile').map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center group px-4 py-3 rounded-xl transition-all relative mb-1 ${isActive 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-white' : 'group-hover:text-slate-900'}`} />
                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Bottom - Professional Profile Area */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 mb-4 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">{user.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5">{user.role}</span>
                </div>
            </div>
            
            <button 
              onClick={() => {
                const confirmed = window.confirm('Are you sure you want to sign out?');
                if (confirmed) {
                  authService.logout();
                  window.location.reload();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl font-bold text-xs transition-all active:scale-95 group"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
