import React from 'react';
import { Edit2, Mail, Phone } from 'lucide-react';

const OrgAdminContact = ({ organization, isEditing, setIsEditing, formData, onChange, onUpdate }) => {
  return (
    <div className="bg-white border border-[#EDEBE9] p-5 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Tenant Identity Contact</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[10px] font-bold text-[#0078D4] uppercase tracking-widest hover:underline flex items-center gap-1 bg-[#F3F2F1] px-3 py-1 rounded-sm border border-[#D2D0CE] transition-colors"
        >
          <Edit2 className="h-3 w-3" />
          {isEditing ? 'Discard' : 'Modify'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={onUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Display Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              className="w-full px-3 py-1.5 bg-white border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider">Operational Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="w-full px-3 py-1.5 bg-white border border-[#8A8886] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none text-sm font-semibold"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 bg-[#0078D4] text-white rounded-sm font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-[#005A9E] transition-colors">Apply Changes</button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm">
            <Mail className="h-4 w-4 text-[#605E5C]" />
            <div>
              <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Routing Email</p>
              <p className="text-sm font-semibold text-[#323130]">{organization.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm">
            <Phone className="h-4 w-4 text-[#605E5C]" />
            <div>
              <p className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Contact Node</p>
              <p className="text-sm font-semibold text-[#323130]">{organization.phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgAdminContact;
