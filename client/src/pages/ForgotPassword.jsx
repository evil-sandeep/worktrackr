import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import authService from '../services/authService';
import { useUI } from '../context/UIContext';
import { 
  Phone, 
  IdCard, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  ArrowLeft,
  KeyRound
} from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: User Info, 2: OTP
  const [loading, setLoading] = useState(false);
  const [empId, setEmpId] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();
  const { addToast } = useUI();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log('reCAPTCHA verified');
      }
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!empId || !mobile) {
      return addToast('Please fill all fields', 'warning');
    }

    setLoading(true);
    try {
      // 1. Verify user in our backend first
      // Ensure mobile has +91 or appropriate prefix
      const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;
      await authService.verifyUser(empId, formattedMobile);

      // 2. If verified, trigger Firebase OTP
      setupRecaptcha();
      const verifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedMobile, verifier);
      
      setConfirmResult(confirmation);
      setStep(2);
      setTimer(60);
      addToast('OTP sent successfully!', 'success');
    } catch (err) {
      console.error('Send OTP Error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return addToast('Enter 6-digit OTP', 'warning');
    }

    setLoading(true);
    try {
      await confirmResult.confirm(otp);
      addToast('Mobile verified!', 'success');
      
      // Store mobile for reset page and navigate
      const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;
      sessionStorage.setItem('reset_mobile', formattedMobile);
      navigate('/reset-password');
    } catch (err) {
      console.error('OTP Verification Error:', err);
      addToast('Invalid OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div id="recaptcha-container"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/login" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
        <div className="bg-white px-8 py-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          {/* Header */}
          <div className="relative z-10 mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <KeyRound className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {step === 1 ? 'Forgot Password?' : 'Verify Identity'}
            </h2>
            <p className="mt-2 text-slate-500 font-medium">
              {step === 1 
                ? "Enter your details to receive an OTP on your registered mobile number."
                : `We've sent a 6-digit code to your mobile number. Enter it below to continue.`}
            </p>
          </div>

          <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="space-y-6 relative z-10">
            {step === 1 ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Employee ID</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IdCard className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value.toUpperCase())}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                        placeholder="e.g. EMP-101"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                        placeholder="10-digit mobile number"
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
                      Send OTP
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">6-Digit Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ShieldCheck className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-black tracking-[0.5em] placeholder-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all text-center text-xl"
                      placeholder="000000"
                    />
                  </div>
                  {timer > 0 ? (
                    <p className="mt-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Resend available in <span className="text-blue-600">{timer}s</span>
                    </p>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleSendOTP}
                      className="mt-3 w-full text-center text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Continue'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                >
                  Change Mobile Number
                </button>
              </>
            )}
          </form>

          {/* Decorative Background Elements */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
