import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  CalendarCheck,
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Shield,
  X
} from 'lucide-react';
import authService from '../services/authService';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Attendance', icon: CalendarCheck, path: '#' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
  ];

  if (user && user.role === 'admin') {
    menuItems.push({ name: 'Admin', icon: Shield, path: '/admin' });
  }

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
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200/60 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-500 ease-out shadow-2xl lg:shadow-none`}>
        <div className="flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3 transform hover:rotate-0 transition-transform duration-300">
                  <ShieldCheck className="text-white h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 tracking-tighter">WorkTrackr</span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Enterprise</span>
                </div>
              </div>
              <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 opacity-50">Operations</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center group px-4 py-4 rounded-2xl transition-all duration-300 ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 translate-x-1' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-all duration-300 ${isActive ? 'text-white' : 'group-hover:text-blue-600 group-hover:scale-110'}`} />
                  <span className="font-bold text-sm flex-1 tracking-tight">{item.name}</span>
                  {isActive ? (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  ) : (
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Bottom - Professional Logout */}
          <div className="p-6 mt-auto border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center p-3 mb-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 rounded-xl flex items-center justify-center font-black text-xs uppercase overflow-hidden ring-2 ring-white">
                    {user.name.charAt(0)}
                </div>
                <div className="flex flex-col ml-3 overflow-hidden">
                    <span className="text-sm font-black text-slate-900 truncate tracking-tight leading-tight">{user.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</span>
                </div>
            </div>
            
            <button 
              onClick={() => {
                authService.logout();
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black text-sm transition-all shadow-sm hover:shadow-lg hover:shadow-red-200 group active:scale-95"
            >
              <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
