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
      const data = await authService.login(email, password);
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      
      addToast(`Welcome back, ${data.name}!`, 'success');
      
      // Redirect based on role and payment status
      if (data.role === 'employee' && !data.isPaid) {
        navigate('/payment');
      } else if (data.role === 'superadmin') {
        navigate('/superadmindashboard');
      } else if (data.role === 'orgadmin' || data.role === 'admin') {
        navigate('/admindashboard');
      } else {
        navigate('/employeedashboard');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid credentials.', 'error');
    } finally {
      showLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] bg-white p-10 border border-[#EDEBE9] shadow-lg animate-in fade-in duration-500">
        
        {/* Branding */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 bg-[#0078D4] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-white" />
             </div>
             <span className="text-[20px] font-semibold text-[#323130] tracking-tight">WorkTrackr</span>
          </div>
          <h1 className="text-[24px] font-semibold text-[#323130]">Sign in</h1>
          <p className="text-[13px] text-[#323130] mt-1">Use your organizational account to continue</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <input
                type="email"
                required
                placeholder="Email, phone, or Skype"
                className="w-full px-0 py-2.5 bg-transparent border-b border-[#8A8886] text-[#323130] placeholder-[#605E5C] focus:border-[#0078D4] outline-none transition-all text-[15px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  className="w-full px-0 py-2.5 bg-transparent border-b border-[#8A8886] text-[#323130] placeholder-[#605E5C] focus:border-[#0078D4] outline-none transition-all text-[15px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#605E5C] hover:text-[#323130] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link to="/forgot" className="text-[13px] text-[#0078D4] hover:underline font-medium">Forgot my password?</Link>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="submit"
              className="px-10 py-1.5 bg-[#0078D4] text-white font-semibold text-[15px] hover:bg-[#005A9E] transition-all"
            >
              Next
            </button>
          </div>
        </form>

        <div className="mt-8 text-[13px] text-[#323130]">
          No account? <Link to="/register" className="text-[#0078D4] hover:underline font-medium">Create one!</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
