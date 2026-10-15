import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, User, Phone, Mail, Sparkles, LogIn, UserPlus, Gift, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle, language } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referCode, setReferCode] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      const res = login(emailOrPhone, password);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = register(name, emailOrPhone, password, referCode);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl shadow-amber-500/10">
        {/* Ambient Glows */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-violet-600 text-black font-black text-xl mb-3 shadow-lg shadow-amber-500/20">
            ৳
          </div>
          <h3 className="text-2xl font-black text-white">
            {mode === 'login'
              ? language === 'bn'
                ? 'লগইন করুন'
                : 'Sign In'
              : language === 'bn'
              ? 'নতুন একাউন্ট খুলুন'
              : 'Create Account'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login'
              ? language === 'bn'
                ? 'আপনার একাউন্টে প্রবেশ করে টাস্ক পূরণ করুন'
                : 'Log in to continue earning daily'
              : language === 'bn'
              ? 'রেজিস্ট্রেশন করলেই পাবেন স্বাগতম বোনাস!'
              : 'Register now & get welcome cash bonus!'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 rounded-2xl bg-zinc-900 border border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{language === 'bn' ? 'লগইন' : 'Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'bn' ? 'রেজিস্ট্রেশন' : 'Register'}</span>
          </button>
        </div>

        {/* Google One-Tap Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full py-3 px-4 mb-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 active:scale-98 border border-zinc-700/80 hover:border-zinc-500 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2.5 transition cursor-pointer shadow-md disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {isGoogleLoading
              ? language === 'bn'
                ? 'সংযোগ করা হচ্ছে...'
                : 'Connecting...'
              : language === 'bn'
              ? 'গুগল দিয়ে প্রবেশ করুন (Google Sign-In)'
              : 'Continue with Google'}
          </span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-zinc-950 px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-bold shrink-0">
            {language === 'bn' ? 'অথবা পাসওয়ার্ড দিয়ে' : 'OR WITH PASSWORD'}
          </span>
          <div className="border-t border-zinc-800 w-full" />
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'আপনার নাম (Full Name)' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: সাকিব হাসান"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              {language === 'bn' ? 'ইমেইল অথবা ফোন নম্বর' : 'Email or Phone Number'}
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              {language === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                <span>{language === 'bn' ? 'রেফার কোড (ঐচ্ছিক)' : 'Refer Code (Optional)'}</span>
                <span className="text-[10px] text-amber-400 font-bold">+৳১০ বোনাস</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={referCode}
                  onChange={(e) => setReferCode(e.target.value)}
                  placeholder="EX: ARIF88"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white uppercase text-xs sm:text-sm focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
              mode === 'login'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-amber-500/25 hover:opacity-95 active:scale-98'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white shadow-violet-600/30 hover:opacity-95 active:scale-98'
            }`}
          >
            {mode === 'login' ? <LogIn className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            <span>
              {mode === 'login'
                ? language === 'bn'
                  ? 'লগইন করুন'
                  : 'Sign In'
                : language === 'bn'
                ? 'একাউন্ট তৈরি করুন'
                : 'Create Account'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
