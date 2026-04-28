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
      <div className="min-h-screen bg-[#F3F2F1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#107C10]"></div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-8 py-12 rounded-sm shadow-xl border border-[#EDEBE9] text-center">
            <div className="w-16 h-16 bg-[#DFF6DD] rounded-sm flex items-center justify-center mx-auto mb-6 border border-[#107C10]/10 shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-[#107C10]" />
            </div>
            <h2 className="text-2xl font-bold text-[#323130] tracking-tight mb-2">Credential Reset Success</h2>
            <p className="text-[12px] font-semibold text-[#605E5C] mb-8 leading-relaxed uppercase tracking-wider">
              Identity keys have been synchronized. Redirecting to primary authentication portal...
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center text-[11px] font-bold text-[#0078D4] uppercase tracking-widest hover:underline transition-all"
            >
              Force Redirect
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      {/* Structural Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#0078D4]"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 rounded-sm shadow-xl border border-[#EDEBE9] relative overflow-hidden">
          {/* Header Area */}
          <div className="relative z-10 mb-8">
            <div className="w-12 h-12 bg-[#0078D4] rounded-sm flex items-center justify-center mb-6 shadow-md">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#323130] tracking-tight">Provision New Key</h2>
            <p className="mt-2 text-[12px] font-semibold text-[#605E5C] leading-relaxed">
              Validation verified for endpoint <span className="text-[#323130] font-bold">{mobile}</span>. Enter new security credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Secure Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#A19F9D] group-focus-within:text-[#0078D4] transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-[#8A8886] rounded-sm text-[#323130] font-semibold placeholder-[#A19F9D] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm outline-none"
                    placeholder="Entropy Minimum 6"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Confirm Identity Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ShieldAlert className="h-4 w-4 text-[#A19F9D] group-focus-within:text-[#0078D4] transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-[#8A8886] rounded-sm text-[#323130] font-semibold placeholder-[#A19F9D] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm outline-none"
                    placeholder="Verify Entropy"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-[#0078D4] hover:bg-[#005A9E] text-white rounded-sm font-bold text-sm tracking-tight transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  Commit Security Update
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-[9px] font-bold text-[#A19F9D] uppercase tracking-[0.4em]">WorkTrackr Secure Provisioning v1.0</p>
      </div>
    </div>
  );
};

export default ResetPassword;
