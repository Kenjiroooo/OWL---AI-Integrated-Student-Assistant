import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  type User,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

/**
 * Sanitizes build-time env vars so corrupted/masked values in Vercel (such as
 * "••••••••••••••••••••••••••••••••••••••••" in FIREBASE_APP_ID, which causes
 * window.fetch to throw "String contains non ISO-8859-1 code point" on
 * X-Firebase-GMPID headers) fall back cleanly to valid ASCII identifiers.
 */
function cleanFirebaseEnv(raw: string | undefined, fallback: string): string {
  const trimmed = (raw || '').trim().replace(/^["']|["']$/g, '');
  if (!trimmed || /[^\x20-\x7E]/.test(trimmed) || trimmed.includes('•')) {
    return fallback;
  }
  return trimmed;
}

const firebaseConfig = {
  apiKey: cleanFirebaseEnv(process.env.FIREBASE_API_KEY, 'AIzaSyD9cLXCdRtWhsuvgn2nVvtWgnDlDqvzA0E'),
  authDomain: cleanFirebaseEnv(process.env.FIREBASE_AUTH_DOMAIN, 'owl-udd.firebaseapp.com'),
  databaseURL: cleanFirebaseEnv(
    process.env.FIREBASE_DATABASE_URL,
    'https://owl-udd-default-rtdb.asia-southeast1.firebasedatabase.app'
  ),
  projectId: cleanFirebaseEnv(process.env.FIREBASE_PROJECT_ID, 'owl-udd'),
  storageBucket: cleanFirebaseEnv(process.env.FIREBASE_STORAGE_BUCKET, 'owl-udd.firebasestorage.app'),
  messagingSenderId: cleanFirebaseEnv(process.env.FIREBASE_MESSAGING_SENDER_ID, '74861051193'),
  appId: cleanFirebaseEnv(process.env.FIREBASE_APP_ID, '1:74861051193:web:c6004d0ba9cfa7651a3ce8'),
  measurementId: cleanFirebaseEnv(process.env.FIREBASE_MEASUREMENT_ID, 'G-KDMCZBB8Q9'),
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

const KIOSK_STUDENT_EMAIL = 'kiosk-student@udd.edu.ph';
const KIOSK_STUDENT_PASS = 'OwlStudentKiosk2026!';
let kioskAuthPromise: Promise<User | null> | null = null;

/**
 * Ensures the kiosk has an active student-scoped Firebase Auth session so Firestore
 * security rules (`isSignedIn()`) pass even if Anonymous Auth is disabled in Firebase Console.
 */
export async function ensureKioskAuth(): Promise<User | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  if (kioskAuthPromise) {
    return kioskAuthPromise;
  }

  kioskAuthPromise = (async () => {
    // 1. Try standard Firebase Anonymous Auth first
    try {
      const anon = await signInAnonymously(auth);
      return anon.user;
    } catch {
      // Anonymous Auth is disabled in Firebase Console; fall back to student kiosk session
    }

    // 2. Fall back to non-admin student session (role: 'student')
    try {
      const cred = await signInWithEmailAndPassword(auth, KIOSK_STUDENT_EMAIL, KIOSK_STUDENT_PASS);
      return cred.user;
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          const created = await createUserWithEmailAndPassword(auth, KIOSK_STUDENT_EMAIL, KIOSK_STUDENT_PASS);
          await setDoc(doc(db, 'users', created.user.uid), {
            uid: created.user.uid,
            email: KIOSK_STUDENT_EMAIL,
            role: 'student',
            fullName: 'OWL Kiosk Student',
          }).catch(() => {});
          return created.user;
        } catch (createErr) {
          console.warn('Kiosk student session creation failed:', createErr);
        }
      } else {
        console.warn('Kiosk Firebase authentication failed:', err);
      }
      return null;
    } finally {
      kioskAuthPromise = null;
    }
  })();

  return kioskAuthPromise;
}

// Connection test
async function testConnection() {
  try {
    // We don't really expect this doc to exist, but if we can reach the server, it's good.
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or connection. The client is offline.");
    } else {
      // Normal permission error or missing doc is fine for a connection test
      console.log("Firebase connection test performed.");
    }
  }
}

testConnection();

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  const authInfo = auth.currentUser ? {
    userId: auth.currentUser.uid,
    email: auth.currentUser.email || '',
    emailVerified: auth.currentUser.emailVerified,
    isAnonymous: auth.currentUser.isAnonymous,
    providerInfo: auth.currentUser.providerData.map(p => ({
      providerId: p.providerId,
      displayName: p.displayName || '',
      email: p.email || '',
    }))
  } : {
    userId: 'unauthenticated',
    email: '',
    emailVerified: false,
    isAnonymous: true,
    providerInfo: []
  };

  const errorInfo: FirestoreErrorInfo = {
    error: error.message || 'Unknown error',
    operationType: operation,
    path,
    authInfo
  };

  throw new Error(JSON.stringify(errorInfo));
}
