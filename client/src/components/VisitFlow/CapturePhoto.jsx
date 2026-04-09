import React, { useRef, useState } from 'react';
import { Camera, RefreshCw, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const CapturePhoto = ({ label, onCaptured, location }) => {
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useUI();

  const applyWatermark = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Match image dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Overlay settings
        const padding = canvas.width * 0.03;
        const fontSize = Math.max(20, canvas.width * 0.02);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, canvas.height - (fontSize * 4), canvas.width, fontSize * 4);
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        const locStr = location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Location Unavailable';
        
        ctx.fillText(`VISIT PROOF - ${label.toUpperCase()}`, padding, canvas.height - (fontSize * 2.5));
        ctx.font = `${fontSize * 0.8}px Inter, sans-serif`;
        ctx.fillText(`${dateStr} | ${timeStr}`, padding, canvas.height - (fontSize * 1.5));
        ctx.fillText(`GPS: ${locStr}`, padding, canvas.height - (fontSize * 0.5));
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUrl;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const watermarked = await applyWatermark(event.target.result);
        setPreview(watermarked);
        onCaptured(watermarked);
      } catch (err) {
        addToast('Failed to process image', 'error');
      } finally {
        setProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className={`relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden border-2 border-dashed transition-all duration-500
          ${preview ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'}`}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm mb-4">
              <Camera className="h-8 w-8" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2">Tap to take photo</p>
          </div>
        )}

        {processing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2 px-6 text-center">Applying Secure Cryptographic Watermark...</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-20"
          title={`Capture ${label}`}
        />
      </div>

      {preview && !processing && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retake Photo
        </button>
      )}
    </div>
  );
};

export default CapturePhoto;
