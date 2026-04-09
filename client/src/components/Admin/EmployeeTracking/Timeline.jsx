import React, { useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Camera, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle,
  ExternalLink,
  Store
} from 'lucide-react';

const TimelineItem = ({ item, isFirst, isLast }) => {
  const isCheckIn = !!item.outsidePhoto;
  const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative flex gap-6 pb-12 group last:pb-0">
      {/* Central Line Connector */}
      {!isLast && (
        <div className="absolute left-[23px] top-[48px] bottom-[-12px] w-[2px] bg-slate-100 group-hover:bg-blue-100 transition-colors" />
      )}

      {/* Icon Column */}
      <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm
        ${isCheckIn ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white border-2 border-slate-100 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-500'}`}>
        {isCheckIn ? <Store className="h-5 w-5" /> : <Navigation className="h-5 w-5" />}
        
        {/* Status Indicator Dot (Only for Pulse Logs) */}
        {!isCheckIn && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
            ${item.isGpsEnabled ? 'bg-green-500' : 'bg-amber-500'}`}>
          </div>
        )}
      </div>

      {/* Content Column */}
      <div className="flex-1 space-y-3">
        {/* Header: Time & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h5 className="text-base font-black text-slate-900 tracking-tight">{timeStr}</h5>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
              ${isCheckIn ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                item.isGpsEnabled ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              {isCheckIn ? 'Site Verification' : (item.isGpsEnabled ? 'GPS Pulse' : 'Signal Lost')}
            </span>
          </div>
          <a 
            href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-blue-500"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Location Text */}
        <div className="flex items-start gap-2 text-slate-500">
           <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
           <p className="text-xs font-bold leading-relaxed">
             {item.locationName || `${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)}`}
           </p>
        </div>

        {/* Check-In Media Preview */}
        {isCheckIn && (
          <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-left-2 duration-700">
             <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Storefront View</p>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner group-media">
                   <img src={item.outsidePhoto} alt="Outside" className="w-full h-full object-cover group-media-hover:scale-110 transition-transform" />
                </div>
             </div>
             <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Interior Audit</p>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner group-media">
                   <img src={item.insidePhoto} alt="Inside" className="w-full h-full object-cover group-media-hover:scale-110 transition-transform" />
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Timeline = ({ locations = [], checkIns = [] }) => {
  // Unify and sort data by timestamp (Newest at the Top)
  const unifiedEvents = useMemo(() => {
    const combined = [...locations, ...checkIns];
    return combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [locations, checkIns]);

  if (unifiedEvents.length === 0) {
    return (
      <div className="py-20 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
         <Clock className="h-10 w-10 text-slate-200 mx-auto mb-4" />
         <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No activity stream recorded</p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 py-8">
      {unifiedEvents.map((item, idx) => (
        <TimelineItem 
          key={item._id || idx} 
          item={item} 
          isFirst={idx === 0}
          isLast={idx === unifiedEvents.length - 1}
        />
      ))}
    </div>
  );
};

export default Timeline;
