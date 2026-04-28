import React from 'react';
import { Camera, Clock, Image as ImageIcon, Map, MapPin } from 'lucide-react';

const LogDetailSidebar = ({ selectedDate, selectedRecord }) => {
  return (
    <div className="h-full">
      <div className="sticky top-0 space-y-6">
        <div>
          <h4 className="text-base font-bold text-[#323130] tracking-tight">Audit Log Detail</h4>
          <p className="text-[11px] font-semibold text-[#0078D4] uppercase tracking-wider mt-0.5">
            Snapshot: {selectedDate}
          </p>
        </div>

        {selectedRecord ? (
          <div className="space-y-6">
            <div className={`p-5 rounded-sm border shadow-sm ${selectedRecord.status === 'absent' ? 'bg-[#FDE7E9] border-[#FDE7E9]' : 'bg-[#DFF6DD] border-[#DFF6DD]'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider text-white ${selectedRecord.status === 'absent' ? 'bg-[#E81123]' : 'bg-[#107C10]'}`}>
                  {selectedRecord.status || 'Active'}
                </span>
                <div className="flex items-center gap-1 text-[#323130] font-bold text-lg tracking-tight">
                  ₹{selectedRecord.earning || 0}
                </div>
              </div>
              {selectedRecord.status !== 'absent' && (
                <div className="flex items-center gap-2 text-[#605E5C] text-[11px] font-bold uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5" />
                  Compute Time: {selectedRecord.totalHours || '--:--'}
                </div>
              )}
            </div>

            {selectedRecord.status !== 'absent' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider flex items-center gap-2">
                      <Camera className="h-3 w-3" /> Ingress Visual
                    </p>
                    <div className="aspect-[4/3] rounded-sm bg-[#F3F2F1] border border-[#EDEBE9] overflow-hidden relative group shadow-inner">
                      {selectedRecord.checkIn?.imageUrl ? (
                        <img src={selectedRecord.checkIn.imageUrl} alt="In" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C8C6C4]">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-widest">
                        {selectedRecord.checkIn?.time || 'Pending'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-[#605E5C] uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Egress Visual
                    </p>
                    <div className="aspect-[4/3] rounded-sm bg-[#F3F2F1] border border-[#EDEBE9] overflow-hidden relative group shadow-inner">
                      {selectedRecord.checkOut?.imageUrl ? (
                        <img src={selectedRecord.checkOut.imageUrl} alt="Out" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C8C6C4]">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-widest">
                        {selectedRecord.checkOut?.time || 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#FAF9F8] border border-[#EDEBE9] p-4 rounded-sm space-y-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 bg-[#DEECF9] rounded-sm flex items-center justify-center border border-[#0078D4]/20">
                      <MapPin className="h-3.5 w-3.5 text-[#0078D4]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest mb-0.5">Ingress Point</p>
                      <p className="text-xs font-semibold text-[#323130] truncate">
                        {selectedRecord.checkIn?.location || 'Network Edge'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 bg-[#F3F2F1] rounded-sm flex items-center justify-center border border-[#EDEBE9]">
                      <Map className="h-3.5 w-3.5 text-[#605E5C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest mb-0.5">Egress Point</p>
                      <p className="text-xs font-semibold text-[#323130] truncate">
                        {selectedRecord.checkOut?.location || 'Network Edge'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#FAF9F8] rounded-sm border border-dashed border-[#C8C6C4] shadow-inner">
            <ImageIcon className="h-8 w-8 text-[#C8C6C4] mx-auto mb-3" />
            <p className="text-[#605E5C] font-bold text-[11px] uppercase tracking-widest">Resource Telemetry Missing</p>
            <p className="text-[#A19F9D] text-[10px] mt-1 italic">Select a node from the calendar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogDetailSidebar;
