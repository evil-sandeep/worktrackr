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
import authService from '../services/authService';
import { formatDateKey } from './Calendar/useCalendar';

const BiometricTerminal = ({ mode = 'checkin', onSuccess }) => {
  const { showLoader, addToast, addNotification } = useUI();
  const userData = authService.getCurrentUser();
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
      addNotification(
        mode === 'checkin' ? 'Check-in Verified' : 'Check-out Success',
        `${userData?.name || 'User'} successfully ${mode === 'checkin' ? 'checked in' : 'checked out'} at ${address || 'Verified Location'}`,
        'success'
      );
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
    <div className="space-y-6">

      <div className="relative aspect-square sm:aspect-video min-h-[300px] sm:min-h-[400px] bg-slate-950 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl group ring-1 ring-slate-100/10">
        {!isCameraActive && !capturedImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4 sm:space-y-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_var(--tw-gradient-to)_100%)] from-slate-900 to-slate-950">
             <div className="relative">
                <div className={`absolute inset-0 ${mode === 'checkin' ? 'bg-blue-600/30' : 'bg-rose-600/30'} rounded-full blur-[30px] animate-pulse`}></div>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 ${mode === 'checkin' ? 'bg-blue-600 shadow-xl shadow-blue-500/20' : 'bg-rose-600 shadow-xl shadow-rose-500/20'} rounded-2xl sm:rounded-[2rem] flex items-center justify-center relative z-10 transform hover:scale-110 transition-all duration-500`}>
                   {mode === 'checkin' ? (
                     <Camera className="h-7 w-7 sm:h-8 sm:w-8 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                   ) : (
                     <LogOut className="h-7 w-7 sm:h-8 sm:w-8 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                   )}
                </div>
             </div>
             <div className="space-y-2 max-w-xs">
               <h3 className="text-white text-base sm:text-lg font-black uppercase tracking-tight">System Initialization</h3>
               <p className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                 Identity scan required for session {mode === 'checkin' ? 'auth' : 'exit'}
               </p>
             </div>
             <button 
              onClick={startCamera}
              className={`group flex items-center gap-3 px-8 py-3.5 ${mode === 'checkin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-xl sm:rounded-2xl font-black transition-all shadow-2xl hover:shadow-${mode === 'checkin' ? 'blue' : 'rose'}-500/40 active:scale-95 transform hover:-translate-y-1`}
             >
               <span className="text-[10px] font-black tracking-[0.25em] uppercase">Authenticate</span>
               <ShieldCheck className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </button>
          </div>
        ) : capturedImage ? (
          <div className="relative w-full h-full animate-in fade-in duration-700">
            <img 
              src={capturedImage} 
              alt="captured" 
              className="w-full h-full object-cover scale-[1.01]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md bg-white/5 p-4 sm:p-6 rounded-3xl sm:rounded-[2.5rem] border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                   <div>
                    <h4 className="text-white font-bold text-[10px] tracking-tight">Identity Verified</h4>
                    <p className="text-white/30 text-[8px] font-bold uppercase tracking-[0.2em]">{currentTime.toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button onClick={resetCapture} className="flex-1 sm:flex-initial px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                    Retry
                  </button>
                  <button 
                    onClick={handleUpload}
                    className={`flex-1 sm:flex-initial px-8 py-3 ${mode === 'checkin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2`}
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload Log
                  </button>
                </div>
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
               <div className="w-full h-full relative">
                  {/* Digital Scanline Effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]"></div>
                  
                  {/* Corners */}
                  <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-blue-500/60 rounded-tl-xl shadow-[-2px_-2px_10px_rgba(59,130,246,0.3)]"></div>
                  <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-blue-500/60 rounded-tr-xl shadow-[2px_-2px_10px_rgba(59,130,246,0.3)]"></div>
                  <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-blue-500/60 rounded-bl-xl shadow-[-2px_2px_10px_rgba(59,130,246,0.3)]"></div>
                  <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-blue-500/60 rounded-br-xl shadow-[2px_2px_10px_rgba(59,130,246,0.3)]"></div>
                  
                  {/* Face Recognition Hub */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-64 h-80 border-2 border-blue-400/20 border-dashed rounded-[3rem] animate-pulse-subtle"></div>
               </div>
            </div>

            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl">
                 <div className="flex flex-col items-center gap-6">
                   <div className="relative">
                      <div className="w-20 h-20 border-2 border-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
                      <Loader2 className="h-12 w-12 text-blue-500 animate-spin relative z-10" />
                   </div>
                   <span className="text-white font-black text-[10px] tracking-[0.4em] uppercase opacity-60">Synchronizing Lens API</span>
                 </div>
              </div>
            )}
            
            {isCameraReady && !capturedImage && (
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 pointer-events-none z-20">
                <div className="flex-shrink-0 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  <span className="text-[10px] font-black tracking-widest tabular-nums text-white uppercase">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="pointer-events-auto">
                  <button 
                     onClick={handleCapture}
                     className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all active:scale-90 shadow-2xl"
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${mode === 'checkin' ? 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'bg-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.4)]'} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  </button>
                </div>

                <div className="flex-shrink-0 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl flex items-center gap-3 max-w-[120px] sm:max-w-[200px]">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                   <span className="text-[8px] font-bold text-white/70 uppercase tracking-[0.2em] truncate">
                     {address ? 'SIGNAL_LOCKED' : 'SEARCHING...'}
                  </span>
                </div>
              </div>
            )}

            {isCameraActive && !capturedImage && (
              <div className="absolute top-8 right-8">
                <div className="px-5 py-2.5 bg-black/40 backdrop-blur-xl rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl">
                   <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(244,63,94,1)]"></div>
                    <span className="text-[8px] font-bold text-white/60 uppercase tracking-[0.3em]">Live // Auth_Mode</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


export default BiometricTerminal;
