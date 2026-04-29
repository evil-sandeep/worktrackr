import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Store, 
  X, 
  ArrowRight, 
  ChevronRight,
  Send,
  Loader2,
  Camera,
  Navigation
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
      <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm flex items-center justify-center text-[#0078D4] shadow-sm transform hover:scale-105 transition-transform">
           <Store className="h-10 w-10" />
        </div>
        
        <div className="space-y-3">
           <h2 className="text-[24px] font-semibold text-[#323130] tracking-tight">Initialize Site Audit</h2>
           <p className="text-[14px] text-[#605E5C] max-w-[320px] mx-auto leading-relaxed">
             Begin the mandatory verification protocol. Ensure you are at the verified geographic location before starting.
           </p>
        </div>

        <StartVisitButton onStarted={handleStarted} />
        
        <div className="pt-4 flex items-center gap-2 text-[11px] font-bold text-[#A19F9D] uppercase tracking-widest">
           <Navigation className="h-3 w-3" />
           GPS Lock Required
        </div>
      </div>
    );
  }

  if (step === 'COMPLETED') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-[#F3F9FF] border-2 border-[#107C10] rounded-sm text-[#107C10] flex items-center justify-center shadow-lg">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-[24px] font-semibold text-[#323130]">Audit Transmitted</h3>
          <p className="text-[14px] text-[#605E5C]">The site verification sequence has been successfully synchronized with the cloud directory.</p>
        </div>
        <button 
          onClick={reset}
          className="px-10 py-2.5 bg-[#0078D4] hover:bg-[#005A9E] text-white font-semibold text-[15px] transition-all shadow-md active:scale-95 uppercase tracking-wide"
        >
          Begin New Audit
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EDEBE9]">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-[#F3F9FF] border border-[#DEECF9] rounded-sm flex items-center justify-center text-[#0078D4]">
              <Camera className="h-5 w-5" />
           </div>
           <div>
              <p className="text-[11px] font-bold text-[#0078D4] uppercase tracking-widest">Step 02: Evidence</p>
              <h3 className="text-[16px] font-semibold text-[#323130]">Photographic Verification</h3>
           </div>
        </div>
        <button onClick={reset} className="text-[#605E5C] hover:text-[#323130] p-2 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Photo Slot 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${outsidePhoto ? 'bg-[#107C10]' : 'bg-[#A19F9D]'}`}></div>
               <span className="text-[12px] font-bold text-[#323130] uppercase tracking-wider">Exterior Environment</span>
            </div>
            <CapturePhoto label="Outside View" location={location} onCaptured={setOutsidePhoto} />
          </div>

          {/* Photo Slot 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${insidePhoto ? 'bg-[#107C10]' : 'bg-[#A19F9D]'}`}></div>
               <span className="text-[12px] font-bold text-[#323130] uppercase tracking-wider">Internal Workspace</span>
            </div>
            <CapturePhoto label="Inside View" location={location} onCaptured={setInsidePhoto} />
          </div>
        </div>

        {/* Geolocation Info Card */}
        <div className="bg-[#FAF9F8] border border-[#EDEBE9] p-6 rounded-sm space-y-4">
           <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white border border-[#EDEBE9] rounded-sm flex items-center justify-center text-[#323130] shadow-sm shrink-0">
                 <MapPin className="h-6 w-6 text-[#0078D4]" />
              </div>
              <div className="space-y-1">
                 <p className="text-[11px] font-bold text-[#605E5C] uppercase tracking-widest">Geographic Anchor</p>
                 <p className="text-[14px] font-semibold text-[#323130] tracking-tight">
                   Coordinate Lock: <span className="text-[#0078D4] tabular-nums">{location?.latitude.toFixed(6)}, {location?.longitude.toFixed(6)}</span>
                 </p>
                 {address && (
                    <p className="text-[13px] text-[#605E5C] font-medium leading-relaxed mt-2 italic">
                       {address}
                    </p>
                 )}
              </div>
           </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 sticky bottom-0 bg-white">
          <button
            onClick={handleSubmit}
            disabled={!outsidePhoto || !insidePhoto || step === 'SUBMITTING'}
            className="w-full group flex items-center justify-center gap-3 py-4 bg-[#0078D4] hover:bg-[#005A9E] disabled:bg-[#F3F2F1] disabled:text-[#A19F9D] text-white rounded-sm font-bold text-sm uppercase tracking-widest shadow-md transition-all active:scale-[0.99]"
          >
            {step === 'SUBMITTING' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {step === 'SUBMITTING' ? 'Synchronizing with Cloud...' : 'Commit Audit Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitFlow;
