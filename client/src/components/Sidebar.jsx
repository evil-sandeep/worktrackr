import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import authService from '../services/authService';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Attendance', icon: Calendar, path: '#' },
    { name: 'Notifications', icon: Bell, path: '#' },
    { name: 'Settings', icon: Settings, path: '#' },
  ];

  if (!user) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full p-6">
          
          {/* Logo */}
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <LayoutDashboard className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight">WorkTrackr</span>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center group px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-white' : 'group-hover:text-blue-600'}`} />
                  <span className="font-bold text-sm flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout (Desktop Sidebar Bottom) */}
          <div className="mt-auto pt-6 border-t border-slate-50">
            <div className="bg-slate-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs capitalize">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-800 truncate max-w-[140px]">{user.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                authService.logout();
                window.location.reload();
              }}
              className="w-full flex items-center px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-2xl font-bold text-sm transition-all group"
            >
              <LogOut className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform" />
              <span>Log out</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
