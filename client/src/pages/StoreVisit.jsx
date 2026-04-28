import React from 'react';
import VisitFlow from '../components/VisitFlow/VisitFlow';
import authService from '../services/authService';
import { Store, ShieldCheck } from 'lucide-react';

const StoreVisit = () => {
    const user = authService.getCurrentUser();

    return (
        <div className="space-y-6 pb-4 animate-in fade-in duration-300 h-full flex flex-col bg-[#F3F2F1] p-6">
            {/* Azure Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDEBE9] pb-4 bg-white -mx-6 -mt-6 px-6 py-4">
                <div className="space-y-1">
                    <h1 className="text-[20px] font-semibold text-[#323130] tracking-tight">
                        Site Operational Audit
                    </h1>
                    <p className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider">
                        Protocol 02: Verification & Compliance
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-[#FAF9F8] border border-[#EDEBE9] px-4 py-2 rounded-sm flex flex-col items-end">
                        <span className="text-[9px] font-bold text-[#605E5C] uppercase">Deployment Session</span>
                        <span className="text-[11px] font-bold text-[#323130] tabular-nums">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-3 h-full min-h-0 bg-white border border-[#EDEBE9] rounded-sm p-4 shadow-sm overflow-y-auto">
                    <VisitFlow />
                </div>
                
                <div className="space-y-4 h-full">
                    <div className="bg-[#11100F] p-6 text-white border border-[#1B1A19] rounded-sm shadow-xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-[#0078D4] rounded-sm flex items-center justify-center border border-[#005A9E] text-white">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Compliance Directives</h3>
                                <p className="text-[10px] text-[#A19F9D] leading-relaxed font-semibold italic">
                                    All site visits require verified GPS locking and cryptographic evidence for audit confirmation.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#EDEBE9] p-6 rounded-sm shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#DEECF9] rounded-sm flex items-center justify-center text-[#0078D4] border border-[#DEECF9] shrink-0">
                            <Store className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-[11px] font-bold text-[#323130] uppercase tracking-wider">Audit Context</h3>
                            <p className="text-[9px] text-[#107C10] font-bold leading-none uppercase tracking-widest">
                                Live-sync active.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#FAF9F8] border border-[#EDEBE9] p-4 rounded-sm flex flex-col gap-2">
                        <h4 className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Resource Telemetry</h4>
                        <div className="flex justify-between items-center text-[10px] font-semibold text-[#323130]">
                            <span>Signal Integrity</span>
                            <span className="text-[#107C10]">Nominal</span>
                        </div>
                        <div className="w-full h-1 bg-[#EDEBE9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#107C10] w-[94%]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreVisit;
