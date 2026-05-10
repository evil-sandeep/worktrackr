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
  LogIn,
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
  const [fullAddress, setFullAddress] = useState(null);
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
      let fetchedShortAddress = '';
      let fetchedFullAddress = '';

      // 1. Try Google Maps First
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
          const result = data.results[0];
          fetchedFullAddress = result.formatted_address;
          fetchedShortAddress = fetchedFullAddress.split(',').slice(0, 3).join(','); // Get exact location parts
        } else {
          console.warn('Google Maps Geocoding failed:', data.status, data.error_message);
        }
      }

      // 2. Fallback to OpenStreetMap Nominatim if Google Maps failed or is missing
      if (!fetchedShortAddress) {
        console.log('Falling back to OpenStreetMap Geocoding...');
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: { 'Accept-Language': 'en-US,en' }
        });
        const data = await res.json();
        if (data && data.display_name) {
          fetchedFullAddress = data.display_name;
          // Extract a nice exact location (e.g. first 3 parts of the address)
          fetchedShortAddress = data.display_name.split(',').slice(0, 3).join(','); 
        }
      }

      if (fetchedShortAddress) {
        setAddress(fetchedShortAddress.trim());
        setFullAddress(fetchedFullAddress.trim());
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
    
    // Prioritize the exact full location name. Fall back to coordinates only if both APIs fail.
    let locStr = fullAddress ? fullAddress : (address ? address : `LOC: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
    
    // Truncate if it's exceptionally long to prevent canvas overflow (though 1280px is wide)
    if (locStr.length > 90) {
      locStr = locStr.substring(0, 87) + '...';
    }

    context.fillText(`${dateStr} | ${timeStr}`, 40, canvas.height - 60);
    context.font = '18px Inter, sans-serif';
    context.fillText(`📍 ${locStr}`, 40, canvas.height - 30);

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
      location: fullAddress ? `${fullAddress}\n${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : `${location.latitude},${location.longitude}`
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
    <div className="flex-1 w-full flex flex-col min-h-0">
      <div className="relative flex-1 w-full bg-[#11100F] rounded-sm overflow-hidden shadow-xl border border-[#EDEBE9] group min-h-0 min-w-[300px]">
        {!isCameraActive && !capturedImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-8 bg-[#FAF9F8]">
            <div
              className={`relative group/btn ${!userData?.isPaid && userData?.role === 'employee' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              onClick={() => {
                if (!userData?.isPaid && userData?.role === 'employee') {
                  addToast('Payment Required: 2000 Units needed for full activation.', 'warning');
                  return;
                }
                startCamera();
              }}
            >
              {/* Azure Pulse Effect */}
              <div className={`absolute inset-0 ${mode === 'checkin' ? 'bg-[#0078D4]/10' : 'bg-[#E81123]/10'} rounded-full blur-2xl animate-pulse transition-all duration-700`}></div>

              <button
                disabled={!userData?.isPaid && userData?.role === 'employee'}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 ${mode === 'checkin' ? 'bg-[#0078D4]' : 'bg-[#E81123]'} text-white rounded-sm flex items-center justify-center transform ${!userData?.isPaid && userData?.role === 'employee' ? '' : 'group-hover/btn:scale-105'} transition-all duration-300 shadow-lg`}
              >
                {mode === 'checkin' ? (
                  <LogIn className="h-10 w-10 sm:h-12 sm:w-12" />
                ) : (
                  <LogOut className="h-10 w-10 sm:h-12 sm:w-12" />
                )}
              </button>
            </div>

            {/* Payment Requirement Message */}
            {!userData?.isPaid && userData?.role === 'employee' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-sm text-amber-700 text-xs font-bold animate-in slide-in-from-bottom-2 duration-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                PAYMENT REQUIRED: CONTACT ADMIN
              </div>
            )}

            <div className="space-y-2">
              <h3 className={`text-lg font-bold uppercase tracking-tight ${mode === 'checkin' ? 'text-[#0078D4]' : 'text-[#E81123]'}`}>
                {mode === 'checkin' ? 'Initialize Ingress' : 'Initialize Egress'}
              </h3>
              <p className="text-[#605E5C] text-[10px] font-semibold uppercase tracking-wider leading-relaxed">
                {!userData?.isPaid && userData?.role === 'employee'
                  ? 'Full Identity Activation Required'
                  : 'Biometric Identity Verification Required'}
              </p>
            </div>
          </div>
        ) : capturedImage ? (
          <div className="relative w-full h-full animate-in fade-in duration-500">
            <img
              src={capturedImage}
              alt="captured"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-sm border border-[#EDEBE9] shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#DFF6DD] rounded-sm flex items-center justify-center border border-[#107C10]/20">
                    <CheckCircle className="h-4 w-4 text-[#107C10]" />
                  </div>
                  <div>
                    <h4 className="text-[#323130] font-bold text-[11px] tracking-tight">Telemetry Captured</h4>
                    <p className="text-[#605E5C] text-[9px] font-bold uppercase tracking-wider">{currentTime.toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={resetCapture} className="flex-1 sm:flex-initial px-4 py-1.5 bg-[#F3F2F1] hover:bg-[#EDEBE9] text-[#323130] rounded-sm font-bold text-[10px] uppercase tracking-wider transition-all border border-[#D2D0CE]">
                    Discard
                  </button>
                  <button
                    onClick={handleUpload}
                    className={`flex-1 sm:flex-initial px-6 py-1.5 ${mode === 'checkin' ? 'bg-[#0078D4] hover:bg-[#005A9E]' : 'bg-[#E81123] hover:bg-[#A80000]'} text-white rounded-sm font-bold text-[10px] uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2`}
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    Commit Log
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
              className="w-full h-full object-cover transform scale-x-[-1] opacity-90"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder Overlay - Azure Professional Style */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full relative">
                {/* Digital Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

                {/* Precision Corners */}
                <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-[#0078D4]"></div>
                <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-[#0078D4]"></div>
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-[#0078D4]"></div>
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-[#0078D4]"></div>

                {/* Central Reticle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-sm">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5"></div>
                </div>
              </div>
            </div>

            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#11100F]">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 text-[#0078D4] animate-spin" />
                  <span className="text-white font-bold text-[9px] tracking-widest uppercase opacity-60">Initializing Azure Lens...</span>
                </div>
              </div>
            )}

            {isCameraReady && !capturedImage && (
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none z-20">
                <div className="flex-shrink-0 px-3 py-1 bg-black/60 rounded-sm border border-white/10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0078D4] rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider tabular-nums">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="pointer-events-auto">
                  <button
                    onClick={handleCapture}
                    className="group relative w-16 h-16 rounded-full border border-white/40 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90"
                  >
                    <div className={`w-12 h-12 rounded-full ${mode === 'checkin' ? 'bg-[#0078D4]' : 'bg-[#E81123]'} flex items-center justify-center`}>
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </button>
                </div>

                <div className="flex-shrink-0 px-3 py-1 bg-black/60 rounded-sm border border-white/10 flex items-center gap-2 max-w-[150px]">
                  <MapPin className="h-3 w-3 text-[#0078D4]" />
                  <span className="text-[9px] font-bold text-white/80 uppercase tracking-wider truncate">
                    {address ? 'SIGNAL_LOCKED' : 'SYNCING GPS...'}
                  </span>
                </div>
              </div>
            )}

            {isCameraActive && !capturedImage && (
              <div className="absolute top-6 right-6">
                <div className="px-3 py-1 bg-[#E81123] rounded-sm flex items-center gap-2 shadow-lg">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">Live Remote Auth</span>
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
