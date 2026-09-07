import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogOut, ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';

interface SecureFeatureWrapperProps {
  children: React.ReactNode;
  featureName: string;
  demoId?: string; // e.g. '2022-BSCS-0042'
}

const TIMEOUT_MS = 30 * 1000; // 30 seconds

export default function SecureFeatureWrapper({
  children,
  featureName,
  demoId = '2022',
}: SecureFeatureWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_MS / 1000);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // ── Session Timeout Logic ─────────────────────────────────────────────────
  
  const logout = () => {
    setIsAuthenticated(false);
    setStudentId('');
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const resetTimer = () => {
    if (!isAuthenticated) return;
    
    // Reset countdown
    setTimeLeft(TIMEOUT_MS / 1000);
    
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Start auto-logout timer
    timerRef.current = setTimeout(() => {
      logout();
    }, TIMEOUT_MS);

    // Start visual countdown for the last 10 seconds (optional, but good UX)
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Attach global activity listeners when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    resetTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isAuthenticated]);


  // ── Login Handler ────────────────────────────────────────────────────────
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, we accept the specific demo ID or any ID that is at least 4 chars
    if (studentId.includes(demoId) || studentId.length >= 4) {
      setError(false);
      setIsAuthenticated(true);
    } else {
      setError(true);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (isAuthenticated) {
    return (
      <div className="relative w-full h-full">
        {/* Floating Logout & Timer Bar */}
        <div className="absolute -top-6 right-0 z-50 flex items-center gap-3">
          {timeLeft <= 10 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold text-sm border border-red-200"
            >
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              Auto-logout in {timeLeft}s
            </motion.div>
          )}
          
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-700 active:scale-95 transition-all shadow-lg shadow-slate-900/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Feature Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-full pt-8"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md w-full text-center relative overflow-hidden"
      >
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-10 -translate-y-10" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-blue-100 rounded-3xl mx-auto flex items-center justify-center mb-6 text-blue-600">
            <Lock className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Secure Access</h2>
          <p className="text-slate-500 font-medium mb-8">
            The <span className="font-bold text-slate-700">{featureName}</span> contains sensitive data. Please log in to verify your identity.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter Student ID (e.g. 23-7687-740)"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-bold placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  autoFocus
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm font-bold mt-2 text-left flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" /> Invalid Student ID
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={!studentId}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
            >
              Access Records
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              For your privacy, this session will automatically log out after 30 seconds of inactivity on this kiosk.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
