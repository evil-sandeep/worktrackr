import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';
import { useUI } from '../context/UIContext';

const Toast = () => {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[110] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <ShieldAlert className="h-5 w-5 text-rose-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
  };

  const colors = {
    success: 'border-green-100 bg-white shadow-green-100',
    error: 'border-rose-100 bg-white shadow-rose-100',
    info: 'border-blue-100 bg-white shadow-blue-100',
    warning: 'border-amber-100 bg-white shadow-amber-100',
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-4 p-4 pr-12 rounded-2xl border ${colors[toast.type]} shadow-2xl transition-all duration-500 animate-in slide-in-from-right-full fade-in relative overflow-hidden group hover:scale-[1.02]`}>
      {/* Dynamic progress bar at bottom */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full overflow-hidden">
         <div className={`h-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-blue-600'} animate-toast-progress`}></div>
      </div>

      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-900 truncate tracking-tight">{toast.message}</p>
      </div>
      <button 
        onClick={onClose}
        className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
