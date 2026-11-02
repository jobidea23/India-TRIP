import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app: any = null;
try {
  if (isFirebaseConfigured) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
} catch (e) {
  console.warn("Firebase init failed, running in demo mode", e);
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
let _rtdb: any = null;
try { if (app && firebaseConfig.databaseURL) _rtdb = getDatabase(app); } catch (e) { console.warn("RTDB init failed", e); }
export const rtdb = _rtdb;
export const storage = app ? getStorage(app) : null;

export async function getMessagingSafe() {
  if (!app) return null;
  try {
    if (await isSupported()) return getMessaging(app);
  } catch {}
  return null;
}
