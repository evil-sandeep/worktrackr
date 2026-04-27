import React from 'react';
import { CreditCard, ShieldCheck, AlertTriangle, ArrowRight, LogOut } from 'lucide-react';
import authService from '../services/authService';

const PaymentPage = () => {
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-poppins">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>
      
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 text-center space-y-8">
          {/* Status Icon */}
          <div className="relative inline-block">
             <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-slate-400" />
             </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscription Required</h1>
             <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm mx-auto">
                Hello <span className="text-blue-600">@{user?.name}</span>, your account initialization is complete, but access to the secure terminal requires an active subscription.
             </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-3 text-left">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                   <ShieldCheck size={16} />
                </div>
                <div>
                   <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Enterprise Access</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Full biometric & tracking protocol</p>
                </div>
             </div>
          </div>

          {/* Action */}
          <div className="space-y-4 pt-4">
             <button 
                onClick={() => window.alert('Payment gateway integration coming soon!')}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
             >
                <span>Authorize Payment</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
             </button>
             
             <button 
                onClick={handleLogout}
                className="flex items-center gap-2 mx-auto text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-colors"
             >
                <LogOut size={12} />
                <span>Return to Login</span>
             </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Version</span>
              <span className="text-[10px] font-bold text-slate-900">v2.4.0-Enterprise</span>
           </div>
           <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
           </div>
        </div>
      </div>

      <p className="mt-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-40">Secured by WorkTrackr Protocol</p>
    </div>
  );
};

export default PaymentPage;
