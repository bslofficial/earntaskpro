import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User as UserIcon,
  Copy,
  Check,
  LogOut,
  Flame,
  Award,
  Wallet,
  ArrowUpRight,
  Shield,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  onOpenRefer: () => void;
  onOpenAuth: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProfileView: React.FC<Props> = ({ onOpenRefer, onOpenAuth, onNavigateTab }) => {
  const { currentUser, taskLogs, logout, language } = useApp();
  const [copied, setCopied] = useState(false);

  if (!currentUser) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl bg-zinc-900/60 border border-zinc-800">
        <UserIcon className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">
          {language === 'bn' ? 'আপনি লগইন অবস্থায় নেই' : 'You are not logged in'}
        </h3>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs cursor-pointer"
        >
          {language === 'bn' ? 'লগইন বা রেজিস্টার করুন' : 'Login or Register'}
        </button>
      </div>
    );
  }

  const handleCopyRefer = () => {
    navigator.clipboard.writeText(currentUser.referCode);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const userLogs = taskLogs.filter((l) => l.userId === currentUser.uid).slice(0, 10);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-violet-600 text-black font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{currentUser.name}</h3>
                {currentUser.role === 'admin' ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-extrabold uppercase">
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
                    Member
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentUser.emailOrPhone}</p>
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  {currentUser.checkInStreak} {language === 'bn' ? 'দিনের স্ট্রিক' : 'Days Streak'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && onNavigateTab && (
              <button
                onClick={() => onNavigateTab('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
              </button>
            )}

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Refer Code Bar */}
        <div className="mt-5 p-3 rounded-2xl bg-black/60 border border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-400">{language === 'bn' ? 'রেফার কোড:' : 'Refer Code:'}</span>
            <span className="font-mono text-sm font-bold text-amber-300">{currentUser.referCode}</span>
          </div>

          <button
            onClick={handleCopyRefer}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Balance & Earnings Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase block">{language === 'bn' ? 'ব্যালেন্স' : 'Balance'}</span>
          <span className="font-mono text-lg font-black text-amber-400">৳{currentUser.balance.toFixed(0)}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase block">{language === 'bn' ? 'মোট আয়' : 'Earned'}</span>
          <span className="font-mono text-lg font-black text-emerald-400">+৳{currentUser.totalEarned.toFixed(0)}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase block">{language === 'bn' ? 'উইথড্র' : 'Withdrawn'}</span>
          <span className="font-mono text-lg font-black text-violet-400">৳{currentUser.totalWithdrawn.toFixed(0)}</span>
        </div>
      </div>

      {/* Recent Earning Activities */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>{language === 'bn' ? 'সাম্প্রতিক টাস্ক কার্যক্রম' : 'Recent Task Activities'}</span>
        </h4>

        {userLogs.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">
            {language === 'bn' ? 'এখনো কোনো টাস্ক রেকর্ড নেই' : 'No task logs yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {userLogs.map((log, idx) => (
              <div
                key={log.id || `log-${idx}-${log.timestamp || idx}`}
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-zinc-200 block">{log.title}</span>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +৳{log.reward}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
