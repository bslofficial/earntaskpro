import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Copy, Check, Share2, Sparkles, X, Gift, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, settings, allUsers, language } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !currentUser) return null;

  const referCode = currentUser.referCode || 'EARN100';
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?ref=${referCode}` : `https://earntask.pro?ref=${referCode}`;

  // Find referred users
  const referredUsers = allUsers.filter(
    (u) => u.referredBy?.toUpperCase() === referCode.toUpperCase()
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(referCode);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    sound.playClick();
    const shareText = `EarnTask Pro অ্যাপে জয়েন করে ভিডিও দেখে ও গেম খেলে প্রতিদিন ২০০-৫০০ টাকা আয় করুন! আমার রেফার কোড: ${referCode} দিয়ে জয়েন করলে পেয়ে যাবেন ৩০ টাকা বোনাস!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EarnTask Pro - Task-Based Earning',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // Fallback copy
        handleCopy();
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
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

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/30 mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <span>{language === 'bn' ? 'রেফার ও ইনভাইট' : 'Refer & Earn'}</span>
            <span className="text-amber-400 text-xs px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 font-mono">
              +৳{settings.referBonus}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            {language === 'bn'
              ? 'আপনার বন্ধুদের ইনভাইট করুন এবং প্রতিটি রেফারেন্সের জন্য ৫০ টাকা বোনাস পান!'
              : 'Invite your friends and get ৳50 reward for each referral!'}
          </p>
        </div>

        {/* Refer Code Box */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 mb-5 relative overflow-hidden">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'আপনার ইউনিক রেফার কোড' : 'Your Unique Referral Code'}</span>
          </div>
          <div className="flex items-center justify-between gap-3 bg-black/60 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-mono text-xl font-black tracking-widest text-amber-400 pl-2">
              {referCode}
            </span>
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{language === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* How it works 3-step banner */}
        <div className="space-y-2 mb-5">
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0">
              ১
            </div>
            <span className="text-zinc-300">
              {language === 'bn' ? 'বন্ধুদের সাথে আপনার রেফারেল কোড বা লিংক শেয়ার করুন' : 'Share your referral code with friends'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0">
              ২
            </div>
            <span className="text-zinc-300">
              {language === 'bn' ? 'তারা সাইন-আপ করার সময় রেফার কোড ব্যবহার করবে' : 'They sign up using your referral code'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
              ৩
            </div>
            <span className="text-zinc-300">
              {language === 'bn' ? `আপনি পাবেন ৳${settings.referBonus} আর বন্ধু পাবে ৩০ টাকা স্বাগতম বোনাস!` : `You get ৳${settings.referBonus} & your friend gets ৳30 welcome bonus!`}
            </span>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full py-3.5 px-6 rounded-2xl font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition cursor-pointer mb-4"
        >
          <Share2 className="w-5 h-5 text-black" />
          <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ / ফেসবুকে শেয়ার করুন' : 'Share via WhatsApp / Social'}</span>
        </button>

        {/* Referred list preview */}
        <div className="border-t border-zinc-800 pt-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>{language === 'bn' ? 'আপনার মোট রেফারেল' : 'Total Referrals'}</span>
            <span className="font-bold text-amber-400">{referredUsers.length} জন</span>
          </div>

          {referredUsers.length > 0 ? (
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
              {referredUsers.map((u, idx) => (
                <div key={u.uid || `ref-${idx}`} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-[10px]">
                      {u.name.substring(0, 1)}
                    </div>
                    <span className="text-zinc-200 font-medium">{u.name}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">+৳{settings.referBonus}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500 text-center py-2">
              {language === 'bn' ? 'এখনো কোনো রেফারেল নেই। এখনই বন্ধুদের আমন্ত্রণ জানান!' : 'No referrals yet. Invite friends to start earning!'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
