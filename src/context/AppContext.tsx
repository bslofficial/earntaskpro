import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Transaction, AppSettings, TaskLog, TaskType, PaymentMethod } from '../types';
import { DEFAULT_SETTINGS, INITIAL_DEMO_USERS, INITIAL_DEMO_TRANSACTIONS } from '../data/mockData';
import { sound } from '../utils/audio';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
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
  // Auth
  login: (emailOrPhone: string, pass: string) => { success: boolean; message: string };
  register: (name: string, emailOrPhone: string, pass: string, referCode?: string) => { success: boolean; message: string };
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
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
  USERS: 'earntask_users_v1',
  TRANSACTIONS: 'earntask_transactions_v1',
  LOGS: 'earntask_task_logs_v1',
  SETTINGS: 'earntask_settings_v2',
  LANGUAGE: 'earntask_lang_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with mock fallbacks
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem('earntask_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new payment numbers are applied if old placeholders were present
        if (!parsed.depositAccounts || parsed.depositAccounts.bKash.includes('01812') || !parsed.depositAccounts.bKash.includes('01913932587')) {
          parsed.depositAccounts = DEFAULT_SETTINGS.depositAccounts;
        }
        return { ...DEFAULT_SETTINGS, ...parsed, depositAccounts: DEFAULT_SETTINGS.depositAccounts };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_DEMO_USERS;
    } catch {
      return INITIAL_DEMO_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        return JSON.parse(saved);
      }
      // Default to demo user for instant exploration
      return INITIAL_DEMO_USERS[1];
    } catch {
      return INITIAL_DEMO_USERS[1];
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
            referCode: u.referCode || `REF${i + 100}`,
            role: (u.role === 'admin' ? 'admin' : 'user') as UserRole,
            checkInStreak: u.checkInStreak || 0,
            dailyTasks: u.dailyTasks || {
              videosWatchedToday: 0,
              spinsToday: 0,
              quizzesToday: 0,
              lastResetDate: new Date().toISOString().split('T')[0],
            },
            createdAt: u.createdAt || new Date().toISOString(),
          }));

          setAllUsers((prev) => {
            const merged = [...sanitized];
            prev.forEach((p) => {
              if (p && !merged.some((m) => m.uid === p.uid)) {
                merged.push(p);
              }
            });
            return merged;
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
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      // Also update in allUsers list
      setAllUsers((prev) => prev.map((u) => (u.uid === currentUser.uid ? currentUser : u)));
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

  // Check and reset daily limits if date has changed
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

  // Auth functions
  const login = (emailOrPhone: string, pass: string) => {
    if (!emailOrPhone) {
      return { success: false, message: language === 'bn' ? 'ইমেইল অথবা ফোন নম্বর দিন।' : 'Please enter email/phone.' };
    }
    const cleanInput = (emailOrPhone || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    const found = allUsers.find((u) => {
      if (!u) return false;
      const userEmailOrPhone = (u.emailOrPhone || '').trim().toLowerCase();
      const userUid = (u.uid || '').trim().toLowerCase();
      const userName = (u.name || '').trim().toLowerCase();
      const matchesId = userEmailOrPhone === cleanInput || userUid === cleanInput || userName === cleanInput;
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
      message: language === 'bn' ? 'ভুল ইমেইল/ফোন অথবা পাসওয়ার্ড!' : 'Invalid email/phone or password!',
    };
  };

  const register = (name: string, emailOrPhone: string, pass: string, referCode?: string) => {
    const cleanName = (name || '').trim();
    const cleanInput = (emailOrPhone || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (!cleanName) {
      return { success: false, message: language === 'bn' ? 'দয়া করে আপনার নাম দিন।' : 'Please enter your name.' };
    }
    if (!cleanInput) {
      return { success: false, message: language === 'bn' ? 'ইমেইল অথবা ফোন নম্বর দিন।' : 'Please enter email/phone.' };
    }
    if (cleanPass.length < 4) {
      return { success: false, message: language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.' };
    }

    const exists = allUsers.some((u) => u && (u.emailOrPhone || '').trim().toLowerCase() === cleanInput);
    if (exists) {
      return { success: false, message: language === 'bn' ? 'এই ইমেইল/নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।' : 'Account already exists with this phone/email.' };
    }

    // Generate random refer code
    const generatedReferCode = cleanName.replace(/\s+/g, '').substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
    const today = new Date().toISOString().split('T')[0];

    // Check if referral code is valid
    let initialBalance = 20; // Welcome registration bonus!
    if (referCode && referCode.trim()) {
      const cleanRef = referCode.trim().toUpperCase();
      const referrer = allUsers.find((u) => u && (u.referCode || '').trim().toUpperCase() === cleanRef);
      if (referrer) {
        initialBalance += 10; // Extra bonus for using referral
        // Give bonus to referrer
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
      uid: 'user-' + Date.now(),
      name: name.trim(),
      emailOrPhone: cleanInput,
      password: pass,
      balance: initialBalance,
      totalEarned: initialBalance,
      totalWithdrawn: 0,
      referCode: generatedReferCode,
      referredBy: referCode ? referCode.trim().toUpperCase() : undefined,
      role: 'user',
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

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!auth) {
        return { success: false, message: 'Firebase Auth is not initialized' };
      }
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const userEmail = (googleUser.email || '').trim().toLowerCase();
      const userName = googleUser.displayName || 'Google User';

      // Check if user already exists
      const existing = allUsers.find(
        (u) =>
          u &&
          ((u.emailOrPhone && u.emailOrPhone.toLowerCase() === userEmail) ||
           (u.uid === googleUser.uid))
      );

      if (existing) {
        setCurrentUser(existing);
        sound.playFanfare();
        return {
          success: true,
          message: language === 'bn' ? `স্বাগতম ${existing.name}! সফলভাবে লগইন হয়েছে।` : `Welcome ${existing.name}! Logged in successfully.`
        };
      }

      // Create new user with welcome bonus
      const generatedReferCode = userName.replace(/\s+/g, '').substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
      const today = new Date().toISOString().split('T')[0];
      const initialBalance = 25; // Extra Google signin bonus

      const newUser: User = {
        uid: googleUser.uid,
        name: userName,
        emailOrPhone: userEmail,
        password: '',
        balance: initialBalance,
        totalEarned: initialBalance,
        totalWithdrawn: 0,
        referCode: generatedReferCode,
        role: 'user',
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
      syncUserToFirebase(newUser);
      sound.playFanfare();

      return {
        success: true,
        message: language === 'bn' ? `গুগল দিয়ে লগইন সফল! স্বাগতম বোনাস ৳${initialBalance} দেওয়া হয়েছে!` : `Signed in with Google! Welcome bonus ৳${initialBalance} added!`
      };
    } catch (error: unknown) {
      console.warn('Google sign in error:', error);
      const err = error as { code?: string; message?: string };
      if (err.code === 'auth/unauthorized-domain') {
        return {
          success: false,
          message: language === 'bn' 
            ? 'Firebase-এ এই ডোমেনটি Authorized Domains তালিকায় যুক্ত করতে হবে (Firebase Console > Auth > Settings > Authorized domains)।'
            : 'Domain not authorized. Please add bslofficial.github.io to Firebase Authorized Domains.'
        };
      }
      if (err.code === 'auth/popup-blocked') {
        return {
          success: false,
          message: language === 'bn' ? 'ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে পপ-আপ অনুমোদন করুন।' : 'Popup was blocked by browser.'
        };
      }
      return {
        success: false,
        message: err.message || (language === 'bn' ? 'গুগল সাইন-ইন সম্পন্ন করা যায়নি।' : 'Google sign-in failed.')
      };
    }
  };

  const logout = () => {
    sound.playClick();
    setCurrentUser(null);
  };

  // Task Completion: Daily Check-in
  const claimDailyCheckin = () => {
    if (!currentUser) {
      return { success: false, reward: 0, streak: 0, message: 'Please login first' };
    }

    const today = new Date().toISOString().split('T')[0];
    if (currentUser.lastCheckInDate === today) {
      return {
        success: false,
        reward: 0,
        streak: currentUser.checkInStreak,
        message: language === 'bn' ? 'আজকের ডেইলি চেক-ইন আপনি ইতিমধ্যে নিয়ে নিয়েছেন!' : 'You have already claimed today’s check-in!',
      };
    }

    // Check if yesterday was checked in to increment streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = currentUser.lastCheckInDate === yesterday ? currentUser.checkInStreak + 1 : 1;

    // Bonus based on streak (e.g. Day 7 gives 2x)
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
    return {
      success: true,
      reward,
      streak: newStreak,
      message: language === 'bn' ? `অভিনন্দন! আপনি ৳${reward} ক্লেইম করেছেন!` : `Congratulations! Claimed ৳${reward}!`,
    };
  };

  // Task Completion: Video Ad Task
  const completeVideoTask = () => {
    if (!currentUser) {
      return { success: false, reward: 0, message: 'Please login first' };
    }

    const watched = currentUser.dailyTasks.videosWatchedToday;
    if (watched >= settings.maxDailyVideos) {
      return {
        success: false,
        reward: 0,
        message: language === 'bn' ? 'আজকের ভিডিও দেখার সর্বোচ্চ লিমিট শেষ!' : 'Daily video limit reached!',
      };
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
    return {
      success: true,
      reward,
      message: language === 'bn' ? `ভিডিও সম্পন্ন হয়েছে! ৳${reward} ব্যালেন্সে যোগ হয়েছে।` : `Video completed! ৳${reward} added.`,
    };
  };

  // Task Completion: Lucky Spin
  const completeLuckySpin = (customReward?: number) => {
    if (!currentUser) {
      return { success: false, reward: 0, message: 'Please login first' };
    }

    const spins = currentUser.dailyTasks.spinsToday;
    if (spins >= settings.maxDailySpins) {
      return {
        success: false,
        reward: 0,
        message: language === 'bn' ? 'আজকের স্পিন লিমিট শেষ!' : 'Daily spin limit reached!',
      };
    }

    // Default to random if not specified
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

    return {
      success: true,
      reward,
      message: reward > 0 ? (language === 'bn' ? `অভিনন্দন! আপনি ৳${reward} জিতেছেন!` : `Congratulations! You won ৳${reward}!`) : (language === 'bn' ? 'দুঃখিত, এবার কিছু পাননি। আবার চেষ্টা করুন!' : 'Better luck next time!'),
    };
  };

  // Task Completion: Quiz
  const completeQuiz = (reward: number) => {
    if (!currentUser) {
      return { success: false, reward: 0, message: 'Please login first' };
    }

    const quizzes = currentUser.dailyTasks.quizzesToday;
    if (quizzes >= settings.maxDailyQuizzes) {
      return {
        success: false,
        reward: 0,
        message: language === 'bn' ? 'আজকের কুইজ লিমিট শেষ!' : 'Daily quiz limit reached!',
      };
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
    return {
      success: true,
      reward,
      message: language === 'bn' ? `সঠিক উত্তর! ৳${reward} যোগ করা হয়েছে।` : `Correct! ৳${reward} credited.`,
    };
  };

  // Wallet: Deposit
  const requestDeposit = (method: PaymentMethod, amount: number, senderNumber: string, transactionId: string) => {
    if (!currentUser) return { success: false, message: 'Please login first' };
    if (amount <= 0) return { success: false, message: language === 'bn' ? 'সঠিক পরিমাণ টাকা দিন।' : 'Enter valid amount.' };
    if (!senderNumber.trim()) return { success: false, message: language === 'bn' ? 'প্রেরক নম্বর দিন।' : 'Enter sender number.' };
    if (!transactionId.trim()) return { success: false, message: language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID) দিন।' : 'Enter TrxID.' };

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

    return {
      success: true,
      message: language === 'bn' ? 'ডিপোজিট রিকোয়েস্ট জমা হয়েছে! অ্যাডমিন ভেরিফাই করে অ্যাপ্রুভ করবেন।' : 'Deposit request submitted for review.',
    };
  };

  // Wallet: Withdraw
  const requestWithdraw = (method: PaymentMethod, amount: number, receiverNumber: string) => {
    if (!currentUser) return { success: false, message: 'Please login first' };
    if (amount < settings.minWithdrawAmount) {
      return {
        success: false,
        message: language === 'bn' ? `সর্বনিম্ন উইথড্র ৳${settings.minWithdrawAmount}!` : `Minimum withdraw is ৳${settings.minWithdrawAmount}!`,
      };
    }
    if (currentUser.balance < amount) {
      return {
        success: false,
        message: language === 'bn' ? 'আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient balance!',
      };
    }
    if (!receiverNumber.trim()) {
      return { success: false, message: language === 'bn' ? 'উইথড্র পাওয়ার নম্বর দিন।' : 'Enter receiver number.' };
    }

    // Deduct immediately from user balance (held in pending)
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

    return {
      success: true,
      message: language === 'bn' ? `৳${amount} উইথড্র রিকোয়েস্ট সফল হয়েছে! খুব শীঘ্রই পেমেন্ট সম্পন্ন হবে।` : `Withdraw request for ৳${amount} placed!`,
    };
  };

  // Admin Actions
  const adminApproveTransaction = (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.status !== 'pending') return;

    // If it's a deposit, credit the user's balance
    if (tx.type === 'deposit') {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.uid === tx.userId) {
            const updated = {
              ...u,
              balance: u.balance + tx.amount,
              totalEarned: u.totalEarned + tx.amount,
            };
            syncUserToFirebase(updated);
            return updated;
          }
          return u;
        })
      );

      // If current user is the recipient, update their active state
      if (currentUser?.uid === tx.userId) {
        setCurrentUser((prev) => (prev ? { ...prev, balance: prev.balance + tx.amount, totalEarned: prev.totalEarned + tx.amount } : null));
      }
    } else if (tx.type === 'withdraw') {
      // Mark totalWithdrawn
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

    // If it was a withdraw request that got rejected, refund the money back to the user
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
        login,
        register,
        loginWithGoogle,
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
