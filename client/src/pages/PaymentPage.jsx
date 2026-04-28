import React, { useState } from 'react';
import { CreditCard, ShieldCheck, AlertTriangle, ArrowRight, LogOut, CheckCircle2, IndianRupee } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';
import { useUI } from '../context/UIContext';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast, showLoader } = useUI();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const empId = searchParams.get('userId');
  const empName = searchParams.get('userName');
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const handlePayment = async () => {
    if (!empId) {
      addToast('No employee specified for payment', 'error');
      return;
    }

    showLoader(true);
    try {
      await adminService.markAsPaid(empId);
      setIsSuccess(true);
      addToast(`Payment of ₹2,000 for ${empName} successful`, 'success');
      
      // Auto redirect back after 3 seconds
      setTimeout(() => {
        navigate('/superadmindashboard');
      }, 3000);
    } catch (error) {
      addToast(error.response?.data?.message || 'Payment failed', 'error');
    } finally {
      showLoader(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-poppins">
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Successful</h1>
          <p className="text-slate-500 font-bold text-sm">
            ₹2,000 has been debited and <span className="text-indigo-600">{empName}</span> is now authorized for the platform.
          </p>
          <div className="pt-4">
             <button 
                onClick={() => navigate('/superadmindashboard')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all"
             >
                Return to Dashboard
             </button>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Redirecting in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-poppins">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>
      
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 text-center space-y-8">
          {/* Status Icon */}
          <div className="relative inline-block">
             <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center">
                <CreditCard className="h-10 w-10 text-indigo-500" />
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
             </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Authorization Payment</h1>
             <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm mx-auto">
                {empId ? (
                  <>You are authorizing license for <span className="text-indigo-600">{empName}</span>.</>
                ) : (
                  <>Subscription required for account access.</>
                )}
             </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-3 text-left">
             <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Amount</p>
                    <p className="text-xl font-black text-slate-900">₹2,000.00</p>
                  </div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  One-time
                </div>
             </div>
          </div>

          {/* Action */}
          <div className="space-y-4 pt-4">
             <button 
                onClick={handlePayment}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-indigo-600 hover:shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
             >
                <span>Authorize Payment</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
             </button>
             
             <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mx-auto text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest transition-colors"
             >
                <span>Cancel & Go Back</span>
             </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Version</span>
              <span className="text-[10px] font-bold text-slate-900">v2.4.0-Enterprise</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Gateway</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           </div>
        </div>
      </div>

      <p className="mt-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-40">Secured by WorkTrackr Protocol</p>
    </div>
  );
};

export default PaymentPage;
