import React from 'react';
import { Menu, Bell, Search, ChevronDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = ({ toggleSidebar }) => {
  const user = authService.getCurrentUser();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 px-8 py-4 flex items-center justify-between shadow-sm">
      
      {/* Left: Toggle & Search */}
      <div className="flex items-center flex-1 max-w-2xl gap-6">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-3 text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-sm transition-all active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative group hidden sm:block w-full max-w-md">
          <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-focus-within:bg-blue-500/10 transition-all duration-500"></div>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors relative z-10" />
          <input 
            type="text" 
            placeholder="Search across workspace..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-transparent rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all outline-none relative z-10"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-6">
        <div className="hidden md:flex items-center px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl gap-2">
           <Sparkles className="h-3.5 w-3.5 text-amber-600" />
           <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Premium Plan</span>
        </div>

        <button className="p-3 text-slate-500 hover:bg-slate-50 rounded-2xl transition-all relative group border border-transparent hover:border-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform shadow-sm"></span>
        </button>

        <div className="flex items-center space-x-4 pl-6 border-l border-slate-200">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-sm font-black text-slate-900 leading-tight mb-0.5">{user.name}</span>
            <div className="flex items-center justify-end gap-1.5 leading-none">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
            </div>
          </div>
          
          <Link to="/profile" className="flex items-center gap-2 p-1 group">
            <div className="relative">
               <div className="absolute inset-0 bg-blue-600/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
               <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-500/20 ring-2 ring-white overflow-hidden relative z-10">
                  {user.profileImg ? (
                    <img src={user.profileImg} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
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
