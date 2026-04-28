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
      let msg = err.message || 'Failed to send OTP';
      
      if (err.code === 'auth/billing-not-enabled') {
        msg = 'Firebase SMS service requires a billing account. Please upgrade to the Blaze Plan or add "Test Phone Numbers" in your Firebase Console to continue testing.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Phone Sign-in is disabled. Please enable it in Firebase Console > Authentication > Sign-in method.';
      } else if (err.code === 'auth/invalid-phone-number') {
        msg = 'The phone number provided is incorrect. Please use the format +91XXXXXXXXXX.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Quota exceeded or too many attempts. Try again later or use a different number.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      
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
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div id="recaptcha-container"></div>
      
      {/* Structural Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#0078D4]"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/login" className="inline-flex items-center text-[11px] font-bold text-[#605E5C] hover:text-[#0078D4] uppercase tracking-widest transition-colors mb-6 group">
          <ArrowLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Authentication
        </Link>
        <div className="bg-white px-8 py-10 rounded-sm shadow-xl border border-[#EDEBE9] relative overflow-hidden">
          {/* Header Area */}
          <div className="relative z-10 mb-8">
            <div className="w-12 h-12 bg-[#0078D4] rounded-sm flex items-center justify-center mb-6 shadow-md">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#323130] tracking-tight">
              {step === 1 ? 'Recover Identity' : 'Verify Authorization'}
            </h2>
            <p className="mt-2 text-[12px] font-semibold text-[#605E5C] leading-relaxed">
              {step === 1 
                ? "Enter your organizational credentials to receive an out-of-band verification code."
                : `A security code has been dispatched to your mobile endpoint. Enter it below to proceed.`}
            </p>
          </div>

          <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="space-y-6 relative z-10">
            {step === 1 ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Asset Tag (Emp ID)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <IdCard className="h-4 w-4 text-[#A19F9D] group-focus-within:text-[#0078D4] transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value.toUpperCase())}
                        className="block w-full pl-10 pr-4 py-2.5 bg-white border border-[#8A8886] rounded-sm text-[#323130] font-semibold placeholder-[#A19F9D] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm outline-none"
                        placeholder="e.g. WT-00X"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">Mobile Endpoint</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-[#A19F9D] group-focus-within:text-[#0078D4] transition-colors" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 bg-white border border-[#8A8886] rounded-sm text-[#323130] font-semibold placeholder-[#A19F9D] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm outline-none"
                        placeholder="+XX XXXXX XXXXX"
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
                      Request Verification Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#605E5C] uppercase tracking-wider ml-0.5">6-Digit Authorization Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <ShieldCheck className="h-4 w-4 text-[#A19F9D] group-focus-within:text-[#0078D4] transition-colors" />
                    </div>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full pl-10 pr-4 py-3 bg-[#FAF9F8] border border-[#8A8886] rounded-sm text-[#323130] font-bold tracking-[0.4em] placeholder-[#A19F9D] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-center text-xl outline-none"
                      placeholder="000000"
                    />
                  </div>
                  {timer > 0 ? (
                    <p className="mt-3 text-center text-[10px] font-bold text-[#605E5C] uppercase tracking-widest">
                      Code rotation in <span className="text-[#0078D4]">{timer}s</span>
                    </p>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleSendOTP}
                      className="mt-3 w-full text-center text-[10px] font-bold text-[#0078D4] uppercase tracking-widest hover:underline"
                    >
                      Resend Authorization Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-2.5 px-4 bg-[#0078D4] hover:bg-[#005A9E] text-white rounded-sm font-bold text-sm tracking-tight transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validate & Initialize Reset'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full text-center text-[9px] font-bold text-[#605E5C] uppercase tracking-[0.2em] hover:text-[#323130]"
                >
                  Update Endpoint Identifier
                </button>
              </>
            )}
          </form>
        </div>
        
        <p className="mt-8 text-center text-[9px] font-bold text-[#A19F9D] uppercase tracking-[0.4em]">WorkTrackr Identity Recovery Protocol v1.4</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
