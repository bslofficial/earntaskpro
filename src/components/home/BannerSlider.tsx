import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Gift, Tv, Disc3, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  onSelectTask: (taskType: string) => void;
}

export const BannerSlider: React.FC<Props> = ({ onSelectTask }) => {
  const { language } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: language === 'bn' ? '🔥 মেগা অফার' : '🔥 Mega Offer',
      title: language === 'bn' ? 'লাকি স্পিন খেলে জিতে নিন জ্যাকপট!' : 'Play Lucky Spin & Win Jackpot!',
      subtitle: language === 'bn' ? 'প্রতিদিন ৮ বার ফ্রি স্পিন করুন আর জিতে নিন সর্বোচ্চ ৫০ টাকা' : 'Spin up to 8 times daily and win up to ৳50 cash',
      actionText: language === 'bn' ? 'এখনই স্পিন করুন' : 'Spin Now',
      taskKey: 'spin',
      icon: Disc3,
      gradient: 'from-amber-600/30 via-yellow-600/20 to-zinc-900',
      border: 'border-amber-500/40',
      accentColor: 'text-amber-400',
      btnBg: 'bg-amber-400 hover:bg-amber-300 text-black',
      image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      badge: language === 'bn' ? '⭐ ভিডিও টাস্ক' : '⭐ Video Task',
      title: language === 'bn' ? 'প্রতি ভিডিওতে পাচ্ছেন ৮ টাকা নিশ্চিত!' : 'Earn ৳8 for Every Video You Watch!',
      subtitle: language === 'bn' ? 'মাত্র ১৫ সেকেন্ডের ভিডিও দেখে দিনে ১০০ টাকা পর্যন্ত আয় করুন' : 'Watch 15s ads and earn up to ৳100 per day directly',
      actionText: language === 'bn' ? 'ভিডিও দেখুন' : 'Watch Ads',
      taskKey: 'video',
      icon: Tv,
      gradient: 'from-violet-600/30 via-indigo-600/20 to-zinc-900',
      border: 'border-violet-500/40',
      accentColor: 'text-violet-400',
      btnBg: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
      image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d1345?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      badge: language === 'bn' ? '🎁 দৈনিক বোনাস' : '🎁 Daily Streak',
      title: language === 'bn' ? '৭ দিনের স্ট্রিক বোনাসে ডাবল রিওয়ার্ড!' : 'Double Reward on 7-Day Daily Streak!',
      subtitle: language === 'bn' ? 'প্রতিদিন লগইন করে ইনস্ট্যান্ট চেক-ইন বোনাস সংগ্রহ করুন' : 'Collect instant daily check-in rewards and multiply earnings',
      actionText: language === 'bn' ? 'চেক-ইন করুন' : 'Claim Now',
      taskKey: 'checkin',
      icon: Gift,
      gradient: 'from-emerald-600/30 via-teal-600/20 to-zinc-900',
      border: 'border-emerald-500/40',
      accentColor: 'text-emerald-400',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Auto rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-xl group">
      {/* Background Image with overlay */}
      <div className="relative min-h-[190px] sm:min-h-[220px] flex items-center p-5 sm:p-7 overflow-hidden">
        <img
          src={activeSlide.image}
          alt={activeSlide.title}
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter saturate-150 transition-all duration-1000 scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${activeSlide.gradient} backdrop-blur-[2px]`} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-md">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-300 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeSlide.badge}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow">
            {activeSlide.title}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 mb-4 line-clamp-2">
            {activeSlide.subtitle}
          </p>

          <button
            onClick={() => onSelectTask(activeSlide.taskKey)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all transform active:scale-95 shadow-lg cursor-pointer ${activeSlide.btnBg}`}
          >
            <span>{activeSlide.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Right Decorative Graphic */}
        <div className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 w-28 h-28 rounded-full bg-black/40 border border-white/10 backdrop-blur-md items-center justify-center shadow-2xl">
          {React.createElement(activeSlide.icon, {
            className: `w-14 h-14 ${activeSlide.accentColor} animate-pulse`,
          })}
        </div>
      </div>

      {/* Slider Nav Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
