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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-8 pb-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Fingerprint className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Attendance Details</h2>
              <div className="flex items-center gap-2 mt-1.5">
                 <Calendar className="h-3.5 w-3.5 text-slate-400" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-100 active:scale-90"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Shift Summary / Working Hours */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-xl shadow-blue-100 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                  <Clock className="h-5 w-5 text-white" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Shift Duration</p>
                  <p className="text-xl font-black">{record?.workingHours || 'In Progress'}</p>
               </div>
            </div>
            <div className="h-10 w-px bg-white/20 mx-2"></div>
            <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Cycle Status</p>
               <p className="text-xs font-black">{isCheckOutComplete ? 'SHIFT COMPLETE' : 'ACTIVE SESSION'}</p>
            </div>
          </div>

          {/* Section 1: Check-In */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                   <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Entry Verification</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-full">Completed</span>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-1 group hover:border-blue-100 transition-all duration-500 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 h-full">
                <div className="relative aspect-video md:aspect-auto rounded-2xl overflow-hidden bg-slate-950">
                   <img 
                    src={checkInData.imageUrl} 
                    alt="Check-in biometric" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                   />
                   <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg flex items-center gap-1.5 border border-white/10">
                      <Camera className="h-3 w-3 text-white" />
                      <span className="text-[9px] font-black text-white uppercase">Entry Photo</span>
                   </div>
                </div>
                
                <div className="p-6 flex flex-col justify-between space-y-6">
                   <div className="space-y-4">
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-colors group-hover:bg-blue-50/30 group-hover:border-blue-100/50">
                        <div className="flex items-center gap-2 mb-1.5 text-blue-500">
                           <Clock className="h-3.5 w-3.5" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Time In</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{checkInData.time}</p>
                      </div>

                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-colors group-hover:bg-blue-50/30 group-hover:border-blue-100/50">
                        <div className="flex items-center gap-2 mb-1.5 text-blue-500">
                           <MapPin className="h-3.5 w-3.5" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Location</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed truncate">{checkInData.location}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center relative">
             <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-100"></div>
             <div className="relative bg-white px-6">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                   <ArrowRight className="h-4 w-4 text-slate-300" />
                </div>
             </div>
          </div>

          {/* Section 2: Check-Out */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                   <LogOut className="h-4 w-4" />
                </div>
                <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Exit Verification</span>
              </div>
              {isCheckOutComplete ? (
                 <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-full">Completed</span>
              ) : (
                 <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full">Pending</span>
              )}
            </div>

            {isCheckOutComplete ? (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-1 group hover:border-rose-100 transition-all duration-500 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 h-full">
                  <div className="relative aspect-video md:aspect-auto rounded-2xl overflow-hidden bg-slate-950">
                    <img 
                      src={checkOutData.imageUrl} 
                      alt="Check-out biometric" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg flex items-center gap-1.5 border border-white/10">
                        <Camera className="h-3 w-3 text-white" />
                        <span className="text-[9px] font-black text-white uppercase">Exit Photo</span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-colors group-hover:bg-rose-50/30 group-hover:border-rose-100/50">
                          <div className="flex items-center gap-2 mb-1.5 text-rose-500">
                             <Clock className="h-3.5 w-3.5" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Time Out</span>
                          </div>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">{checkOutData.time}</p>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-colors group-hover:bg-rose-50/30 group-hover:border-rose-100/50">
                          <div className="flex items-center gap-2 mb-1.5 text-rose-500">
                             <MapPin className="h-3.5 w-3.5" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Location</span>
                          </div>
                          <p className="text-xs font-bold text-slate-600 leading-relaxed truncate">{checkOutData.location}</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center text-center space-y-4 group transition-all hover:bg-white hover:border-rose-200">
                <div className="w-20 h-20 bg-amber-50 rounded-[1.5rem] flex items-center justify-center border border-amber-100 shadow-sm group-hover:scale-110 transition-transform">
                   <AlertCircle className="h-10 w-10 text-amber-500" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Check-Out Incomplete</h3>
                   <p className="text-slate-400 text-xs font-medium max-w-[200px]">The user has not logged their biometric exit for this session yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-8 pt-4 bg-white/80 backdrop-blur-md border-t border-slate-50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-200"
           >
             Close Records
           </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
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
