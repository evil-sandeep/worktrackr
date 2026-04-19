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
  Calendar
} from 'lucide-react';
import authService from '../services/authService';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  const allMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admindashboard', roles: ['admin'] },
    { name: 'Employees', icon: Users, path: '/employee', roles: ['admin'] },
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
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 opacity-70">Main Menu</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center group px-4 py-3 rounded-lg transition-all relative ${isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {/* Left Border Active State */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-md"></div>
                  )}

                  <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-indigo-600' : 'group-hover:text-indigo-600'}`} />
                  <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                </Link>
              );
            })}
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
