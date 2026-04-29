import React from 'react';
import VisitFlow from '../components/VisitFlow/VisitFlow';
import authService from '../services/authService';
import { Store, ShieldCheck, Activity, Globe, Info } from 'lucide-react';

const StoreVisit = () => {
    const user = authService.getCurrentUser();

    return (
        <div className="min-h-screen bg-[#FAF9F8] p-6 space-y-6 animate-in fade-in duration-500 font-sans">
            {/* Enterprise Header */}
            <div className="bg-white border border-[#EDEBE9] p-6 shadow-sm rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#0078D4] text-[12px] font-semibold uppercase tracking-wider mb-1">
                        <Globe className="h-3 w-3" />
                        Operational Identity Hub
                    </div>
                    <h1 className="text-[28px] font-semibold text-[#323130] tracking-tight leading-tight">
                        Site Operational Audit
                    </h1>
                    <p className="text-[14px] text-[#605E5C] max-w-xl">
                        Verify on-site presence and compliance protocols via cryptographic evidence and geographic telemetry.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-12 w-[1px] bg-[#EDEBE9] hidden md:block"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-[11px] font-bold text-[#605E5C] uppercase tracking-widest">Active Session</span>
                        <span className="text-[16px] font-semibold text-[#323130] tabular-nums">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Action Area */}
                <div className="lg:col-span-3 bg-white border border-[#EDEBE9] shadow-sm rounded-sm overflow-hidden min-h-[600px] flex flex-col">
                    <div className="bg-[#FAF9F8] border-b border-[#EDEBE9] px-6 py-3 flex items-center justify-between">
                        <span className="text-[12px] font-bold text-[#323130] uppercase tracking-wider flex items-center gap-2">
                            <Activity className="h-4 w-4 text-[#0078D4]" />
                            Flow Sequence: Protocol 02A
                        </span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-[#107C10] rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-[#605E5C] uppercase">Live Sync</span>
                        </div>
                    </div>
                    <div className="flex-1 p-8">
                        <VisitFlow />
                    </div>
                </div>
                
                {/* Information Sidebar */}
                <div className="space-y-6">
                    {/* Compliance Card */}
                    <div className="bg-[#11100F] p-6 text-white rounded-sm shadow-xl relative overflow-hidden group">
                        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#0078D4] opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-[#0078D4] rounded-sm flex items-center justify-center text-white shadow-lg">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[12px] font-bold text-[#0078D4] uppercase tracking-widest">Compliance Protocol</h3>
                                <p className="text-[13px] text-[#D2D0CE] leading-relaxed font-medium">
                                    All site audits require dual-angle photographic verification and GPS coordinate locking for valid transmission.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white border border-[#EDEBE9] p-6 rounded-sm shadow-sm hover:border-[#0078D4] transition-colors duration-300">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-[#F3F9FF] rounded-sm flex items-center justify-center text-[#0078D4] shrink-0">
                                <Store className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-bold text-[#323130] uppercase tracking-wider">Site Status</h3>
                                <p className="text-[14px] text-[#107C10] font-semibold">Authorized Access</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-[#EDEBE9]">
                            <div className="flex justify-between items-center text-[12px]">
                                <span className="text-[#605E5C]">Encryption</span>
                                <span className="text-[#323130] font-semibold">AES-256</span>
                            </div>
                            <div className="flex justify-between items-center text-[12px]">
                                <span className="text-[#605E5C]">Signal Strength</span>
                                <span className="text-[#107C10] font-bold">Excellent</span>
                            </div>
                        </div>
                    </div>

                    {/* Telemetry Card */}
                    <div className="bg-[#FAF9F8] border border-[#EDEBE9] p-6 rounded-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-bold text-[#605E5C] uppercase tracking-widest">Resource Telemetry</h4>
                            <Info className="h-3 w-3 text-[#A19F9D]" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[12px] font-medium">
                                    <span className="text-[#323130]">GPS Integrity</span>
                                    <span className="text-[#0078D4]">98%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#EDEBE9] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#0078D4] w-[98%] transition-all duration-1000"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[12px] font-medium">
                                    <span className="text-[#323130]">Sync Latency</span>
                                    <span className="text-[#107C10]">14ms</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#EDEBE9] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#107C10] w-[15%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreVisit;
