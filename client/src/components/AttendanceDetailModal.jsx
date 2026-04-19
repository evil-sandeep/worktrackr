import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  User,
  AlertCircle,
  LogOut,
  ArrowRight,
  Fingerprint,
  CheckCircle2,
  Camera
} from 'lucide-react';

const AttendanceDetailModal = ({ isOpen, onClose, record, date }) => {
  if (!isOpen) return null;

  const isCheckOutComplete = !!(record?.checkOut?.time || record?.checkoutTime);
  const checkInData = record?.checkIn || {
    imageUrl: record?.imageUrl,
    time: record?.time,
    location: record?.location
  };
  const checkOutData = record?.checkOut || {
    imageUrl: record?.checkoutImageUrl,
    time: record?.checkoutTime,
    location: record?.checkoutLocation
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">

        {/* Modal Header */}
        <div className="px-10 py-8 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-50 sticky top-0 z-20">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
              <Fingerprint className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="subheading-premium !mb-0.5">Session Archive</p>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Log Details</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-100 active:scale-95 border border-slate-100/50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">

          {record?.status === 'absent' ? (
            <div className="flex flex-col items-center justify-center space-y-8 py-16 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-[60px] animate-pulse"></div>
                <div className="w-32 h-32 bg-rose-50 rounded-[2.5rem] flex items-center justify-center border border-rose-100 shadow-xl relative z-10">
                  <AlertCircle className="h-16 w-16 text-rose-500" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">No Activity Logged</h3>
                <p className="text-slate-400 font-bold max-w-[320px] mx-auto text-[10px] leading-relaxed uppercase tracking-[0.2em]">
                  Attendance protocols were not initialized for {date}.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Status: Standby</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Shift Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
                        <Clock className="h-5 w-5 text-blue-400" />
                      </div>
                      <p className="subheading-premium !text-slate-400 !mb-0">Session Duration</p>
                    </div>
                    <p className="text-4xl font-black tracking-tighter">{record?.totalHours || record?.workingHours || 'In Progress'}</p>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{isCheckOutComplete ? 'Synchronized' : 'Active Log'}</p>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[80px]"></div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between group overflow-hidden relative">
                   <div className="space-y-8 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-lg font-black text-blue-600">₹</div>
                        <p className="subheading-premium !mb-0">Yield Accrued</p>
                      </div>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{record?.earning || 0}</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Payroll Verified</p>
                      </div>
                   </div>
                   <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full blur-[60px] group-hover:bg-blue-100/50 transition-all duration-700"></div>
                </div>
              </div>


              {/* Detailed Logs */}
              <div className="space-y-8 pt-4">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="subheading-premium !text-slate-300 !mb-0">Biometric Verification Nodes</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                {/* Entry Log */}
                <div className="card-premium !bg-slate-50/20 group hover:!bg-white hover:border-blue-100 shadow-sm transition-all duration-700">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-48 aspect-square rounded-[2rem] overflow-hidden bg-slate-950 border border-slate-200/50 shadow-inner shrink-0 relative">
                      <img
                        src={checkInData.imageUrl}
                        alt="Check-in biometric"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    
                    <div className="flex-1 py-2 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Entry Verification</span>
                         </div>
                         <span className="px-3 py-1 bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-green-100">Authenticated</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="space-y-1.5">
                            <p className="subheading-premium !text-[9px] !mb-0">Clock-In</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{checkInData.time}</p>
                         </div>
                         <div className="space-y-1.5">
                            <p className="subheading-premium !text-[9px] !mb-0">Lock Signal</p>
                            <p className="text-[10px] font-bold text-slate-500 line-clamp-2 uppercase tracking-tight">{checkInData.location}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exit Log */}
                {isCheckOutComplete ? (
                   <div className="card-premium !bg-slate-50/20 group hover:!bg-white hover:border-rose-100 shadow-sm transition-all duration-700">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-48 aspect-square rounded-[2rem] overflow-hidden bg-slate-950 border border-slate-200/50 shadow-inner shrink-0 relative">
                          <img
                            src={checkOutData.imageUrl}
                            alt="Check-out biometric"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                          />
                          <div className="absolute inset-0 bg-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        
                        <div className="flex-1 py-2 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Exit termination</span>
                            </div>
                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-green-100">Authenticated</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <p className="subheading-premium !text-[9px] !mb-0">Clock-Out</p>
                                <p className="text-xl font-black text-slate-900 tracking-tight">{checkOutData.time}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="subheading-premium !text-[9px] !mb-0">Lock Signal</p>
                                <p className="text-[10px] font-bold text-slate-500 line-clamp-2 uppercase tracking-tight">{checkOutData.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                ) : (
                  <div className="bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center text-center space-y-5 group transition-all hover:bg-white hover:border-amber-200">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm group-hover:scale-110 transition-transform">
                      <AlertCircle className="h-8 w-8 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Termination Pending</h3>
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest max-w-[240px]">Biometric exit protocol not initialized for this cycle.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-10 py-8 bg-white/80 backdrop-blur-xl border-t border-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/20"
          >
            Close Database
          </button>
        </div>
      </div>


      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default AttendanceDetailModal;
