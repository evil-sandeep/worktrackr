import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, Check, Trash2, Clock as ClockIcon, X, UserCircle, LogOut, AlertCircle, XCircle } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';



const Navbar = ({ toggleSidebar }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();
  const { notifications, markAllNotificationsRead, clearNotifications, removeNotification, calendarStats } = useUI();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isCalendar = location.pathname === '/calendar';

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-[#0078D4] text-white px-6 h-12 flex items-center justify-between shrink-0 shadow-md">
      
      {/* Left Area: Mobile Toggle & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-1.5 text-white hover:bg-white/10 rounded-sm transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold tracking-tight">WorkTrackr</span>
          <span className="hidden sm:block text-[14px] font-light text-white/60">|</span>
          <span className="hidden sm:block text-[12px] font-medium text-white/90">
            {location.pathname === '/superadmindashboard' ? 'Super Admin' : 
             location.pathname === '/admindashboard' ? 'Admin Center' : 'Staff Portal'}
          </span>
        </div>
      </div>

      {/* Right Area: Profile & Notifications */}
      <div className="flex items-center gap-1">
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAllNotificationsRead();
            }}
            className={`p-2 rounded-none transition-all relative hover:bg-white/10 ${showNotifications ? 'bg-white/20' : ''}`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#E81123] border border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-0 w-80 bg-white shadow-xl border border-[#EDEBE9] z-50 animate-in fade-in duration-200">
                <div className="px-4 py-2 border-b border-[#EDEBE9] bg-[#FAF9F8] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#323130] uppercase tracking-wider">Notifications</span>
                  <button onClick={clearNotifications} className="text-[10px] text-[#0078D4] hover:underline font-semibold">Clear all</button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#605E5C] text-[11px]">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-3 border-b border-[#EDEBE9] hover:bg-[#F3F2F1] relative group">
                        <p className="text-[11px] font-bold text-[#323130]">{n.title}</p>
                        <p className="text-[10px] text-[#605E5C]">{n.message}</p>
                        <button 
                          onClick={() => removeNotification(n.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-[#605E5C] hover:text-[#E81123]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Area */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`flex items-center gap-2 px-3 h-12 hover:bg-white/10 transition-colors ${showProfileDropdown ? 'bg-white/20' : ''}`}
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold">
              {user.name.charAt(0)}
            </div>
            <span className="hidden sm:block text-[12px] font-medium">{user.email}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showProfileDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)}></div>
              <div className="absolute right-0 mt-0 w-64 bg-white shadow-2xl border border-[#EDEBE9] z-50 animate-in fade-in duration-200">
                <div className="p-4 bg-[#FAF9F8] border-b border-[#EDEBE9]">
                  <p className="text-[12px] font-bold text-[#323130] truncate">{user.name}</p>
                  <p className="text-[11px] text-[#605E5C] truncate">{user.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-[#DEECF9] text-[#0078D4] text-[9px] font-bold uppercase rounded-sm">
                    {user.role}
                  </span>
                </div>
                <div className="p-1">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-3 py-2 text-[12px] text-[#323130] hover:bg-[#F3F2F1] transition-colors"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <UserCircle size={14} className="text-[#605E5C]" />
                    My Account
                  </Link>
                  <button 
                    onClick={() => {
                      if (window.confirm('Sign out?')) {
                        authService.logout();
                        window.location.reload();
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-[#A4262C] hover:bg-[#FDE7E9] transition-colors text-left"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
