import React from 'react';
import { Camera, Clock, Image as ImageIcon, Map, MapPin } from 'lucide-react';

const LogDetailSidebar = ({ selectedDate, selectedRecord }) => {
  return (
    <div className="lg:col-span-12 xl:col-span-4">
      <div className="sticky top-0 space-y-6">
        <h4 className="text-lg font-black text-slate-900 tracking-tight">Day Log Detail</h4>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest -mt-5">
          Selected: {selectedDate}
        </p>

        {selectedRecord ? (
          <div className="space-y-6">
            <div className={`p-6 rounded-[2rem] border ${selectedRecord.status === 'absent' ? 'bg-rose-50 border-rose-100' : 'bg-green-50 border-green-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${selectedRecord.status === 'absent' ? 'bg-rose-500' : 'bg-green-600'}`}>
                  {selectedRecord.status || 'Present'}
                </span>
                <div className="flex items-center gap-1.5 text-slate-900 font-black text-lg">
                  ₹{selectedRecord.earning || 0}
                </div>
              </div>
              {selectedRecord.status !== 'absent' && (
                <div className="flex items-center gap-3 text-slate-600 text-sm font-bold uppercase tracking-widest">
                  <Clock className="h-4 w-4" />
                  Worked {selectedRecord.totalHours || '--:--'}
                </div>
              )}
            </div>

            {selectedRecord.status !== 'absent' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Camera className="h-3 w-3" /> Check-In
                    </p>
                    <div className="aspect-[3/4] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                      {selectedRecord.checkIn?.imageUrl ? (
                        <img src={selectedRecord.checkIn.imageUrl} alt="In" className="w-full h-full object-cover group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-[10px] font-black text-white">
                        {selectedRecord.checkIn?.time || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Check-Out
                    </p>
                    <div className="aspect-[3/4] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                      {selectedRecord.checkOut?.imageUrl ? (
                        <img src={selectedRecord.checkOut.imageUrl} alt="Out" className="w-full h-full object-cover group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-[10px] font-black text-white">
                        {selectedRecord.checkOut?.time || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Check-In</p>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedRecord.checkIn?.location || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Map className="h-4 w-4 text-indigo-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Check-Out</p>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedRecord.checkOut?.location || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm">No record found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogDetailSidebar;
