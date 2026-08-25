import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Map,
  Bus,
  Calendar,
  Bell,
  Search,
  MessageSquare,
  HelpCircle,
  PackageSearch,
  Wallet,
  FileText,
  LogOut,
  Clock,
  Sparkles,
  ArrowRight,
  Wifi,
  Shield,
  Zap,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import appLogo from '../assets/app-logo.png';
import schoolLogo from '../assets/university-logo.png';
import { OwlCharacter } from '../components/OwlCharacter';

const features = [
  { id: 'academic', title: 'Academic Assistance', icon: GraduationCap, color: 'from-blue-500 to-indigo-600', glow: 'rgba(99,102,241,0.25)', description: 'Grades, Enrollment, Requirements' },
  { id: 'campus-nav', title: 'Campus Navigation', icon: Map, color: 'from-emerald-400 to-teal-600', glow: 'rgba(20,184,166,0.25)', description: 'Building Maps, Room Finder' },
  { id: 'transport', title: 'Campus Transport', icon: Bus, color: 'from-orange-400 to-rose-600', glow: 'rgba(251,113,133,0.25)', description: 'E-Jeep Live Timetable' },
  { id: 'exam', title: 'Examination Timetable', icon: Clock, color: 'from-indigo-500 to-purple-600', glow: 'rgba(139,92,246,0.25)', description: 'Your Seat & Schedule' },
  { id: 'announcements', title: 'Notice Board', icon: Bell, color: 'from-rose-400 to-pink-600', glow: 'rgba(244,63,94,0.25)', description: 'Campus News & Events' },
  { id: 'faculty', title: 'Faculty Locator', icon: Search, color: 'from-cyan-400 to-blue-600', glow: 'rgba(6,182,212,0.25)', description: 'Find Teachers & Offices' },
  { id: 'feedback', title: 'Feedback Center', icon: MessageSquare, color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.25)', description: 'Suggestions & Reports' },
  { id: 'inquiry', title: 'Inquiry Center', icon: HelpCircle, color: 'from-sky-400 to-indigo-600', glow: 'rgba(56,189,248,0.25)', description: 'FAQs & General Help' },
  { id: 'lost-found', title: 'Lost & Found', icon: PackageSearch, color: 'from-amber-400 to-orange-600', glow: 'rgba(251,191,36,0.25)', description: 'Report or Claim Items' },
  { id: 'registrar', title: 'Registrar Hub', icon: FileText, color: 'from-purple-500 to-indigo-600', glow: 'rgba(168,85,247,0.25)', description: 'Docs & E-Queue' },
];

