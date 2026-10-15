import { rtdb } from '../firebase';
import { ref, set, get, onValue, update } from 'firebase/database';
import { User, Transaction, AppSettings, TaskLog } from '../types';

/**
 * Service to sync app state with Firebase Realtime Database.
 * Wrapped with robust error handling to guarantee UI responsiveness.
 */

export const syncUserToFirebase = async (user: User): Promise<void> => {
  if (!rtdb) return;
  try {
    const userRef = ref(rtdb, `users/${user.uid}`);
    await set(userRef, user);
  } catch (error) {
    console.warn('Firebase RTDB syncUser warning:', error);
  }
};

export const syncTransactionToFirebase = async (tx: Transaction): Promise<void> => {
  if (!rtdb) return;
  try {
    const txRef = ref(rtdb, `transactions/${tx.id}`);
    await set(txRef, tx);
  } catch (error) {
    console.warn('Firebase RTDB syncTransaction warning:', error);
  }
};

export const syncSettingsToFirebase = async (settings: AppSettings): Promise<void> => {
  if (!rtdb) return;
  try {
    const settingsRef = ref(rtdb, 'settings');
    await set(settingsRef, settings);
  } catch (error) {
    console.warn('Firebase RTDB syncSettings warning:', error);
  }
};

export const syncTaskLogToFirebase = async (log: TaskLog): Promise<void> => {
  if (!rtdb) return;
  try {
    const logRef = ref(rtdb, `logs/${log.id}`);
    await set(logRef, log);
  } catch (error) {
    console.warn('Firebase RTDB syncTaskLog warning:', error);
  }
};

export const subscribeToFirebaseData = (
  onUsersUpdate?: (users: User[]) => void,
  onTransactionsUpdate?: (transactions: Transaction[]) => void,
  onSettingsUpdate?: (settings: AppSettings) => void
) => {
  if (!rtdb) return () => {};

  try {
    // Listen to users
    const usersRef = ref(rtdb, 'users');
    const unsubUsers = onValue(
      usersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const usersList: User[] = Object.values(val);
          if (onUsersUpdate && usersList.length > 0) {
            onUsersUpdate(usersList);
          }
        }
      },
      (err) => console.warn('RTDB users listener notice:', err.message)
    );

    // Listen to transactions
    const txRef = ref(rtdb, 'transactions');
    const unsubTx = onValue(
      txRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const txList: Transaction[] = Object.values(val);
          if (onTransactionsUpdate && txList.length > 0) {
            // Sort by latest createdAt
            txList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            onTransactionsUpdate(txList);
          }
        }
      },
      (err) => console.warn('RTDB transactions listener notice:', err.message)
    );

    // Listen to settings
    const settingsRef = ref(rtdb, 'settings');
    const unsubSettings = onValue(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (onSettingsUpdate && val) {
            onSettingsUpdate(val);
          }
        }
      },
      (err) => console.warn('RTDB settings listener notice:', err.message)
    );

    return () => {
      unsubUsers();
      unsubTx();
      unsubSettings();
    };
  } catch (error) {
    console.warn('subscribeToFirebaseData error:', error);
    return () => {};
  }
};
