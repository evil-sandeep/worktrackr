import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const CapturePhoto = ({ label, onCaptured, location }) => {
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const { addToast } = useUI();

  // Stop camera stream utility
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  // Start camera stream
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      setIsStreaming(true);
      setError(null);
    } catch (err) {
      console.error('Camera Access Error:', err);
      const msg = err.name === 'NotAllowedError' ? 'Camera permission denied' : 'Camera inaccessible (maybe in use by another app?)';
      setError(msg);
      addToast(msg, 'error');
    }
  };

  // Explicitly attach stream to video when element is ready
  useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      console.log('[Camera] Stream attached to video element');
    }
  }, [isStreaming]);

  // Watermark implementation
  const applyWatermark = (canvas) => {
    const ctx = canvas.getContext('2d');
    
    // Overlay settings
    const padding = canvas.width * 0.03;
    const fontSize = Math.max(24, canvas.width * 0.025);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height - (fontSize * 5), canvas.width, fontSize * 5);
    
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    const locStr = location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'GPS Not Found';
    
    ctx.fillText(`SECURE AUDIT - ${label.toUpperCase()}`, padding, canvas.height - (fontSize * 3.2));
    ctx.font = `${fontSize * 0.85}px Inter, sans-serif`;
    ctx.fillText(`CAPTURE: ${dateStr} ${timeStr}`, padding, canvas.height - (fontSize * 2));
    ctx.fillText(`COORDS: ${locStr}`, padding, canvas.height - (fontSize * 0.8));
    
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Capture current frame
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Match dimensions to video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const watermarkedData = applyWatermark(canvas);
    setPreview(watermarkedData);
    onCaptured(watermarkedData);
    
    stopCamera();
    setProcessing(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className={`relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden border-2 transition-all duration-500 shadow-2xl
          ${preview && !isStreaming ? 'border-emerald-500 bg-emerald-50/10' : isStreaming ? 'border-blue-500 ring-4 ring-blue-50' : 'border-dashed border-slate-200 bg-white hover:border-blue-300 group'}`}
      >
        {/* Live Viewfinder */}
        {isStreaming && (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover bg-slate-900"
          />
        )}

        {/* Captured Preview */}
        {preview && !isStreaming && (
          <img src={preview} alt={label} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />
        )}

        {/* Placeholder / Tap to Start */}
        {!isStreaming && !preview && !error && (
          <button 
            onClick={startCamera}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <Camera className="h-10 w-10" />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{label}</p>
            <p className="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">Open Live Camera</p>
          </button>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-rose-50/50 backdrop-blur-sm">
            <XCircle className="h-14 w-14 text-rose-500 mb-4" />
            <p className="text-sm font-black text-rose-900 uppercase tracking-widest mb-2">Hardware Error</p>
            <p className="text-xs font-bold text-rose-600 max-w-[200px] mb-6">{error}</p>
            <button onClick={startCamera} className="px-8 py-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95">Restart Hardware</button>
          </div>
        )}

        {/* High-Contrast Capture Controls Overlay */}
        {isStreaming && (
          <div className="absolute inset-0 flex flex-col justify-end p-8 z-30 pointer-events-none">
            <div className="flex items-center justify-between w-full pointer-events-auto">
              <button 
                onClick={stopCamera}
                className="p-4 bg-black/40 backdrop-blur-xl text-white rounded-3xl hover:bg-black/60 transition-all active:scale-90"
                title="Cancel"
              >
                <XCircle className="h-6 w-6" />
              </button>

              <button 
                onClick={captureFrame}
                disabled={processing}
                className="group flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full border-[6px] border-white flex items-center justify-center bg-transparent shadow-2xl transition-all active:scale-75 group-hover:scale-105">
                  <div className="w-14 h-14 rounded-full bg-white shadow-inner group-hover:bg-blue-50" />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mt-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Capture</p>
              </button>

              <div className="w-14" /> {/* Spacer */}
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {processing && (
          <div className="absolute inset-0 bg-blue-600/90 backdrop-blur-md flex flex-col items-center justify-center z-40 animate-in fade-in duration-300">
            <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
            <p className="text-xs font-black text-white uppercase tracking-[0.3em] px-6 text-center">Encrypting Audit Bundle...</p>
          </div>
        )}
        
        {/* Hidden Canvas for Frame Extraction */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {preview && !isStreaming && !processing && (
        <div className="flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-500">
          <button 
            onClick={startCamera}
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Retake
          </button>
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            Verified
          </div>
        </div>
      )}
    </div>
  );
};

export default CapturePhoto;
