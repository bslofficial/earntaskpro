import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { sound } from '../../utils/audio';

export const WalletView: React.FC = () => {
  const {
    currentUser,
    settings,
    transactions,
    requestDeposit,
    requestWithdraw,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [method, setMethod] = useState<PaymentMethod>('bKash');

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('200');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState('150');
  const [receiverNumber, setReceiverNumber] = useState('');

  // Status message
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const adminNumber = settings.depositAccounts[method];

  const handleCopyNumber = () => {
    // Extract just the phone digits
    const cleaned = adminNumber.split(' ')[0];
    navigator.clipboard.writeText(cleaned);
    setCopiedNumber(true);
    sound.playClick();
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    const amt = parseFloat(depositAmount);
    const res = requestDeposit(method, amt, senderNumber, transactionId);

    if (res.success) {
      setAlert({ type: 'success', msg: res.message });
      setTransactionId('');
      setSenderNumber('');
    } else {
      setAlert({ type: 'error', msg: res.message });
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    const amt = parseFloat(withdrawAmount);
    const res = requestWithdraw(method, amt, receiverNumber);

    if (res.success) {
      setAlert({ type: 'success', msg: res.message });
      setReceiverNumber('');
    } else {
      setAlert({ type: 'error', msg: res.message });
    }
  };

  // Filter user transactions
  const userTransactions = transactions.filter(
    (tx) => tx.userId === currentUser?.uid
  );

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-6 shadow-2xl shadow-amber-500/10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'বর্তমান ওয়ালেট ব্যালেন্স' : 'Current Wallet Balance'}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                ৳{(currentUser?.balance ?? 0).toFixed(0)}
              </span>
              <span className="text-amber-400 font-bold text-sm">BDT</span>
            </div>
          </div>

          {/* Quick summary tags */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 text-right">
              <span className="text-[10px] text-zinc-400 block">{language === 'bn' ? 'মোট আয়' : 'Earned'}</span>
              <span className="font-mono text-xs font-bold text-emerald-400">+৳{(currentUser?.totalEarned ?? 0).toFixed(0)}</span>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 text-right">
              <span className="text-[10px] text-zinc-400 block">{language === 'bn' ? 'উইথড্রকৃত' : 'Withdrawn'}</span>
              <span className="font-mono text-xs font-bold text-amber-400">৳{(currentUser?.totalWithdrawn ?? 0).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
        <button
          onClick={() => { setActiveTab('deposit'); setAlert(null); sound.playClick(); }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'deposit'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'ডিপোজিট (Deposit)' : 'Deposit'}</span>
        </button>

        <button
          onClick={() => { setActiveTab('withdraw'); setAlert(null); sound.playClick(); }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'withdraw'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>{language === 'bn' ? 'উইথড্র (Withdraw)' : 'Withdraw'}</span>
        </button>

        <button
          onClick={() => { setActiveTab('history'); setAlert(null); sound.playClick(); }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-zinc-800 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'bn' ? 'হিস্ট্রি' : 'History'}</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {alert && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-semibold border flex items-center gap-2 ${
            alert.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}
        >
          {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{alert.msg}</span>
        </div>
      )}

      {/* TAB 1: DEPOSIT */}
      {activeTab === 'deposit' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div>
            <h4 className="text-base font-bold text-white mb-1">
              {language === 'bn' ? 'টাকা ডিপোজিট করার নিয়ম' : 'How to Deposit'}
            </h4>
            <p className="text-xs text-zinc-400">
              {language === 'bn'
                ? 'পছন্দের পেমেন্ট মাধ্যম সিলেক্ট করে নিচে দেওয়া নম্বরে টাকা পাঠান এবং TrxID দিন।'
                : 'Select payment method, send money to the number below, and enter TrxID.'}
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['bKash', 'Nagad', 'Rocket'] as PaymentMethod[]).map((m) => {
              const isSelected = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMethod(m); sound.playClick(); }}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm flex flex-col items-center gap-1 transition cursor-pointer ${
                    isSelected
                      ? m === 'bKash'
                        ? 'border-pink-500 bg-pink-950/40 text-pink-300 ring-2 ring-pink-500/40'
                        : m === 'Nagad'
                        ? 'border-orange-500 bg-orange-950/40 text-orange-300 ring-2 ring-orange-500/40'
                        : 'border-purple-500 bg-purple-950/40 text-purple-300 ring-2 ring-purple-500/40'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm sm:text-base">
                    {m === 'bKash' ? 'বিকাশ' : m === 'Nagad' ? 'নগদ' : 'রকেট'}
                  </span>
                  <span className="text-[10px] opacity-80">{m}</span>
                </button>
              );
            })}
          </div>

          {/* Admin receiver number box */}
          <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">
                {method} {language === 'bn' ? 'নম্বর (Send Money)' : 'Account Number'}
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-amber-300">
                {adminNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNumber ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>
          </div>

          {/* Deposit Form */}
          <form onSubmit={handleDepositSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'ডিপোজিট পরিমাণ (টাকা)' : 'Deposit Amount (৳)'}
              </label>
              <input
                type="number"
                min="100"
                step="10"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono focus:border-amber-500 focus:outline-none text-sm"
                placeholder="200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'আপনার প্রেরক নম্বর' : 'Your Sender Phone Number'}
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono focus:border-amber-500 focus:outline-none text-sm"
                placeholder="017XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'}
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono uppercase focus:border-amber-500 focus:outline-none text-sm"
                placeholder="Ex: 9KD4J2LA01"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 hover:opacity-95 active:scale-98 transition cursor-pointer"
            >
              {language === 'bn' ? 'ডিপোজিট রিকোয়েস্ট পাঠান' : 'Submit Deposit Request'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: WITHDRAW */}
      {activeTab === 'withdraw' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div>
            <h4 className="text-base font-bold text-white mb-1">
              {language === 'bn' ? 'টাকা উইথড্র করার নিয়ম' : 'Withdraw Earnings'}
            </h4>
            <p className="text-xs text-zinc-400">
              {language === 'bn'
                ? `সর্বনিম্ন উইথড্র ৳${settings.minWithdrawAmount}। পেমেন্ট রিকোয়েস্টের ৩০ মিনিটের মধ্যে টাকা পাঠানো হয়।`
                : `Minimum withdraw is ৳${settings.minWithdrawAmount}. Requests processed within 30 minutes.`}
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['bKash', 'Nagad', 'Rocket'] as PaymentMethod[]).map((m) => {
              const isSelected = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMethod(m); sound.playClick(); }}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm flex flex-col items-center gap-1 transition cursor-pointer ${
                    isSelected
                      ? 'border-violet-500 bg-violet-950/40 text-violet-300 ring-2 ring-violet-500/40'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm sm:text-base">
                    {m === 'bKash' ? 'বিকাশ' : m === 'Nagad' ? 'নগদ' : 'রকেট'}
                  </span>
                  <span className="text-[10px] opacity-80">{m}</span>
                </button>
              );
            })}
          </div>

          {/* Withdraw Form */}
          <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? 'উইথড্র পরিমাণ (টাকা)' : 'Withdraw Amount (৳)'}
              </label>
              <input
                type="number"
                min={settings.minWithdrawAmount}
                max={currentUser?.balance || 0}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono focus:border-violet-500 focus:outline-none text-sm"
                placeholder={settings.minWithdrawAmount.toString()}
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                {language === 'bn'
                  ? `সর্বোচ্চ উইথড্রযোগ্য: ৳${(currentUser?.balance || 0).toFixed(0)}`
                  : `Available balance: ৳${(currentUser?.balance || 0).toFixed(0)}`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {language === 'bn' ? `${method} নম্বর (যাতে টাকা নিবেন)` : `Your ${method} Account Number`}
              </label>
              <input
                type="text"
                value={receiverNumber}
                onChange={(e) => setReceiverNumber(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono focus:border-violet-500 focus:outline-none text-sm"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <button
              type="submit"
              disabled={(currentUser?.balance || 0) < settings.minWithdrawAmount}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                (currentUser?.balance || 0) < settings.minWithdrawAmount
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white shadow-lg shadow-violet-600/30 hover:opacity-95 active:scale-98'
              }`}
            >
              <ArrowUpRight className="w-5 h-5" />
              <span>
                {(currentUser?.balance || 0) < settings.minWithdrawAmount
                  ? language === 'bn'
                    ? `পর্যাপ্ত ব্যালেন্স নেই (মিনিমাম ৳${settings.minWithdrawAmount})`
                    : `Insufficient balance (Min ৳${settings.minWithdrawAmount})`
                  : language === 'bn'
                  ? 'উইথড্র রিকোয়েস্ট নিশ্চিত করুন'
                  : 'Confirm Withdraw Request'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
          <h4 className="text-base font-bold text-white mb-2">
            {language === 'bn' ? 'আপনার লেনদেনের বিবরণ' : 'Transaction History'}
          </h4>

          {userTransactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              {language === 'bn' ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি' : 'No transactions found'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {userTransactions.map((tx) => {
                const isDeposit = tx.type === 'deposit';

                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          isDeposit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'
                        }`}
                      >
                        {isDeposit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {isDeposit
                            ? language === 'bn'
                              ? 'ডিপোজিট'
                              : 'Deposit'
                            : language === 'bn'
                            ? 'উইথড্র'
                            : 'Withdraw'}
                          <span className="text-zinc-400 font-normal ml-1">({tx.method})</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {tx.accountNumber} {tx.transactionId ? `• Trx: ${tx.transactionId}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-sm ${
                          isDeposit ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {isDeposit ? '+' : '-'}৳{tx.amount}
                      </div>

                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                          tx.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {tx.status === 'approved'
                          ? language === 'bn'
                            ? 'অনুমোদিত'
                            : 'Approved'
                          : tx.status === 'pending'
                          ? language === 'bn'
                            ? 'পেন্ডিং'
                            : 'Pending'
                          : language === 'bn'
                          ? 'বাতিল'
                          : 'Rejected'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
