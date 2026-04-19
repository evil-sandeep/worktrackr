import React from 'react';
import VisitFlow from '../components/VisitFlow/VisitFlow';
import authService from '../services/authService';
import { Store, ShieldCheck } from 'lucide-react';

const StoreVisit = () => {
    const user = authService.getCurrentUser();

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <p className="subheading-premium">Operational Hub</p>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-[-0.04em]">
                        Site <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Verification</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-[11px] uppercase tracking-widest opacity-70">
                        Protocol System 02: Store Audit and Compliance
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="glass-premium px-6 py-3 rounded-2xl border-white/40 flex flex-col items-end">
                        <span className="subheading-premium !text-[8px]">Session Auth</span>
                        <span className="text-sm font-black text-slate-900 tabular-nums">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <VisitFlow />
                </div>
                
                <div className="space-y-8">
                    <div className="card-premium p-10 bg-slate-900 text-white relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                                <ShieldCheck className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="heading-premium !text-white !text-sm uppercase tracking-widest">Compliance Rule</h3>
                                <p className="text-[11px] text-white/50 leading-relaxed">
                                    All store visits must be verified with active GPS locking and multi-angle photographic evidence. Failure to sync results in session invalidation.
                                </p>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[80px]"></div>
                    </div>

                    <div className="card-premium p-10 border-slate-100/60 flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Store className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="heading-premium !text-sm uppercase">Audit Intelligence</h3>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-widest">
                                Your data is encrypted and synchronized with enterprise cloud nodes in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreVisit;
