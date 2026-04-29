import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import { UserPlus, User, Mail, Phone, Hash, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Briefcase, Globe, HelpCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FAF9F8] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0078D4] opacity-[0.03] rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0078D4] opacity-[0.03] rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="w-full max-w-[500px] z-10 transition-all duration-500 transform animate-in slide-in-from-bottom-8">
        {/* Branding Node */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-[#0078D4] flex items-center justify-center shadow-lg rounded-sm">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <span className="text-[22px] font-bold text-[#323130] tracking-tight">WorkTrackr <span className="text-[#0078D4] font-medium text-sm align-top ml-1">Provisioning</span></span>
        </div>

        {/* Register Card */}
        <div className="bg-white p-10 border border-[#EDEBE9] shadow-[0_32px_64px_rgba(0,0,0,0.08)] relative rounded-sm group overflow-hidden">
          {/* Top Progress Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent overflow-hidden">
            <div className="w-full h-full bg-[#0078D4] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </div>

          <div className="mb-8">
            <h1 className="text-[28px] font-semibold text-[#323130] mb-2">Create account</h1>
            <p className="text-[14px] text-[#605E5C]">Join the global enterprise tracking network</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="relative group/input">
                <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-0 bottom-3 h-4 w-4 text-[#A19F9D]" />
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full pl-6 pr-0 py-2 bg-transparent border-b border-[#8A8886] text-[#323130] placeholder-[#A19F9D] outline-none focus:border-[#0078D4] transition-all text-[15px]"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div className="relative group/input">
                <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider mb-1 block">Employee ID</label>
                <div className="relative">
                  <Hash className="absolute left-0 bottom-3 h-4 w-4 text-[#A19F9D]" />
                  <input
                    name="empId"
                    type="text"
                    required
                    placeholder="WT-123"
                    className="w-full pl-6 pr-0 py-2 bg-transparent border-b border-[#8A8886] text-[#323130] placeholder-[#A19F9D] outline-none focus:border-[#0078D4] transition-all text-[15px]"
                    value={formData.empId}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="relative group/input">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider mb-1 block">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-0 bottom-3 h-4 w-4 text-[#A19F9D]" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-6 pr-0 py-2 bg-transparent border-b border-[#8A8886] text-[#323130] placeholder-[#A19F9D] outline-none focus:border-[#0078D4] transition-all text-[15px]"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative group/input">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-0 bottom-3 h-4 w-4 text-[#A19F9D]" />
                <input
                  name="phone"
                  type="text"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full pl-6 pr-0 py-2 bg-transparent border-b border-[#8A8886] text-[#323130] placeholder-[#A19F9D] outline-none focus:border-[#0078D4] transition-all text-[15px]"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative group/input">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider mb-1 block">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-0 bottom-3 h-4 w-4 text-[#A19F9D]" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full pl-6 pr-10 py-2 bg-transparent border-b border-[#8A8886] text-[#323130] placeholder-[#A19F9D] outline-none focus:border-[#0078D4] transition-all text-[15px]"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-[#605E5C] hover:text-[#0078D4] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider mb-3 block">Authorization Type</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center gap-2 py-2.5 px-4 border rounded-sm cursor-pointer transition-all duration-300 ${formData.role === 'employee' ? 'bg-[#F3F9FF] border-[#0078D4] text-[#0078D4] shadow-sm' : 'bg-white border-[#EDEBE9] text-[#605E5C] hover:bg-[#FAF9F8]'}`}>
                  <input type="radio" name="role" value="employee" className="hidden" checked={formData.role === 'employee'} onChange={handleChange} />
                  <User className="h-4 w-4" />
                  <span className="font-semibold text-xs uppercase">Staff</span>
                </label>
                <label className={`flex items-center justify-center gap-2 py-2.5 px-4 border rounded-sm cursor-pointer transition-all duration-300 ${formData.role === 'orgadmin' ? 'bg-[#F3F9FF] border-[#0078D4] text-[#0078D4] shadow-sm' : 'bg-white border-[#EDEBE9] text-[#605E5C] hover:bg-[#FAF9F8]'}`}>
                  <input type="radio" name="role" value="orgadmin" className="hidden" checked={formData.role === 'orgadmin'} onChange={handleChange} />
                  <Briefcase className="h-4 w-4" />
                  <span className="font-semibold text-xs uppercase">Admin</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="group w-full py-3 mt-4 bg-[#0078D4] text-white font-bold text-sm rounded-sm shadow-md hover:bg-[#005A9E] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Create Identity <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[#EDEBE9] text-center">
            <p className="text-[14px] text-[#605E5C]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0078D4] font-bold hover:underline ml-1">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[12px] text-[#605E5C] font-medium opacity-70">
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#323130] transition-colors"><Globe className="h-3 w-3" /> Global Directory</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#323130] transition-colors"><ShieldCheck className="h-3 w-3" /> Encrypted Protocol</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#323130] transition-colors"><HelpCircle className="h-3 w-3" /> Knowledge Base</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
