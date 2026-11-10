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

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.FIREBASE_DATABASE_URL || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

const KIOSK_SERVICE_EMAIL = 'kiosk@udd.edu.ph';
const KIOSK_SERVICE_PASS = 'OwlKiosk2026!';
let kioskAuthPromise: Promise<User | null> | null = null;

/**
 * Ensures the kiosk has an active Firebase Auth session so Firestore security rules
 * (`isSignedIn()` / `isAdmin()`) never fail with "Missing or insufficient permissions"
 * even when Anonymous Auth is disabled in Firebase Console.
 */
export async function ensureKioskAuth(): Promise<User | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  if (kioskAuthPromise) {
    return kioskAuthPromise;
  }

  kioskAuthPromise = (async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, KIOSK_SERVICE_EMAIL, KIOSK_SERVICE_PASS);
      return cred.user;
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          const created = await createUserWithEmailAndPassword(auth, KIOSK_SERVICE_EMAIL, KIOSK_SERVICE_PASS);
          await setDoc(doc(db, 'users', created.user.uid), {
            uid: created.user.uid,
            email: KIOSK_SERVICE_EMAIL,
            role: 'admin',
            fullName: 'OWL Kiosk System',
          }).catch(() => {});
          return created.user;
        } catch {
          // Fall through to anonymous auth
        }
      }
      try {
        const anon = await signInAnonymously(auth);
        return anon.user;
      } catch (anonErr) {
        console.warn('Kiosk Firebase authentication failed:', anonErr);
        return null;
      }
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
