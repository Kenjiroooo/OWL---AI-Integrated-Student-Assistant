import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, User, Eye, EyeOff, LogIn, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export function getStoredAdminCredentials() {
  try {
    const stored = localStorage.getItem('owl_admin_credentials');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.username && parsed?.password) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading admin credentials:', e);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validCreds = getStoredAdminCredentials();

    // Check credentials (case-insensitive for username, case-sensitive for password)
    const isUserValid = username.trim().toLowerCase() === validCreds.username.toLowerCase();
    const isPassValid = password === validCreds.password;

    setTimeout(() => {
      setIsSubmitting(false);
      if (isUserValid && isPassValid) {
        sessionStorage.setItem('owl_admin_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError('Invalid username or password. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, 400);
  };

  return (
    <div 
      data-no-keyboard="true"
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none"
      style={{
        background: 'linear-gradient(135deg, #051329 0%, #001f4d 45%, #00317e 100%)',
      }}
    >
      {/* Background Decorative Glow & Mesh */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, #00c1fd 0%, transparent 40%), radial-gradient(circle at 80% 70%, #2559bf 0%, transparent 45%)',
          filter: 'blur(60px)',
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          x: shake ? [-8, 8, -6, 6, -3, 3, 0] : 0 
        }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10 rounded-3xl p-8 sm:p-10 shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 25px 60px -15px rgba(0, 49, 126, 0.35)',
        }}
      >
        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4"
            style={{ 
              background: 'linear-gradient(135deg, #00317e 0%, #00c1fd 100%)',
              boxShadow: '0 10px 25px rgba(0, 193, 253, 0.3)'
            }}
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="text-[11px] font-black tracking-widest uppercase text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 mb-2">
            Universidad de Dagupan
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            OWL Admin Portal
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Restricted access. Please authenticate to continue.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoFocus
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            style={{
              background: 'linear-gradient(135deg, #00317e 0%, #0056cc 100%)',
              boxShadow: '0 8px 24px rgba(0, 49, 126, 0.35)',
            }}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In to Admin Panel
              </>
            )}
          </button>
        </form>

        {/* Back to Kiosk Action */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Student Kiosk Interface
          </button>

          {/* Default Credentials Helper */}
          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 w-full text-center">
            <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
              <KeyRound className="w-3 h-3 text-sky-500" />
              Default: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-700">admin</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-700">admin123</code>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
