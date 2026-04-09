import { 
  MapPin, 
  Clock, 
  Camera, 
  Store, 
  Building2, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Navigation,
  Image as ImageIcon,
  Map as MapIcon
} from 'lucide-react';
import EmployeeRouteMap from './EmployeeRouteMap';

const TrackingDataViewer = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold">Syncing tracking logs...</p>
      </div>
    );
  }

  if (!data || (!data.locations.length && !data.checkIns.length)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-1">No Activity Detected</h3>
        <p className="text-slate-400 text-sm font-medium">The employee was not active or GPS was disabled on this date.</p>
      </div>
    );
  }

  const { locations, checkIns, summary } = data;

  return (
    <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Route Visualization Map */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
            <MapIcon className="h-3 w-3" /> Route Visualization
        </h4>
        <div className="h-[400px] w-full">
            <EmployeeRouteMap 
              locations={locations} 
              checkIns={checkIns} 
            />
        </div>
      </div>

      {/* Last Seen Quick Link */}
      {summary?.lastLocation && (
        <div className="p-6 bg-blue-600 rounded-[2rem] border-4 border-blue-100 shadow-xl shadow-blue-100 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Navigation className="h-6 w-6 text-white" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Last Known Pulse</p>
                <p className="text-lg font-black tracking-tight">{summary.lastLocation.name || 'Site Visit'}</p>
             </div>
          </div>
          <a 
            href={`https://www.google.com/maps?q=${summary.lastLocation.latitude},${summary.lastLocation.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            Live Map
          </a>
        </div>
      )}

      {/* Multi-Photo Check-Ins */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Verification Check-Ins</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {checkIns.map((ci, idx) => (
            <div key={ci._id || idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Store className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Site Entry</p>
                    <p className="text-sm font-black text-slate-900">{new Date(ci.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" /> Hardware Verified
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Outside</p>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner group">
                    <img src={ci.outsidePhoto} alt="Outside" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inside</p>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner group">
                    <img src={ci.insidePhoto} alt="Inside" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                 <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                 <p className="text-xs font-bold text-slate-600 truncate">{ci.locationName}</p>
                 <a 
                   href={`https://www.google.com/maps?q=${ci.latitude},${ci.longitude}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="ml-auto p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                 >
                   <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                 </a>
              </div>
            </div>
          ))}
          {checkIns.length === 0 && (
            <div className="md:col-span-2 p-10 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
              <Camera className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Verifications for this date</p>
            </div>
          )}
        </div>
      </div>

      {/* Hourly Location Pulse */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Hourly Location Logs</h4>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm divide-y divide-slate-50">
          {locations.map((loc, idx) => (
            <div key={loc._id || idx} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    {loc.isGpsEnabled ? 'GPS Active' : 'Fallback (GPS Disabled)'}
                  </p>
                </div>
              </div>
              
              <div className="flex-1 px-8">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">{loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}</span>
                 </div>
              </div>

              <a 
                 href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2 bg-slate-50 group-hover:bg-blue-600 rounded-xl text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-all"
              >
                Map <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
          {locations.length === 0 && (
            <div className="p-10 text-center text-slate-300">
               <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-widest">No pulse logs available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingDataViewer;
