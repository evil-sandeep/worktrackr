import React from 'react';
import { Menu, Bell, Search, User, ChevronDown } from 'lucide-react';
import authService from '../services/authService';

const Navbar = ({ toggleSidebar }) => {
  const user = authService.getCurrentUser();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm shadow-slate-200/20">
      
      {/* Search & Toggle */}
      <div className="flex items-center flex-1 max-w-2xl gap-4">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2.5 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative group hidden sm:block w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search activity..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      {/* Tools & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-5">
        <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative group">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full group-hover:scale-110 transition-transform"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 sm:pl-6 border-l border-slate-100">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-black text-slate-900 leading-none mb-1">{user.name}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.role} workspace</span>
          </div>
          <button className="flex items-center gap-1 p-1 hover:bg-slate-50 rounded-2xl transition-all group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200 ring-2 ring-white overflow-hidden">
               {user.name.charAt(0)}
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
