import { AppSettings, QuizQuestion, User, Transaction } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  noticeText: "🔥 নতুন মেম্বারদের জন্য ৫০ টাকা বোনাস! প্রতিদিন ভিডিও দেখে ও লাকি স্পিন খেলে সহজেই ২০০-৫০০ টাকা আয় করুন। বিকাশ, নগদ ও রকেটে দ্রুত পেমেন্ট দেয়া হয়!",
  dailyCheckinReward: 15,
  videoTaskReward: 8,
  videoDurationSeconds: 15,
  maxDailyVideos: 10,
  maxDailySpins: 8,
  maxDailyQuizzes: 5,
  quizReward: 10,
  referBonus: 50,
  minWithdrawAmount: 100,
  depositAccounts: {
    bKash: "01913932587 (Personal / Send Money)",
    Nagad: "01913932587 (Personal / Send Money)",
    Rocket: "01917044596-9 (Personal / Send Money)"
  },
  adminPasscode: "admin123"
};

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    questionBn: "বাংলাদেশের জাতীয় কবির নাম কী?",
    questionEn: "Who is the national poet of Bangladesh?",
    options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জসীমউদ্দীন", "জীবনানন্দ দাশ"],
    correctIndex: 0,
    explanationBn: "কাজী নজরুল ইসলাম বাংলাদেশের জাতীয় কবি।"
  },
  {
    id: 2,
    questionBn: "১ কিলোমিটারে কত মিটার থাকে?",
    questionEn: "How many meters are in 1 kilometer?",
    options: ["১০০ মিটার", "৫০০ মিটার", "১০০০ মিটার", "১০০০০ মিটার"],
    correctIndex: 2,
    explanationBn: "১ কিলোমিটার = ১০০০ মিটার।"
  },
  {
    id: 3,
    questionBn: "পৃথিবীর সবচেয়ে বড় মহাসাগরের নাম কী?",
    questionEn: "Which is the largest ocean in the world?",
    options: ["আটলান্টিক", "ভারত", "প্রশান্ত", "উত্তর মহাসাগর"],
    correctIndex: 2,
    explanationBn: "প্রশান্ত মহাসাগর (Pacific Ocean) পৃথিবীর বৃহত্তম মহাসাগর।"
  },
  {
    id: 4,
    questionBn: "সূর্যোদয়ের দেশ বলা হয় কোন দেশকে?",
    questionEn: "Which country is called the Land of the Rising Sun?",
    options: ["চীন", "জাপান", "নরওয়ে", "কোরিয়া"],
    correctIndex: 1,
    explanationBn: "জাপানকে সূর্যোদয়ের দেশ বলা হয়।"
  },
  {
    id: 5,
    questionBn: "কম্পিউটারের মস্তিষ্ক (Brain) কাকে বলা হয়?",
    questionEn: "What is called the brain of a computer?",
    options: ["RAM", "Hard Disk", "CPU", "Monitor"],
    correctIndex: 2,
    explanationBn: "CPU (Central Processing Unit) কে কম্পিউটারের মস্তিষ্ক বলা হয়।"
  },
  {
    id: 6,
    questionBn: "কোন ভিটামিনের অভাবে রাতকানা রোগ হয়?",
    questionEn: "Deficiency of which vitamin causes night blindness?",
    options: ["ভিটামিন এ (Vitamin A)", "ভিটামিন বি (Vitamin B)", "ভিটামিন সি (Vitamin C)", "ভিটামিন ডি (Vitamin D)"],
    correctIndex: 0,
    explanationBn: "ভিটামিন এ এর অভাবে রাতকানা রোগ হয়ে থাকে।"
  }
];

export const INITIAL_DEMO_USERS: User[] = [
  {
    uid: "admin-master",
    name: "Admin Boss",
    emailOrPhone: "admin@earntask.com",
    password: "admin",
    balance: 5000,
    totalEarned: 12500,
    totalWithdrawn: 7500,
    referCode: "ADMIN777",
    role: "admin",
    checkInStreak: 7,
    dailyTasks: {
      videosWatchedToday: 0,
      spinsToday: 0,
      quizzesToday: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    },
    createdAt: new Date().toISOString()
  },
  {
    uid: "user-demo-1",
    name: "আরিফুল ইসলাম",
    emailOrPhone: "01711223344",
    password: "user123",
    balance: 245,
    totalEarned: 420,
    totalWithdrawn: 175,
    referCode: "ARIF88",
    role: "user",
    checkInStreak: 3,
    lastCheckInDate: undefined,
    dailyTasks: {
      videosWatchedToday: 2,
      spinsToday: 3,
      quizzesToday: 1,
      lastResetDate: new Date().toISOString().split('T')[0]
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-101",
    userId: "user-demo-1",
    userName: "আরিফুল ইসলাম",
    userPhone: "01711223344",
    type: "deposit",
    amount: 200,
    method: "bKash",
    accountNumber: "01711223344",
    transactionId: "9KD4J2LA01",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "tx-102",
    userId: "user-demo-1",
    userName: "আরিফুল ইসলাম",
    userPhone: "01711223344",
    type: "withdraw",
    amount: 150,
    method: "Nagad",
    accountNumber: "01711223344",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];
