import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  ExternalLink,
  Loader2,
  FileText,
  Map as MapIcon,
  List as ListIcon,
  X as CloseIcon,
  Download,
  SearchIcon,
  Maximize2
} from 'lucide-react';
import adminService from '../../services/adminService';
import TrackingMap from './TrackingMap';

const AdminVisitView = ({ employeeId }) => {
  const [data, setData] = useState({ visits: [], locations: [], checkIns: [] });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // { url, label }
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await adminService.getDailyTracking(employeeId, selectedDate);
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Fetch Tracking Data Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchData();
  }, [employeeId, selectedDate]);

  const visits = data.visits || [];
  const locations = data.locations || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
             <Store className="h-6 w-6" />
          </div>
          <div>
             <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Store Site Audits</h2>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Verified Field Proofs</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
               onClick={() => setViewMode('list')}
               className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
               title="List View"
             >
               <ListIcon className="h-5 w-5" />
             </button>
             <button 
               onClick={() => setViewMode('map')}
               className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
               title="Map View"
             >
               <MapIcon className="h-5 w-5" />
             </button>
          </div>

          <div className="relative group">
             <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
             <input 
               type="date"
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="pl-12 pr-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest focus:border-indigo-500 outline-none transition-all cursor-pointer"
             />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
           <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Synchronizing Audit Records...</p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <TrackingMap locations={locations} visits={visits} />
        </div>
      ) : visits.length === 0 ? (
        <div className="py-20 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
           <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No visit audits recorded for this date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {visits.map((visit) => (
            <div key={visit._id} className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
              <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                            Visit ID: {visit._id.slice(-8).toUpperCase()}
                         </div>
                         <span className="text-xs font-bold text-slate-400">
                           {new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <a 
                        href={`https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl flex items-center justify-center transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                   </div>

                   <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Location Verification</p>
                         <p className="text-sm font-black text-slate-900 leading-tight truncate-2-lines">
                            {visit.address || `${visit.latitude.toFixed(6)}, ${visit.longitude.toFixed(6)}`}
                         </p>
                         {visit.address && (
                           <p className="text-[10px] font-bold text-slate-400 mt-1">
                              GPS: {visit.latitude.toFixed(6)}, {visit.longitude.toFixed(6)}
                           </p>
                         )}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-2">
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Exterior Verification</p>
                          <div 
                            onClick={() => setSelectedImage({ url: visit.outsidePhoto, label: 'Exterior Site View' })}
                            className="aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner cursor-pointer relative group/img"
                          >
                             <img src={visit.outsidePhoto} alt="Outside" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                             <div className="absolute inset-0 bg-indigo-600/0 group-hover/img:bg-indigo-600/20 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl transform translate-y-4 group-hover/img:translate-y-0 transition-transform">
                                   <Maximize2 className="h-6 w-6 text-indigo-600" />
                                </div>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Internal Compliance</p>
                          <div 
                            onClick={() => setSelectedImage({ url: visit.insidePhoto, label: 'Internal Audit View' })}
                            className="aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner cursor-pointer relative group/img"
                          >
                             <img src={visit.insidePhoto} alt="Inside" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                             <div className="absolute inset-0 bg-indigo-600/0 group-hover/img:bg-indigo-600/20 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl transform translate-y-4 group-hover/img:translate-y-0 transition-transform">
                                   <Maximize2 className="h-6 w-6 text-indigo-600" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Zoom Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"></div>
           
           <div 
             className="relative max-w-5xl w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="absolute top-6 right-6 z-10 flex gap-2">
                 <a 
                   href={selectedImage.url} 
                   download 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-12 h-12 bg-white/10 hover:bg-indigo-600 backdrop-blur-md text-white rounded-2xl flex items-center justify-center transition-all border border-white/20 shadow-lg"
                   title="Download Proof"
                 >
                    <Download className="h-5 w-5" />
                 </a>
                 <button 
                   onClick={() => setSelectedImage(null)}
                   className="w-12 h-12 bg-white/10 hover:bg-rose-500 backdrop-blur-md text-white rounded-2xl flex items-center justify-center transition-all border border-white/20 shadow-lg"
                 >
                    <CloseIcon className="h-5 w-5" />
                 </button>
              </div>

              <div className="p-4 sm:p-8 bg-slate-900 flex items-center justify-between border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                       <Maximize2 className="h-5 w-5" />
                     </div>
                    <div>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Evidence Magnifier</p>
                       <h4 className="text-white font-bold tracking-tight">{selectedImage.label}</h4>
                    </div>
                 </div>
              </div>

              <div className="relative aspect-video sm:aspect-auto sm:h-[70vh] bg-black group/zoom">
                 <img 
                   src={selectedImage.url} 
                   alt="Audit Proof" 
                   className="w-full h-full object-contain"
                 />
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/zoom:opacity-100 transition-opacity">
                    Inspection Mode Active
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminVisitView;
