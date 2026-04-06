import React, { useRef, useState, useEffect } from 'react';
import attendanceService from '../services/attendanceService';
import { useUI } from '../context/UIContext';
import { 
  Camera, 
  MapPin, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  LogOut,
  ShieldCheck,
  Clock,
  UploadCloud
} from 'lucide-react';
import { formatDateKey } from './Calendar/useCalendar';

const BiometricTerminal = ({ mode = 'checkin', onSuccess }) => {
  const { showLoader, addToast } = useUI();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedData, setCapturedData] = useState(null);
  const [address, setAddress] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WorkTrackr-Attendance-System/1.0'
          }
        }
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
      setLoading(true);
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      console.log('Camera stream obtained:', cameraStream.id);
      setStream(cameraStream);
      setIsCameraActive(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setLocation({ latitude: lat, longitude: lon });
            fetchAddress(lat, lon);
          },
          () => {
            setStatus({ type: 'error', message: 'GPS access denied. Please enable location.' });
          }
        );
      }
    } catch (err) {
      console.error('Camera Error:', err);
      addToast('Camera access denied or failed.', 'error');
      setStatus({ type: 'error', message: 'Camera access denied.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = () => {
    if (!isCameraReady || !location) {
      addToast('Wait for camera and GPS to initialize', 'warning');
      return;
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

    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, canvas.height - 100, canvas.width, 100);

    context.fillStyle = 'white';
    context.font = 'bold 24px Inter, sans-serif';

    const dateISO = formatDateKey(currentTime);
    const dateStr = currentTime.toLocaleDateString();
    const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locStr = address ? address : `LOC: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    
    context.fillText(`${dateStr} | ${timeStr}`, 40, canvas.height - 60);
    context.font = '18px Inter, sans-serif';
    context.fillText(locStr, 40, canvas.height - 30);
    
    context.fillStyle = mode === 'checkin' ? '#3b82f6' : '#f43f5e';
    context.fillRect(canvas.width - 240, canvas.height - 70, 200, 40);
    context.fillStyle = 'white';
    context.font = 'bold 14px Inter, sans-serif';
    context.textAlign = 'center';
    context.fillText(mode === 'checkin' ? 'VERIFIED ENTRY' : 'VERIFIED EXIT', canvas.width - 140, canvas.height - 45);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setCapturedData({
      image: imageData,
      date: dateISO,
      time: timeStr,
      location: address || `${location.latitude},${location.longitude}`
    });
  };

  const handleUpload = async () => {
    if (!capturedData) return;

    showLoader(true);
    try {
      if (mode === 'checkin') {
        await attendanceService.markAttendance(capturedData);
      } else {
        await attendanceService.markCheckout(capturedData);
      }
      
      addToast(`${mode === 'checkin' ? 'Check-In' : 'Check-Out'} logged successfully!`, 'success');
      setCapturedImage(null);
      setCapturedData(null);
      setIsCameraActive(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Submission failed. Please try again.';
      addToast(errorMsg, 'error');
    } finally {
      showLoader(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setCapturedData(null);
  };

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
              {mode === 'checkin' ? 'Check-In' : 'Check-Out'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Authentication Required</p>
          </div>
          <div className={`flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${address ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
            <MapPin className="h-2.5 w-2.5 mr-1.5" />
            {address ? 'Location Secured' : 'Acquiring Signal...'}
          </div>
        </div>

        <div className="relative aspect-video bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl group ring-4 ring-slate-50">
          {!isCameraActive && !capturedImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
               <div className="relative">
                  <div className={`absolute inset-0 ${mode === 'checkin' ? 'bg-blue-600/20' : 'bg-rose-600/20'} rounded-full blur-2xl animate-pulse`}></div>
                  <div className={`w-20 h-20 ${mode === 'checkin' ? 'bg-blue-600' : 'bg-rose-600'} rounded-[2rem] flex items-center justify-center relative z-10 shadow-2xl`}>
                     {mode === 'checkin' ? <Camera className="h-8 w-8 text-white" /> : <LogOut className="h-8 w-8 text-white" />}
                  </div>
               </div>
               <div className="space-y-2">
                 <h3 className="text-white text-lg font-black tracking-tight">{mode === 'checkin' ? 'Begin Daily Session' : 'Terminate Session'}</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Initialize Biometric Lens</p>
               </div>
               <button 
                onClick={startCamera}
                className={`group flex items-center gap-2 px-10 py-4 ${mode === 'checkin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all shadow-xl hover:shadow-${mode === 'checkin' ? 'blue' : 'rose'}-500/20 active:scale-95`}
               >
                 <span>Start Camera</span>
                 <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full h-full group/captured">
              <img 
                src={capturedImage} 
                alt="captured" 
                className="w-full h-full object-cover animate-in fade-in zoom-in duration-500 scale-[1.02] group-hover/captured:scale-100 transition-transform duration-1000" 
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between backdrop-blur-[2px]">
                <button onClick={resetCapture} className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95">
                  Discard
                </button>
                <button 
                  onClick={handleUpload}
                  className={`px-10 py-3 ${mode === 'checkin' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30'} text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center gap-2.5`}
                >
                  <UploadCloud className="h-4 w-4" />
                  Finalize {mode === 'checkin' ? 'Entry' : 'Exit'}
                </button>
              </div>
              <div className="absolute top-6 left-6">
                 <div className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 text-white flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Snapshot Verified</span>
                 </div>
              </div>
            </div>
          ) : (
            <>
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
                    {/* Corner Guides */}
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-blue-500/50 rounded-tl-xl"></div>
                    <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-blue-500/50 rounded-tr-xl"></div>
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-blue-500/50 rounded-bl-xl"></div>
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-blue-500/50 rounded-br-xl"></div>
                    
                    {/* Face Recognition Guide - Subtle Central Oval */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-64 h-80 border-2 border-white/10 border-dashed rounded-[100%]"></div>
                 </div>
              </div>

              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl">
                   <div className="flex flex-col items-center gap-6">
                     <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
                        <Loader2 className="h-16 w-16 text-blue-500 animate-spin relative z-10" />
                     </div>
                     <span className="text-white font-black text-xs tracking-[0.3em] uppercase opacity-70">Synchronizing Lens</span>
                   </div>
                </div>
              )}
              
              {/* Capture controls and Info Bar - Responsive Layout */}
              {isCameraReady && !capturedImage && (
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 flex items-center justify-between gap-2 pointer-events-none z-20">
                  {/* Left: Time badge */}
                  <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 shadow-xl">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                    <span className="text-[9px] sm:text-[11px] font-black tracking-widest tabular-nums text-white uppercase">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Middle: Professional Capture Button */}
                  <div className="pointer-events-auto flex-shrink-0">
                    <button 
                       onClick={handleCapture}
                       className="group relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md hover:bg-white/20 transition-all active:scale-90 shadow-2xl"
                    >
                      <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full ${mode === 'checkin' ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]'} flex items-center justify-center transition-transform group-hover:scale-105`}>
                        <Camera className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </button>
                  </div>

                  {/* Right: Location badge */}
                  <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 shadow-xl max-w-[100px] sm:max-w-[180px]">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                    <span className="text-[8px] sm:text-[10px] font-black text-white/90 uppercase tracking-widest truncate">
                       {address || 'SEARCHING...'}
                    </span>
                  </div>
                </div>
              )}

              {isCameraActive && !capturedImage && (
                <div className="absolute top-6 right-6">
                  <div className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl flex items-center gap-2 border border-white/10 shadow-2xl">
                     <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                     <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Live Biometric Stream</span>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiometricTerminal;
