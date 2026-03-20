import React, { useRef, useState, useEffect } from 'react';
import attendanceService from '../services/attendanceService';
import { Camera, MapPin, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const AttendanceCamera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isCameraReady, setIsCameraReady] = useState(false);

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
              setStatus({ type: 'error', message: 'Location access denied. Please enable GPS.' });
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

  const captureAndMarkBatch = async () => {
    if (!isCameraReady || !location) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');

      const now = new Date();
      await attendanceService.markAttendance({
        image: imageData,
        latitude: location.latitude,
        longitude: location.longitude,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString(),
      });
      setStatus({ type: 'success', message: 'Attendance logged successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Submission failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all hover:shadow-3xl">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Punch In</h2>
          </div>
          <div className={`flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${location ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 font-bold'}`}>
            <MapPin className="h-3 w-3 mr-1" />
            {location ? 'GPS Found' : 'Locating...'}
          </div>
        </div>

        <div className="relative aspect-square sm:aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl group border-4 border-slate-50">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1] transition-transform group-hover:scale-105"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Selfie Preview</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>

        {status.message && (
          <div className={`mt-8 p-5 rounded-[1.5rem] flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-500 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            <div className={`p-2 rounded-full ${status.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {status.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <p className="text-sm font-bold leading-tight">{status.message}</p>
          </div>
        )}

        <div className="mt-10">
          <button
            onClick={captureAndMarkBatch}
            disabled={loading || !isCameraReady || !location}
            className={`w-full h-16 flex items-center justify-center rounded-[1.5rem] font-black text-lg text-white shadow-xl transition-all transform active:scale-95 ${loading || !isCameraReady || !location ? 'bg-slate-200 cursor-not-allowed shadow-none' : 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-1'}`}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Log Working Status <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-6 opacity-30">
            <div className="h-px bg-slate-300 flex-1"></div>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Security Encrypted</span>
            <div className="h-px bg-slate-300 flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCamera;
