import React from 'react';
import { useApp } from '../../context/AppContext';
import { Megaphone, Bell } from 'lucide-react';

export const NoticeMarquee: React.FC = () => {
  const { settings, language } = useApp();

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-violet-600/15 to-amber-500/10 border-y border-amber-500/20 py-2 px-3 overflow-hidden">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        {/* Label Badge */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-sm">
          <Megaphone className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'নোটিশ' : 'NOTICE'}</span>
        </div>

        {/* Marquee Ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-xs font-medium text-amber-200/90">
            <span>{settings.noticeText}</span>
            <span className="text-amber-500/60">•</span>
            <span>{language === 'bn' ? 'প্রতিদিন টাস্ক কমপ্লিট করুন ও ইনস্ট্যান্ট রিওয়ার্ড নিন' : 'Complete daily tasks & earn instant rewards'}</span>
            <span className="text-amber-500/60">•</span>
            <span>{settings.noticeText}</span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 48s linear infinite;
        }
        .animate-marquee:hover,
        .animate-marquee:active {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
