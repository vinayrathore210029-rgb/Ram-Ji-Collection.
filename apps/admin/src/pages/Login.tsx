import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../context/store';
import { Lock, Mail, Award } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAdminAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.toString());
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-gray-100 p-8 rounded-3xl shadow-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-brand-gold mx-auto shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-brand-dark">Ram Ji Collection</h2>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Admin Dashboard Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <p className="text-xs text-brand-red font-bold p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
              {errorMsg}
            </p>
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
                placeholder="admin@ramjicollection.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-semibold"
              />
            </div>
          </div>

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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-gold font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-charcoal text-white hover:bg-brand-gold font-bold text-xs uppercase tracking-widest rounded-full shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
