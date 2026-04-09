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
  Map as MapIcon,
  ListTree
} from 'lucide-react';
import EmployeeRouteMap from './EmployeeRouteMap';
import Timeline from './Timeline';

const TrackingDataViewer = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold">Syncing tracking logs...</p>
      </div>
    );
  }

  if (!data || (!data.locations.length && !data.checkIns.length && !data.visits.length)) {
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

  const { locations, checkIns, visits, summary } = data;

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
              visits={visits}
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

      {/* Unified Daily Audit Trail */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
            <ListTree className="h-3 w-3" /> Daily Audit Trail
        </h4>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-10">
            <Timeline 
              locations={locations} 
              checkIns={checkIns} 
              visits={visits}
            />
        </div>
      </div>
    </div>
  );
};

export default TrackingDataViewer;