// Live animated clock
function useLiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setTime(`${h}:${m < 10 ? '0' + m : m} ${ampm}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// Floating particles background
function FloatingParticles() {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 3 + Math.random() * 6,
    duration: 8 + Math.random() * 10,
    delay: Math.random() * 6,
    opacity: 0.04 + Math.random() * 0.12,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: 'radial-gradient(circle, #2559bf, #00c1fd)',
            opacity: p.opacity,
          }}
          animate={{ y: [0, -25, 0], x: [0, 8, -8, 0], scale: [1, 1.4, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function StudentHome() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const time = useLiveClock();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleLogout = () => signOut(auth);

  if (!profile) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.93 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-600 relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 45%, #dff3ff 100%)' }}
    >
      {/* ── Mesh / glow orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ top: '-15%', right: '-12%', width: 800, height: 800, background: 'radial-gradient(circle, rgba(0,193,253,0.10) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div className="absolute rounded-full" style={{ bottom: '-18%', left: '-12%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(37,89,191,0.09) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ top: '45%', left: '35%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,49,126,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        {/* Subtle dot grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0,49,126,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <FloatingParticles />

      {/* ══════════════════ HEADER ══════════════════ */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-10 py-3 sm:py-4 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,49,126,0.08)', boxShadow: '0 2px 20px rgba(0,49,126,0.06)' }}
      >
        {/* Left: Logo + Greeting */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 sm:gap-6">
          <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
            <div className="absolute -inset-1.5 rounded-[1.3rem] blur opacity-30 group-hover:opacity-60 transition-all duration-500" style={{ background: 'linear-gradient(135deg, #00317e, #00c1fd)' }} />
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-[1.3rem] shadow-xl overflow-hidden border border-blue-50 flex items-center justify-center">
              <img src={appLogo} alt="OWL Logo" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
          <div className="hidden xs:block">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-0.5">
              Welcome back, <span style={{ background: 'linear-gradient(135deg, #00317e, #2559bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{profile.fullName.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-blue-400" />
              {profile.program} · 2nd Semester
            </div>
          </div>
        </motion.div>

        {/* Right: Clock + Status + Logout */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 sm:gap-4">
          {/* Live clock */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,49,126,0.10)', boxShadow: '0 2px 10px rgba(0,49,126,0.05)' }}>
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-black text-xs tracking-wider text-slate-700 tabular-nums">{time}</span>
          </div>

          {/* University logo + date */}
          <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-3 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,49,126,0.10)', boxShadow: '0 2px 10px rgba(0,49,126,0.05)' }}>
            <img src={schoolLogo} alt="UdD" className="h-7 object-contain" />
            <div className="h-5 w-px bg-slate-200" />
            <span className="font-black text-[10px] uppercase tracking-[0.1em] text-slate-400">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
            </span>
          </motion.div>

          {/* Live dot */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,193,253,0.08)', border: '1px solid rgba(0,193,253,0.25)' }}>
            <motion.div className="w-2 h-2 rounded-full bg-[#00c1fd]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[10px] font-black text-[#006688] uppercase tracking-widest">Live</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleLogout}
            className="p-3 rounded-2xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444' }}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </header>

      {/* ══════════════════ MAIN ══════════════════ */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8 pb-24">

        {/* ── Stats ribbon ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 sm:gap-4"
        >
          {[
            { icon: Wifi, label: 'Network Status', value: 'Connected', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
            { icon: Shield, label: 'Security', value: 'Verified', color: '#2559bf', bg: 'rgba(37,89,191,0.07)', border: 'rgba(37,89,191,0.18)' },
            { icon: Zap, label: 'Services', value: `${features.length} Active`, color: '#f97316', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.18)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: stat.bg, border: `1px solid ${stat.border}`, backdropFilter: 'blur(10px)' }}
            >
              <div className="p-2 rounded-xl" style={{ background: `${stat.color}20` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: stat.color, opacity: 0.7 }}>{stat.label}</p>
                <p className="text-xs font-black text-slate-700">{stat.value}</p>
              </div>
              <div className="block sm:hidden">
                <p className="text-xs font-black text-slate-700">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Chat with OWL Banner ── */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.008 }}
          whileTap={{ scale: 0.995 }}
          onClick={() => navigate('/owl-chat')}
          className="relative group w-full text-left cursor-pointer"
        >
          {/* Outer glow */}
          <div className="absolute -inset-1 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700" style={{ background: 'linear-gradient(135deg, #00317e, #2559bf, #00c1fd)' }} />

          <div
            className="relative rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 text-white overflow-hidden flex flex-col sm:flex-row items-center gap-6 sm:gap-10"
            style={{ background: 'linear-gradient(135deg, #00317e 0%, #2559bf 55%, #0077aa 100%)' }}
          >
            {/* Animated shimmer line */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ backgroundPosition: ['200% center', '-200% center'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)',
                backgroundSize: '400% 100%',
              }}
            />

            {/* Glow blobs */}
            <div className="absolute top-[-20%] right-[-5%] w-80 h-80 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #00c1fd, transparent 70%)', filter: 'blur(40px)' }} />
            <div className="absolute bottom-[-30%] left-[15%] w-56 h-56 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #7dd3fc, transparent 70%)', filter: 'blur(40px)' }} />

            {/* Decorative corner grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Owl */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 15 }}
              className="relative z-10 shrink-0 drop-shadow-2xl"
            >
              <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: 'radial-gradient(circle, #00c1fd, transparent 60%)' }} />
              <OwlCharacter className="w-32 h-32 sm:w-48 sm:h-48 relative z-10" />
            </motion.div>

            {/* Text */}
            <div className="relative z-10 flex-1 space-y-3 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: 'rgba(0,193,253,0.2)', border: '1px solid rgba(0,193,253,0.35)', color: '#7de8ff' }}>
                  ✦ AI Campus Assistant
                </div>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tighter leading-[1.05]">
                Chat with{' '}
                <span style={{ background: 'linear-gradient(90deg, #fde68a, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OWL</span>
              </h2>
              <p className="text-blue-100 text-base sm:text-lg font-medium opacity-75 leading-relaxed max-w-lg">
                Ask about enrollment, find rooms, check schedules, and get instant campus assistance.
              </p>
              <motion.div
                className="inline-flex items-center gap-2 font-black text-sm uppercase tracking-widest pt-1"
                style={{ color: '#7de8ff' }}
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Start Chatting <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </motion.button>

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between px-2"
        >
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <div className="h-7 w-1.5 rounded-full" style={{ background: 'linear-gradient(180deg, #00317e, #2559bf)' }} />
              <div className="h-7 w-1 rounded-full opacity-30" style={{ background: 'linear-gradient(180deg, #00317e, #2559bf)' }} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase" style={{ color: '#0f172a' }}>Dashboard Services</h3>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs tracking-widest">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">LIVE KIOSK TERMINAL</span>
          </div>
        </motion.div>

        {/* ── Feature Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
        >
          {features.map((feature) => (
            <motion.button
              key={feature.id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2, ease: 'easeOut' } }}
              onClick={() => navigate(`/feature/${feature.id}`)}
              onHoverStart={() => setHoveredCard(feature.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group relative text-left flex flex-col gap-5 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: '2rem',
                padding: '2rem',
                boxShadow: hoveredCard === feature.id
                  ? `0 20px 50px ${feature.glow}, 0 4px 16px rgba(0,0,0,0.06)`
                  : '0 4px 16px rgba(0,49,126,0.04), 0 1px 4px rgba(0,0,0,0.03)',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              {/* Top-left accent bar */}
              <div
                className="absolute top-0 left-6 h-0.5 w-8 rounded-full opacity-0 group-hover:opacity-100 group-hover:w-16 transition-all duration-500"
                style={{ background: `linear-gradient(90deg, ${feature.glow.replace('0.25', '1')}, transparent)` }}
              />

              {/* Icon */}
              <div
                className={`w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-[1.2rem] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 relative`}
              >
                <feature.icon className="w-8 h-8" />
                {/* Icon glow */}
                <div className="absolute inset-0 rounded-[1.2rem] opacity-0 group-hover:opacity-60 transition-opacity blur-md" style={{ background: `linear-gradient(135deg, ${feature.glow.replace('0.25', '0.8')})` }} />
              </div>

              {/* Text */}
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg sm:text-xl font-black tracking-tighter leading-tight transition-colors duration-200" style={{ color: hoveredCard === feature.id ? '#00317e' : '#0f172a' }}>
                  {feature.title}
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed text-sm line-clamp-2">
                  {feature.description}
                </p>
              </div>

              {/* CTA arrow */}
              <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" style={{ color: '#2559bf' }}>
                Access Now <ArrowRight className="w-3.5 h-3.5" />
              </div>

              {/* Ghost icon */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.04] pointer-events-none group-hover:opacity-[0.07] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700">
                <feature.icon className="w-28 h-28 text-slate-900" />
              </div>

              {/* Shimmer on hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-[2rem]"
                animate={hoveredCard === feature.id ? { backgroundPosition: ['200% center', '-200% center'] } : {}}
                transition={{ duration: 1.2, ease: 'linear' }}
                style={{
                  background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                  backgroundSize: '400% 100%',
                }}
              />
            </motion.button>
          ))}
        </motion.div>
      </main>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer
        className="relative z-10 px-6 sm:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-6"
        style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,49,126,0.08)' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <img src={schoolLogo} alt="Universidad de Dagupan" className="h-10 sm:h-12 object-contain opacity-75 hover:opacity-100 transition-opacity" />
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div>
            <p className="text-slate-500 font-bold text-xs sm:text-sm tracking-tight">© 2025 UNIVERSIDAD DE DAGUPAN</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 opacity-70 mt-0.5">OWL KIOSK OS v2.0</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}
          >
            <motion.div className="w-2 h-2 bg-emerald-500 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            System Online
          </div>
          <p className="text-slate-400 font-black text-[10px] sm:text-xs tracking-widest">
            TERMINAL ID: <span className="text-slate-700">KIOSK-SE-01</span>
          </p>
        </div>
      </footer>

      {/* Font imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;700;800&display=swap');
      `}</style>
    </div>
  );
}
