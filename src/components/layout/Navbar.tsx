import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, RefreshCw, Languages, UserCheck, ShieldCheck, LogIn } from 'lucide-react';

interface Props {
  onOpenAuth: () => void;
  onNavigateTab: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<Props> = ({ onOpenAuth, onNavigateTab, activeTab }) => {
  const { currentUser, language, toggleLanguage, refreshBalance } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-violet-600 flex items-center justify-center font-black text-black text-base shadow-md shadow-amber-500/20">
            ৳
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                Earn<span className="text-amber-400">Task</span>
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                PRO
              </span>
            </div>
            <p className="text-[9px] text-zinc-400 -mt-0.5 font-medium">Task-Based Earning</p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Balance Chip (Click navigates to wallet) */}
          {currentUser ? (
            <button
              onClick={() => onNavigateTab('wallet')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-violet-600/15 border border-amber-500/30 hover:border-amber-400/60 transition group cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs shadow">
                ৳
              </div>
              <span className="font-mono font-bold text-sm text-amber-300">
                {currentUser.balance.toFixed(0)}
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-400 group-hover:text-amber-300">
                {language === 'bn' ? 'টাকা' : 'BDT'}
              </span>
            </button>
          ) : null}

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title="Toggle Language"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 transition cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-violet-400" />
            <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* User Status / Login */}
          {currentUser ? (
            <button
              onClick={() => onNavigateTab('profile')}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-violet-500/40 text-xs text-zinc-200 transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-medium text-xs max-w-[90px] truncate">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-violet-600/20 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
