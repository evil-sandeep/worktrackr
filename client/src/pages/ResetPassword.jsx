import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import { 
  Lock, 
  ShieldCheck, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useUI();

  useEffect(() => {
    const storedMobile = sessionStorage.getItem('reset_mobile');
    if (!storedMobile) {
      addToast('Unauthorized session. Please start again.', 'error');
      navigate('/forgot');
    } else {
      setMobile(storedMobile);
    }
  }, [navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      return addToast('Password must be at least 6 characters', 'warning');
    }
    if (newPassword !== confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }

    setLoading(true);
    try {
      await authService.resetPassword(mobile, newPassword);
      addToast('Password reset successful!', 'success');
      setIsSuccess(true);
      sessionStorage.removeItem('reset_mobile');
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset Password Error:', err);
      const msg = err.response?.data?.message || 'Failed to reset password';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-8 py-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Password Reset!</h2>
            <p className="text-slate-500 font-medium mb-8">
              Your password has been successfully updated. You will be redirected to the login page in a few seconds.
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center text-sm font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors"
            >
              Go to Login Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          {/* Header */}
          <div className="relative z-10 mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Create New Password</h2>
            <p className="mt-2 text-slate-500 font-medium">
              Identity verified. Please choose a strong password for your account associated with <span className="text-slate-900 font-bold">{mobile}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldAlert className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  Update Password
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Decorative Background Elements */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
