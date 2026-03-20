import React, { useRef, useState, useEffect } from 'react';
import attendanceService from '../services/attendanceService';
import { 
  Camera, 
  MapPin, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  RefreshCcw, 
  UploadCloud,
  Clock
} from 'lucide-react';

const AttendanceCamera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsCameraReady(true);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            () => {
              setStatus({ type: 'error', message: 'GPS access denied. Please enable location.' });
            }
          );
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Camera access denied. Check permissions.' });
      }
    };

    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!isCameraReady) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setStatus({ type: '', message: '' });
  };

  const handleUpload = async () => {
    if (!capturedImage || !location) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await attendanceService.markAttendance({
        image: capturedImage,
        latitude: location.latitude,
        longitude: location.longitude,
        date: currentTime.toISOString().split('T')[0],
        time: currentTime.toLocaleTimeString(),
      });
      setStatus({ type: 'success', message: 'Attendance successfully logged!' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Upload failed.';
      const detailMsg = err.response?.data?.details || '';
      setStatus({ 
        type: 'error', 
        message: detailMsg ? `${errorMsg} (${detailMsg})` : errorMsg 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden transform transition-all hover:shadow-3xl">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Attendance Terminal</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Biometric Verification</p>
            </div>
          </div>
          <div className={`flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${location ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            <MapPin className="h-3 w-3 mr-2" />
            {location ? 'Signal Secure' : 'Locating GPS...'}
          </div>
        </div>

        {/* Camera / Preview Area */}
        <div className="relative aspect-square sm:aspect-video bg-slate-950 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-50 group">
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="captured" 
              className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" 
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
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
            </>
          )}

          {/* Flash Effect on capture can be added here if needed */}
          
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/10">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Live</span>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
             <div className="bg-black/40 backdrop-blur-lg px-5 py-3 rounded-2xl border border-white/10 text-white min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                   <Clock className="h-3.5 w-3.5 text-blue-400" />
                   <span className="text-xs font-black tracking-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                   <MapPin className="h-3.5 w-3.5 text-blue-400" />
                   <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter">
                      {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Scanning...'}
                   </span>
                </div>
             </div>
             
             {capturedImage ? (
                <button 
                  onClick={resetCapture}
                  className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90"
                  title="Retake Photo"
                >
                   <RefreshCcw className="h-6 w-6" />
                </button>
             ) : (
                <button 
                  onClick={handleCapture}
                  disabled={!isCameraReady}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90 disabled:opacity-50 disabled:scale-100 ring-8 ring-white/10"
                >
                   <div className="w-16 h-16 border-4 border-slate-900 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center transition-transform hover:scale-90">
                         <Camera className="h-6 w-6 text-white" />
                      </div>
                   </div>
                </button>
             )}
          </div>
        </div>

        {/* Metadata info below image */}
        {capturedImage && (
          <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Context</p>
              <p className="text-sm font-black text-slate-800 tracking-tight">Image Captured & Geotagged Successfully</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-500 scale-110" />
          </div>
        )}

        {/* Status Messages */}
        {status.message && (
          <div className={`mt-8 p-5 rounded-3xl flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-500 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            <div className={`p-2.5 rounded-2xl ${status.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {status.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            </div>
            <p className="text-sm font-bold leading-tight">{status.message}</p>
          </div>
        )}

        <div className="mt-10">
          <button
            onClick={capturedImage ? handleUpload : handleCapture}
            disabled={loading || !isCameraReady || !location}
            className={`w-full h-16 flex items-center justify-center rounded-[1.5rem] font-black text-lg text-white shadow-xl transition-all transform active:scale-95 ${loading || !isCameraReady || !location ? 'bg-slate-200 cursor-not-allowed shadow-none font-bold' : 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-1'}`}
          >
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <span className="flex items-center gap-3">
                {capturedImage ? (
                  <>Submit Logs <UploadCloud className="h-6 w-6" /></>
                ) : (
                  <>Point and Capture <ArrowRight className="h-6 w-6" /></>
                )}
              </span>
            )}
          </button>
          
          <p className="mt-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-40">
            End-to-End Encrypted &bull; 256-bit AES
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCamera;
