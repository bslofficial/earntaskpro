import { User, UserRole } from '../types';

export const BENGALI_FIRST_NAMES = [
  "রিফাত", "নাজমুল", "তানভীর", "সাকিব", "রাকিব", "শরিফুল", "ইমরান", "ফারহান", 
  "সোহাগ", "জনি", "পার্থ", "শাকিল", "মামুন", "সাগর", "হাসান", "হৃদয়", 
  "আকাশ", "শান্ত", "শুভ", "নাহিদ", "ফাহিম", "সিয়াম", "রাফি", "জয়", 
  "তুষার", "আরিফ", "সাদিয়া", "নাজনীন", "তানিয়া", "মীম", "সুরাইয়া", "ফাতেমা", 
  "আয়েশা", "নুসরাত", "সাবিহা", "মেহেদী", "সাইফুল", "রকিবুল", "রুবেল", "শামীম",
  "তারেক", "আশরাফুল", "জুবায়ের", "মুস্তাফিজ", "তাসকিন", "লিটন", "মিরাজ", "মোজাম্মেল"
];

export const BENGALI_LAST_NAMES = [
  "ইসলাম", "হোসেন", "আহমেদ", "চৌধুরী", "খান", "মোল্লা", "তালুকদার", "সরকার", 
  "মিয়া", "বিশ্বাস", "মন্ডল", "প্রামাণিক", "মাহমুদ", "কবীর", "দেওয়ান", "বেপারী"
];

export const OPERATOR_PREFIXES = ["017", "018", "019", "016", "013", "014"];

/**
 * Strictly deduplicates a list of users.
 * Guarantees that no user with the same uid or same emailOrPhone (case-insensitive) appears more than once.
 * In case of collision, retains the user with the higher totalEarned.
 */
export const deduplicateUsers = (users: (User | null | undefined)[]): User[] => {
  const seenUids = new Set<string>();
  const seenPhones = new Set<string>();
  const uniqueUsers: User[] = [];

  // Filter valid entries and sort by totalEarned descending first
  const validSorted = (users || [])
    .filter((u): u is User => Boolean(u && typeof u === 'object' && u.uid))
    .sort((a, b) => (Number(b.totalEarned) || 0) - (Number(a.totalEarned) || 0));

  for (const user of validSorted) {
    const uidKey = (user.uid || '').trim();
    const phoneKey = (user.emailOrPhone || '').trim().toLowerCase();

    if (!uidKey) continue;

    // Check collision on UID
    if (seenUids.has(uidKey)) continue;

    // Check collision on Email or Phone
    if (phoneKey && seenPhones.has(phoneKey)) continue;

    seenUids.add(uidKey);
    if (phoneKey) seenPhones.add(phoneKey);
    uniqueUsers.push(user);
  }

  return uniqueUsers;
};

/**
 * Generates 150+ completely distinct, non-duplicate users for the platform leaderboard.
 */
export const generate150UniqueUsers = (): User[] => {
  const users: User[] = [
    {
      uid: "admin-master",
      name: "Admin Boss",
      emailOrPhone: "admin@earntask.com",
      password: "admin",
      balance: 5000,
      totalEarned: 125000,
      totalWithdrawn: 75000,
      referCode: "ADMIN777",
      role: "admin",
      checkInStreak: 45,
      dailyTasks: { 
        videosWatchedToday: 0, 
        spinsToday: 0, 
        quizzesToday: 0, 
        lastResetDate: new Date().toISOString().split('T')[0] 
      },
      createdAt: new Date().toISOString(),
      totalDeposited: 5000
    }
  ];

  const seenUids = new Set<string>(["admin-master"]);
  const seenPhones = new Set<string>(["admin@earntask.com"]);

  for (let i = 1; i <= 160; i++) {
    const fnIndex = (i - 1) % BENGALI_FIRST_NAMES.length;
    const lnIndex = (Math.floor((i - 1) / BENGALI_FIRST_NAMES.length) + ((i * 3) % BENGALI_LAST_NAMES.length)) % BENGALI_LAST_NAMES.length;
    const prefix = OPERATOR_PREFIXES[(i - 1) % OPERATOR_PREFIXES.length];
    
    // Guaranteed distinct 8-digit suffix
    const phoneSuffix = String(20000000 + i * 49127).padStart(8, '0').slice(0, 8);
    const phone = `${prefix}${phoneSuffix}`;
    const uid = `top-earner-${i}`;

    if (seenUids.has(uid) || seenPhones.has(phone)) continue;
    seenUids.add(uid);
    seenPhones.add(phone);

    // Realistic tiered earnings for top 150
    const totalEarned = Math.max(500, Math.floor(65000 - (i * 380) + ((i * 19) % 200)));
    const balance = Math.floor(totalEarned * 0.18);
    const totalWithdrawn = Math.floor(totalEarned * 0.72);

    users.push({
      uid,
      name: `${BENGALI_FIRST_NAMES[fnIndex]} ${BENGALI_LAST_NAMES[lnIndex]}`,
      emailOrPhone: phone,
      password: "user123",
      balance: Math.max(20, balance),
      totalEarned,
      totalWithdrawn: Math.max(0, totalWithdrawn),
      referCode: `REF${10000 + i}`,
      role: "user" as UserRole,
      checkInStreak: (i % 28) + 1,
      dailyTasks: { 
        videosWatchedToday: 2, 
        spinsToday: 2, 
        quizzesToday: 1, 
        lastResetDate: new Date().toISOString().split('T')[0] 
      },
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      totalDeposited: 300
    });
  }

  return users.sort((a, b) => b.totalEarned - a.totalEarned);
};

/**
 * Ensures a user list has at least 150 unique users without any duplicates.
 */
export const ensure150UniqueUsers = (existingUsers: (User | null | undefined)[]): User[] => {
  const deduped = deduplicateUsers(existingUsers);
  if (deduped.length >= 150) {
    return deduped;
  }

  // Backfill up to 150 with newly generated users that don't collide
  const freshPool = generate150UniqueUsers();
  return deduplicateUsers([...deduped, ...freshPool]);
};
