import React, { useState } from 'react';
import { CreditCard, ShieldCheck, ArrowRight, CheckCircle2, Printer } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import useRazorpay from '../hooks/useRazorpay';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast, showLoader } = useUI();
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnDetails, setTxnDetails] = useState(null);
  const { initPayment } = useRazorpay();
  
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  const orgId = searchParams.get('orgId');
  const orgName = searchParams.get('orgName') || 'WorkTrackr Cloud';
  const empId = searchParams.get('empId') || 'N/A';
  const user = authService.getCurrentUser();

  const handlePayment = async () => {
    if (!userId) {
      addToast('No employee specified for payment', 'error');
      return;
    }

    const isOrgActivation = userId === orgId;

    initPayment({
      amount: 2000,
      orgName: orgName,
      userName: userName || user?.name || 'Guest User',
      userEmail: user?.email || 'support@worktrackr.com',
      userPhone: user?.phone || '9999999999',
      orgId: orgId,
      type: isOrgActivation ? 'license_activation' : 'employee_activation',
      targetId: userId,
      onSuccess: (verification) => {
        const details = {
          txnId: verification.paymentId,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          amount: '₹2,000.00',
          status: 'SUCCESS'
        };
        setTxnDetails(details);
        setIsSuccess(true);
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isSuccess && txnDetails) {
    return (
      <div className="min-h-screen bg-[#F3F2F1] flex flex-col items-center justify-center p-6 print:bg-white print:p-0">
        <div className="w-full max-w-xl bg-white border border-[#EDEBE9] shadow-2xl overflow-hidden rounded-none print:shadow-none print:border-none animate-in zoom-in-95 duration-500">
          {/* Receipt Header */}
          <div className="bg-[#11100F] p-8 text-white flex justify-between items-start">
             <div>
                <h1 className="text-[22px] font-bold tracking-tight uppercase mb-1">Transaction Receipt</h1>
                <p className="text-[10px] font-bold text-[#A19F9D] uppercase tracking-[0.3em]">WorkTrackr Identity Protocol</p>
             </div>
             <div className="w-12 h-12 bg-[#0078D4] flex items-center justify-center rounded-sm">
                <CheckCircle2 className="h-7 w-7 text-white" />
             </div>
          </div>

          <div className="p-10 space-y-8">
            {/* Main Receipt Content */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
               <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Organization</span>
                  <p className="text-[14px] font-bold text-[#323130] uppercase">{orgName}</p>
               </div>
               <div className="space-y-1 text-right">
                  <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Transaction ID</span>
                  <p className="text-[14px] font-bold text-[#0078D4] tabular-nums">{txnDetails.txnId}</p>
               </div>
               <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Employee Name</span>
                  <p className="text-[14px] font-bold text-[#323130]">{userName}</p>
               </div>
               <div className="space-y-1 text-right">
                  <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Employee ID</span>
                  <p className="text-[14px] font-bold text-[#323130]">{empId}</p>
               </div>
               <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Provisioning Date</span>
                  <p className="text-[14px] font-bold text-[#323130] tabular-nums">{txnDetails.date} | {txnDetails.time}</p>
               </div>
               <div className="space-y-1 text-right">
                  <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Authorization Fee</span>
                  <p className="text-[14px] font-bold text-[#107C10] tabular-nums">{txnDetails.amount}</p>
               </div>
            </div>

            {/* Verification Footer */}
            <div className="pt-8 border-t border-dashed border-[#EDEBE9] space-y-4">
               <div className="flex items-center gap-3 bg-[#FAF9F8] p-4 border border-[#EDEBE9]">
                  <ShieldCheck className="h-5 w-5 text-[#107C10]" />
                  <div>
                    <p className="text-[11px] font-bold text-[#323130] uppercase">Cryptographically Verified</p>
                    <p className="text-[9px] text-[#605E5C] font-medium leading-relaxed">This asset has been successfully provisioned and authorized for cloud-native attendance tracking under the parent organization directory.</p>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 print:hidden">
               <button 
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-[#323130] text-white rounded-sm font-bold text-[11px] uppercase tracking-widest hover:bg-[#11100F] transition-all flex items-center justify-center gap-2"
               >
                  <Printer className="h-4 w-4" />
                  Print Receipt
               </button>
               <button 
                  onClick={() => navigate('/orgadmin/dashboard')}
                  className="flex-1 py-3 bg-[#0078D4] text-white rounded-sm font-bold text-[11px] uppercase tracking-widest hover:bg-[#005A9E] transition-all flex items-center justify-center gap-2"
               >
                  Continue to Dashboard
                  <ArrowRight className="h-4 w-4" />
               </button>
            </div>
          </div>
          
          <div className="bg-[#FAF9F8] border-t border-[#EDEBE9] px-10 py-4 text-center">
             <p className="text-[8px] font-bold text-[#A19F9D] uppercase tracking-[0.4em]">WorkTrackr Identity Management System v2.1</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#EDEBE9] shadow-2xl overflow-hidden animate-in fade-in duration-500 rounded-none">
        <div className="h-1.5 w-full bg-[#0078D4]"></div>
        
        <div className="p-10 text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-[#FAF9F8] rounded-sm flex items-center justify-center border border-[#EDEBE9] relative shadow-sm">
                <CreditCard className="h-8 w-8 text-[#0078D4]" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-[#EDEBE9] rounded-sm shadow-md flex items-center justify-center">
                   <ShieldCheck className="h-4 w-4 text-[#107C10]" />
                </div>
             </div>
             <div className="space-y-1">
               <h1 className="text-xl font-bold text-[#323130] uppercase tracking-tight">Identity Provisioning</h1>
               <p className="text-[10px] font-bold text-[#605E5C] uppercase tracking-widest">
                 Authorizing asset: <span className="text-[#0078D4]">{userName}</span>
               </p>
             </div>
          </div>

          <div className="bg-[#FAF9F8] border border-[#EDEBE9] p-5 text-left space-y-4">
             <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Organization Domain</span>
                <p className="text-[12px] font-bold text-[#323130] uppercase truncate">{orgName}</p>
             </div>
             <div className="h-[1px] bg-[#EDEBE9] w-full"></div>
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest mb-1">Authorization Fee</p>
                   <p className="text-3xl font-bold text-[#323130]">₹2,000.00</p>
                </div>
                <div className="bg-[#DEECF9] text-[#0078D4] px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border border-[#0078D4]/20">
                  Per Seat License
                </div>
             </div>
          </div>

          <div className="space-y-4 pt-2">
             <button 
                onClick={handlePayment}
                className="w-full py-4 bg-[#0078D4] text-white rounded-sm font-bold text-[11px] uppercase tracking-widest shadow-sm hover:bg-[#005A9E] transition-all flex items-center justify-center gap-3 group"
             >
                Confirm Payment
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
             </button>
             
             <button 
                onClick={() => navigate(-1)}
                className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider hover:text-[#323130] transition-colors underline decoration-[#EDEBE9] underline-offset-4"
             >
                Abort Transaction
             </button>
          </div>
        </div>

        <div className="px-10 py-5 bg-[#FAF9F8] border-t border-[#EDEBE9] flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[8px] font-bold text-[#A19F9D] uppercase tracking-widest">Asset Tag</span>
              <span className="text-[9px] font-bold text-[#323130] uppercase">{empId}</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#107C10] rounded-full"></div>
              <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Secure Link</span>
           </div>
        </div>
      </div>

      <p className="mt-8 text-[8px] font-bold text-[#A19F9D] uppercase tracking-[0.4em] opacity-50">WorkTrackr Secure Payment Protocol v2.1</p>
    </div>
  );
};

export default PaymentPage;
