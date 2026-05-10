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
    { name: 'Dashboard', icon: ShieldCheck, path: '/superadmin/dashboard', roles: ['superadmin'] },
    { name: 'Organizations', icon: Building2, path: '/organizations', roles: ['superadmin'] },
    { name: 'Global Directory', icon: Users, path: '/orgadmin/employee', roles: ['superadmin'] },
    { name: 'Profile', icon: UserCircle, path: '/profile', roles: ['superadmin'] },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/orgadmin/dashboard', roles: ['admin', 'orgadmin'] },
    { name: 'Employees', icon: Users, path: '/orgadmin/employee', roles: ['admin', 'orgadmin'] },
    { name: 'Profile', icon: UserCircle, path: '/profile', roles: ['admin', 'orgadmin'] },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/employee/dashboard', roles: ['employee'] },
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
      <aside className={`fixed lg:static lg:inset-auto lg:translate-x-0 inset-y-0 left-0 w-64 bg-white border-r border-[#edebe9] z-50 shrink-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          
          {/* Logo Section - Azure Style */}
          <div className="px-6 py-6 border-b border-[#edebe9]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#0078d4] rounded-sm flex items-center justify-center shadow-sm">
                  <ShieldCheck className="text-white h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-[#323130] tracking-tight">WorkTrackr</span>
                  <span className="text-[9px] font-semibold text-[#0078d4] uppercase tracking-wider leading-none">Management Console</span>
                </div>
              </div>
              <button onClick={toggleSidebar} className="lg:hidden p-1.5 text-[#605e5c] hover:bg-[#f3f2f1] rounded-sm transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
            {/* Super Admin Section */}
            {user.role === 'superadmin' && (
              <div className="mb-6">
                 <p className="px-6 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider mb-2">Global Resources</p>
                 {menuItems.filter(item => ['Dashboard', 'Organizations', 'Global Directory'].includes(item.name)).map((item) => {
                   const isActive = location.pathname === item.path;
                   return (
                     <Link
                       key={item.name}
                       to={item.path}
                       className={`sidebar-link ${isActive ? 'active' : ''}`}
                     >
                       <item.icon className={`h-4 w-4 ${isActive ? 'text-[#0078d4]' : 'text-[#605e5c]'}`} />
                       <span>{item.name}</span>
                     </Link>
                   );
                 })}
              </div>
            )}

            {/* Admin Section */}
            {(user.role === 'admin' || user.role === 'orgadmin') && (
              <div className="mb-6">
                <p className="px-6 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider mb-2">Control Plane</p>
                {menuItems.filter(item => ['Dashboard', 'Employees'].includes(item.name)).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-[#0078d4]' : 'text-[#605e5c]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Employee Section */}
            {user.role === 'employee' && (
              <div className="mb-6">
                <p className="px-6 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider mb-2">Staff Hub</p>
                {menuItems.filter(item => ['Dashboard', 'Calendar', 'Store Visit'].includes(item.name)).map((item) => {
                  const isActive = location.pathname === item.path;
                  const isDisabled = ['Calendar', 'Store Visit'].includes(item.name) && !user.isPaid;
                  
                  if (isDisabled) {
                    return (
                      <div
                        key={item.name}
                        className="flex items-center gap-3 px-6 py-2.5 text-[#A19F9D] cursor-not-allowed opacity-60"
                        title="Payment required for full activation"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-[13px] font-medium">{item.name}</span>
                        <Shield className="h-3 w-3 ml-auto text-amber-500" />
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-[#0078d4]' : 'text-[#605e5c]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Generic Section (Profile) */}
            <div>
              <p className="px-6 text-[11px] font-semibold text-[#605e5c] uppercase tracking-wider mb-2">Configuration</p>
              {menuItems.filter(item => item.name === 'Profile').map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-[#0078d4]' : 'text-[#605e5c]'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Bottom - Professional Profile Area */}
          <div className="p-4 border-t border-[#edebe9] bg-[#faf9f8]">
            <div className="flex items-center gap-3 p-2 mb-2 rounded-sm hover:bg-[#edebe9] transition-colors cursor-default group">
                <div className="w-8 h-8 bg-[#323130] text-white rounded-sm flex items-center justify-center font-semibold text-xs shadow-sm group-hover:bg-[#0078d4] transition-colors">
                    {user.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold text-[#323130] truncate">{user.name}</span>
                    <span className="text-[10px] font-medium text-[#605e5c] truncate uppercase">{user.role}</span>
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
              className="w-full flex items-center gap-3 px-3 py-2 text-[#a4262c] hover:bg-[#fde7e9] rounded-sm font-semibold text-[13px] transition-all group"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
