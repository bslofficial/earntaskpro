import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Share2, Copy, Check, TrendingUp, Gift, Award, Sparkles, ArrowUpRight, ShieldCheck, DollarSign } from 'lucide-react';
import { sound } from '../../utils/audio';

export const AffiliateDashboard: React.FC = () => {
  const { currentUser, allUsers, settings, language } = useApp();
  const [copied, setCopied] = useState(false);

  if (!currentUser) return null;

  const referCode = currentUser.referCode || 'EARN100';
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?ref=${referCode}` : `https://earntask.pro?ref=${referCode}`;

  // Find referred users
  const referredUsers = allUsers.filter(
    (u) => u.referredBy?.toUpperCase() === referCode.toUpperCase()
  );

  const totalInvited = referredUsers.length;
  const referBonus = settings.referBonus || 50;
  const totalCommission = totalInvited * referBonus;

  // Milestone goals
  const milestones = [
    { target: 5, reward: 250, labelBn: '৫ জন রেফার', labelEn: '5 Referrals' },
    { target: 10, reward: 600, labelBn: '১০ জন রেফার', labelEn: '10 Referrals' },
    { target: 25, reward: 1500, labelBn: '২৫ জন রেফার', labelEn: '25 Referrals' },
    { target: 50, reward: 3500, labelBn: '৫০ জন রেফার', labelEn: '50 Referrals' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referCode);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    sound.playClick();
    const shareText = language === 'bn'
      ? `EarnTask Pro এ আমার সাথে যুক্ত হয়ে প্রতিদিন আয় করুন! আমার রেফার কোড: ${referCode} দিয়ে জয়েন করলে পাবেন ৩০ টাকা বোনাস!`
      : `Join me on EarnTask Pro and earn daily! Use my referral code: ${referCode} to get a ৳30 bonus!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EarnTask Pro Affiliate',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 sm:p-8 shadow-2xl shadow-amber-500/10">
        <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'অ্যাফিলিয়েট ড্যাশবোর্ড' : 'Affiliate Partner Hub'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'bn' ? 'রেফারেল ও কমিশন গ্রোথ' : 'Referral Growth & Earnings'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              {language === 'bn'
                ? 'আপনার রেফারেল লিংক শেয়ার করে বন্ধুদের যুক্ত করুন এবং প্রতি সফল রেফারে আকর্ষণীয় কমিশন উপভোগ করুন।'
                : 'Share your referral link, grow your network, and earn instant commission for every invited user.'}
            </p>
          </div>

          <button
            onClick={handleShare}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-95 transition flex items-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'লিংক শেয়ার করুন' : 'Share Link'}</span>
          </button>
        </div>

        {/* Code Box */}
        <div className="mt-6 p-4 rounded-2xl bg-black/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
                {language === 'bn' ? 'আপনার রেফারেল কোড' : 'Your Referral Code'}
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-amber-300 tracking-wider">
                {referCode}
              </span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-zinc-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-400" />
                <span>{language === 'bn' ? 'কোড কপি করুন' : 'Copy Code'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Invited */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              {language === 'bn' ? 'মোট আমন্ত্রিত ব্যবহারকারী' : 'Total Invited Users'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{totalInvited}</span>
              <span className="text-xs text-violet-400 font-bold flex items-center">
                <Users className="w-3.5 h-3.5 mr-1" /> {language === 'bn' ? 'জন বন্ধু' : 'Users'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {language === 'bn' ? 'আপনার কোড ব্যবহার করে সাইন আপ করেছে' : 'Signed up using your code'}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Total Commission Earned */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              {language === 'bn' ? 'মোট কমিশন আয়' : 'Total Commission Earned'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-mono">৳{totalCommission.toFixed(0)}</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +৳{referBonus}/{language === 'bn' ? 'রেফার' : 'ref'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {language === 'bn' ? 'সরাসরি আপনার মেইন ব্যালেন্সে জমা হয়েছে' : 'Credited to your main balance'}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Referral Growth Milestones */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'রেফারেল মাইলস্টোন ও বোনাস' : 'Referral Milestones & Bonus'}</span>
          </h3>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg">
            {totalInvited} / 50 {language === 'bn' ? 'পূর্ণ' : 'Completed'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {milestones.map((m, idx) => {
            const isAchieved = totalInvited >= m.target;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition ${
                  isAchieved
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">{language === 'bn' ? m.labelBn : m.labelEn}</span>
                  {isAchieved ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black">
                      {language === 'bn' ? 'অর্জিত' : 'Achieved'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500">
                      {m.target - totalInvited} {language === 'bn' ? 'বাকি' : 'left'}
                    </span>
                  )}
                </div>
                <div className="font-mono font-black text-lg text-white">
                  +৳{m.reward}
                </div>
                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAchieved ? 'bg-amber-400' : 'bg-violet-500'
                    }`}
                    style={{ width: `${Math.min(100, (totalInvited / m.target) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invited Users List */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-400" />
          <span>{language === 'bn' ? 'আপনার আমন্ত্রিত ব্যবহারকারীগণের তালিকা' : 'Invited Users List'}</span>
        </h3>

        {referredUsers.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">
              {language === 'bn' ? 'এখনো কাউকে ইনভাইট করা হয়নি' : 'No Invited Users Yet'}
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-4">
              {language === 'bn'
                ? 'আপনার রেফার কোড শেয়ার করুন এবং প্রথম বন্ধুকে যুক্ত করে ৳৫০ বোনাস পান।'
                : 'Share your referral code and invite your first friend to earn ৳50 reward.'}
            </p>
            <button
              onClick={handleShare}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer"
            >
              {language === 'bn' ? 'এখনই শেয়ার করুন' : 'Share Now'}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {referredUsers.map((u, idx) => {
              const maskedEmailOrPhone = u.emailOrPhone.length > 6
                ? u.emailOrPhone.slice(0, 3) + '****' + u.emailOrPhone.slice(-3)
                : '****user';

              return (
                <div
                  key={u.uid || idx}
                  className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/90 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{maskedEmailOrPhone}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm block">
                      +৳{referBonus}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
