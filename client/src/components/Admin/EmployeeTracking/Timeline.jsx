import React, { useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Camera, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle,
  ExternalLink,
  Store,
  Wifi,
  WifiOff
} from 'lucide-react';

const TimelineItem = ({ item, isFirst, isLast }) => {
  const isVisit = !!item.outsidePhoto;
  const isBiometric = !!item.locationName && !item.isGpsEnabled === undefined; // CheckIn model vs LocationLog
  
  // Model specific identifiers
  const isCheckIn = !!item.outsidePhoto; 
  const itemDate = item.timestamp || item.createdAt;
  const timeStr = new Date(itemDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Determine Icon and Color based on type
  const getTypeConfig = () => {
    if (isCheckIn) return { 
      icon: <Store className="h-5 w-5" />, 
      color: 'bg-indigo-600 text-white shadow-indigo-100',
      label: 'Site Verification',
      statusColor: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    };
    
    return {
      icon: <Navigation className="h-5 w-5" />,
      color: 'bg-white border-2 border-slate-100 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-500',
      label: item.isGpsEnabled ? 'GPS Pulse' : 'Signal Lost',
      statusColor: item.isGpsEnabled ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
    };
  };

  const config = getTypeConfig();

  return (
    <div className="relative flex gap-6 pb-12 group last:pb-0">
      {/* Central Line Connector */}
      {!isLast && (
        <div className="absolute left-[23px] top-[48px] bottom-[-12px] w-[2px] bg-slate-100 group-hover:bg-blue-100 transition-colors" />
      )}

      {/* Icon Column */}
      <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${config.color}`}>
        {config.icon}
        
        {/* Signal Status Indicator */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm
          ${item.isGpsEnabled === false ? 'bg-amber-500' : 'bg-green-500'}`}>
          {item.isGpsEnabled === false ? <WifiOff size={8} className="text-white" /> : <Wifi size={8} className="text-white" />}
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 space-y-3">
        {/* Header: Time & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h5 className="text-base font-black text-slate-900 tracking-tight">{timeStr}</h5>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.statusColor}`}>
              {config.label}
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
           <div className="flex flex-col">
             <p className="text-xs font-bold leading-relaxed text-slate-700">
               {item.address?.fullAddress || item.locationName || `${item.latitude?.toFixed(6) || 'N/A'}, ${item.longitude?.toFixed(6) || 'N/A'}`}
             </p>
             {item.accuracy && (
               <p className="text-[10px] font-bold text-blue-500 mt-1">
                 GPS Accuracy: {Math.round(item.accuracy)}m
               </p>
             )}
             {item.address?.village && (
               <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                 {item.address.village}, {item.address.district}
               </p>
             )}
           </div>
        </div>

        {/* Media Preview (Photos) */}
        {isCheckIn && (
          <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-left-2 duration-700">
             <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exterior View</p>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner group-media">
                   <img src={item.outsidePhoto} alt="Outside" className="w-full h-full object-cover group-media-hover:scale-110 transition-transform" />
                </div>
             </div>
             <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal Audit</p>
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

const Timeline = ({ locations = [], checkIns = [], visits = [] }) => {
  // Unify and sort data by timestamp (Newest at the Top)
  const unifiedEvents = useMemo(() => {
    const combined = [...locations, ...checkIns, ...visits];
    return combined.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.createdAt);
      const dateB = new Date(b.timestamp || b.createdAt);
      return dateB - dateA;
    });
  }, [locations, checkIns, visits]);

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
