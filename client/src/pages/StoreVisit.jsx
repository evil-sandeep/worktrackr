import React from 'react';
import VisitFlow from '../components/VisitFlow/VisitFlow';
import authService from '../services/authService';
import { Store, ShieldCheck } from 'lucide-react';

const StoreVisit = () => {
    const user = authService.getCurrentUser();

    return (
        <div className="space-y-6 pb-4 animate-in fade-in duration-1000 h-full flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="space-y-1">
                    <p className="subheading-premium !mb-0.5">Operational Hub</p>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Site <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Verification</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest opacity-60">
                        Protocol 02: Audit and Compliance
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="glass-premium px-4 py-2 rounded-xl border-white/40 flex flex-col items-end">
                        <span className="subheading-premium !text-[7px]">Session Auth</span>
                        <span className="text-xs font-black text-slate-900 tabular-nums">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-2 h-full min-h-0">
                    <VisitFlow />
                </div>
                
                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 h-full">
                    <div className="card-premium p-6 bg-slate-900 text-white relative overflow-hidden group">
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 text-blue-400">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="heading-premium !text-white !text-[11px] uppercase tracking-widest">Compliance Rule</h3>
                                <p className="text-[10px] text-white/40 leading-relaxed">
                                    All store visits must be verified with active GPS locking and multi-angle photographic evidence.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card-premium p-6 border-slate-100/60 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                            <Store className="h-6 w-6" />
                        </div>
                        <div className="space-y-0.5 text-left">
                            <h3 className="heading-premium !text-[11px] uppercase">Audit Intelligence</h3>
                            <p className="text-[9px] text-slate-400 font-bold leading-none uppercase tracking-widest opacity-60">
                                Real-time encryption active.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreVisit;
