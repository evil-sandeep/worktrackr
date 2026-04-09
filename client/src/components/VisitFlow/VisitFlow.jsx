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
import { useUI } from '../../context/UIContext';

const VisitFlow = ({ onSuccess }) => {
  const [step, setStep] = useState('IDLE'); // IDLE, STARTED, SUBMITTING, COMPLETED
  const [visitId, setVisitId] = useState(null);
  const [location, setLocation] = useState(null);
  const [outsidePhoto, setOutsidePhoto] = useState(null);
  const [insidePhoto, setInsidePhoto] = useState(null);
  const { addToast, showLoader } = useUI();

  const handleStarted = (id, loc) => {
    setVisitId(id);
    setLocation(loc);
    setStep('STARTED');
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
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-sm animate-in fade-in duration-700">
        <div className="flex flex-col items-center text-center max-w-sm mx-auto space-y-8">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-inner relative group">
             <Store className="h-10 w-10 relative z-10 transition-transform group-hover:scale-110" />
             <div className="absolute inset-4 bg-indigo-200/50 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <div className="space-y-4">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Visit Protocol</h2>
             <p className="text-sm font-medium text-slate-500 leading-relaxed">
               Execute store audit with mandatory GPS tagging and dual-view site verification.
             </p>
          </div>

          <StartVisitButton onStarted={handleStarted} />
        </div>
      </div>
    );
  }

  if (step === 'COMPLETED') {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 text-center border border-green-100 shadow-sm animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 animate-in fade-in zoom-in duration-700" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Mission Complete</h3>
        <p className="text-sm font-bold text-slate-500 mt-2">Visit record and proofs synchronized.</p>
        <button 
          onClick={reset}
          className="mt-8 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
        >
          Begin New Visit
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-slate-900 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400">
              <Store className="h-5 w-5" />
           </div>
           <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Store Protocol</p>
              <h3 className="text-white font-bold tracking-tight">Proof Synchronization</h3>
           </div>
        </div>
        <button onClick={reset} className="text-white/40 hover:text-white p-2">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 {outsidePhoto ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-200" />}
                 Site Exterior
               </span>
            </div>
            <CapturePhoto label="Outside View" location={location} onCaptured={setOutsidePhoto} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 {insidePhoto ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-200" />}
                 Internal Audit
               </span>
            </div>
            <CapturePhoto label="Inside View" location={location} onCaptured={setInsidePhoto} />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
           <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-slate-100 shrink-0">
                 <MapPin className="h-5 w-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Location</p>
                 <p className="text-xs font-black text-slate-900">GPS Locked at {location?.latitude.toFixed(6)}, {location?.longitude.toFixed(6)}</p>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Verification Key: {visitId?.slice(-8).toUpperCase()}</p>
              </div>
           </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!outsidePhoto || !insidePhoto || step === 'SUBMITTING'}
          className="w-full group flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-[0.98] mt-4"
        >
          {step === 'SUBMITTING' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {step === 'SUBMITTING' ? 'Synchronizing Data...' : 'Finalize & Submit Proofs'}
        </button>
      </div>
    </div>
  );
};

export default VisitFlow;
