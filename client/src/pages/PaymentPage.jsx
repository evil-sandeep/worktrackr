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
      <div className="min-h-screen bg-[#F3F2F1] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[#EDEBE9] shadow-xl p-10 text-center space-y-6 animate-in fade-in duration-500 rounded-none">
          <div className="w-20 h-20 bg-[#DFF6DD] rounded-sm flex items-center justify-center mx-auto border border-[#107C10]/10">
            <CheckCircle2 className="h-10 w-10 text-[#107C10]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#323130] tracking-tight uppercase">Provisioning Successful</h1>
            <p className="text-[#605E5C] font-semibold text-xs leading-relaxed uppercase tracking-wider">
              Asset authorized. Identity <span className="text-[#0078D4]">{empName}</span> is now active in the fleet.
            </p>
          </div>
          <div className="pt-4">
             <button 
                onClick={() => navigate('/superadmindashboard')}
                className="w-full py-3 bg-[#0078D4] text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-[#005A9E] transition-all shadow-sm"
             >
                Return to Control Plane
             </button>
          </div>
          <p className="text-[9px] text-[#A19F9D] font-bold uppercase tracking-widest">Automatic redirect in sequence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#EDEBE9] shadow-2xl overflow-hidden animate-in fade-in duration-500 rounded-none">
        {/* Azure Status Bar */}
        <div className="h-1 w-full bg-[#0078D4]"></div>
        
        <div className="p-10 text-center space-y-8">
          {/* Identity/Payment Node */}
          <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-[#FAF9F8] rounded-sm flex items-center justify-center border border-[#EDEBE9] relative shadow-sm">
                <CreditCard className="h-8 w-8 text-[#0078D4]" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-[#EDEBE9] rounded-sm shadow-md flex items-center justify-center">
                   <ShieldCheck className="h-4 w-4 text-[#107C10]" />
                </div>
             </div>
             <div className="space-y-1">
               <h1 className="text-lg font-bold text-[#323130] uppercase tracking-tight">Resource Authorization</h1>
               <p className="text-[10px] font-bold text-[#605E5C] uppercase tracking-widest">
                 Provisioning License for node: <span className="text-[#0078D4]">{empName}</span>
               </p>
             </div>
          </div>

          {/* Billing Detail Table */}
          <div className="bg-[#FAF9F8] border border-[#EDEBE9] p-4 text-left space-y-3">
             <div className="flex justify-between items-center border-b border-[#EDEBE9] pb-2">
                <span className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider">SKU Description</span>
                <span className="text-[10px] font-bold text-[#323130] uppercase">Enterprise Seat</span>
             </div>
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest mb-1">Billing Amount</p>
                   <p className="text-2xl font-bold text-[#323130]">₹2,000.00</p>
                </div>
                <div className="bg-[#DEECF9] text-[#0078D4] px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border border-[#0078D4]/10">
                  Fixed Asset Fee
                </div>
             </div>
          </div>

          {/* Execution Actions */}
          <div className="space-y-4 pt-2">
             <button 
                onClick={handlePayment}
                className="w-full py-4 bg-[#0078D4] text-white rounded-sm font-bold text-[11px] uppercase tracking-widest shadow-sm hover:bg-[#005A9E] transition-all flex items-center justify-center gap-3 group"
             >
                Commit Authorization
                <ArrowRight className="h-4 w-4" />
             </button>
             
             <button 
                onClick={() => navigate(-1)}
                className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider hover:text-[#323130] transition-colors underline decoration-[#EDEBE9] underline-offset-4"
             >
                Abort Provisioning
             </button>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="px-10 py-5 bg-[#FAF9F8] border-t border-[#EDEBE9] flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[8px] font-bold text-[#A19F9D] uppercase tracking-widest">Schema Hash</span>
              <span className="text-[9px] font-bold text-[#323130] uppercase">AZ-882-SYS</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#107C10] rounded-full"></div>
              <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Security Link Verified</span>
           </div>
        </div>
      </div>

      <p className="mt-8 text-[8px] font-bold text-[#A19F9D] uppercase tracking-[0.4em] opacity-50">Microsoft Azure Enterprise Billing Protocol v2.1</p>
    </div>
  );
};

export default PaymentPage;
