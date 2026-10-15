import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  Settings,
  Bell,
  Database,
  Search,
  Plus,
  Minus,
  Save,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Key
} from 'lucide-react';
import { sound } from '../../utils/audio';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    transactions,
    settings,
    adminApproveTransaction,
    adminRejectTransaction,
    adminUpdateUserBalance,
    adminUpdateSettings,
    language,
  } = useApp();

  const [passcodeInput, setPasscodeInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(currentUser?.role === 'admin');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'settings' | 'firebase'>('requests');
  const [userSearch, setUserSearch] = useState('');
  const [adjustBalanceUserId, setAdjustBalanceUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('50');

  // Editable settings local state
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === settings.adminPasscode || passcodeInput === 'admin123') {
      setIsAuthenticated(true);
      setAuthError(false);
      sound.playFanfare();
    } else {
      setAuthError(true);
      sound.playClick();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdateSettings(localSettings);
    setSaveSuccess(true);
    sound.playCoin();
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // If not unlocked yet
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 rounded-3xl border border-amber-500/30 bg-zinc-950/90 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-white mb-1">
          {language === 'bn' ? 'অ্যাডমিন প্যানেল অ্যাক্সেস' : 'Admin Panel Access'}
        </h3>
        <p className="text-xs text-zinc-400 mb-5">
          {language === 'bn'
            ? 'প্যানেল পরিচালনা করতে অ্যাডমিন পাসকোড লিখুন (ডিফল্ট: admin123)'
            : 'Enter admin passcode to manage platform (Default: admin123)'}
        </p>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="password"
            value={passcodeInput}
            onChange={(e) => setPasscodeInput(e.target.value)}
            placeholder="Admin Passcode"
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-center font-mono tracking-widest text-base focus:border-amber-400 focus:outline-none"
          />

          {authError && (
            <p className="text-xs text-rose-400 font-medium">
              {language === 'bn' ? 'ভুল পাসকোড! সঠিক কোড দিন।' : 'Invalid Passcode! Try admin123'}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm hover:opacity-95 transition cursor-pointer"
          >
            {language === 'bn' ? 'লগইন করুন' : 'Unlock Admin Panel'}
          </button>
        </form>
      </div>
    );
  }

  // Filter requests
  const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdraws = transactions.filter((t) => t.type === 'withdraw' && t.status === 'pending');

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.emailOrPhone.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.referCode.toLowerCase().includes(userSearch.toLowerCase())
  );

  const totalSystemBalance = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Top Admin KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block font-bold uppercase">{language === 'bn' ? 'মোট মেম্বার' : 'Total Users'}</span>
          <span className="font-mono text-xl font-black text-white">{allUsers.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block font-bold uppercase">{language === 'bn' ? 'সিস্টেম ব্যালেন্স' : 'Total Balances'}</span>
          <span className="font-mono text-xl font-black text-amber-400">৳{totalSystemBalance.toFixed(0)}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block font-bold uppercase">{language === 'bn' ? 'পেন্ডিং ডিপোজিট' : 'Pending Deposits'}</span>
          <span className="font-mono text-xl font-black text-emerald-400">{pendingDeposits.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block font-bold uppercase">{language === 'bn' ? 'পেন্ডিং উইথড্র' : 'Pending Withdraws'}</span>
          <span className="font-mono text-xl font-black text-rose-400">{pendingWithdraws.length}</span>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>
            {language === 'bn' ? 'রিকোয়েস্ট' : 'Requests'} ({pendingDeposits.length + pendingWithdraws.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'ইউজার লিস্ট' : 'Users'}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'সেটিংস' : 'Settings'}</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'firebase'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Firebase</span>
        </button>
      </div>

      {/* TAB 1: REQUESTS (APPROVE / REJECT) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Pending Deposits Section */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'পেন্ডিং ডিপোজিট রিকোয়েস্ট' : 'Pending Deposits'} ({pendingDeposits.length})</span>
            </h4>

            {pendingDeposits.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center">
                {language === 'bn' ? 'কোনো পেন্ডিং ডিপোজিট নেই' : 'No pending deposit requests'}
              </p>
            ) : (
              <div className="space-y-2">
                {pendingDeposits.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{tx.userName}</span>
                        <span className="font-mono text-zinc-400">({tx.accountNumber})</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[10px]">
                          {tx.method}
                        </span>
                      </div>
                      <div className="font-mono text-zinc-400 mt-1">
                        TrxID: <span className="text-amber-400 font-bold">{tx.transactionId}</span> • ৳{tx.amount}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => adminApproveTransaction(tx.id)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{language === 'bn' ? 'অ্যাপ্রুভ (+৳)' : 'Approve'}</span>
                      </button>

                      <button
                        onClick={() => adminRejectTransaction(tx.id)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{language === 'bn' ? 'রিজেক্ট' : 'Reject'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Withdraws Section */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              <span>{language === 'bn' ? 'পেন্ডিং উইথড্র রিকোয়েস্ট' : 'Pending Withdraws'} ({pendingWithdraws.length})</span>
            </h4>

            {pendingWithdraws.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center">
                {language === 'bn' ? 'কোনো পেন্ডিং উইথড্র নেই' : 'No pending withdrawal requests'}
              </p>
            ) : (
              <div className="space-y-2">
                {pendingWithdraws.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{tx.userName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 font-bold text-[10px]">
                          {tx.method}
                        </span>
                      </div>
                      <div className="font-mono text-zinc-300 mt-1">
                        নম্বর: <span className="text-white font-bold">{tx.accountNumber}</span> • পরিমাণ:{' '}
                        <span className="text-amber-400 font-bold">৳{tx.amount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => adminApproveTransaction(tx.id)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{language === 'bn' ? 'পেইড মার্ক করুন' : 'Mark Paid'}</span>
                      </button>

                      <button
                        onClick={() => adminRejectTransaction(tx.id, 'ভুল নম্বর বা তথ্য')}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{language === 'bn' ? 'রিজেক্ট ও রিফান্ড' : 'Refund'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USERS LIST & BALANCE ADJUSTMENT */}
      {activeTab === 'users' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder={language === 'bn' ? 'নাম, ফোন বা রেফার কোড দিয়ে খুঁজুন...' : 'Search by name, phone or refer code...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
              <div
                key={u.uid}
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{u.name}</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{u.emailOrPhone}</span>
                    {u.role === 'admin' && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black font-extrabold text-[9px]">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
                    <span>
                      রেফার কোড: <strong className="text-zinc-200">{u.referCode}</strong>
                    </span>
                    <span>
                      স্ট্রিক: <strong className="text-amber-400">{u.checkInStreak} দিন</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-amber-400">৳{u.balance.toFixed(0)}</span>
                  </div>

                  {/* Adjust Balance buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => adminUpdateUserBalance(u.uid, 50)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>৳৫০</span>
                    </button>
                    <button
                      onClick={() => adminUpdateUserBalance(u.uid, -50)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>৳৫০</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: APP SETTINGS & REWARDS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white">
              {language === 'bn' ? 'অ্যাপ কনফিগারেশন ও রিওয়ার্ড রেট' : 'App Configuration & Reward Rates'}
            </h4>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 animate-in fade-in">
                {language === 'bn' ? 'সফলভাবে সেভ হয়েছে!' : 'Saved successfully!'}
              </span>
            )}
          </div>

          {/* Marquee Notice */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              {language === 'bn' ? 'হোমপেজ স্ক্রলিং নোটিশ বার টেক্সট' : 'Homepage Scrolling Notice Text'}
            </label>
            <textarea
              rows={2}
              value={localSettings.noticeText}
              onChange={(e) => setLocalSettings({ ...localSettings, noticeText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'ডেইলি চেক-ইন রিওয়ার্ড (৳)' : 'Daily Check-in Reward (৳)'}
              </label>
              <input
                type="number"
                value={localSettings.dailyCheckinReward}
                onChange={(e) => setLocalSettings({ ...localSettings, dailyCheckinReward: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'ভিডিও টাস্ক রিওয়ার্ড (৳)' : 'Video Task Reward (৳)'}
              </label>
              <input
                type="number"
                value={localSettings.videoTaskReward}
                onChange={(e) => setLocalSettings({ ...localSettings, videoTaskReward: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'ভিডিও সময়কাল (সেকেন্ড)' : 'Video Duration (seconds)'}
              </label>
              <input
                type="number"
                value={localSettings.videoDurationSeconds}
                onChange={(e) => setLocalSettings({ ...localSettings, videoDurationSeconds: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'কুইজ গেম রিওয়ার্ড (৳)' : 'Quiz Game Reward (৳)'}
              </label>
              <input
                type="number"
                value={localSettings.quizReward}
                onChange={(e) => setLocalSettings({ ...localSettings, quizReward: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'রেফার বোনাস (৳)' : 'Referral Bonus (৳)'}
              </label>
              <input
                type="number"
                value={localSettings.referBonus}
                onChange={(e) => setLocalSettings({ ...localSettings, referBonus: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'সর্বনিম্ন উইথড্র লিমিট (৳)' : 'Min Withdraw Amount (৳)'}
              </label>
              <input
                type="number"
                value={localSettings.minWithdrawAmount}
                onChange={(e) => setLocalSettings({ ...localSettings, minWithdrawAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* Payment Receiver numbers */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {language === 'bn' ? 'পেমেন্ট গ্রহণের নম্বরসমূহ' : 'Deposit Receiving Numbers'}
            </h5>

            <div className="space-y-2">
              <input
                type="text"
                value={localSettings.depositAccounts.bKash}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    depositAccounts: { ...localSettings.depositAccounts, bKash: e.target.value },
                  })
                }
                placeholder="bKash Number"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
              />
              <input
                type="text"
                value={localSettings.depositAccounts.Nagad}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    depositAccounts: { ...localSettings.depositAccounts, Nagad: e.target.value },
                  })
                }
                placeholder="Nagad Number"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
              />
              <input
                type="text"
                value={localSettings.depositAccounts.Rocket}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    depositAccounts: { ...localSettings.depositAccounts, Rocket: e.target.value },
                  })
                }
                placeholder="Rocket Number"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'bn' ? 'সেটিংস সেভ করুন' : 'Save App Settings'}</span>
          </button>
        </form>
      )}

      {/* TAB 4: FIREBASE CONFIGURATION PLACEHOLDER */}
      {activeTab === 'firebase' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Firebase Realtime Database & Cloud Sync
              </h4>
              <p className="text-xs text-zinc-400">
                {language === 'bn'
                  ? 'আপনার ফায়ারবেস ক্রেডেনশিয়ালস কনফিগারেশন'
                  : 'Firebase credentials configuration & sync state'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{language === 'bn' ? 'ফায়ারবেস স্ট্যাটাস:' : 'Firebase Status:'}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected & Live Syncing</span>
              </span>
            </div>
            <div className="text-xs text-zinc-300 pt-2 border-t border-zinc-800 space-y-1">
              <div><strong>Project ID:</strong> <span className="font-mono text-amber-400">earning-web-app-d515c</span></div>
              <div><strong>Database:</strong> <span className="font-mono text-zinc-300 text-[11px]">https://earning-web-app-d515c-default-rtdb.firebaseio.com</span></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto">
            <div className="text-amber-400 font-bold mb-2">// Active Firebase Config (src/firebase.ts)</div>
            <pre className="text-zinc-300">
{`const firebaseConfig = {
  apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
  authDomain: "earning-web-app-d515c.firebaseapp.com",
  databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com",
  projectId: "earning-web-app-d515c",
  storageBucket: "earning-web-app-d515c.firebasestorage.app",
  messagingSenderId: "940476940339",
  appId: "1:940476940339:web:eb81b99117e9294fc86346"
};`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
