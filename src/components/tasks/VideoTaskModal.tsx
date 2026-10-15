import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Pause, CheckCircle, Sparkles, X, Tv, ShieldAlert, Award, Volume2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_ADS = [
  {
    title: "Daraz 11.11 Mega Sale TVC",
    sponsor: "Daraz Bangladesh",
    tags: ["Shopping", "Discount 70%"],
    thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
    description: "সেরা অনলাইন কেনাকাটার মহা উৎসব! হাজারো পণ্যে বিশেষ ছাড়।"
  },
  {
    title: "bKash Super CashBack Offer",
    sponsor: "bKash Limited",
    tags: ["FinTech", "Instant Cashback"],
    thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    description: "যেকোনো কেনাকাটায় বিকাশ পেমেন্ট করে জিতে নিন ক্যাশব্যাক!"
  },
  {
    title: "Top Mobile Gaming Festival",
    sponsor: "Esports Arena",
    tags: ["Mobile Gaming", "Win Prizes"],
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    description: "খেলুন আর জিতে নিন আকর্ষণীয় পুরস্কার ও মেগা উপহার।"
  }
];

export const VideoTaskModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, settings, completeVideoTask, language } = useApp();
  
  const targetSeconds = settings.videoDurationSeconds || 15;
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(targetSeconds);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const watchedCount = currentUser?.dailyTasks?.videosWatchedToday || 0;
  const maxVideos = settings.maxDailyVideos || 10;
  const canWatch = watchedCount < maxVideos;

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(targetSeconds);
      setIsPlaying(false);
      setIsCompleted(false);
      setFeedback(null);
      setActiveAdIndex(Math.floor(Math.random() * SAMPLE_ADS.length));
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, targetSeconds]);

  // Video countdown timer
  useEffect(() => {
    if (isPlaying && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsPlaying(false);
            setIsCompleted(true);
            sound.playCoin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, secondsRemaining]);

  if (!isOpen) return null;

  const currentAd = SAMPLE_ADS[activeAdIndex];
  const progressPercent = Math.round(((targetSeconds - secondsRemaining) / targetSeconds) * 100);

  const handleStartWatch = () => {
    if (!canWatch) return;
    setIsPlaying(true);
    sound.playClick();
  };

  const handlePauseWatch = () => {
    setIsPlaying(false);
    sound.playClick();
  };

  const handleClaimReward = () => {
    const res = completeVideoTask();
    if (res.success) {
      setFeedback(res.message);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#8B5CF6', '#F59E0B', '#3B82F6'],
      });
      // Allow next video after 1.5s
      setTimeout(() => {
        setIsCompleted(false);
        setSecondsRemaining(targetSeconds);
        setFeedback(null);
        setActiveAdIndex((prev) => (prev + 1) % SAMPLE_ADS.length);
      }, 1800);
    } else {
      setFeedback(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl shadow-violet-500/10">
        {/* Glow ambient background */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pr-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/30">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{language === 'bn' ? 'ভিডিও অ্যাড টাস্ক' : 'Watch Video Task'}</span>
                <span className="text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 font-mono">
                  +৳{settings.videoTaskReward}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                {language === 'bn'
                  ? `আজকের বাকি: ${Math.max(0, maxVideos - watchedCount)}/${maxVideos} টি`
                  : `Remaining today: ${Math.max(0, maxVideos - watchedCount)}/${maxVideos}`}
              </p>
            </div>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900 aspect-video shadow-inner group">
          <img
            src={currentAd.thumbnail}
            alt={currentAd.title}
            className={`w-full h-full object-cover transition duration-700 ${isPlaying ? 'scale-105 brightness-95' : 'brightness-75'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

          {/* Ad Sponsor Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-wider">
              Ad
            </span>
            <span className="text-xs font-semibold text-white/90 drop-shadow">
              {currentAd.sponsor}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono">
            <Volume2 className="w-3.5 h-3.5 text-violet-400" />
            <span>HD Promo</span>
          </div>

          {/* Center Play/Pause Overlay */}
          {!isCompleted && canWatch && (
            <div className="absolute inset-0 flex items-center justify-center">
              {isPlaying ? (
                <button
                  onClick={handlePauseWatch}
                  className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer shadow-xl"
                >
                  <Pause className="w-7 h-7" />
                </button>
              ) : (
                <button
                  onClick={handleStartWatch}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/50 hover:scale-110 active:scale-95 transition cursor-pointer animate-pulse"
                >
                  <Play className="w-7 h-7 ml-1" />
                </button>
              )}
            </div>
          )}

          {/* Completed Badge inside Video */}
          {isCompleted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8" />
              </div>
              <span className="text-emerald-400 font-bold text-lg">
                {language === 'bn' ? 'ভিডিও দেখা সম্পন্ন!' : 'Video Completed!'}
              </span>
              <span className="text-zinc-300 text-xs">
                {language === 'bn' ? 'এখন আপনার রিওয়ার্ড সংগ্রহ করুন' : 'Claim your reward now'}
              </span>
            </div>
          )}

          {/* Bottom Video Info & Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="flex items-center justify-between text-xs text-white mb-1.5 font-medium">
              <span className="truncate max-w-[200px]">{currentAd.title}</span>
              <span className="font-mono text-amber-300">
                {secondsRemaining > 0 ? `${secondsRemaining}s remaining` : 'Done!'}
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-indigo-400 to-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Instructions / Rules */}
        <div className="mt-4 p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'ভিডিও টাস্কের নিয়মাবলী:' : 'Video Task Guidelines:'}</span>
          </div>
          <p className="text-zinc-400 pl-5">
            {language === 'bn'
              ? `পুরো ${targetSeconds} সেকেন্ড ভিডিওটি দেখতে হবে। ভিডিও স্কিপ বা ট্যাব পরিবর্তন করলে রিওয়ার্ড জমা হবে না।`
              : `Watch the full ${targetSeconds}s video. Skipping or leaving the tab will pause the timer.`}
          </p>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="mt-3 p-2.5 rounded-xl text-center text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          {isCompleted ? (
            <button
              onClick={handleClaimReward}
              className="flex-1 py-3.5 px-6 rounded-2xl font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>{language === 'bn' ? `টাকা ক্লেইম করুন (+৳${settings.videoTaskReward})` : `Claim Reward (+৳${settings.videoTaskReward})`}</span>
            </button>
          ) : (
            <button
              onClick={isPlaying ? handlePauseWatch : handleStartWatch}
              disabled={!canWatch}
              className={`flex-1 py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                !canWatch
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:opacity-95 active:scale-98'
              }`}
            >
              {!canWatch ? (
                <>
                  <Award className="w-5 h-5 text-zinc-500" />
                  <span>{language === 'bn' ? 'আজকের লিমিট শেষ' : 'Daily Limit Reached'}</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>{language === 'bn' ? 'পজ করুন (Pause)' : 'Pause Video'}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>{language === 'bn' ? 'ভিডিও দেখা শুরু করুন' : 'Start Watching Ad'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
