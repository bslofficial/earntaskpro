import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Tv, Disc3, HelpCircle, Users, ChevronRight, CheckCircle2, Sparkles, LayoutGrid, Layers } from 'lucide-react';

interface Props {
  onOpenCheckin: () => void;
  onOpenVideo: () => void;
  onOpenSpin: () => void;
  onOpenQuiz: () => void;
  onOpenRefer: () => void;
}

export const TaskListView: React.FC<Props> = ({
  onOpenCheckin,
  onOpenVideo,
  onOpenSpin,
  onOpenQuiz,
  onOpenRefer,
}) => {
  const { currentUser, settings, language } = useApp();
  const [activeCategory, setActiveCategory] = useState<'all' | 'video' | 'survey' | 'interactive'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckinDone = currentUser?.lastCheckInDate === todayStr;

  const videosWatched = currentUser?.dailyTasks?.videosWatchedToday || 0;
  const maxVideos = settings.maxDailyVideos || 10;

  const spinsDone = currentUser?.dailyTasks?.spinsToday || 0;
  const maxSpins = settings.maxDailySpins || 8;

  const quizzesDone = currentUser?.dailyTasks?.quizzesToday || 0;
  const maxQuizzes = settings.maxDailyQuizzes || 5;

  const tasks = [
    {
      id: 'checkin',
      category: 'interactive',
      categoryNameBn: 'ইন্টারেক্টিভ',
      categoryNameEn: 'Interactive',
      title: language === 'bn' ? 'ডেইলি চেক-ইন বোনাস' : 'Daily Check-in Bonus',
      subtitle: language === 'bn' ? 'প্রতিদিন মাত্র ১ ক্লিকে রিওয়ার্ড নিন' : 'Claim daily streak rewards with 1 click',
      reward: `+৳${settings.dailyCheckinReward}`,
      rewardSub: isCheckinDone ? (language === 'bn' ? 'সংগৃহীত' : 'Claimed') : (language === 'bn' ? 'দাবি করুন' : 'Claim'),
      icon: Calendar,
      gradient: 'from-amber-500 to-yellow-400',
      isCompleted: isCheckinDone,
      progressText: isCheckinDone ? '1 / 1' : '0 / 1',
      progressPercent: isCheckinDone ? 100 : 0,
      badge: currentUser?.checkInStreak ? `${currentUser.checkInStreak} ${language === 'bn' ? 'দিন স্ট্রিক' : 'd streak'}` : null,
      onClick: onOpenCheckin,
    },
    {
      id: 'video',
      category: 'video',
      categoryNameBn: 'ভিডিও',
      categoryNameEn: 'Video',
      title: language === 'bn' ? 'ভিডিও অ্যাড দেখুন' : 'Watch Video Ads',
      subtitle: language === 'bn' ? '১৫ সেকেন্ডের বিজ্ঞাপন দেখে টাকা পান' : 'Watch 15s ads and earn cash',
      reward: `+৳${settings.videoTaskReward}`,
      rewardSub: language === 'bn' ? 'প্রতি ভিডিও' : 'per video',
      icon: Tv,
      gradient: 'from-violet-600 to-indigo-600',
      isCompleted: videosWatched >= maxVideos,
      progressText: `${videosWatched} / ${maxVideos}`,
      progressPercent: Math.min(100, Math.round((videosWatched / maxVideos) * 100)),
      badge: `${maxVideos - videosWatched} ${language === 'bn' ? 'বাকি' : 'left'}`,
      onClick: onOpenVideo,
    },
    {
      id: 'spin',
      category: 'interactive',
      categoryNameBn: 'ইন্টারেক্টিভ',
      categoryNameEn: 'Interactive',
      title: language === 'bn' ? 'লাকি স্পিন হুইল' : 'Lucky Spin Wheel',
      subtitle: language === 'bn' ? 'চাকা ঘুরিয়ে ৫০ টাকা পর্যন্ত জিতুন' : 'Spin the lucky wheel for up to ৳50',
      reward: `+৳২-৫০`,
      rewardSub: language === 'bn' ? 'প্রতি স্পিন' : 'per spin',
      icon: Disc3,
      gradient: 'from-amber-500 to-orange-500',
      isCompleted: spinsDone >= maxSpins,
      progressText: `${spinsDone} / ${maxSpins}`,
      progressPercent: Math.min(100, Math.round((spinsDone / maxSpins) * 100)),
      badge: `${maxSpins - spinsDone} ${language === 'bn' ? 'বাকি' : 'left'}`,
      onClick: onOpenSpin,
    },
    {
      id: 'quiz',
      category: 'survey',
      categoryNameBn: 'সার্ভে ও কুইজ',
      categoryNameEn: 'Survey',
      title: language === 'bn' ? 'সাধারণ জ্ঞান কুইজ' : 'GK Quiz Challenge',
      subtitle: language === 'bn' ? 'সহজ প্রশ্নের সঠিক উত্তর দিয়ে আয় করুন' : 'Answer trivia correctly and get paid',
      reward: `+৳${settings.quizReward}`,
      rewardSub: language === 'bn' ? 'প্রতি কুইজ' : 'per quiz',
      icon: HelpCircle,
      gradient: 'from-fuchsia-600 to-pink-600',
      isCompleted: quizzesDone >= maxQuizzes,
      progressText: `${quizzesDone} / ${maxQuizzes}`,
      progressPercent: Math.min(100, Math.round((quizzesDone / maxQuizzes) * 100)),
      badge: `${maxQuizzes - quizzesDone} ${language === 'bn' ? 'বাকি' : 'left'}`,
      onClick: onOpenQuiz,
    },
    {
      id: 'refer',
      category: 'interactive',
      categoryNameBn: 'ইন্টারেক্টিভ',
      categoryNameEn: 'Interactive',
      title: language === 'bn' ? 'রেফার ও ইনভাইট' : 'Refer & Invite Friends',
      subtitle: language === 'bn' ? 'বন্ধুদের ইনভাইট করলেই প্রতি রেফারে ৫০ টাকা' : 'Earn ৳50 for every verified friend',
      reward: `+৳${settings.referBonus}`,
      rewardSub: language === 'bn' ? 'প্রতি রেফার' : 'per invite',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-400',
      isCompleted: false,
      progressText: 'আনলিমিটেড',
      progressPercent: 100,
      badge: 'HOT 🔥',
      onClick: onOpenRefer,
    },
  ];

  const categories = [
    { id: 'all', labelBn: 'সব টাস্ক', labelEn: 'All Tasks', icon: LayoutGrid },
    { id: 'video', labelBn: 'ভিডিও (Video)', labelEn: 'Video', icon: Tv },
    { id: 'survey', labelBn: 'সার্ভে (Survey)', labelEn: 'Survey', icon: HelpCircle },
    { id: 'interactive', labelBn: 'ইন্টারেক্টিভ (Interactive)', labelEn: 'Interactive', icon: Disc3 },
  ];

  const filteredTasks = activeCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === activeCategory);

  return (
    <div className="w-full space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>{language === 'bn' ? 'আর্নিং টাস্কসমূহ' : 'Available Earning Tasks'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </h3>
          <p className="text-xs text-zinc-400">
            {language === 'bn' ? 'টাস্ক সম্পন্ন করে সরাসরি ব্যালেন্সে টাকা নিন' : 'Complete tasks to receive balance instantly'}
          </p>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const CatIcon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                isActive
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
              }`}
            >
              <CatIcon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-amber-400'}`} />
              <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Deposit Requirement Notice Banner */}
      {currentUser && currentUser.role !== 'admin' && (currentUser.totalDeposited || 0) < (settings.minDepositForTasks || 300) && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-300 text-xs sm:text-sm">
          <div>
            <p className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{language === 'bn' ? 'টাস্ক আনলক করতে ডিপোজিট প্রয়োজন' : 'Deposit Required to Unlock Tasks'}</span>
            </p>
            <p className="text-zinc-300 text-[11px] mt-0.5">
              {language === 'bn'
                ? `কাজ করার জন্য কমপক্ষে ৳${settings.minDepositForTasks || 300} ডিপোজিট করতে হবে। আপনার ডিপোজিট: ৳${currentUser.totalDeposited || 0}`
                : `Minimum ৳${settings.minDepositForTasks || 300} deposit required. Your deposit: ৳${currentUser.totalDeposited || 0}`}
            </p>
          </div>
          <button
            onClick={() => {
              const walletTabBtn = document.querySelector('[data-tab="wallet"]') as HTMLElement;
              if (walletTabBtn) walletTabBtn.click();
            }}
            className="px-3 py-2 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition shrink-0 shadow cursor-pointer"
          >
            {language === 'bn' ? 'ডিপোজিট করুন' : 'Deposit Now'}
          </button>
        </div>
      )}

      {/* Task Cards List Grouped / Filtered */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <p className="text-sm text-zinc-400">
              {language === 'bn' ? 'এই ক্যাটাগরিতে কোনো টাস্ক নেই।' : 'No tasks found in this category.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const Icon = task.icon;

            return (
              <div
                key={task.id}
                onClick={task.onClick}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer p-4 group ${
                  task.isCompleted
                    ? 'border-zinc-800 bg-zinc-900/40 opacity-75 hover:opacity-100'
                    : 'border-zinc-800 hover:border-amber-500/50 bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-zinc-950 hover:bg-zinc-850 shadow-md hover:shadow-xl'
                }`}
              >
                {/* Top Row: Icon + Info + Reward */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Icon & Title */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${task.gradient} text-black font-black flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-black" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                          {language === 'bn' ? task.categoryNameBn : task.categoryNameEn}
                        </span>
                        <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-amber-300 transition-colors">
                          {task.title}
                        </h4>
                        {task.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
                            {task.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {task.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Reward pill */}
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div className="bg-black/50 border border-zinc-700/60 px-3 py-1.5 rounded-xl text-right">
                      <span className="block font-mono font-black text-sm sm:text-base text-amber-400 leading-tight">
                        {task.reward}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase font-medium">
                        {task.rewardSub}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Bottom Progress track */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>
                      {task.isCompleted
                        ? language === 'bn'
                          ? 'আজকের জন্য সম্পন্ন'
                          : 'Completed for today'
                        : language === 'bn'
                        ? 'টাস্ক সক্রিয় আছে'
                        : 'Task Available'}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-300 font-semibold">{task.progressText}</span>
                    <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          task.isCompleted ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${task.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
