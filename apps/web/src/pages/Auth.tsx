import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { UserPlus, LogIn, Mail, Lock, User as UserIcon, Phone, ShieldCheck, Clock, CheckCircle2, KeyRound, ArrowRight, X } from 'lucide-react';
import api from '../services/api';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, forgotPasswordEmail, resetPasswordEmail, googleLogin, loading } = useAuthStore();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  // OTP state for registration
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Google Login Modal & Loading State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // 2-minute timer tick effect for Phone OTP
  useEffect(() => {
    let timer: any;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // 2-minute timer tick effect for Forgot Password OTP
  useEffect(() => {
    let timer: any;
    if (forgotCooldown > 0) {
      timer = setInterval(() => {
        setForgotCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  // Dynamically load Google Identity Services Script
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId.includes('mock')) return;
    
    // Check if script already exists
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) return;
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      await googleLogin({ credential: response.credential });
      navigate('/profile');
    } catch (err: any) {
      setErrorMsg(err.toString());
    } finally {
      setGoogleLoading(false);
    }
  };

  const triggerGoogleLogin = () => {
    setErrorMsg('');
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (googleClientId && !googleClientId.includes('mock') && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          openGoogleDemoModal();
        }
      });
    } else {
      openGoogleDemoModal();
    }
  };

  const openGoogleDemoModal = () => {
    setGoogleEmailInput(email || 'rvinurtr00123@gmail.com');
    setShowGoogleModal(true);
  };

  const handleCustomGoogleSubmit = async (targetEmail: string) => {
    if (!targetEmail) return;
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      await googleLogin({ credential: `mock_google_token_${btoa(targetEmail)}` });
      setShowGoogleModal(false);
      navigate('/profile');
    } catch (err: any) {
      setErrorMsg(err.toString());
    } finally {
      setGoogleLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number first.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setOtpLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      setCooldownSeconds(120);
      
      if (res.data.data?.devOtp) {
        setSuccessMsg(`Demo OTP Code: ${res.data.data.devOtp} (Auto-filled for testing)`);
        setOtp(res.data.data.devOtp);
      } else {
        setSuccessMsg('OTP sent to your phone number via WhatsApp/SMS!');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.toString());
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setOtpLoading(true);
    try {
      await api.post('/auth/verify-otp', { phone, otp });
      setOtpVerified(true);
      setSuccessMsg('Phone number verified successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.toString());
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (isLoginTab) {
        await login({ email, password });
      } else {
        if (!otpVerified) {
          setErrorMsg('Please send and verify the OTP for your phone number before creating an account.');
          return;
        }
        await register({ firstName, lastName, email, password, phone });
      }
      navigate('/profile');
    } catch (err: any) {
      setErrorMsg(err.toString());
    }
  };

  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      await forgotPasswordEmail(forgotEmail);
      setForgotStep('OTP');
      setForgotCooldown(120);
      setForgotSuccess('OTP has been sent to your email! Please check your inbox.');
    } catch (err: any) {
      setForgotError(err.toString());
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      await resetPasswordEmail({ email: forgotEmail, otp: forgotOtp, newPassword });
      setSuccessMsg('Password reset successfully! Please log in with your new password.');
      setEmail(forgotEmail);
      setPassword(newPassword);
      setShowForgotModal(false);
      setIsLoginTab(true);
    } catch (err: any) {
      setForgotError(err.toString());
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col justify-center min-h-[70vh]">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-md space-y-6">
        
        {/* Header Tabs */}
        <div className="flex border-b border-gray-100 pb-3 justify-center gap-8">
          <button
            onClick={() => { setIsLoginTab(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`text-sm font-bold uppercase tracking-wider pb-1 flex items-center gap-1.5 transition-all ${
              isLoginTab ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-gray-400'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`text-sm font-bold uppercase tracking-wider pb-1 flex items-center gap-1.5 transition-all ${
              !isLoginTab ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-gray-400'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </button>
        </div>

        {/* Google 1-Click Login Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={triggerGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl font-bold text-xs text-gray-700 shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-gray-400 absolute">or</span>
          </div>
        </div>

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <p className="text-xs text-brand-red font-bold p-3 bg-red-50 border border-red-100 rounded-xl text-center">
              {errorMsg}
            </p>
          )}
          {successMsg && (
            <p className="text-xs text-green-700 font-bold p-3 bg-green-50 border border-green-100 rounded-xl text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {successMsg}
            </p>
          )}

          {!isLoginTab && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">First Name</span>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ram"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Last Name</span>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Kumar"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@domain.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-medium"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Mobile Number (Required)</span>
                  {cooldownSeconds > 0 && (
                    <span className="text-[10px] font-extrabold text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse" /> Resend in {formatTimer(cooldownSeconds)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      disabled={otpVerified}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-medium disabled:bg-gray-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || cooldownSeconds > 0 || otpVerified}
                    className="px-4 py-2.5 bg-brand-gold text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="space-y-1 pt-2 border-t border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Enter 6-Digit OTP</span>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono tracking-widest text-center outline-none focus:border-brand-gold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otp.length !== 6}
                      className="px-4 py-2.5 bg-brand-charcoal text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-black transition-all disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</span>
              {isLoginTab && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotEmail(email);
                    setForgotStep('EMAIL');
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                  className="text-[11px] font-bold text-brand-gold hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!isLoginTab && !otpVerified)}
            className="w-full py-3 bg-brand-charcoal hover:bg-brand-gold text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 mt-2"
          >
            {isLoginTab ? 'Sign In' : 'Verify & Create Account'}
          </button>
        </form>

      </div>

      {/* Google Sign-In Sleek Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Sign in with Google</h3>
              <p className="text-xs text-gray-500">
                Choose a Google account to continue to <strong>Ram Ji Collection</strong>
              </p>
            </div>

            {/* Quick Select Account Option */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleCustomGoogleSubmit('rvinurtr00123@gmail.com')}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl flex items-center gap-3 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                  R
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">Vinay Rathore</p>
                  <p className="text-[11px] text-gray-500 truncate">rvinurtr00123@gmail.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-2 text-[10px] uppercase font-bold text-gray-400 absolute">or enter another gmail</span>
              </div>

              {/* Custom Gmail Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="your.name@gmail.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleCustomGoogleSubmit(googleEmailInput)}
                  disabled={googleLoading || !googleEmailInput}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              To enable official Google popup, add <code>VITE_GOOGLE_CLIENT_ID</code> to <code>.env</code>.
            </p>
          </div>
        </div>
      )}

      {/* Forgot Password Email OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-brand-gold mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
              <p className="text-xs text-gray-500">
                {forgotStep === 'EMAIL' 
                  ? 'Enter your registered email address to receive a 6-digit OTP code.' 
                  : `Enter the 6-digit OTP sent to ${forgotEmail}`}
              </p>
            </div>

            {forgotError && (
              <p className="text-xs text-brand-red font-bold p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                {forgotError}
              </p>
            )}
            {forgotSuccess && (
              <p className="text-xs text-green-700 font-bold p-3 bg-green-50 border border-green-100 rounded-xl text-center">
                {forgotSuccess}
              </p>
            )}

            {forgotStep === 'EMAIL' ? (
              <form onSubmit={handleForgotSendOtp} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Registered Email</span>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your.email@domain.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full py-3 bg-brand-gold hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send Reset OTP'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">6-Digit Email OTP</span>
                    {forgotCooldown > 0 && (
                      <span className="text-[10px] font-bold text-amber-600">
                        Resend in {formatTimer(forgotCooldown)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono tracking-widest outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">New Password</span>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('EMAIL')}
                    className="w-1/3 py-3 bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.length !== 6 || newPassword.length < 6}
                    className="w-2/3 py-3 bg-brand-charcoal text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
