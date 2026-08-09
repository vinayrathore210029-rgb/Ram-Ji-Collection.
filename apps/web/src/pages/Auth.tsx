import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { UserPlus, LogIn, Mail, Lock, User as UserIcon, Phone, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, loading } = useAuthStore();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 2-minute timer tick effect
  useEffect(() => {
    let timer: any;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Format seconds to mm:ss
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
      setCooldownSeconds(120); // 2 minute strict cooldown
      setSuccessMsg('OTP sent to your phone number via WhatsApp/SMS!');
      if (res.data.data?.devOtp) {
        console.log('[Dev mode OTP]:', res.data.data.devOtp);
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
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</span>
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
    </div>
  );
}
