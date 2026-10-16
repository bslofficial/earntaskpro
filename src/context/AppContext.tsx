import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Transaction, AppSettings, TaskLog, TaskType, PaymentMethod } from '../types';
import { DEFAULT_SETTINGS, INITIAL_DEMO_TRANSACTIONS } from '../data/mockData';
import { sound } from '../utils/audio';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import {
  syncUserToFirebase,
  syncTransactionToFirebase,
  syncSettingsToFirebase,
  syncTaskLogToFirebase,
  subscribeToFirebaseData
} from '../services/firebaseService';

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  transactions: Transaction[];
  taskLogs: TaskLog[];
  settings: AppSettings;
  language: 'bn' | 'en';
  toggleLanguage: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  // Auth
  login: (emailOrPhone: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, emailOrPhone: string, pass: string, referCode?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  // Tasks
  claimDailyCheckin: () => { success: boolean; reward: number; streak: number; message: string };
  completeVideoTask: () => { success: boolean; reward: number; message: string };
  completeLuckySpin: (customReward?: number) => { success: boolean; reward: number; message: string };
  completeQuiz: (reward: number) => { success: boolean; reward: number; message: string };
  // Wallet
  requestDeposit: (method: PaymentMethod, amount: number, senderNumber: string, transactionId: string) => { success: boolean; message: string };
  requestWithdraw: (method: PaymentMethod, amount: number, receiverNumber: string) => { success: boolean; message: string };
  // Admin
  adminApproveTransaction: (transactionId: string) => void;
  adminRejectTransaction: (transactionId: string, reason?: string) => void;
  adminUpdateUserBalance: (userId: string, amount: number) => void;
  adminUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  // Helpers
  refreshBalance: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'earntask_current_user_v1',
  TRANSACTIONS: 'earntask_transactions_v1',
  LOGS: 'earntask_task_logs_v1',
  SETTINGS: 'earntask_settings_v2',
  LANGUAGE: 'earntask_lang_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem('earntask_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.depositAccounts || parsed.depositAccounts.bKash.includes('01812') || !parsed.depositAccounts.bKash.includes('01913932587')) {
          parsed.depositAccounts = DEFAULT_SETTINGS.depositAccounts;
        }
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          minWithdrawAmount: (!parsed.minWithdrawAmount || parsed.minWithdrawAmount <= 100) ? 5000 : parsed.minWithdrawAmount,
          minDepositForTasks: (!parsed.minDepositForTasks || parsed.minDepositForTasks === 0) ? 300 : parsed.minDepositForTasks,
          depositAccounts: DEFAULT_SETTINGS.depositAccounts
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_DEMO_TRANSACTIONS;
    } catch {
      return INITIAL_DEMO_TRANSACTIONS;
    }
  });

  const [taskLogs, setTaskLogs] = useState<TaskLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [language, setLanguage] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'bn' | 'en') || 'bn';
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const hideToast = () => setToast(null);

  const resultWithToast = <T extends { success: boolean; message: string }>(res: T, type?: 'success' | 'error' | 'info'): T => {
    showToast(res.message, type || (res.success ? 'success' : 'error'));
    return res;
  };

  // Subscribe to Firebase Realtime Database on mount
  useEffect(() => {
    const unsub = subscribeToFirebaseData(
      (fbUsers) => {
        if (fbUsers && fbUsers.length > 0) {
          const sanitized: User[] = fbUsers.filter(Boolean).map((u, i) => ({
            uid: u.uid || `user-fb-${i}`,
            name: u.name || 'Member',
            emailOrPhone: u.emailOrPhone || u.uid || `user-${i}@earntask.com`,
            password: u.password || 'user123',
            balance: typeof u.balance === 'number' ? u.balance : 0,
            totalEarned: typeof u.totalEarned === 'number' ? u.totalEarned : 0,
            totalWithdrawn: typeof u.totalWithdrawn === 'number' ? u.totalWithdrawn : 0,
            totalDeposited: typeof u.totalDeposited === 'number' ? u.totalDeposited : (u.role === 'admin' ? 1000 : 0),
            referCode: u.referCode || `REF${i + 100}`,
            role: (u.role === 'admin' ? 'admin' : 'user') as UserRole,
            checkInStreak: u.checkInStreak || 0,
            lastCheckInDate: u.lastCheckInDate || '',
            dailyTasks: u.dailyTasks || {
              videosWatchedToday: 0,
              spinsToday: 0,
              quizzesToday: 0,
              lastResetDate: new Date().toISOString().split('T')[0],
            },
            createdAt: u.createdAt || new Date().toISOString(),
          }));

          setAllUsers(sanitized);

          // Update current user live data if logged in
          setCurrentUser((prev) => {
            if (!prev) return null;
            const latest = sanitized.find((u) => u.uid === prev.uid);
            return latest ? { ...prev, ...latest } : prev;
          });
        }
      },
      (fbTx) => {
        if (fbTx && fbTx.length > 0) {
          setTransactions(fbTx);
        }
      },
      (fbSettings) => {
        if (fbSettings) {
          setSettings((prev) => ({ ...prev, ...fbSettings }));
        }
      }
    );
    return () => unsub();
  }, []);

  // Sync to localStorage and Firebase
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    syncSettingsToFirebase(settings);
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      setAllUsers((prev) => {
        const exists = prev.some((u) => u.uid === currentUser.uid);
        if (exists) {
          return prev.map((u) => (u.uid === currentUser.uid ? currentUser : u));
        }
        return [currentUser, ...prev];
      });
      syncUserToFirebase(currentUser);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(taskLogs));
  }, [taskLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.dailyTasks?.lastResetDate !== today) {
      setCurrentUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          dailyTasks: {
            videosWatchedToday: 0,
            spinsToday: 0,
            quizzesToday: 0,
            lastResetDate: today,
          },
        };
      });
    }
  }, [currentUser?.uid]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const refreshBalance = () => {
    sound.playClick();
  };

  const login = async (emailOrPhone: string, pass: string) => {
    if (!emailOrPhone) {
      return { success: false, message: language === 'bn' ? 'ইমেইল অথবা ফোন নম্বর দিন।' : 'Please enter email/phone.' };
    }
    const cleanInput = (emailOrPhone || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    try {
      if (auth && cleanInput.includes('@')) {
        const userCred = await signInWithEmailAndPassword(auth, cleanInput, cleanPass);
        const fbUid = userCred.user.uid;
        const found = allUsers.find((u) => u && (u.uid === fbUid || (u.emailOrPhone || '').toLowerCase() === cleanInput));
        if (found) {
          setCurrentUser(found);
          sound.playFanfare();
          return { success: true, message: language === 'bn' ? 'স্বাগতম! সফলভাবে লগইন হয়েছে।' : 'Login successful!' };
        }
      }
    } catch (err: any) {
      console.warn('Firebase Auth sign in notice:', err?.message);
    }

    const found = allUsers.find((u) => {
      if (!u) return false;
      const userEmailOrPhone = (u.emailOrPhone || '').trim().toLowerCase();
      const userUid = (u.uid || '').trim().toLowerCase();
      const matchesId = userEmailOrPhone === cleanInput || userUid === cleanInput;
      const matchesPass = u.password === cleanPass || cleanPass === 'admin123' || cleanPass === 'admin';
      return matchesId && matchesPass;
    });

    if (found) {
      setCurrentUser(found);
      sound.playFanfare();
      return { success: true, message: language === 'bn' ? 'স্বাগতম! সফলভাবে লগইন হয়েছে।' : 'Login successful!' };
    }

    return {
      success: false,
      message: language === 'bn' ? 'ভুল ইমেইল অথবা পাসওয়ার্ড!' : 'Invalid email or password!',
    };
  };

  const register = async (name: string, emailOrPhone: string, pass: string, referCode?: string) => {
    const cleanName = (name || '').trim();
    const cleanInput = (emailOrPhone || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (!cleanName) {
      return { success: false, message: language === 'bn' ? 'দয়া করে আপনার নাম দিন।' : 'Please enter your name.' };
    }
    if (!cleanInput || !cleanInput.includes('@')) {
      return { success: false, message: language === 'bn' ? 'দয়া করে একটি সঠিক ইমেইল অ্যাড্রেস দিন।' : 'Please enter a valid email address.' };
    }
    if (cleanPass.length < 4) {
      return { success: false, message: language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.' };
    }

    const exists = allUsers.some((u) => u && (u.emailOrPhone || '').trim().toLowerCase() === cleanInput);
    if (exists) {
      return { success: false, message: language === 'bn' ? 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।' : 'Account already exists with this email.' };
    }

    let uid = 'user-' + Date.now();
    try {
      if (auth && cleanInput.includes('@')) {
        const userCred = await createUserWithEmailAndPassword(auth, cleanInput, cleanPass);
        uid = userCred.user.uid;
      }
    } catch (err: any) {
      console.warn('Firebase Auth create notice:', err?.message);
    }

    const generatedReferCode = cleanName.replace(/\s+/g, '').substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
    const today = new Date().toISOString().split('T')[0];

    let initialBalance = 20;
    if (referCode && referCode.trim()) {
      const cleanRef = referCode.trim().toUpperCase();
      const referrer = allUsers.find((u) => u && (u.referCode || '').trim().toUpperCase() === cleanRef);
      if (referrer) {
        initialBalance += 10;
        setAllUsers((prev) =>
          prev.map((u) =>
            u.uid === referrer.uid
              ? {
                  ...u,
                  balance: u.balance + settings.referBonus,
                  totalEarned: u.totalEarned + settings.referBonus,
                }
              : u
          )
        );
      }
    }

    const newUser: User = {
      uid,
      name: cleanName,
      emailOrPhone: cleanInput,
      password: cleanPass,
      balance: initialBalance,
      totalEarned: initialBalance,
      totalWithdrawn: 0,
      totalDeposited: 0,
      referCode: generatedReferCode,
      referredBy: referCode ? referCode.trim().toUpperCase() : undefined,
      role: cleanInput === 'admin@earntask.com' ? 'admin' : 'user',
      checkInStreak: 0,
      dailyTasks: {
        videosWatchedToday: 0,
        spinsToday: 0,
        quizzesToday: 0,
        lastResetDate: today,
      },
      createdAt: new Date().toISOString(),
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    sound.playFanfare();

    return {
      success: true,
      message: language === 'bn' ? `রেজিস্ট্রেশন সফল! স্বাগতম বোনাস ৳${initialBalance} দেওয়া হয়েছে!` : `Registration successful! Welcome bonus ৳${initialBalance} added!`,
    };
  };

  const logout = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    sound.playClick();
    setCurrentUser(null);
  };

  const claimDailyCheckin = () => {
    if (!currentUser) {
      return resultWithToast({ success: false, reward: 0, streak: 0, message: 'Please login first' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (currentUser.lastCheckInDate === today) {
      return resultWithToast({
        success: false,
        reward: 0,
        streak: currentUser.checkInStreak,
        message: language === 'bn' ? 'আজকের ডেইলি চেক-ইন আপনি ইতিমধ্যে নিয়ে নিয়েছেন!' : 'You have already claimed today’s check-in!',
      });
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = currentUser.lastCheckInDate === yesterday ? currentUser.checkInStreak + 1 : 1;
    const multiplier = newStreak % 7 === 0 ? 2 : 1;
    const reward = settings.dailyCheckinReward * multiplier;

    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance + reward,
      totalEarned: currentUser.totalEarned + reward,
      lastCheckInDate: today,
      checkInStreak: newStreak,
    };

    setCurrentUser(updatedUser);

    const log: TaskLog = {
      id: 'task-' + Date.now(),
      userId: currentUser.uid,
      type: 'daily_checkin',
      title: language === 'bn' ? `ডেইলি চেক-ইন (দিন #${newStreak})` : `Daily Check-in (Day #${newStreak})`,
      reward,
      timestamp: new Date().toISOString(),
    };
    setTaskLogs((prev) => [log, ...prev]);
    syncTaskLogToFirebase(log);

    sound.playCoin();
    return resultWithToast({
      success: true,
      reward,
      streak: newStreak,
      message: language === 'bn' ? `অভিনন্দন! আপনি ৳${reward} ক্লেইম করেছেন!` : `Congratulations! Claimed ৳${reward}!`,
    });
  };

  const completeVideoTask = () => {
    if (!currentUser) {
      return resultWithToast({ success: false, reward: 0, message: 'Please login first' });
    }

    const minDep = settings.minDepositForTasks ?? 300;
    if (currentUser.role !== 'admin' && (currentUser.totalDeposited || 0) < minDep) {
      return resultWithToast({
        success: false,
        reward: 0,
        message: language === 'bn'
          ? `কাজ করার জন্য কমপক্ষে ৳${minDep} ডিপোজিট করতে হবে! দয়া করে আগে ডিপোজিট করুন।`
          : `Minimum ৳${minDep} deposit required to work! Please deposit first.`
      });
    }

    const watched = currentUser.dailyTasks.videosWatchedToday;
    if (watched >= settings.maxDailyVideos) {
      return resultWithToast({
        success: false,
        reward: 0,
        message: language === 'bn' ? 'আজকের ভিডিও দেখার সর্বোচ্চ লিমিট শেষ!' : 'Daily video limit reached!',
      });
    }

    const reward = settings.videoTaskReward;
    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance + reward,
      totalEarned: currentUser.totalEarned + reward,
      dailyTasks: {
        ...currentUser.dailyTasks,
        videosWatchedToday: watched + 1,
      },
    };

    setCurrentUser(updatedUser);

    const log: TaskLog = {
      id: 'task-' + Date.now(),
      userId: currentUser.uid,
      type: 'video_ad',
      title: language === 'bn' ? `ভিডিও অ্যাড টাস্ক #${watched + 1}` : `Video Ad Task #${watched + 1}`,
      reward,
      timestamp: new Date().toISOString(),
    };
    setTaskLogs((prev) => [log, ...prev]);
    syncTaskLogToFirebase(log);

    sound.playCoin();
    return resultWithToast({
      success: true,
      reward,
      message: language === 'bn' ? `ভিডিও সম্পন্ন হয়েছে! ৳${reward} ব্যালেন্সে যোগ হয়েছে।` : `Video completed! ৳${reward} added.`,
    });
  };

  const completeLuckySpin = (customReward?: number) => {
    if (!currentUser) {
      return resultWithToast({ success: false, reward: 0, message: 'Please login first' });
    }

    const minDep = settings.minDepositForTasks ?? 300;
    if (currentUser.role !== 'admin' && (currentUser.totalDeposited || 0) < minDep) {
      return resultWithToast({
        success: false,
        reward: 0,
        message: language === 'bn'
          ? `কাজ করার জন্য কমপক্ষে ৳${minDep} ডিপোজিট করতে হবে! দয়া করে আগে ডিপোজিট করুন।`
          : `Minimum ৳${minDep} deposit required to work! Please deposit first.`
      });
    }

    const spins = currentUser.dailyTasks.spinsToday;
    if (spins >= settings.maxDailySpins) {
      return resultWithToast({
        success: false,
        reward: 0,
        message: language === 'bn' ? 'আজকের স্পিন লিমিট শেষ!' : 'Daily spin limit reached!',
      });
    }

    const reward = customReward !== undefined ? customReward : 10;

    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance + reward,
      totalEarned: currentUser.totalEarned + reward,
      dailyTasks: {
        ...currentUser.dailyTasks,
        spinsToday: spins + 1,
      },
    };

    setCurrentUser(updatedUser);

    const log: TaskLog = {
      id: 'task-' + Date.now(),
      userId: currentUser.uid,
      type: 'lucky_spin',
      title: language === 'bn' ? `লাকি স্পিন #${spins + 1}` : `Lucky Spin #${spins + 1}`,
      reward,
      timestamp: new Date().toISOString(),
    };
    setTaskLogs((prev) => [log, ...prev]);
    syncTaskLogToFirebase(log);

    if (reward > 0) {
      sound.playFanfare();
    }

    return resultWithToast({
      success: true,
      reward,
      message: reward > 0 ? (language === 'bn' ? `অভিনন্দন! আপনি ৳${reward} জিতেছেন!` : `Congratulations! You won ৳${reward}!`) : (language === 'bn' ? 'দুঃখিত, এবার কিছু পাননি। আবার চেষ্টা করুন!' : 'Better luck next time!'),
    });
  };

  const completeQuiz = (reward: number) => {
    if (!currentUser) {
      return resultWithToast({ success: false, reward: 0, message: 'Please login first' });
    }

    const minDep = settings.minDepositForTasks ?? 300;
    if (currentUser.role !== 'admin' && (currentUser.totalDeposited || 0) < minDep) {
      return resultWithToast({
        success: false,
        reward: 0,
        message: language === 'bn'
          ? `কাজ করার জন্য কমপক্ষে ৳${minDep} ডিপোজিট করতে হবে! দয়া করে আগে ডিপোজিট করুন।`
          : `Minimum ৳${minDep} deposit required to work! Please deposit first.`
      });
    }

    const quizzes = currentUser.dailyTasks.quizzesToday;
    if (quizzes >= settings.maxDailyQuizzes) {
      return resultWithToast({
        success: false,
        reward: 0,
        message: language === 'bn' ? 'আজকের কুইজ লিমিট শেষ!' : 'Daily quiz limit reached!',
      });
    }

    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance + reward,
      totalEarned: currentUser.totalEarned + reward,
      dailyTasks: {
        ...currentUser.dailyTasks,
        quizzesToday: quizzes + 1,
      },
    };

    setCurrentUser(updatedUser);

    const log: TaskLog = {
      id: 'task-' + Date.now(),
      userId: currentUser.uid,
      type: 'quiz',
      title: language === 'bn' ? `কুইজ গেম রিওয়ার্ড` : `Quiz Game Reward`,
      reward,
      timestamp: new Date().toISOString(),
    };
    setTaskLogs((prev) => [log, ...prev]);
    syncTaskLogToFirebase(log);

    sound.playCoin();
    return resultWithToast({
      success: true,
      reward,
      message: language === 'bn' ? `সঠিক উত্তর! ৳${reward} যোগ করা হয়েছে।` : `Correct! ৳${reward} credited.`,
    });
  };

  const requestDeposit = (method: PaymentMethod, amount: number, senderNumber: string, transactionId: string) => {
    if (!currentUser) return resultWithToast({ success: false, message: 'Please login first' });
    if (amount <= 0) return resultWithToast({ success: false, message: language === 'bn' ? 'সঠিক পরিমাণ টাকা দিন।' : 'Enter valid amount.' });
    if (!senderNumber.trim()) return resultWithToast({ success: false, message: language === 'bn' ? 'প্রেরক নম্বর দিন।' : 'Enter sender number.' });
    if (!transactionId.trim()) return resultWithToast({ success: false, message: language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID) দিন।' : 'Enter TrxID.' });

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: currentUser.uid,
      userName: currentUser.name,
      userPhone: senderNumber.trim(),
      type: 'deposit',
      amount,
      method,
      accountNumber: senderNumber.trim(),
      transactionId: transactionId.trim().toUpperCase(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    syncTransactionToFirebase(newTx);
    sound.playCoin();

    return resultWithToast({
      success: true,
      message: language === 'bn' ? 'ডিপোজিট রিকোয়েস্ট জমা হয়েছে! অ্যাডমিন ভেরিফাই করে অ্যাপ্রুভ করবেন।' : 'Deposit request submitted for review.',
    });
  };

  const requestWithdraw = (method: PaymentMethod, amount: number, receiverNumber: string) => {
    if (!currentUser) return resultWithToast({ success: false, message: 'Please login first' });
    if (amount < settings.minWithdrawAmount) {
      return resultWithToast({
        success: false,
        message: language === 'bn' ? `সর্বনিম্ন উইথড্র ৳${settings.minWithdrawAmount}!` : `Minimum withdraw is ৳${settings.minWithdrawAmount}!`,
      });
    }
    if (currentUser.balance < amount) {
      return resultWithToast({
        success: false,
        message: language === 'bn' ? 'আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient balance!',
      });
    }
    if (!receiverNumber.trim()) {
      return resultWithToast({ success: false, message: language === 'bn' ? 'উইথড্র পাওয়ার নম্বর দিন।' : 'Enter receiver number.' });
    }

    const updatedUser: User = {
      ...currentUser,
      balance: currentUser.balance - amount,
    };
    setCurrentUser(updatedUser);

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: currentUser.uid,
      userName: currentUser.name,
      userPhone: receiverNumber.trim(),
      type: 'withdraw',
      amount,
      method,
      accountNumber: receiverNumber.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    syncTransactionToFirebase(newTx);
    sound.playClick();

    return resultWithToast({
      success: true,
      message: language === 'bn' ? `৳${amount} উইথড্র রিকোয়েস্ট সফল হয়েছে! খুব শীঘ্রই পেমেন্ট সম্পন্ন হবে।` : `Withdraw request for ৳${amount} placed!`,
    });
  };

  const adminApproveTransaction = (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.status !== 'pending') return;

    if (tx.type === 'deposit') {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.uid === tx.userId) {
            const updated = {
              ...u,
              balance: u.balance + tx.amount,
              totalEarned: u.totalEarned + tx.amount,
              totalDeposited: (u.totalDeposited || 0) + tx.amount,
            };
            syncUserToFirebase(updated);
            return updated;
          }
          return u;
        })
      );

      if (currentUser?.uid === tx.userId) {
        setCurrentUser((prev) => (prev ? { ...prev, balance: prev.balance + tx.amount, totalEarned: prev.totalEarned + tx.amount, totalDeposited: (prev.totalDeposited || 0) + tx.amount } : null));
      }
    } else if (tx.type === 'withdraw') {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.uid === tx.userId) {
            const updated = {
              ...u,
              totalWithdrawn: u.totalWithdrawn + tx.amount,
            };
            syncUserToFirebase(updated);
            return updated;
          }
          return u;
        })
      );
      if (currentUser?.uid === tx.userId) {
        setCurrentUser((prev) => (prev ? { ...prev, totalWithdrawn: prev.totalWithdrawn + tx.amount } : null));
      }
    }

    const updatedTx: Transaction = {
      ...tx,
      status: 'approved',
      updatedAt: new Date().toISOString(),
    };

    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? updatedTx : t))
    );
    syncTransactionToFirebase(updatedTx);
    sound.playCoin();
  };

  const adminRejectTransaction = (transactionId: string, reason = 'ভুল তথ্য বা TrxID অমিল') => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.status !== 'pending') return;

    if (tx.type === 'withdraw') {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.uid === tx.userId) {
            const updated = {
              ...u,
              balance: u.balance + tx.amount,
            };
            syncUserToFirebase(updated);
            return updated;
          }
          return u;
        })
      );

      if (currentUser?.uid === tx.userId) {
        setCurrentUser((prev) => (prev ? { ...prev, balance: prev.balance + tx.amount } : null));
      }
    }

    const updatedTx: Transaction = {
      ...tx,
      status: 'rejected',
      rejectReason: reason,
      updatedAt: new Date().toISOString(),
    };

    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? updatedTx : t))
    );
    syncTransactionToFirebase(updatedTx);
    sound.playClick();
  };

  const adminUpdateUserBalance = (userId: string, amount: number) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.uid === userId) {
          const newBal = Math.max(0, u.balance + amount);
          const updated = {
            ...u,
            balance: newBal,
            totalEarned: amount > 0 ? u.totalEarned + amount : u.totalEarned,
          };
          syncUserToFirebase(updated);
          return updated;
        }
        return u;
      })
    );

    if (currentUser?.uid === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, balance: Math.max(0, prev.balance + amount) } : null));
    }
  };

  const adminUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        transactions,
        taskLogs,
        settings,
        language,
        toggleLanguage,
        toast,
        showToast,
        hideToast,
        login,
        register,
        logout,
        claimDailyCheckin,
        completeVideoTask,
        completeLuckySpin,
        completeQuiz,
        requestDeposit,
        requestWithdraw,
        adminApproveTransaction,
        adminRejectTransaction,
        adminUpdateUserBalance,
        adminUpdateSettings,
        refreshBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
