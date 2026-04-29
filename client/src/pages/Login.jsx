import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Globe, HelpCircle } from 'lucide-react';

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
      const data = await authService.login(email, password);
      localStorage.setItem('user', JSON.stringify(data));
      addToast(`Welcome back, ${data.name}!`, 'success');
      
      if (data.role === 'employee' && !data.isPaid) {
        navigate('/payment');
      } else if (data.role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else if (data.role === 'orgadmin' || data.role === 'admin') {
        navigate('/orgadmin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid credentials.', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0078D4] opacity-[0.03] rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0078D4] opacity-[0.03] rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="w-full max-w-[440px] z-10 transition-all duration-500 transform animate-in slide-in-from-bottom-8">
        {/* Branding Node */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0078D4] flex items-center justify-center shadow-lg rounded-sm transform hover:rotate-12 transition-transform duration-300">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-[22px] font-bold text-[#323130] tracking-tight">WorkTrackr <span className="text-[#0078D4] font-medium text-sm align-top ml-1">Cloud</span></span>
        </div>

        {/* Login Card */}
        <div className="bg-white p-10 border border-[#EDEBE9] shadow-[0_32px_64px_rgba(0,0,0,0.08)] relative rounded-sm group overflow-hidden">
          {/* Top Progress Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent overflow-hidden">
            <div className="w-full h-full bg-[#0078D4] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </div>

          <div className="mb-8">
            <h1 className="text-[28px] font-semibold text-[#323130] mb-2">Sign in</h1>
            <p className="text-[14px] text-[#605E5C]">Secure access to your enterprise directory</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email Field */}
              <div className="relative group/input">
                <div className="absolute left-0 bottom-0 w-full h-[1px] bg-[#8A8886] group-focus-within/input:bg-[#0078D4] transition-colors duration-300"></div>
                <div className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#0078D4] group-focus-within/input:w-full transition-all duration-500"></div>
                <input
                  type="email"
                  required
                  placeholder="Email or Employee ID"
                  className="w-full px-0 py-3 bg-transparent text-[#323130] placeholder-[#605E5C] outline-none transition-all text-[16px] border-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div className="relative group/input">
                <div className="absolute left-0 bottom-0 w-full h-[1px] bg-[#8A8886] group-focus-within/input:bg-[#0078D4] transition-colors duration-300"></div>
                <div className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#0078D4] group-focus-within/input:w-full transition-all duration-500"></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  className="w-full px-0 py-3 bg-transparent text-[#323130] placeholder-[#605E5C] outline-none transition-all text-[16px] border-none pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-3 text-[#605E5C] hover:text-[#0078D4] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link to="/forgot" className="text-[13px] text-[#0078D4] hover:underline font-medium hover:text-[#005A9E] transition-colors">Forgot password?</Link>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="submit"
                className="group px-8 py-2 bg-[#0078D4] text-white font-semibold text-[15px] hover:bg-[#005A9E] transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                Sign in <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-[#EDEBE9] text-[14px] text-[#323130] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span>New to WorkTrackr?</span>
              <Link to="/register" className="text-[#0078D4] hover:underline font-semibold">Join the network</Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[12px] text-[#605E5C] font-medium opacity-70">
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#323130] transition-colors"><Globe className="h-3 w-3" /> Identity Hub</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#323130] transition-colors"><ShieldCheck className="h-3 w-3" /> Secure Access</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#323130] transition-colors"><HelpCircle className="h-3 w-3" /> Support</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
