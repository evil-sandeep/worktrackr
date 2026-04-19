import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, Check, Trash2, Clock as ClockIcon, X, UserCircle, LogOut } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = ({ toggleSidebar }) => {
  const user = authService.getCurrentUser();
  const { notifications, markAllNotificationsRead, clearNotifications, removeNotification } = useUI();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 h-16 flex items-center justify-between shrink-0">
      
      {/* Left Area: Mobile Toggle & Greeting */}
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Welcome, <span className="text-indigo-600">{user?.name?.split(' ')[0] || 'User'}</span>
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Session</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-6">
        
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAllNotificationsRead();
            }}
            className={`p-3 rounded-2xl transition-all relative group border ${showNotifications ? 'bg-blue-50 border-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-50 border-transparent hover:border-slate-100'}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm animate-in zoom-in duration-300">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-4 w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-4 duration-300">
                <div className="px-6 py-5 bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
                       <Bell className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-widest">Protocol Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={clearNotifications}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                      title="Clear All"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto opacity-50">
                         <Bell className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empty Signal</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-6 hover:bg-slate-50/80 transition-all border-b border-slate-50 relative group/item ${!n.read ? 'bg-blue-50/30' : ''}`}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(n.id);
                            }}
                            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all z-10"
                            title="Remove Alert"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              n.type === 'success' ? 'bg-green-100 text-green-600' : 
                              n.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {n.type === 'success' ? <Check size={18} /> : <Bell size={18} />}
                            </div>
                            <div className="space-y-1 pr-6">
                              <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{n.title}</p>
                              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{n.message}</p>
                              <div className="flex items-center gap-1.5 pt-1">
                                 <ClockIcon className="h-3 w-3 text-slate-300" />
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                   {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                   <button className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">
                      Historical Operations Log
                   </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
          <div className="relative">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all group"
            >
              <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-md">
                {user?.profileImg ? (
                  <img src={user.profileImg} alt={user?.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Info</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] font-medium text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-xs font-semibold"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <UserCircle size={16} />
                    View Profile
                  </Link>
                  <button 
                    onClick={() => {
                      const confirmed = window.confirm('Are you sure you want to sign out?');
                      if (confirmed) {
                        authService.logout();
                        window.location.reload();
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500 hover:bg-rose-50 transition-colors text-xs font-semibold text-left"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
