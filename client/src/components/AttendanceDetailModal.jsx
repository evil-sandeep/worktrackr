import React, { useState } from 'react';
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
  CheckCircle,
  Camera
} from 'lucide-react';

const FullscreenPreview = ({ url, locationText, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
    <button 
      onClick={onClose}
      className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95 border border-white/20 z-[110]"
    >
      <X className="h-8 w-8" />
    </button>
    <div className="relative w-full h-full p-10 sm:p-20 flex flex-col items-center justify-center gap-8">
      <img 
        src={url} 
        alt="Full size biometric" 
        className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
      />
      <div className="flex flex-col items-center gap-2">
         <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white text-center shadow-2xl min-w-[300px]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Verified Coordinates</p>
            {locationText?.split('\n').map((line, i) => (
              <p key={i} className={`font-bold ${i === 0 ? 'text-sm mb-1' : 'text-xs text-blue-300 tracking-widest font-mono'}`}>
                {line}
              </p>
            ))}
         </div>
      </div>
    </div>
  </div>
);

const AttendanceDetailModal = ({ isOpen, onClose, record, date }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLocation, setPreviewLocation] = useState(null);

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

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewLocation(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500">
        <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-premium-layered border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500 relative">
          
          {previewImage && <FullscreenPreview url={previewImage} locationText={previewLocation} onClose={closePreview} />}

          {/* Modal Header */}
          <div className="px-10 py-8 flex items-center justify-between bg-white relative z-20">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
                <Fingerprint className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1 font-outfit">Session Data</p>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase font-outfit">{date}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-100 active:scale-95 border border-slate-100/50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Stats Command Row */}
          <div className="px-10 pb-8 grid grid-cols-2 gap-4 border-b border-slate-50">
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between group overflow-hidden relative">
              <div className="relative z-10">
                 <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Duration</p>
                 <p className="text-2xl font-black tracking-tighter">{record?.totalHours || record?.workingHours || 'Active'}</p>
              </div>
              <Clock className="h-8 w-8 text-white/10 group-hover:text-blue-500/20 transition-all duration-700" />
              <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-blue-600/20 rounded-full blur-xl"></div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group overflow-hidden relative">
              <div className="relative z-10">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Yield Accrued</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{record?.earning || 0}</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold border border-slate-200">₹</div>
              <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-slate-200/40 rounded-full blur-xl"></div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-slate-50/10">
            {record?.status === 'absent' ? (
              <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center">
                <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center border border-rose-100 shadow-xl">
                  <AlertCircle className="h-10 w-10 text-rose-500" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Protocol Standby</h3>
                  <p className="text-slate-400 font-bold max-w-[300px] mx-auto text-[10px] leading-relaxed uppercase tracking-widest">
                    No attendance sequences detected for this cycle.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                 {/* Entry Node */}
                 <div className="flex gap-8 group/node">
                    <div className="hidden sm:flex flex-col items-center gap-4">
                       <div className="w-4 h-4 bg-blue-600 rounded-full ring-4 ring-blue-100 shrink-0"></div>
                       <div className="w-0.5 h-full bg-slate-100 rounded-full group-last/node:hidden"></div>
                    </div>
                    <div className="flex-1 space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Node 01: Initialized</span>
                             <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-full">{checkInData.time}</span>
                          </div>
                           <button 
                            onClick={() => { setPreviewImage(checkInData.imageUrl); setPreviewLocation(checkInData.location); }}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-black text-[9px] uppercase tracking-widest transition-all hover:translate-x-1"
                          >
                            View Signature <ArrowRight size={14} />
                          </button>
                       </div>
                       <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all duration-700">
                          <div className="w-full md:w-32 aspect-square rounded-2xl overflow-hidden bg-slate-950 shrink-0 ring-4 ring-slate-50 cursor-pointer" onClick={() => { setPreviewImage(checkInData.imageUrl); setPreviewLocation(checkInData.location); }}>
                             <img src={checkInData.imageUrl} className="w-full h-full object-cover" alt="entry" />
                          </div>
                          <div className="space-y-6 flex-1">
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verification</p>
                                   <p className="text-xs font-bold text-slate-900">Authenticated Scan</p>
                                </div>
                                <div className="space-y-2">
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Lock</p>
                                   <p className="text-[10px] font-bold text-slate-900 leading-tight uppercase tracking-tight line-clamp-2 italic opacity-80 break-words">{checkInData.location}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 text-green-500 font-black text-[8px] uppercase tracking-widest">
                                <ShieldCheck size={12} /> Secure Protocol Success
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Exit Node */}
                 <div className="flex gap-8 group/node">
                    <div className="hidden sm:flex flex-col items-center gap-4">
                       <div className={`w-4 h-4 ${isCheckOutComplete ? 'bg-amber-600 ring-amber-100' : 'bg-slate-200 ring-slate-100'} rounded-full ring-4 shrink-0`}></div>
                       <div className="w-0.5 h-full bg-slate-100 rounded-full group-last/node:hidden"></div>
                    </div>
                    <div className="flex-1 space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Node 02: Termination</span>
                             <span className={`px-3 py-1 ${isCheckOutComplete ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'} text-[8px] font-black uppercase tracking-widest rounded-full`}>{checkOutData.time || 'Pending'}</span>
                          </div>
                          {isCheckOutComplete && (
                            <button 
                              onClick={() => { setPreviewImage(checkOutData.imageUrl); setPreviewLocation(checkOutData.location); }}
                              className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-black text-[9px] uppercase tracking-widest transition-all hover:translate-x-1"
                            >
                              View Signature <ArrowRight size={14} />
                            </button>
                          )}
                       </div>
                       {isCheckOutComplete ? (
                          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all duration-700">
                             <div className="w-full md:w-32 aspect-square rounded-2xl overflow-hidden bg-slate-950 shrink-0 ring-4 ring-slate-50 cursor-pointer" onClick={() => { setPreviewImage(checkOutData.imageUrl); setPreviewLocation(checkOutData.location); }}>
                                <img src={checkOutData.imageUrl} className="w-full h-full object-cover" alt="exit" />
                             </div>
                             <div className="space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-8">
                                   <div className="space-y-2">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verification</p>
                                      <p className="text-xs font-bold text-slate-900">Exit Auth Success</p>
                                   </div>
                                   <div className="space-y-2">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Lock</p>
                                      <p className="text-[10px] font-bold text-slate-900 leading-tight uppercase tracking-tight line-clamp-2 italic opacity-80 break-words">{checkOutData.location}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3 text-green-500 font-black text-[8px] uppercase tracking-widest">
                                   <CheckCircle size={12} /> Log Finalized
                                </div>
                             </div>
                          </div>
                       ) : (
                          <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-4">
                             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-400 border border-slate-200 shadow-sm"><AlertCircle size={24} /></div>
                             <div>
                                <p className="text-xs font-black text-slate-900 uppercase">Awaiting Protocol Termination</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mt-1">Check-out biometric verification not yet recorded.</p>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-10 py-8 bg-white border-t border-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/20"
            >
              Close Report
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
    </>
  );
};

export default AttendanceDetailModal;
