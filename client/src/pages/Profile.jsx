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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Profile</h1>
          <p className="text-slate-500 font-medium">Manage your personal information and workspace identity</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500"></div>
              <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-500/30 overflow-hidden ring-4 ring-white relative z-10">
                {previewImg ? (
                  <img src={previewImg} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="h-8 w-8 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              {currentUser.role === 'admin' && (
                <div className="absolute bottom-2 right-2 bg-amber-400 text-white p-2 rounded-xl shadow-lg border-2 border-white z-20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-1">{currentUser.name}</h2>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">{currentUser.designation || 'Staff Member'}</p>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Active Account</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                   <Fingerprint className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Employee ID</p>
                   <p className="text-lg font-bold tracking-tight">{currentUser.empId}</p>
                </div>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed italic">
                Your Employee ID is a unique identifier and cannot be changed. Contact IT support if you need to update it.
             </p>
          </div>
        </div>

        {/* Right Column: Detailed Information Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2 opacity-80">
                  <label className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Mail className="h-3.5 w-3.5" />
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-bold cursor-not-allowed">
                    {currentUser.email}
                    <AlertCircle className="h-3.5 w-3.5 ml-auto" />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    placeholder="Enter mobile number"
                  />
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
                    <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    Residential Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows="3"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all resize-none"
                    placeholder="Enter your complete address"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            {isEditing && (
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 text-slate-500 font-black text-sm uppercase tracking-widest hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
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
