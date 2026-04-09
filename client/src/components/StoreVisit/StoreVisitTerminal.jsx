import React, { useRef, useState, useEffect } from 'react';
import storeVisitService from '../../services/storeVisitService';
import { useUI } from '../../context/UIContext';
import { 
  Camera, 
  MapPin, 
  Loader2, 
  CheckCircle, 
  ArrowRight,
  UploadCloud,
  Store,
  Image as ImageIcon
} from 'lucide-react';

const StoreVisitTerminal = ({ onSuccess, onCancel }) => {
  const { showLoader, addToast } = useUI();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // flow steps: 'idle' -> 'capture-outside' -> 'capture-inside' -> 'review'
  const [step, setStep] = useState('idle');
  
  const [stream, setStream] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  // Captures
  const [outsideImage, setOutsideImage] = useState(null);
  const [insideImage, setInsideImage] = useState(null);
  
  const [address, setAddress] = useState(null);
  const [location, setLocation] = useState(null);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [currentTime] = useState(new Date());

  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'WorkTrackr-System/1.0' } }
      );
      const data = await response.json();
      if (data && data.display_name) {
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || '';
        const state = data.address.state || data.address.region || '';
        const shortAddress = [city, state].filter(Boolean).join(', ') || data.display_name.split(',').slice(0, 2).join(',');
        setAddress(shortAddress);
      }
    } catch (err) {
      console.error('Reverse Geocoding Error:', err);
    }
  };

  const startCamera = async () => {
    try {
      setLoadingCamera(true);
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      setStream(cameraStream);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setLocation({ latitude: lat, longitude: lon });
            fetchAddress(lat, lon);
          },
          () => {
            addToast('GPS access denied. Required for store visit.', 'error');
          }
        );
      }
    } catch (err) {
      addToast('Camera access denied or failed.', 'error');
    } finally {
      setLoadingCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraReady(false);
  };

  // Turn on camera when moving to capture states
  useEffect(() => {
    if (step === 'capture-outside' || step === 'capture-inside') {
      if (!stream) startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, step]);

  const handleStart = () => setStep('capture-outside');

  const captureFrame = (label, color) => {
    if (!isCameraReady || !location) {
      addToast('Wait for camera and GPS to initialize', 'warning');
      return null;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = 1280;
    canvas.height = 720;
    const context = canvas.getContext('2d');
    
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    // Bottom dark overlay for watermark
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Text configuration
    context.fillStyle = 'white';
    context.font = 'bold 24px Inter, sans-serif';

    const dateStr = currentTime.toLocaleDateString();
    const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locStr = address ? address : `LOC: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    
    context.fillText(`${dateStr} | ${timeStr}`, 40, canvas.height - 60);
    context.font = '18px Inter, sans-serif';
    context.fillText(locStr, 40, canvas.height - 30);
    
    // Watermark label (OUTSIDE/INSIDE)
    context.fillStyle = color;
    context.fillRect(canvas.width - 320, canvas.height - 70, 280, 40);
    context.fillStyle = 'white';
    context.font = 'bold 14px Inter, sans-serif';
    context.textAlign = 'center';
    context.fillText(`STORE VISIT - ${label}`, canvas.width - 180, canvas.height - 45);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const handleCaptureOutside = () => {
    const data = captureFrame('OUTSIDE', '#3b82f6'); // blue color
    if (data) {
      setOutsideImage(data);
      setStep('capture-inside');
    }
  };

  const handleCaptureInside = () => {
    const data = captureFrame('INSIDE', '#8b5cf6'); // violet color
    if (data) {
      setInsideImage(data);
      setStep('review');
    }
  };

  const handleSubmit = async () => {
    showLoader(true);
    try {
      const serverDate = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')}`;
      
      const payload = {
        outsideImage,
        insideImage,
        date: serverDate,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address || 'Current Location'
        }
      };

      await storeVisitService.submitVisit(payload);
      addToast('Store visit submitted successfully!', 'success');
      
      if (onSuccess) onSuccess();
      
      // Reset
      setStep('idle');
      setOutsideImage(null);
      setInsideImage(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit visit.', 'error');
    } finally {
      showLoader(false);
    }
  };

  const renderCameraFrame = (instructions, captureAction, isSecondary) => (
    <div className="relative aspect-video bg-slate-950 rounded-[1.25rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl group ring-2 sm:ring-4 ring-slate-50">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlay={() => setIsCameraReady(true)}
        className="w-full h-full object-cover transform scale-x-[-1] brightness-[1.1] contrast-[1.05]"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Viewfinder Overlay */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="w-full h-full border border-white/20 relative">
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-blue-500/50 rounded-tl-xl"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-blue-500/50 rounded-tr-xl"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-blue-500/50 rounded-bl-xl"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-blue-500/50 rounded-br-xl"></div>
         </div>
      </div>

      {!isCameraReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl px-4 text-center">
           <div className="flex flex-col items-center gap-6">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin relative z-10" />
             </div>
             <span className="text-white font-black text-xs tracking-[0.3em] uppercase opacity-70">Initializing Interface</span>
           </div>
        </div>
      )}

      {isCameraReady && (
        <div className="absolute bottom-0 inset-x-0 p-5 flex items-center justify-between pointer-events-none">
           <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white shadow-xl max-w-[200px]">
             <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">{instructions}</p>
             <p className="text-xs font-bold leading-tight truncate">{address || 'Locating...'}</p>
           </div>
           
           <div className="pointer-events-auto">
             <button 
                onClick={captureAction}
                className={`w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-90 shadow-2xl ${
                  isSecondary ? 'hover:border-violet-400' : 'hover:border-blue-400'
                }`}
             >
               <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                  isSecondary ? 'bg-violet-600 shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
               }`}>
                 <Camera className="h-6 w-6 text-white" />
               </div>
             </button>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm animate-in fade-in duration-500">
      <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Store className="h-5 w-5" />
           </div>
           <div>
              <h2 className="font-black text-slate-900 tracking-tight leading-none uppercase">Store Visit</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Field Proof Logging</p>
           </div>
        </div>
        {step !== 'idle' && (
          <button onClick={() => { setStep('idle'); onCancel?.(); }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
            Cancel
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {step === 'idle' && (
          <div className="bg-slate-50 rounded-[2rem] p-10 flex flex-col items-center text-center space-y-6 border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
                <Store className="h-10 w-10" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Record Store Visit</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">Capture outside and inside proof of visit with verified coordinates and timestamp.</p>
             </div>
             <button 
               onClick={handleStart}
               disabled={loadingCamera}
               className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
             >
               {loadingCamera ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
               Start Visit Flow
             </button>
          </div>
        )}

        {step === 'capture-outside' && renderCameraFrame('Step 1: Capture Outside', handleCaptureOutside, false)}

        {step === 'capture-inside' && renderCameraFrame('Step 2: Capture Inside', handleCaptureInside, true)}

        {step === 'review' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-blue-500" /> Outside View</p>
                  <img src={outsideImage} alt="outside" className="w-full aspect-video object-cover rounded-2xl border-4 border-slate-50 shadow-sm" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-violet-500" /> Inside View</p>
                  <img src={insideImage} alt="inside" className="w-full aspect-video object-cover rounded-2xl border-4 border-slate-50 shadow-sm" />
               </div>
            </div>
            
            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                 <p className="text-sm font-black tracking-tight">Coordinates Locked</p>
                 <p className="text-xs font-medium opacity-80 mt-0.5">{address}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">Lat: {location?.latitude?.toFixed(4)} / Lng: {location?.longitude?.toFixed(4)}</p>
              </div>
            </div>

            <button 
               onClick={handleSubmit}
               className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
               <UploadCloud className="h-4 w-4" />
               Submit Visit Proof
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreVisitTerminal;
