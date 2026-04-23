import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Store, 
  X, 
  ArrowRight, 
  ChevronRight,
  Send,
  Loader2
} from 'lucide-react';
import StartVisitButton from './StartVisitButton';
import CapturePhoto from './CapturePhoto';
import visitService from '../../services/visitService';
import authService from '../../services/authService';
import { useUI } from '../../context/UIContext';

const VisitFlow = ({ onSuccess }) => {
  const [step, setStep] = useState('IDLE'); // IDLE, STARTED, SUBMITTING, COMPLETED
  const [visitId, setVisitId] = useState(null);
  const [location, setLocation] = useState(null);
  const [outsidePhoto, setOutsidePhoto] = useState(null);
  const [insidePhoto, setInsidePhoto] = useState(null);
  const [address, setAddress] = useState(null);
  const { addToast, showLoader, addNotification } = useUI();
  const userData = authService.getCurrentUser();

  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'WorkTrackr-System/1.0' } }
      );
      const data = await response.json();
      if (data && data.display_name) {
        // Set the full exact address string which includes area, village, and specific location details
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error('Visit Geocoding Error:', err);
    }
  };

  const handleStarted = (id, loc) => {
    setVisitId(id);
    setLocation(loc);
    setStep('STARTED');
    fetchAddress(loc.latitude, loc.longitude);
  };

  const handleSubmit = async () => {
    if (!outsidePhoto || !insidePhoto) {
      addToast('Both photos are required', 'error');
      return;
    }

    setStep('SUBMITTING');
    showLoader(true);
    try {
      const response = await visitService.submitVisit(visitId, outsidePhoto, insidePhoto);
      if (response.success) {
        addToast('Store visit proof uploaded successfully', 'success');
        addNotification(
          'Store Visit Logged',
          `${userData?.name || 'User'} successfully visit store at ${address || 'Verified Site'}`,
          'success'
        );
        setStep('COMPLETED');
        if (onSuccess) onSuccess(response.data);
      }
    } catch (error) {
      console.error('Submission Error:', error);
      addToast(error.response?.data?.message || 'Failed to submit proofs', 'error');
      setStep('STARTED');
    } finally {
      showLoader(false);
    }
  };

  const reset = () => {
    setStep('IDLE');
    setVisitId(null);
    setLocation(null);
    setOutsidePhoto(null);
    setInsidePhoto(null);
  };

  if (step === 'IDLE') {
    return (
      <div className="card-premium h-full flex flex-col justify-center animate-in fade-in duration-1000">
        <div className="flex flex-col items-center text-center max-w-sm mx-auto space-y-6 py-4">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl relative group rotate-3">
             <Store className="h-8 w-8 relative z-10 transition-transform group-hover:scale-110" />
             <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <div className="space-y-4">
             <p className="subheading-premium !mb-0">Operation System 02</p>
             <h2 className="heading-premium !text-2xl uppercase">Store Audit</h2>
             <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-[240px] mx-auto opacity-70">
               Mandatory site verification protocol with multi-angle photographic evidence.
             </p>
          </div>

          <StartVisitButton onStarted={handleStarted} />
        </div>
      </div>
    );
  }

  if (step === 'COMPLETED') {
    return (
      <div className="card-premium h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700 bg-slate-50/20">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[2.5rem] text-white flex items-center justify-center shadow-2xl shadow-green-200 animate-pulse-subtle">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h3 className="heading-premium !text-lg uppercase">Audit Transmitted</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-80">Digital records synchronized.</p>
        </div>
        <button 
          onClick={reset}
          className="mt-4 px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
        >
          New Audit Request
        </button>
      </div>
    );
  }

  return (
    <div className="card-premium !p-0 h-full overflow-hidden flex flex-col border-slate-200/60 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-slate-900 p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center text-blue-400 border border-white/10">
              <Store className="h-5 w-5" />
           </div>
           <div>
              <p className="subheading-premium !text-white/40 !mb-0.5">Active Session</p>
              <h3 className="text-white font-bold tracking-widest uppercase text-xs">Site Protocol 02A</h3>
           </div>
        </div>
        <button onClick={reset} className="text-white/20 hover:text-white p-2 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
               <span className="subheading-premium flex items-center gap-3">
                 {outsidePhoto ? <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> : <div className="w-2 h-2 bg-slate-300 rounded-full" />}
                 Exterior Frame
               </span>
            </div>
            <CapturePhoto label="Outside View" location={location} onCaptured={setOutsidePhoto} />
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
               <span className="subheading-premium flex items-center gap-3">
                 {insidePhoto ? <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> : <div className="w-2 h-2 bg-slate-300 rounded-full" />}
                 Internal Scan
               </span>
            </div>
            <CapturePhoto label="Inside View" location={location} onCaptured={setInsidePhoto} />
          </div>
        </div>

        <div className="glass-premium !bg-slate-50/30 p-4 rounded-[2rem] border-slate-100">
           <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-xl border border-slate-100 shrink-0">
                 <MapPin className="h-5 w-5" />
              </div>
              <div className="space-y-1 w-full overflow-hidden">
                 <p className="subheading-premium !mb-0 !text-[8px]">Geographic Lock</p>
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Signal: {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}</p>
                 {address && (
                    <p className="text-[10px] font-semibold text-slate-600 line-clamp-2" title={address}>
                       {address}
                    </p>
                 )}
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-60">ID: {visitId?.slice(-8).toUpperCase()}</p>
              </div>
           </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!outsidePhoto || !insidePhoto || step === 'SUBMITTING'}
          className="w-full group flex items-center justify-center gap-4 py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98] mt-6"
        >
          {step === 'SUBMITTING' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          )}
          {step === 'SUBMITTING' ? 'Encrypting...' : 'Submit Audit'}
        </button>
      </div>
    </div>
  );
};


export default VisitFlow;
