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
    context.fillText(mode === 'checkin' ? 'VERIFIED CHECK-IN' : 'VERIFIED CHECK-OUT', canvas.width - 140, canvas.height - 45);

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
      
      addToast(`${mode === 'checkin' ? 'Check-in' : 'Check-out'} logged successfully!`, 'success');
      setCapturedImage(null);
      setCapturedData(null);
      setIsCameraActive(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      addToast('Submission failed. Please try again.', 'error');
    } finally {
      showLoader(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setCapturedData(null);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden transform transition-all hover:shadow-3xl">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${mode === 'checkin' ? 'bg-blue-600' : 'bg-rose-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
              {mode === 'checkin' ? <ShieldCheck className="h-6 w-6 text-white" /> : <LogOut className="h-6 w-6 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {mode === 'checkin' ? 'Check-In' : 'Check-Out'} Terminal
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Biometric Verification</p>
            </div>
          </div>
          <div className={`flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${address ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            <MapPin className="h-3 w-3 mr-2" />
            {address ? 'Signal Secure' : 'Scanning GPS...'}
          </div>
        </div>

        <div className="relative aspect-square sm:aspect-video bg-slate-950 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-50 group">
          {!isCameraActive && !capturedImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-900">
               <div className={`w-24 h-24 ${mode === 'checkin' ? 'bg-blue-600/10' : 'bg-rose-600/10'} rounded-[2.5rem] flex items-center justify-center border border-white/5`}>
                  {mode === 'checkin' ? <Camera className="h-10 w-10 text-blue-500" /> : <LogOut className="h-10 w-10 text-rose-500" />}
               </div>
               <div className="space-y-2">
                 <h3 className="text-white text-xl font-black">{mode === 'checkin' ? 'Begin Shift' : 'End Shift'}</h3>
                 <p className="text-slate-400 text-sm font-medium max-w-[240px]">Initialize lens for biometric verification</p>
               </div>
               <button 
                onClick={startCamera}
                className={`px-8 py-3 ${mode === 'checkin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all active:scale-95`}
               >
                 Start Camera
               </button>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full h-full">
              <img 
                src={capturedImage} 
                alt="captured" 
                className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" 
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                <button onClick={resetCapture} className="px-6 py-2.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                  Retake
                </button>
                <button 
                  onClick={handleUpload}
                  className={`px-8 py-2.5 ${mode === 'checkin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2`}
                >
                  <UploadCloud className="h-4 w-4" />
                  Submit {mode === 'checkin' ? 'Check-In' : 'Check-Out'}
                </button>
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
                className="w-full h-full object-cover transform scale-x-[-1] transition-transform group-hover:scale-105"
              />
              <canvas ref={canvasRef} className="hidden" />
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
                   <div className="flex flex-col items-center gap-4">
                     <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                     <span className="text-white font-bold text-sm tracking-widest uppercase">Initializing Lens</span>
                   </div>
                </div>
              )}
              
              {isCameraReady && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                   <button 
                     onClick={handleCapture}
                     className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all active:scale-90`}
                   >
                     <div className={`w-12 h-12 rounded-full ${mode === 'checkin' ? 'bg-blue-600' : 'bg-rose-600'} flex items-center justify-center`}>
                        <Camera className="h-6 w-6 text-white" />
                     </div>
                   </button>
                </div>
              )}
            </>
          )}

          {isCameraActive && !capturedImage && (
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/10">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Terminal</span>
              </div>
            </div>
          )}

          {isCameraActive && !capturedImage && (
            <div className="absolute bottom-24 left-6 right-6 flex items-end justify-between pointer-events-none">
               <div className="bg-black/40 backdrop-blur-lg px-5 py-3 rounded-2xl border border-white/10 text-white min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1">
                     <Clock className="h-3.5 w-3.5 text-blue-400" />
                     <span className="text-xs font-black tracking-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <MapPin className="h-3.5 w-3.5 text-blue-400" />
                     <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter truncate max-w-[100px]">
                        {address || 'Locating...'}
                     </span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiometricTerminal;
