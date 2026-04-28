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
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
    <button 
      onClick={onClose}
      className="absolute top-6 right-6 p-2 bg-white text-[#323130] rounded-sm transition-all hover:bg-[#F3F2F1] z-[120] border border-[#EDEBE9]"
    >
      <X className="h-6 w-6" />
    </button>
    <div className="relative w-full h-full p-4 flex flex-col items-center justify-center gap-6">
      <img 
        src={url} 
        alt="Biometric Snapshot" 
        className="max-w-full max-h-[75vh] object-contain rounded-sm shadow-2xl border border-white/20"
      />
      <div className="bg-white p-4 rounded-sm border border-[#EDEBE9] shadow-xl max-w-md w-full">
         <p className="text-[10px] font-bold uppercase tracking-wider text-[#605E5C] mb-2">Verified Endpoint Signature</p>
         <p className="text-[12px] font-semibold text-[#323130] leading-relaxed break-words whitespace-pre-wrap">
            {locationText}
         </p>
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-none animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl border border-[#EDEBE9] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300 relative">
          
          {previewImage && <FullscreenPreview url={previewImage} locationText={previewLocation} onClose={closePreview} />}

          {/* Modal Header - Azure Style */}
          <div className="px-8 py-6 flex items-center justify-between bg-[#FAF9F8] border-b border-[#EDEBE9]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0078D4] rounded-sm flex items-center justify-center shadow-sm">
                <Fingerprint className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider mb-0.5">Telemetry Snapshot</p>
                <h2 className="text-lg font-bold text-[#323130] tracking-tight leading-none uppercase">{date}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#605E5C] hover:text-[#323130] hover:bg-[#F3F2F1] rounded-sm transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Performance Metrics Bar */}
          <div className="px-8 py-6 grid grid-cols-2 gap-4 bg-white border-b border-[#EDEBE9]">
            <div className="bg-[#FAF9F8] p-4 rounded-sm border border-[#EDEBE9] flex items-center justify-between group">
              <div>
                 <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider mb-1">Session Lifecycle</p>
                 <p className="text-xl font-bold text-[#323130] tracking-tight">{record?.totalHours || record?.workingHours || 'Active Node'}</p>
              </div>
              <Clock className="h-6 w-6 text-[#0078D4]/40" />
            </div>

            <div className="bg-[#FAF9F8] p-4 rounded-sm border border-[#EDEBE9] flex items-center justify-between group">
              <div>
                 <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider mb-1">Accrued Rev</p>
                 <p className="text-xl font-bold text-[#323130] tracking-tight">₹{record?.earning || 0}</p>
              </div>
              <div className="w-8 h-8 bg-white border border-[#EDEBE9] rounded-sm flex items-center justify-center text-[#0078D4] font-bold text-xs shadow-sm">₹</div>
            </div>
          </div>

          {/* Trace Log Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
            {record?.status === 'absent' ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
                <div className="w-16 h-16 bg-[#FAF9F8] rounded-sm flex items-center justify-center border border-dashed border-[#C8C6C4]">
                  <AlertCircle className="h-8 w-8 text-[#E81123]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-[#323130] uppercase tracking-tight">Resource Offline</h3>
                  <p className="text-[#605E5C] font-semibold max-w-[300px] mx-auto text-[10px] leading-relaxed uppercase tracking-wider">
                    No active telemetry sequences detected for this cycle.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                 {/* Ingress Sequence */}
                 <div className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#F3F2F1]"></div>
                    <div className="absolute left-[-5px] top-0 w-3 h-3 bg-[#0078D4] rounded-full border-2 border-white shadow-sm"></div>
                    
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <span className="text-[11px] font-bold text-[#323130] uppercase tracking-wider">Seq 01: Ingress Authentication</span>
                             <span className="px-2 py-0.5 bg-[#DEECF9] text-[#0078D4] text-[9px] font-bold uppercase tracking-wider rounded-sm border border-[#0078D4]/10">{checkInData.time}</span>
                          </div>
                          <button 
                            onClick={() => { setPreviewImage(checkInData.imageUrl); setPreviewLocation(checkInData.location); }}
                            className="text-[#0078D4] hover:underline font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                          >
                            Inspect <ArrowRight size={12} />
                          </button>
                       </div>

                       <div className="bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm p-5 flex flex-col md:flex-row gap-6 hover:border-[#0078D4] transition-all duration-300 shadow-sm">
                          <div className="w-full md:w-28 aspect-square rounded-sm overflow-hidden bg-black shrink-0 border border-[#EDEBE9] cursor-pointer shadow-inner" onClick={() => { setPreviewImage(checkInData.imageUrl); setPreviewLocation(checkInData.location); }}>
                             <img src={checkInData.imageUrl} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" alt="entry" />
                          </div>
                          <div className="space-y-4 flex-1">
                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                   <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider">Validation</p>
                                   <p className="text-[12px] font-semibold text-[#323130]">Azure Identity Verified</p>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider">Network Origin</p>
                                   <p className="text-[10px] font-medium text-[#323130] leading-tight break-words">{checkInData.location}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2 text-[#107C10] font-bold text-[9px] uppercase tracking-widest bg-[#DFF6DD] w-fit px-2 py-1 rounded-sm border border-[#107C10]/10">
                                <ShieldCheck size={12} /> Secure Handshake Success
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Egress Sequence */}
                 <div className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#F3F2F1]"></div>
                    <div className={`absolute left-[-5px] top-0 w-3 h-3 ${isCheckOutComplete ? 'bg-[#0078D4]' : 'bg-[#C8C6C4]'} rounded-full border-2 border-white shadow-sm`}></div>
                    
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <span className="text-[11px] font-bold text-[#323130] uppercase tracking-wider">Seq 02: Egress Termination</span>
                             <span className={`px-2 py-0.5 ${isCheckOutComplete ? 'bg-[#DEECF9] text-[#0078D4] border-[#0078D4]/10' : 'bg-[#F3F2F1] text-[#A19F9D] border-[#EDEBE9]'} text-[9px] font-bold uppercase tracking-wider rounded-sm border`}>{checkOutData.time || 'Awaiting Sync'}</span>
                          </div>
                          {isCheckOutComplete && (
                            <button 
                              onClick={() => { setPreviewImage(checkOutData.imageUrl); setPreviewLocation(checkOutData.location); }}
                              className="text-[#0078D4] hover:underline font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                            >
                              Inspect <ArrowRight size={12} />
                            </button>
                          )}
                       </div>

                       {isCheckOutComplete ? (
                          <div className="bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm p-5 flex flex-col md:flex-row gap-6 hover:border-[#0078D4] transition-all duration-300 shadow-sm">
                             <div className="w-full md:w-28 aspect-square rounded-sm overflow-hidden bg-black shrink-0 border border-[#EDEBE9] cursor-pointer shadow-inner" onClick={() => { setPreviewImage(checkOutData.imageUrl); setPreviewLocation(checkOutData.location); }}>
                                <img src={checkOutData.imageUrl} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" alt="exit" />
                             </div>
                             <div className="space-y-4 flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider">Validation</p>
                                      <p className="text-[12px] font-semibold text-[#323130]">Azure Session Finalized</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-wider">Network Origin</p>
                                      <p className="text-[10px] font-medium text-[#323130] leading-tight break-words">{checkOutData.location}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2 text-[#107C10] font-bold text-[9px] uppercase tracking-widest bg-[#DFF6DD] w-fit px-2 py-1 rounded-sm border border-[#107C10]/10">
                                   <CheckCircle size={12} /> Resource De-provisioned Successfully
                                </div>
                             </div>
                          </div>
                       ) : (
                          <div className="bg-[#FAF9F8] border border-dashed border-[#C8C6C4] rounded-sm p-8 flex flex-col items-center text-center space-y-4">
                             <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center text-[#A19F9D] border border-[#EDEBE9] shadow-sm"><AlertCircle size={20} /></div>
                             <div>
                                <p className="text-[11px] font-bold text-[#323130] uppercase tracking-wider">Awaiting Resource Release</p>
                                <p className="text-[9px] font-semibold text-[#605E5C] uppercase tracking-widest leading-relaxed mt-1">Egress biometric signature not detected in local buffer.</p>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="px-8 py-6 bg-[#FAF9F8] border-t border-[#EDEBE9] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#0078D4] text-white rounded-sm font-bold text-[11px] uppercase tracking-widest hover:bg-[#005A9E] transition-all shadow-sm"
            >
              Acknowledge Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceDetailModal;
