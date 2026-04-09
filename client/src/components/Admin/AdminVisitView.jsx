import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  ExternalLink,
  Loader2,
  FileText
} from 'lucide-react';
import visitService from '../../services/visitService';

const AdminVisitView = ({ employeeId }) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      try {
        const response = await visitService.getEmployeeVisits(employeeId, selectedDate);
        if (response.success) {
          setVisits(response.data);
        }
      } catch (error) {
        console.error('Fetch Visits Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchVisits();
  }, [employeeId, selectedDate]);

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

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
           <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Synchronizing Audit Records...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className="py-20 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
           <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No visit audits recorded for this date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
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
                      <MapPin className="h-5 w-5 text-indigo-500 mt-0.5" />
                      <div>
                         <p className="text-sm font-black text-slate-900 leading-tight">Coordinates Verification</p>
                         <p className="text-xs font-bold text-slate-400 mt-1">{visit.latitude.toFixed(6)}, {visit.longitude.toFixed(6)}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-3">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Exterior Verification</p>
                         <div className="aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                            <img src={visit.outsidePhoto} alt="Outside" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Internal Compliance</p>
                         <div className="aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                            <img src={visit.insidePhoto} alt="Inside" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVisitView;
