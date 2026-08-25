import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, AlertCircle, Loader2, ArrowRight, UserCircle2, ChevronLeft, CheckCircle2 } from 'lucide-react';
import appLogo from '../assets/app-logo.png';
import schoolLogo from '../assets/university-logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [lastUser, setLastUser] = useState<{ fullName: string; email: string; role: string } | null>(null);
  const [showFullForm, setShowFullForm] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTimeout = searchParams.get('timeout') === 'true';
  const { user, loading: authLoading } = useAuth();

  // ✅ Auto-redirect if already logged in (persistent session)
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load last logged-in user from localStorage for "Welcome Back" UX
  useEffect(() => {
    const savedUser = localStorage.getItem('owl_kiosk_last_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setLastUser(parsed);
      setEmail(parsed.email || '');
    } else {
      setShowFullForm(true);
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setIsNewUser(false);

    try {
      // --- Try signing in first ---
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Save to localStorage so next visit shows "Welcome Back"
      localStorage.setItem('owl_kiosk_last_user', JSON.stringify({
        email,
        fullName: fullName || email.split('@')[0], // Optimistic name until profile loads
        role: 'student',
      }));

      // Immediate navigation to feel faster
      navigate('/', { replace: true });
    } catch (signInErr: any) {
      // --- If account doesn't exist yet, auto-register ---
      if (
        signInErr.code === 'auth/user-not-found' ||
        signInErr.code === 'auth/invalid-credential'
      ) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, email, password);
          const uid = newCred.user.uid;

          const newProfile = {
            uid,
            email,
            fullName: fullName || email.split('@')[0],
            role: 'student',
            createdAt: new Date(),
          };

          await setDoc(doc(db, 'users', uid), newProfile);

          localStorage.setItem('owl_kiosk_last_user', JSON.stringify({
            email,
            fullName: newProfile.fullName,
            role: 'student',
          }));

          setIsNewUser(true);
          setTimeout(() => navigate('/', { replace: true }), 1500);
          return;

        } catch (regErr: any) {
          if (regErr.code === 'auth/email-already-in-use') {
            setError('Incorrect password. Please try again.');
          } else if (regErr.code === 'auth/weak-password') {
            setError('Password must be at least 6 characters.');
          } else {
            setError('Sign-in failed. Please check your credentials.');
          }
        }
      } else if (signInErr.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (signInErr.code === 'auth/configuration-not-found') {
        setError('Email/Password sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.');
      } else {
        setError('Sign-in failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchUser = () => {
    setShowFullForm(true);
    setLastUser(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  // Show spinner while Firebase checks saved auth session
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Success screen for brand new accounts
  if (isNewUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-xl shadow-emerald-50">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Account Created!</h2>
          <p className="text-slate-500 font-medium">Signing you in automatically...</p>
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md landscape:max-w-4xl landscape:flex landscape:flex-row bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden"
      >
        {/* Left Section (Branding) */}
        <div className="relative w-full landscape:w-1/2 p-6 sm:p-10 pb-0 sm:pb-0 landscape:pb-10 landscape:bg-slate-50/50 landscape:flex landscape:flex-col landscape:justify-center landscape:border-r landscape:border-slate-100">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-indigo-50 rounded-full -ml-14 -mb-14 opacity-60 pointer-events-none" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-6 sm:mb-10 landscape:mb-0 relative z-10">
            <motion.div
              whileHover={{ rotate: -5, scale: 1.05 }}
              className="w-32 h-32 sm:w-40 sm:h-40 mb-4 sm:mb-6 relative group"
            >
              <div className="absolute inset-0 bg-blue-100 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src={appLogo} 
                alt="OWL Logo" 
                className="w-full h-full object-cover rounded-[2rem] relative z-10"
                style={{ clipPath: 'inset(4%)' }}
              />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight text-center leading-tight">
              {lastUser && !showFullForm ? 'Welcome Back 👋' : 'Get Started'}
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-center">
              Universidad de Dagupan <br /> Kiosk Information System
            </p>
          </div>
        </div>

        {/* Right Section (Form & Footer) */}
        <div className="w-full landscape:w-1/2 p-6 sm:p-10 pt-0 sm:pt-0 landscape:pt-10 flex flex-col justify-center">
          {/* Alerts */}
          <AnimatePresence mode="wait">
            {isTimeout && (
              <motion.div
                key="timeout"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-amber-50 text-amber-700 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-amber-100"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">Session timed out due to inactivity.</p>
              </motion.div>
            )}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 text-red-700 p-5 rounded-2xl mb-6 flex items-start gap-4 border border-red-100"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Welcome Back: returning user ── */}
          {!showFullForm && lastUser ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                  <UserCircle2 className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{lastUser.fullName}</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">{lastUser.email}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 ml-2 uppercase tracking-widest">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="••••••••"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:border-blue-600 focus:bg-white transition-all outline-none text-slate-800 font-bold text-lg"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleLogin()}
                  disabled={loading || !password}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 sm:py-5 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-4 text-lg sm:text-xl"
                >
                  {loading
                    ? <Loader2 className="w-6 h-6 animate-spin" />
                    : <> Sign In <ArrowRight className="w-6 h-6" /> </>
                  }
                </button>

                <button
                  onClick={handleSwitchUser}
                  className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Not you? Use a different account
                </button>
              </div>
            </motion.div>

          ) : (
            /* ── First-time / full form ── */
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 ml-2 uppercase tracking-widest">Email / ID Number</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="ID Number or your.email@udd.edu.ph"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:border-blue-600 focus:bg-white transition-all outline-none text-slate-800 font-bold text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 ml-2 uppercase tracking-widest">
                  Full Name <span className="normal-case font-medium text-slate-400">(first time only)</span>
                </label>
                <div className="relative group">
                  <UserCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Fernandez"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:border-blue-600 focus:bg-white transition-all outline-none text-slate-800 font-bold text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 ml-2 uppercase tracking-widest">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:border-blue-600 focus:bg-white transition-all outline-none text-slate-800 font-bold text-base"
                  />
                </div>
                <p className="text-xs text-slate-400 ml-2 font-medium">
                  First time? We'll create your account automatically.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 sm:py-5 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-4 text-lg sm:text-xl mt-2"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In'}
              </button>

              {lastUser && (
                <button
                  type="button"
                  onClick={() => setShowFullForm(false)}
                  className="w-full py-3 text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors"
                >
                  ← Back to {lastUser.fullName}
                </button>
              )}
            </form>
          )}

          <div className="mt-10 flex flex-col items-center gap-6 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Powered by</span>
              <img src={schoolLogo} alt="Universidad de Dagupan" className="h-10 object-contain" />
            </div>
            
            <button
              onClick={() => navigate('/admin-login')}
              className="text-slate-300 hover:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              Administrator Access
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
