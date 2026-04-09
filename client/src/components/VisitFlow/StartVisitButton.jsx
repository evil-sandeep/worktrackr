import React, { useState } from 'react';
import { Play, Loader2, MapPin, AlertCircle } from 'lucide-react';
import visitService from '../../services/visitService';
import { useUI } from '../../context/UIContext';

const StartVisitButton = ({ onStarted }) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useUI();

  const handleStart = async () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await visitService.startVisit(latitude, longitude);
          
          if (response.success) {
            addToast('Visit started successfully', 'success');
            onStarted(response.data._id, { latitude, longitude });
          } else {
            addToast(response.message || 'Failed to start visit', 'error');
          }
        } catch (error) {
          console.error('Start Visit Error:', error);
          addToast(error.response?.data?.message || 'Error communicating with server', 'error');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        let errorMsg = 'Failed to get location';
        if (error.code === 1) errorMsg = 'Location permission denied. Please enable GPS.';
        else if (error.code === 2) errorMsg = 'Location unvailable.';
        else if (error.code === 3) errorMsg = 'Location request timed out.';
        
        addToast(errorMsg, 'error');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="w-full">
      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full group relative flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin relative z-10" />
        ) : (
          <Play className="h-5 w-5 fill-current relative z-10" />
        )}
        
        <span className="relative z-10">
          {loading ? 'Initializing Visit...' : 'Start New Store Visit'}
        </span>
      </button>
      
      <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
        <MapPin className="h-3 w-3" />
        GPS Verification Required
      </p>
    </div>
  );
};

export default StartVisitButton;
