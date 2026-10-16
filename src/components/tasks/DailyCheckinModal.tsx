import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Gift, CheckCircle2, Sparkles, X, Flame, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyCheckinModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, settings, claimDailyCheckin, language } = useApp();
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string; reward?: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyClaimed = currentUser?.lastCheckInDate === todayStr;
  const currentStreak = currentUser?.checkInStreak || 0;

  // মিডনাইট কাউন্টডাউন টাইমার
  useEffect(() => {
    if (!alreadyClaimed) return;

    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);

      const diff = nextMidnight.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const formatted = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      setTimeLeft(formatted);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [alreadyClaimed]);

  if (!isOpen || !currentUser) return null;

  const days = [
    { day: 1, reward: settings.dailyCheckinReward, label: language === 'bn' ? '১ম দিন' : 'Day 1' },
    { day: 2, reward: settings.dailyCheckinReward, label: language === 'bn' ? '২য় দিন' : 'Day 2' },
    { day: 3, reward: settings.dailyCheckinReward + 5, label: language === 'bn' ? '৩য় দিন' : 'Day 3' },
    { day: 4, reward: settings.dailyCheckinReward + 5, label: language === 'bn' ? '৪র্থ দিন' : 'Day 4' },
    { day: 5, reward: settings.dailyCheckinReward + 10, label: language === 'bn' ? '৫ম দিন' : 'Day 5' },
    { day: 6, reward: settings.dailyCheckinReward + 10, label: language === 'bn' ? '৬ষ্ঠ দিন' : 'Day 6' },
    { day: 7, reward: settings.dailyCheckinReward * 2, label: language === 'bn' ? '৭ম দিন (মেগা)' : 'Day 7 (Mega)' },
  ];

  const handleClaim = () => {
    if (alreadyClaimed) return;

    const res = claimDailyCheckin();
    setFeedback({
      success: res.success,
      msg: res.message,
      reward: res.reward,
    });

    if (res.success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#8B5CF6', '#10B981', '#F43F5E'],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900 via-zinc-900 to-black p-6 shadow-2xl shadow-amber-500/10">
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black shadow-lg shadow-amber-500/30 mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>{language === 'bn' ? 'দৈনিক চেক-ইন' : 'Daily Check-in'}</span>
            <span className="text-amber-400 text-xs px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 font-mono">
              +৳{settings.dailyCheckinReward}
            </span>
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            {language === 'bn'
              ? 'প্রতিদিন লগইন করে রিওয়ার্ড দাবি করুন এবং স্ট্রিক বাড়ান'
              : 'Log in daily to claim your rewards and build your streak'}
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>
              {language === 'bn'
                ? `বর্তমান স্ট্রিক: ${currentStreak} দিন`
                : `Current Streak: ${currentStreak} Days`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {days.map((item) => {
            const isCompleted = currentStreak >= item.day;
            const isCurrent = !alreadyClaimed && (currentStreak + 1 === item.day || (currentStreak === 0 && item.day === 1));
            const isMega = item.day === 7;

            return (
              <div
                key={item.day}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border transition ${
                  isMega ? 'col-span-2' : 'col-span-1'
                } ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                }`}
              >
                <span className="text-[11px] font-medium opacity-80 mb-1">{item.label}</span>
                <div className="my-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Gift className={`w-5 h-5 ${isCurrent ? 'text-amber-400 animate-bounce' : 'text-zinc-500'}`} />
                  )}
                </div>
                <span className="text-xs font-bold text-amber-300 mt-0.5">৳{item.reward}</span>
                {isCurrent && (
                  <span className="absolute -top-2 -right-1 text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-bold">
                    TODAY
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl mb-4 text-center text-sm font-medium ${
              feedback.success
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* Action / Countdown Button */}
        <button
          onClick={handleClaim}
          disabled={alreadyClaimed}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
            alreadyClaimed
              ? 'bg-zinc-800/90 text-amber-400/90 border border-amber-500/30 cursor-not-allowed opacity-90'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black shadow-amber-500/25 hover:opacity-95 active:scale-95 cursor-pointer'
          }`}
        >
          {alreadyClaimed ? (
            <>
              <Clock className="w-5 h-5 text-amber-400 animate-spin" />
              <span>
                {language === 'bn'
                  ? `পরবর্তী আনলক: ${timeLeft || '00:00:00'}`
                  : `Next Unlock in ${timeLeft || '00:00:00'}`}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{language === 'bn' ? 'বোনাস ক্লেইম করুন' : 'Claim Daily Reward'}</span>
            </>
          )}
        </button>

        {alreadyClaimed && (
          <p className="text-center text-xs text-zinc-500 mt-3 font-mono">
            {language === 'bn'
              ? 'পরবর্তী চেক-ইন রাত ১২:০০ টায় আনলক হবে'
              : 'Next check-in unlocks at 00:00 midnight'}
          </p>
        )}
      </div>
    </div>
  );
};
