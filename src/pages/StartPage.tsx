import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import owlLogo from '../assets/app-logo.png';

// --- Floating particle component ---
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function FloatingParticles() {
  const particles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 5,
    opacity: 0.08 + Math.random() * 0.18,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, #00c1fd, #2559bf)`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// --- Clock ---
function useLiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`);
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return { time, date };
}

// --- Main Component ---
export default function StartPage() {
  const navigate = useNavigate();
  const { time, date } = useLiveClock();
  const [pressed, setPressed] = useState(false);

  const handleBegin = () => {
    setPressed(true);
    setTimeout(() => navigate('/home'), 400);
  };

  return (
    <motion.div
      className="h-screen w-screen overflow-hidden flex flex-col relative select-none"
      style={{
        fontFamily: "'Hanken Grotesk', sans-serif",
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 40%, #dff3ff 100%)',
      }}
      animate={pressed ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Deep background mesh ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            top: '-15%', right: '-10%',
            width: 900, height: 900,
            background: 'radial-gradient(circle, rgba(0,193,253,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: '-15%', left: '-10%',
            width: 700, height: 700,
            background: 'radial-gradient(circle, rgba(0,49,126,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: '40%', left: '40%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(37,89,191,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* ── Floating particles ── */}
      <FloatingParticles />

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,49,126,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,49,126,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ══════════════════════════════════
          HEADER
      ══════════════════════════════════ */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex justify-between items-center w-full px-12 py-5"
      >
        {/* Brand mark */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, #00317e, #2559bf)',
              boxShadow: '0 4px 14px rgba(0,49,126,0.3)',
            }}
          >
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: 22 }}
            >
              local_library
            </span>
          </div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.12em] text-[#00317e]"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              OWL Kiosk
            </p>
            <p className="text-[10px] text-[#6b7089] tracking-wide">Student AI Assistant</p>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-5">
          {/* Clock */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,49,126,0.1)',
              boxShadow: '0 2px 10px rgba(0,49,126,0.06)',
            }}
          >
            <span className="material-symbols-outlined text-[#00317e]" style={{ fontSize: 16 }}>schedule</span>
            <span
              className="text-sm font-bold uppercase text-[#00317e] tracking-wider tabular-nums"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              {time}
            </span>
          </div>
          {/* Live badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(0,193,253,0.1)',
              border: '1px solid rgba(0,193,253,0.3)',
            }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-[#00c1fd]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span
              className="text-sm font-bold text-[#006688] uppercase tracking-wider"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Live
            </span>
          </div>
        </div>
      </motion.header>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 gap-0">

        {/* OWL Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 relative"
        >
          {/* Glow ring behind logo */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,193,253,0.3) 0%, transparent 70%)',
              filter: 'blur(20px)',
              transform: 'scale(1.4)',
            }}
            animate={{ scale: [1.4, 1.6, 1.4], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="relative flex items-center justify-center rounded-full overflow-hidden"
            style={{
              width: 140,
              height: 140,
              background: 'linear-gradient(145deg, #ffffff, #e8f0fe)',
              boxShadow:
                '0 20px 60px rgba(0,49,126,0.2), 0 0 0 1px rgba(0,49,126,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <img
              src={owlLogo}
              alt="OWL Logo"
              className="w-full h-full object-cover"
              style={{
                transform: 'scale(1.087)',
                filter: 'drop-shadow(0 4px 12px rgba(0,49,126,0.25))',
              }}
            />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-3"
        >
          <h1
            className="font-extrabold tracking-tight leading-none mb-4"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              background: 'linear-gradient(135deg, #00317e 0%, #2559bf 50%, #00c1fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Welcome to OWL
          </h1>
          <p
            className="text-lg font-medium leading-relaxed"
            style={{
              color: '#434653',
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            Your Smart AI-Integrated Student Assistant
          </p>
        </motion.div>

        {/* Decorative divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-10 mt-2"
          style={{
            width: 80,
            height: 3,
            borderRadius: 99,
            background: 'linear-gradient(90deg, #00317e, #00c1fd)',
          }}
        />

        {/* ── Touch to Begin CTA ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Outer pulse rings */}
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid rgba(0,49,126,0.25)' }}
              animate={{ scale: [1, 1.35 + i * 0.15], opacity: [0.5, 0] }}
              transition={{
                duration: 2.2,
                delay: i * 0.6,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}

          <motion.button
            onClick={handleBegin}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative flex items-center gap-4 rounded-full font-bold text-white cursor-pointer"
            style={{
              fontSize: 22,
              paddingInline: 56,
              paddingBlock: 26,
              background: 'linear-gradient(135deg, #00317e 0%, #2559bf 60%, #006688 100%)',
              boxShadow:
                '0 16px 48px rgba(0,49,126,0.4), 0 4px 16px rgba(0,193,253,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              letterSpacing: '0.01em',
              border: 'none',
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}
          >
            {/* Glass sheen */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
              }}
            />
            <span style={{ position: 'relative' }}>Touch to Begin</span>
            <motion.span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: 30, position: 'relative' }}
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              touch_app
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Date & guest info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <p
            className="text-sm text-[#8590a6] tracking-wide"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {date}
          </p>
          <div className="flex items-center gap-2 text-[#8590a6] text-xs font-semibold uppercase tracking-widest">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
            <span>Guest Mode — No login required</span>
          </div>
        </motion.div>
      </main>

      {/* ── Footer bar ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="relative z-10 flex justify-center items-center py-4"
      >
        <p className="text-[10px] text-[#b0b7cc] tracking-widest uppercase"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          Powered by OWL AI · Universidad de Dagupan
        </p>
      </motion.footer>

      {/* ── Keyframes injected ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;700;800&family=Work+Sans:wght@500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>
    </motion.div>
  );
}
