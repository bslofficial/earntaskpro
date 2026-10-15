import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Award, Flame, Search, Crown, Medal, User as UserIcon } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { allUsers, language, currentUser } = useApp();
  const [search, setSearch] = useState('');

  // Ensure sorted by totalEarned descending and take 150 users
  const sortedUsers = [...allUsers]
    .filter(Boolean)
    .sort((a, b) => (b.totalEarned || 0) - (a.totalEarned || 0))
    .slice(0, 150);

  const filteredUsers = sortedUsers.filter(
    (u) =>
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.emailOrPhone || '').toLowerCase().includes(search.toLowerCase())
  );

  const maskPhone = (phone: string) => {
    if (!phone) return '017****000';
    if (phone.length <= 5) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200 pb-16">
      {/* Leaderboard Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-xl text-center">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {language === 'bn' ? 'সেরা ১৫০ জন লিডারবোর্ড' : 'Top 150 Leaderboard'}
          </h2>
          <p className="text-xs text-zinc-400 max-w-sm mt-1">
            {language === 'bn'
              ? 'প্ল্যাটফর্মে সবচেয়ে বেশি আয়কারী সেরা ১৫০ জন ইউজারের তালিকা'
              : 'Ranking the top 150 earners across the EarnTask Pro platform'}
          </p>

          {/* Search Bar */}
          <div className="mt-5 w-full max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'bn' ? 'নাম বা নম্বর দিয়ে খুঁজুন...' : 'Search by name or phone...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2.5">
        <div className="flex items-center justify-between px-2 pb-2 border-b border-zinc-800/80 text-[11px] font-bold uppercase text-zinc-400">
          <span>{language === 'bn' ? 'র‍্যাংক ও ইউজার' : 'Rank & User'}</span>
          <span>{language === 'bn' ? 'মোট আয়' : 'Total Earned'}</span>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-xs text-zinc-500 py-8 text-center">
            {language === 'bn' ? 'কোনো ইউজার পাওয়া যায়নি' : 'No users found'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user, index) => {
              const rank = sortedUsers.findIndex((u) => u.uid === user.uid) + 1;
              const isCurrentUser = currentUser?.uid === user.uid;

              return (
                <div
                  key={user.uid || `user-${index}`}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isCurrentUser
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : rank === 1
                      ? 'bg-gradient-to-r from-amber-500/20 via-zinc-900 to-zinc-950 border-amber-500/40'
                      : rank === 2
                      ? 'bg-gradient-to-r from-zinc-300/15 via-zinc-900 to-zinc-950 border-zinc-400/40'
                      : rank === 3
                      ? 'bg-gradient-to-r from-amber-700/20 via-zinc-900 to-zinc-950 border-amber-700/40'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Left: Rank & Avatar & Details */}
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shadow ${
                        rank === 1
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-black shadow-amber-500/30'
                          : rank === 2
                          ? 'bg-gradient-to-br from-zinc-300 to-zinc-400 text-black shadow-zinc-400/30'
                          : rank === 3
                          ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-700/30'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {rank === 1 ? <Crown className="w-4 h-4 text-black fill-black" /> : rank <= 3 ? <Medal className="w-4 h-4" /> : `#${rank}`}
                    </div>

                    {/* Avatar Initial */}
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 text-amber-400 font-bold text-sm flex items-center justify-center">
                      {(user.name || 'U').charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[130px] sm:max-w-[200px]">
                          {user.name}
                          {isCurrentUser && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-black uppercase">
                              {language === 'bn' ? 'আপনি' : 'You'}
                            </span>
                          )}
                        </span>
                        {user.role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[9px] font-bold">
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                        <span className="font-mono">{maskPhone(user.emailOrPhone)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {user.checkInStreak || 0}d streak
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Earned */}
                  <div className="text-right">
                    <span className="font-mono font-black text-sm sm:text-base text-emerald-400 block">
                      +৳{(user.totalEarned || 0).toFixed(0)}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">
                      {language === 'bn' ? 'আয়' : 'Earned'}
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
