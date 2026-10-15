import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, TrendingUp, CheckCircle, Flame, ArrowUpRight, PlusCircle } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  onNavigateTab: (tab: string) => void;
  onOpenCheckin: () => void;
}

export const QuickStats: React.FC<Props> = ({ onNavigateTab, onOpenCheckin }) => {
  const { currentUser, language } = useApp();

  const balance = currentUser?.balance || 0;
  const streak = currentUser?.checkInStreak || 0;

  const tasksCount =
    (currentUser?.dailyTasks?.videosWatchedToday || 0) +
    (currentUser?.dailyTasks?.spinsToday || 0) +
    (currentUser?.dailyTasks?.quizzesToday || 0) +
    (currentUser?.lastCheckInDate === new Date().toISOString().split('T')[0] ? 1 : 0);

  return (
    <div className="w-full space-y-3">
      {/* Primary Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl shadow-amber-500/10">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? 'মোট ব্যালেন্স' : 'Total Balance'}</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight">
                ৳{balance.toFixed(0)}
              </span>
              <span className="text-amber-400 font-bold text-xs">BDT</span>
            </div>
          </div>

          {/* Quick Actions (Deposit & Withdraw) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { sound.playClick(); onNavigateTab('wallet'); }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{language === 'bn' ? 'উইথড্র' : 'Withdraw'}</span>
            </button>

            <button
              onClick={() => { sound.playClick(); onNavigateTab('wallet'); }}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'ডিপোজিট' : 'Deposit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Secondary Mini Metric Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Streak card */}
        <div
          onClick={onOpenCheckin}
          className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'bn' ? 'স্ট্রিক' : 'Streak'}</span>
            <Flame className="w-3.5 h-3.5 text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-mono text-base sm:text-lg font-black text-amber-300">
            {streak} {language === 'bn' ? 'দিন' : 'd'}
          </span>
        </div>

        {/* Tasks completed today */}
        <div
          onClick={() => onNavigateTab('task')}
          className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-violet-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'bn' ? 'আজকের টাস্ক' : 'Tasks'}</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-mono text-base sm:text-lg font-black text-white">
            {tasksCount} {language === 'bn' ? 'টি' : 'done'}
          </span>
        </div>

        {/* Total Earned */}
        <div
          onClick={() => onNavigateTab('profile')}
          className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'bn' ? 'মোট আয়' : 'Earned'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-mono text-base sm:text-lg font-black text-emerald-400">
            ৳{(currentUser?.totalEarned || 0).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
};
