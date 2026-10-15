export type UserRole = 'user' | 'admin';

export interface User {
  uid: string;
  name: string;
  emailOrPhone: string;
  password?: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  referCode: string;
  referredBy?: string;
  role: UserRole;
  lastCheckInDate?: string; // YYYY-MM-DD
  checkInStreak: number;
  dailyTasks: {
    videosWatchedToday: number;
    spinsToday: number;
    quizzesToday: number;
    lastResetDate: string; // YYYY-MM-DD
  };
  createdAt: string;
}

export type TransactionType = 'deposit' | 'withdraw';
export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  accountNumber: string; // sender number for deposit, receiver number for withdraw
  transactionId?: string; // TrxID from bKash/Nagad
  status: TransactionStatus;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskType = 'daily_checkin' | 'video_ad' | 'lucky_spin' | 'quiz' | 'referral_bonus';

export interface TaskLog {
  id: string;
  userId: string;
  type: TaskType;
  title: string;
  reward: number;
  timestamp: string;
}

export interface AppSettings {
  noticeText: string;
  dailyCheckinReward: number;
  videoTaskReward: number;
  videoDurationSeconds: number;
  maxDailyVideos: number;
  maxDailySpins: number;
  maxDailyQuizzes: number;
  quizReward: number;
  referBonus: number;
  minWithdrawAmount: number;
  depositAccounts: {
    bKash: string;
    Nagad: string;
    Rocket: string;
  };
  adminPasscode: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export interface QuizQuestion {
  id: number;
  questionBn: string;
  questionEn: string;
  options: string[];
  correctIndex: number;
  explanationBn: string;
}
