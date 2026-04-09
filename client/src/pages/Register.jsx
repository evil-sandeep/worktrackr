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
      await authService.register(formData);
      addToast('Registration successful! Welcome to WorkTrackr.', 'success');
      navigate('/employeedashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 py-12 px-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse delay-700"></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-5 transform hover:-rotate-6 transition-all duration-500">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">
            Create <span className="text-indigo-500">Account</span>
          </h1>
          <p className="text-slate-400 font-medium">Join the next generation of workforce management</p>
        </div>

        {/* Glassmorphic Card */}
        <div className="backdrop-blur-2xl bg-white/5 rounded-[2.5rem] shadow-2xl border border-white/5 p-8 sm:p-12 relative">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-indigo-500 to-transparent"></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
                <div className="group relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl focus:bg-slate-900/80 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Employee ID</label>
                <div className="group relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    name="empId"
                    type="text"
                    required
                    placeholder="WT-001"
                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl focus:bg-slate-900/80 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.empId}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Work Email</label>
                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="john@company.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl focus:bg-slate-900/80 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Phone Number</label>
                <div className="group relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    name="phone"
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl focus:bg-slate-900/80 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Choose Password</label>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl focus:bg-slate-900/80 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-15 mt-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-900/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group active:scale-95"
            >
              Register Now <ArrowRight className="h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 font-medium">
              Already a member?{' '}
              <Link to="/login" className="text-white font-bold hover:text-indigo-400 transition-colors ml-1">
                Log In Instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
