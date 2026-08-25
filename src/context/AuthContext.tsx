import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface UserProfile {
  uid: string;
  role: 'student' | 'admin';
  fullName: string;
  studentId?: string;
  email: string;
  program?: string;
  yearLevel?: string;
  enrollmentStatus?: string;
  missingRequirements?: string[];
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile;
  loading: boolean;
  isAdmin: boolean;
}

// Static guest profile — no login required
const GUEST_PROFILE: UserProfile = {
  uid: 'guest',
  email: 'guest@campus.edu.ph',
  fullName: 'Guest Student',
  role: 'student',
  program: 'BSCS',
  yearLevel: '1',
  enrollmentStatus: 'Incomplete',
  missingRequirements: ['Transcript of Records', 'Good Moral Certificate'],
  balance: 5000,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: GUEST_PROFILE,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sign in anonymously so Firestore rules (request.auth != null) pass
    signInAnonymously(auth).catch(err => {
      console.warn('Anonymous sign-in failed:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Use the anonymous user's UID if available, otherwise fall back to 'guest'
  const profile: UserProfile = {
    ...GUEST_PROFILE,
    uid: user?.uid || 'guest',
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: false }}>
      {children}
    </AuthContext.Provider>
  );
};
