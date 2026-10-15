/**
 * =========================================================================
 * FIREBASE REALTIME DATABASE & AUTH CONFIGURATION
 * =========================================================================
 * Connected to Firebase project: earning-web-app-d515c
 * =========================================================================
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
  authDomain: "earning-web-app-d515c.firebaseapp.com",
  databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com",
  projectId: "earning-web-app-d515c",
  storageBucket: "earning-web-app-d515c.firebasestorage.app",
  messagingSenderId: "940476940339",
  appId: "1:940476940339:web:eb81b99117e9294fc86346",
  measurementId: "G-74LH2RTK1B"
};

export const isFirebaseConfigured = (): boolean => {
  return true;
};

let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let rtdb: ReturnType<typeof getDatabase> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  try {
    rtdb = getDatabase(app);
  } catch (err) {
    console.warn("RTDB initialization warning:", err);
  }
  try {
    db = getFirestore(app);
  } catch (err) {
    console.warn("Firestore initialization warning:", err);
  }
  console.log("Firebase initialized successfully with Realtime Database (earning-web-app-d515c).");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { app, auth, rtdb, db };
