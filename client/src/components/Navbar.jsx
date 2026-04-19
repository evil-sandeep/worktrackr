import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, Check, Trash2, Clock as ClockIcon } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = ({ toggleSidebar }) => {
  const user = authService.getCurrentUser();
  const { notifications, markAllNotificationsRead, clearNotifications } = useUI();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 px-8 py-4 flex items-center justify-between shadow-sm">
      
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-3 text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-sm transition-all active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>
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
                  <button 
                    onClick={clearNotifications}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                    title="Clear All"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
                        <div key={n.id} className={`p-6 hover:bg-slate-50/80 transition-colors flex gap-4 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            n.type === 'success' ? 'bg-green-100 text-green-600' : 
                            n.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {n.type === 'success' ? <Check size={18} /> : <Bell size={18} />}
                          </div>
                          <div className="space-y-1">
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

        <div className="flex items-center space-x-4 pl-6 border-l border-slate-200">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-sm font-black text-slate-900 leading-tight mb-0.5">{user?.name || 'Account'}</span>
            <div className="flex items-center justify-end gap-1.5 leading-none">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
            </div>
          </div>
          
          <Link to="/profile" className="flex items-center gap-2 p-1 group">
            <div className="relative">
               <div className="absolute inset-0 bg-blue-600/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
               <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-500/20 ring-2 ring-white overflow-hidden relative z-10">
                  {user?.profileImg ? (
                    <img src={user.profileImg} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    (user?.name?.charAt(0) || 'U')
                  )}
               </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-y-0.5 transition-all hidden sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
