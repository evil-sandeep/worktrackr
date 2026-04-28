import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Fingerprint, 
  Camera, 
  Edit2, 
  Save, 
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';

const Profile = () => {
  const { showLoader, addToast } = useUI();
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    designation: '',
    profileImg: ''
  });
  const [previewImg, setPreviewImg] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        designation: user.designation || '',
        profileImg: user.profileImg || ''
      });
      setPreviewImg(user.profileImg || '');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
        setFormData(prev => ({ ...prev, profileImg: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      setCurrentUser(updatedUser);
      setIsEditing(false);
      addToast('Profile updated successfully', 'success');
      // Force reload to update UI components that depend on currentUser
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      showLoader(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Azure Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 border border-[#EDEBE9] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0078D4] text-white rounded-sm flex items-center justify-center shadow-sm">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#323130] tracking-tight">Identity Profile</h1>
            <p className="text-[11px] font-semibold text-[#605E5C] uppercase tracking-wider mt-0.5">
              Personal Credentials & System Metadata
            </p>
          </div>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#0078D4] text-white rounded-sm font-semibold text-sm hover:bg-[#005A9E] transition-all shadow-sm"
          >
            <Edit2 className="h-4 w-4" />
            <span>Modify Identity</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Technical Identity Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white border border-[#EDEBE9] shadow-sm p-8 flex flex-col items-center text-center rounded-sm">
            <div className="relative group mb-6">
              <div className="w-32 h-32 bg-[#F3F2F1] rounded-sm flex items-center justify-center text-[#323130] text-4xl font-bold border border-[#EDEBE9] overflow-hidden relative z-10 shadow-inner">
                {previewImg ? (
                  <img src={previewImg} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="h-6 w-6 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              {(currentUser.role === 'admin' || currentUser.role === 'orgadmin') && (
                <div className="absolute -bottom-2 -right-2 bg-[#0078D4] text-white p-1.5 rounded-sm shadow-md border border-white z-20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="space-y-1 mb-4">
              <h2 className="text-lg font-bold text-[#323130] leading-tight">{currentUser.name}</h2>
              <p className="text-[10px] font-bold text-[#0078D4] uppercase tracking-wider">{currentUser.designation || 'Standard Resource'}</p>
            </div>
            
            {/* Status & Role Badges */}
            <div className="flex flex-col gap-2 w-full">
              <div className={`flex items-center justify-between px-3 py-1.5 rounded-sm border ${
                currentUser.role === 'admin' ? 'bg-[#DFF6DD] text-[#107C10] border-[#107C10]/10' :
                currentUser.role === 'orgadmin' ? 'bg-[#FFF4CE] text-[#797673] border-[#797673]/10' :
                currentUser.role === 'superadmin' ? 'bg-[#E1DFDD] text-[#323130] border-[#EDEBE9]' :
                'bg-[#DEECF9] text-[#0078D4] border-[#0078D4]/10'
              }`}>
                <span className="text-[9px] font-bold uppercase tracking-widest">System Role</span>
                <span className="text-[10px] font-bold">
                  {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'orgadmin' ? 'Tenant' : currentUser.role === 'superadmin' ? 'Global' : 'User'}
                </span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 bg-[#FAF9F8] border border-[#EDEBE9] rounded-sm">
                <span className="text-[9px] font-bold text-[#605E5C] uppercase tracking-widest">Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#107C10] rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-[#107C10]">COMMITTED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#11100F] p-6 text-white border border-[#EDEBE9] rounded-sm shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-sm flex items-center justify-center border border-white/5">
                   <Fingerprint className="h-4 w-4 text-[#0078D4]" />
                </div>
                <div>
                   <p className="text-[9px] font-bold text-[#A19F9D] uppercase tracking-wider">Resource ID</p>
                   <p className="text-md font-bold tracking-tight text-white">{currentUser.empId}</p>
                </div>
             </div>
             <p className="text-[10px] text-[#A19F9D] leading-relaxed font-semibold italic border-t border-white/5 pt-3">
                Unique identifier assigned during provisioning. Immutable asset token.
             </p>
          </div>
        </div>

        {/* Right Column: Information Control Plane */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white border border-[#EDEBE9] shadow-sm rounded-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8]">
               <h3 className="text-sm font-bold text-[#323130] uppercase tracking-wider">Metadata Configuration</h3>
            </div>
            
            <div className="p-8 flex-1 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A19F9D]" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#8A8886] rounded-sm text-[#323130] font-semibold text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none disabled:bg-[#FAF9F8] transition-all"
                      placeholder="Node Identifier"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#A19F9D] uppercase tracking-wider ml-0.5">Primary Routing Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A19F9D]" />
                    <div className="w-full pl-10 pr-4 py-2 bg-[#F3F2F1] border border-[#EDEBE9] rounded-sm text-[#A19F9D] font-semibold text-sm cursor-not-allowed flex items-center justify-between">
                      {currentUser.email}
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Contact Node</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A19F9D]" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#8A8886] rounded-sm text-[#323130] font-semibold text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none disabled:bg-[#FAF9F8] transition-all"
                      placeholder="+XX XXXXX XXXXX"
                    />
                  </div>
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Asset Classification</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A19F9D]" />
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#8A8886] rounded-sm text-[#323130] font-semibold text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none disabled:bg-[#FAF9F8] transition-all"
                      placeholder="Role Identity"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Physical Deployment Node</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-[#A19F9D]" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows="2"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#8A8886] rounded-sm text-[#323130] font-semibold text-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none disabled:bg-[#FAF9F8] transition-all resize-none"
                      placeholder="Deployment Location"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions Footer */}
            {isEditing && (
              <div className="px-8 py-4 bg-[#FAF9F8] border-t border-[#EDEBE9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-[#F3F2F1] text-[#605E5C] border border-[#D2D0CE] rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-[#EDEBE9] transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-2 bg-[#0078D4] text-white rounded-sm font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-[#005A9E] transition-all"
                >
                  <Save className="h-4 w-4" />
                  Commit Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
