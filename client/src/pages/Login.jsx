import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { showLoader, addToast } = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader(true);

    try {
      await authService.login(email, password);
      addToast('Login successful! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid credentials.', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="max-w-md w-full px-6 py-12 relative z-10">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-6 transform hover:rotate-6 transition-all duration-500">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">
            Work<span className="text-blue-500">Trackr</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">Secure workforce management portal</p>
        </div>

        {/* Glassmorphic Card */}
        <div className="backdrop-blur-2xl bg-white/10 rounded-[2.5rem] shadow-2xl border border-white/10 p-10 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
              <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
            </div>

            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl focus:bg-slate-900/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-slate-300">Password</label>
                  <button type="button" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">Forgot?</button>
                </div>
                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl focus:bg-slate-900/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-15 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group active:scale-95"
            >
              Enter Dashboard <ArrowRight className="h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 font-medium">
              New to WorkTrackr?{' '}
              <Link to="/register" className="text-white font-bold hover:text-blue-400 transition-colors ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-slate-500 text-sm font-bold flex items-center justify-center gap-2 tracking-widest uppercase">
          <ShieldCheck className="h-4 w-4" /> Enterprise Secure
        </p>
      </div>
    </div>
  );
};

export default Login;
