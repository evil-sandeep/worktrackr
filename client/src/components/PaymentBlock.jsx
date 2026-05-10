import React from 'react';
import { ShieldAlert, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentBlock = ({ title = "Section Restricted", message = "Full account activation is required to access this feature." }) => {
  return (
    <div className="flex-1 w-full h-full min-h-[400px] flex items-center justify-center p-6 bg-[#FAF9F8]">
      <div className="max-w-md w-full bg-white border border-[#EDEBE9] rounded-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-[#11100F] p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#0078D4]"></div>
          <div className="w-20 h-20 bg-[#323130] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl">
            <Lock className="h-10 w-10 text-[#0078D4] animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-2">{title}</h2>
          <div className="flex items-center justify-center gap-2 px-3 py-1 bg-[#0078D4]/20 rounded-full border border-[#0078D4]/30 w-fit mx-auto mb-4">
             <ShieldAlert className="h-3.5 w-3.5 text-[#0078D4]" />
             <span className="text-[10px] font-bold text-[#0078D4] uppercase tracking-widest">Activation Required</span>
          </div>
        </div>
        
        <div className="p-8 text-center space-y-6">
          <p className="text-[#605E5C] text-sm font-medium leading-relaxed">
            {message} Please complete the mandatory activation fee of 2000 units to unlock all enterprise features.
          </p>
          
          <div className="p-4 bg-[#F3F2F1] rounded-sm border border-[#EDEBE9] text-left">
             <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-4 w-4 text-[#323130]" />
                <span className="text-[11px] font-bold text-[#323130] uppercase tracking-wider">Payment Details</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-[#605E5C]">Activation Fee</span>
                <span className="text-[#323130] font-bold">2000 Units</span>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              to="/profile" 
              className="w-full py-3 bg-[#0078D4] hover:bg-[#005A9E] text-white rounded-sm font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              Contact Administrator
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[10px] font-bold text-[#A19F9D] uppercase tracking-widest">
              Access will be granted immediately after verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentBlock;
