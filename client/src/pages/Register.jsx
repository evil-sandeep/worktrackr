import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import { UserPlus, User, Mail, Phone, Hash, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';

const Register = () => {
  const { showLoader, addToast } = useUI();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    password: '',
    role: 'employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader(true);

    try {
      // Force all new registrations to start as 'employee'
      // This ensures they see the Employee Dashboard first as requested
      const registrationData = { ...formData, role: 'employee' };
      await authService.register(registrationData);
      addToast('Registration successful! Welcome to WorkTrackr.', 'success');
      navigate('/employeedashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F8] py-12 px-4 relative">
      {/* Structural Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#0078D4]"></div>

      <div className="max-w-md w-full">
        {/* Branding Node */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-[#0078D4] rounded-sm flex items-center justify-center shadow-lg mb-4">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#323130] tracking-tight">Provision Identity</h1>
          <p className="text-[11px] font-bold text-[#605E5C] uppercase tracking-widest mt-1">WorkTrackr Cloud Directory Services</p>
        </div>

        {/* Provisioning Card */}
        <div className="bg-white border border-[#EDEBE9] shadow-2xl p-8 sm:p-10 rounded-sm relative">
          <div className="absolute top-0 right-0 p-3">
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#107C10] rounded-full"></div>
                <span className="text-[9px] font-bold text-[#605E5C] uppercase">Secure Link</span>
             </div>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Resource Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A19F9D]" />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Identity Identifier"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#8A8886] text-[#323130] placeholder-[#A19F9D] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none transition-all font-semibold text-sm"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Employee ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Asset Tag (Emp ID)</label>
              <div className="relative group">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A19F9D]" />
                <input
                  name="empId"
                  type="text"
                  required
                  placeholder="WT-00X"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#8A8886] text-[#323130] placeholder-[#A19F9D] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none transition-all font-semibold text-sm"
                  value={formData.empId}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Routing Endpoint (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A19F9D]" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="identity@endpoint.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#8A8886] text-[#323130] placeholder-[#A19F9D] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none transition-all font-semibold text-sm"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Communications Node</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A19F9D]" />
                <input
                  name="phone"
                  type="text"
                  required
                  placeholder="+XX XXXXX XXXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#8A8886] text-[#323130] placeholder-[#A19F9D] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none transition-all font-semibold text-sm"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Secure Key</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A19F9D]" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#8A8886] text-[#323130] placeholder-[#A19F9D] rounded-sm focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none transition-all font-semibold text-sm"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#605E5C] hover:text-[#0078D4] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Access Authorization Level</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-2.5 rounded-sm border cursor-pointer transition-all ${formData.role === 'employee' ? 'bg-[#DEECF9] border-[#0078D4] text-[#0078D4]' : 'bg-white border-[#8A8886] text-[#605E5C] hover:bg-[#FAF9F8]'}`}>
                  <input type="radio" name="role" value="employee" className="hidden" checked={formData.role === 'employee'} onChange={handleChange} />
                  <User className="h-3.5 w-3.5" />
                  <span className="font-bold text-[11px] uppercase">Staff Node</span>
                </label>
                <label className={`flex items-center justify-center gap-2 p-2.5 rounded-sm border cursor-pointer transition-all ${formData.role === 'orgadmin' ? 'bg-[#DEECF9] border-[#0078D4] text-[#0078D4]' : 'bg-white border-[#8A8886] text-[#605E5C] hover:bg-[#FAF9F8]'}`}>
                  <input type="radio" name="role" value="orgadmin" className="hidden" checked={formData.role === 'orgadmin'} onChange={handleChange} />
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="font-bold text-[11px] uppercase">Admin Node</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0078D4] text-white font-bold text-sm rounded-sm shadow-md hover:bg-[#005A9E] transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              Commit Provisioning <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#EDEBE9] text-center">
            <p className="text-[11px] text-[#605E5C] font-semibold uppercase tracking-wider">
              Existing identity?{' '}
              <Link to="/login" className="text-[#0078D4] font-bold hover:underline ml-1">
                Authenticate Instead
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-6 text-center text-[9px] font-bold text-[#A19F9D] uppercase tracking-[0.3em]">WorkTrackr Identity Protocol v2.1-Enterprise</p>
      </div>
    </div>
  );
};

export default Register;
