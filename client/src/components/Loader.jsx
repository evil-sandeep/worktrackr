import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Premium Loader component
 * @param {boolean} fullScreen - If true, displays as a fixed overlay
 * @param {string} message - Optional message to display
 */
const Loader = ({ fullScreen = false, message = 'Loading...' }) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullScreen ? '' : 'p-8'}`}>
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
        {/* Animated Spinner */}
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin relative z-10" />
      </div>
      {message && (
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-500 animate-in fade-in">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
