import { db } from '../firebase';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { User, Transaction, AppSettings, TaskLog } from '../types';

/**
 * Service to sync app state with Firebase Firestore Database.
 */

export const syncUserToFirebase = async (user: User): Promise<void> => {
  if (!db) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.warn('Firestore syncUser warning:', error);
  }
};

export const syncTransactionToFirebase = async (tx: Transaction): Promise<void> => {
  if (!db) return;
  try {
    const txRef = doc(db, 'transactions', tx.id);
    await setDoc(txRef, tx, { merge: true });
  } catch (error) {
    console.warn('Firestore syncTransaction warning:', error);
  }
};

export const syncSettingsToFirebase = async (settings: AppSettings): Promise<void> => {
  if (!db) return;
  try {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, settings, { merge: true });
  } catch (error) {
    console.warn('Firestore syncSettings warning:', error);
  }
};

export const syncTaskLogToFirebase = async (log: TaskLog): Promise<void> => {
  if (!db) return;
  try {
    const logRef = doc(db, 'logs', log.id);
    await setDoc(logRef, log, { merge: true });
  } catch (error) {
    console.warn('Firestore syncTaskLog warning:', error);
  }
};

export const subscribeToFirebaseData = (
  onUsersUpdate?: (users: User[]) => void,
  onTransactionsUpdate?: (transactions: Transaction[]) => void,
  onSettingsUpdate?: (settings: AppSettings) => void
) => {
  if (!db) return () => {};

  try {
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersList: User[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            usersList.push(docSnap.data() as User);
          }
        });
        if (onUsersUpdate && usersList.length > 0) {
          onUsersUpdate(usersList);
        }
      },
      (err) => console.warn('Firestore users listener notice:', err.message)
    );

    const unsubTx = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        const txList: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            txList.push(docSnap.data() as Transaction);
          }
        });
        txList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (onTransactionsUpdate) {
          onTransactionsUpdate(txList);
        }
      },
      (err) => console.warn('Firestore transactions listener notice:', err.message)
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (docSnap) => {
        if (docSnap.exists() && onSettingsUpdate) {
          onSettingsUpdate(docSnap.data() as AppSettings);
        }
      },
      (err) => console.warn('Firestore settings listener notice:', err.message)
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
