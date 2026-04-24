import React, { useRef, useState, useEffect } from 'react';
import checkInService from '../services/checkInService';
import { useUI } from '../context/UIContext';
import { 
  Camera, 
  MapPin, 
  Loader2, 
  CheckCircle, 
  ArrowRight,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Store,
  Building2,
  Image as ImageIcon
} from 'lucide-react';

const CheckInTerminal = ({ onSuccess }) => {
  const { showLoader, addToast } = useUI();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [step, setStep] = useState(1); // 1: Outside, 2: Inside, 3: Review, 4: Success
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photos, setPhotos] = useState({ outside: null, inside: null });
  const [location, setLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [addressComponents, setAddressComponents] = useState(null);
  const [address, setAddress] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAddress = async (lat, lon) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const formattedAddress = result.formatted_address;
        
        let village = '';
        let area = '';
        let district = '';
        let state = '';
        
        result.address_components.forEach(component => {
          const types = component.types;
          if (types.includes('locality') || types.includes('administrative_area_level_3')) {
            village = village || component.long_name;
          }
          if (types.includes('sublocality')) {
            area = area || component.long_name;
          }
          if (types.includes('administrative_area_level_2')) {
            district = district || component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
        });
        
        setAddress(formattedAddress.split(',').slice(0, 3).join(','));
        setAddressComponents({
          village,
          area,
          district,
          state,
          formattedAddress
        });
      } else {
        setAddress('Address not found');
      }
    } catch (err) {
      console.error('Geocoding Error:', err);
    }
  };

  const startCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer back camera for shop photos
        audio: false
      });
      setStream(cameraStream);
      setIsCameraActive(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            if (accuracy > 100) {
              addToast(`GPS accuracy too low (${Math.round(accuracy)}m). Please move to an open area.`, 'warning');
              stopCamera();
              return;
            }
            setLocation({ latitude, longitude });
            setAccuracy(accuracy);
            fetchAddress(latitude, longitude);
          },
          (error) => addToast(`GPS Error: ${error.message}`, 'error'),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } catch (err) {
      addToast('Camera access denied.', 'error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setIsCameraReady(false);
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => stopCamera();
  }, [stream]);

  const capturePhoto = () => {
    if (!isCameraReady || !location) {
      addToast('Waiting for camera and GPS...', 'warning');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    
    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Metadata Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(`${step === 1 ? 'OUTSIDE' : 'INSIDE'} | ${currentTime.toLocaleString()}`, 30, canvas.height - 45);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(address || `LAT: ${location.latitude}, LON: ${location.longitude}`, 30, canvas.height - 20);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    if (step === 1) {
      setPhotos(prev => ({ ...prev, outside: imageData }));
      setStep(2);
    } else {
      setPhotos(prev => ({ ...prev, inside: imageData }));
      setStep(3);
      stopCamera();
    }
  };

  const handleSubmit = async () => {
    if (!photos.outside || !photos.inside) return;

    showLoader(true);
    try {
      await checkInService.submitCheckIn({
        outsidePhoto: photos.outside,
        insidePhoto: photos.inside,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy,
        locationName: address,
        addressComponents,
        timestamp: new Date()
      });
      addToast('Check-in successful!', 'success');
      setStep(4);
    } catch (err) {
      addToast('Submission failed.', 'error');
    } finally {
      showLoader(false);
    }
  };

  const resetStep = (targetStep) => {
    if (targetStep < 3 && !isCameraActive) startCamera();
    setStep(targetStep);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8 sm:p-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Check-In Wizard 
            <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
              {step === 4 ? 'Complete' : `Step ${step}/3`}
            </span>
          </h2>
          <p className="text-slate-500 font-medium font-inter">Complete all visuals to log your shop entry.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
          <MapPin className={`h-4 w-4 ${location ? 'text-green-500' : 'text-amber-500 animate-pulse'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {address ? 'Signal Locked' : 'Searching GPS...'}
          </span>
        </div>
      </div>

      {/* Main UI */}
      <div className="relative">
        {step === 4 ? (
          <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-[2rem] border-2 border-green-100">
             <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200">
                <CheckCircle className="h-10 w-10 text-white" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">Verification Complete</h3>
             <p className="text-slate-500 font-medium mb-6">Your location and audit photos have been securely logged.</p>
             
             <div className="bg-white w-full rounded-2xl p-4 border border-slate-100 text-left mb-8 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Detected Location</p>
                <div className="flex items-start gap-3">
                   <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                   <div>
                      <p className="text-sm font-bold text-slate-800">{addressComponents?.village || addressComponents?.area || 'Location Logged'}</p>
                      <p className="text-xs text-slate-500 mt-1">{addressComponents?.formattedAddress || address}</p>
                      <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-2">Accuracy: {Math.round(accuracy)}m</p>
                   </div>
                </div>
             </div>

             <button onClick={onSuccess} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all shadow-xl active:scale-95">
                Return to Dashboard
             </button>
          </div>
        ) : step < 3 ? (
          <div className="space-y-8">
            <div className="relative aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-slate-50">
              {!isCameraActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl">
                    {step === 1 ? <Building2 className="h-10 w-10 text-white" /> : <Store className="h-10 w-10 text-white" />}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    {step === 1 ? 'Capture Outside View' : 'Capture Inside View'}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mb-8">Align your camera with the {step === 1 ? 'shop entrance' : 'shop interior'}.</p>
                  <button onClick={startCamera} className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl active:scale-95 flex items-center gap-3">
                    Activate Lens <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted onPlay={() => setIsCameraReady(true)} className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Viewfinder overlay */}
                  <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 border-2 border-white/20 border-dashed rounded-3xl pointer-events-none"></div>
                  
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                    <button 
                      onClick={capturePhoto} 
                      className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-90"
                    >
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </button>
                  </div>

                  <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-500/50"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Capture</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
               ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              Review Captures <CheckCircle className="text-green-500 h-6 w-6" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4 group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Outside Snapshot</p>
                <div className="aspect-video rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-lg relative">
                  <img src={photos.outside} alt="Outside" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                  <button onClick={() => resetStep(1)} className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg hover:bg-white transition-colors"><Camera className="h-4 w-4 text-slate-900" /></button>
                </div>
              </div>
              <div className="space-y-4 group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Inside Snapshot</p>
                <div className="aspect-video rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-lg relative">
                  <img src={photos.inside} alt="Inside" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                  <button onClick={() => resetStep(2)} className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg hover:bg-white transition-colors"><Camera className="h-4 w-4 text-slate-900" /></button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
               <button onClick={handleSubmit} className="flex-1 px-10 py-5 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95">
                  Finalize Submission <UploadCloud className="h-5 w-5" />
               </button>
               <button onClick={() => resetStep(1)} className="px-10 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 active:scale-95">
                  Retake All
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInTerminal;
