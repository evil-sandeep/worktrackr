import React from 'react';
import { Trash2 } from 'lucide-react';

const OrgDangerZone = ({ onDelete }) => {
  return (
    <div className="p-5 bg-[#FDE7E9] border border-[#FDE7E9] shadow-sm">
      <h3 className="text-[11px] font-semibold text-[#A4262C] uppercase tracking-wider mb-1">Critical Operations</h3>
      <p className="text-[10px] font-medium text-[#A4262C]/80 mb-4">Permanent resource termination. Data is not recoverable.</p>
      <button
        onClick={onDelete}
        className="w-full px-4 py-2 bg-white border border-[#A4262C] text-[#A4262C] rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-[#A4262C] hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        <Trash2 className="h-3 w-3" />
        Terminate Resource
      </button>
    </div>
  );
};

export default OrgDangerZone;
