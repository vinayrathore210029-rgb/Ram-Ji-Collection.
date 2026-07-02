import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { UserPlus, LogIn, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, loading } = useAuthStore();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLoginTab) {
        await login({ email, password });
      } else {
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
            onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
            className={`text-sm font-bold uppercase tracking-wider pb-1 flex items-center gap-1.5 transition-all ${
              isLoginTab ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-gray-400'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
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
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Number (Optional)</span>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-medium"
                />
              </div>
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
            disabled={loading}
            className="w-full py-3 bg-brand-charcoal hover:bg-brand-gold text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 mt-2"
          >
            {isLoginTab ? 'Sign In' : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  );
}
