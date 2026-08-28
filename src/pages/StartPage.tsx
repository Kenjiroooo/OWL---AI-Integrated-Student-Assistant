import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ───
type Phase = 'sleeping' | 'waking' | 'greeting' | 'transitioning';

// ─── Floating Stars ───
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function FloatingStars() {
  const stars: Star[] = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 3,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 4,
    opacity: 0.15 + Math.random() * 0.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: '#ffffff',
          }}
          animate={{
            opacity: [s.opacity, s.opacity * 0.2, s.opacity],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Zzz Sleep Indicators ───
function SleepZzz() {
  return (
    <div className="absolute pointer-events-none" style={{ top: '-10%', right: '-20%' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute font-bold select-none"
          style={{
            fontSize: 20 + i * 10,
            color: 'rgba(255,255,255,0.5)',
            fontFamily: "'Hanken Grotesk', sans-serif",
            right: i * 20,
            top: -i * 30,
          }}
          animate={{
            y: [0, -20 - i * 10],
            opacity: [0.7, 0],
            x: [0, 8 + i * 5],
          }}
          transition={{
            duration: 2,
            delay: i * 0.6,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          Z
        </motion.span>
      ))}
    </div>
  );
}

// ─── Typewriter Hook ───
function useTypewriter(text: string, active: boolean, speed: number = 40) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed('');
      setDone(false);
      return;
    }
    let i = 0;
    setDisplayed('');
    setDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { displayed, done };
}

// ─── Time-aware greeting ───
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning!';
  if (hour < 18) return 'Good afternoon!';
  return 'Good evening!';
}

// ─── Live Clock ───
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

// ─── Sleeping OWL SVG ───
// Uses the same geometry as OwlCharacter.tsx with sleeping/waking eye states
function SleepingOwlSvg({ phase, isTalking }: { phase: Phase; isTalking: boolean }) {
  const isAwake = phase !== 'sleeping';

  // Beak flicker for talking (same logic as OwlCharacter.tsx)
  const [beakOpen, setBeakOpen] = useState(false);
  useEffect(() => {
    if (!isTalking) {
      setBeakOpen(false);
      return;
    }
    let timeout: ReturnType<typeof setTimeout>;
    const flicker = () => {
      setBeakOpen((prev) => !prev);
      timeout = setTimeout(flicker, 80 + Math.random() * 120);
    };
    flicker();
    return () => clearTimeout(timeout);
  }, [isTalking]);

  const upperBeakPath = 'M 118 138 Q 128 128 138 138 L 128 150 Z';
  const lowerBeakOpenPath = `M 118 142 L 128 150 L 138 142 Q 128 ${beakOpen ? '170' : '158'} 118 142 Z`;

  // Pupil positions (centered, awake)
  const pupilX = [100, 156];
  const pupilY = 115;

  return (
    <svg viewBox="0 0 256 256" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="128" cy="235" rx="60" ry="8" fill="#0a2949" />

      {/* Talons */}
      <rect x="90" y="215" width="20" height="24" rx="10" fill="#f6c342" stroke="#0a2949" strokeWidth="6" />
      <rect x="110" y="215" width="20" height="24" rx="10" fill="#f6c342" stroke="#0a2949" strokeWidth="6" />
      <rect x="126" y="215" width="20" height="24" rx="10" fill="#f6c342" stroke="#0a2949" strokeWidth="6" />
      <rect x="146" y="215" width="20" height="24" rx="10" fill="#f6c342" stroke="#0a2949" strokeWidth="6" />

      {/* Wings */}
      <path d="M 70 120 C 30 150 40 220 80 230 C 70 190 80 150 90 120 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />
      <path d="M 186 120 C 226 150 216 220 176 230 C 186 190 176 150 166 120 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

      {/* Main Body */}
      <path d="M 80 100 C 40 160 60 225 128 225 C 196 225 216 160 176 100 C 150 70 106 70 80 100 Z" fill="#1878a9" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

      {/* Belly Circuit Pattern */}
      <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 128 200 L 128 175" />
        <path d="M 128 190 L 145 175" />
        <path d="M 128 180 L 105 160" />
        <path d="M 115 168 L 100 178" />
        <path d="M 135 183 L 150 193" />
      </g>
      <g fill="#ffffff">
        <circle cx="105" cy="160" r="5" />
        <circle cx="145" cy="175" r="5" />
        <circle cx="100" cy="178" r="5" />
        <circle cx="150" cy="193" r="5" />
      </g>

      {/* Face Mask */}
      <path d="M 60 110 C 60 150 100 160 128 140 C 156 160 196 150 196 110 C 196 70 150 80 128 90 C 106 80 60 70 60 110 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

      {/* Eyes — sleeping = closed arcs, awake = full circles */}
      {isAwake ? (
        <>
          {/* Open eyes (same as OwlCharacter.tsx) */}
          <circle cx="95" cy="115" r="28" fill="#ffffff" stroke="#0a2949" strokeWidth="6" />
          <circle cx="161" cy="115" r="28" fill="#ffffff" stroke="#0a2949" strokeWidth="6" />

          {/* Pupils */}
          <motion.circle
            cx={pupilX[0]} cy={pupilY} r="18" fill="#0a2949"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
          />
          <motion.circle
            cx={pupilX[1]} cy={pupilY} r="18" fill="#0a2949"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
          />

          {/* Pupil highlights */}
          <motion.circle cx={pupilX[0] + 6} cy={pupilY - 7} r="6" fill="#ffffff"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} />
          <motion.circle cx={pupilX[1] + 6} cy={pupilY - 7} r="6" fill="#ffffff"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} />
          <motion.circle cx={pupilX[0] - 5} cy={pupilY + 7} r="2.5" fill="#ffffff"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} />
          <motion.circle cx={pupilX[1] - 5} cy={pupilY + 7} r="2.5" fill="#ffffff"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} />
        </>
      ) : (
        <>
          {/* Closed eyes — horizontal arcs representing shut eyelids */}
          <circle cx="95" cy="115" r="28" fill="#ffffff" stroke="#0a2949" strokeWidth="6" />
          <circle cx="161" cy="115" r="28" fill="#ffffff" stroke="#0a2949" strokeWidth="6" />
          {/* Eyelid covers */}
          <path d="M 67 115 Q 95 90 123 115" fill="#0b4c79" stroke="#0a2949" strokeWidth="4" />
          <path d="M 67 115 Q 95 135 123 115" fill="#0b4c79" stroke="#0a2949" strokeWidth="4" />
          <path d="M 133 115 Q 161 90 189 115" fill="#0b4c79" stroke="#0a2949" strokeWidth="4" />
          <path d="M 133 115 Q 161 135 189 115" fill="#0b4c79" stroke="#0a2949" strokeWidth="4" />
          {/* Closed eye lines */}
          <path d="M 72 115 Q 95 125 118 115" fill="none" stroke="#0a2949" strokeWidth="3" strokeLinecap="round" />
          <path d="M 138 115 Q 161 125 184 115" fill="none" stroke="#0a2949" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {/* Beak */}
      {isTalking ? (
        <g>
          <path d={upperBeakPath} fill="#f6c342" stroke="#0a2949" strokeWidth="5" strokeLinejoin="round" />
          <path d={lowerBeakOpenPath} fill="#e8a800" stroke="#0a2949" strokeWidth="5" strokeLinejoin="round" />
          {beakOpen && (
            <path d="M 123 150 Q 128 156 133 150" fill="none" stroke="#c06000" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </g>
      ) : (
        <path d="M 120 135 Q 128 130 136 135 L 128 165 Z" fill="#f6c342" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />
      )}

      {/* Eyebrows */}
      <path d="M 50 90 C 70 70 100 75 128 90 C 156 75 186 70 206 90 C 190 60 160 60 128 75 C 96 60 66 60 50 90 Z" fill="#1878a9" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

      {/* Graduation Cap */}
      <path d="M 85 60 L 80 90 Q 128 100 176 90 L 171 60 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />
      <path d="M 128 20 L 210 50 L 128 80 L 46 50 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

      {/* Tassel */}
      <path d="M 128 50 Q 80 60 70 80" fill="none" stroke="#f6c342" strokeWidth="4" />
      <path d="M 70 80 L 60 110 L 80 110 Z" fill="#f6c342" stroke="#0a2949" strokeWidth="4" strokeLinejoin="round" />
      <path d="M 64 110 L 64 125 M 70 110 L 70 125 M 76 110 L 76 125" stroke="#f6c342" strokeWidth="3" strokeLinecap="round" />
      <circle cx="128" cy="50" r="5" fill="#f6c342" />
    </svg>
  );
}

// ─── Main Component ───
export default function StartPage() {
  const navigate = useNavigate();
  const { time, date } = useLiveClock();
  const [phase, setPhase] = useState<Phase>('sleeping');
  const greetingText = useRef(`${getGreeting()} Welcome to OWL Kiosk`);
  const { displayed, done: typingDone } = useTypewriter(
    greetingText.current,
    phase === 'greeting',
    40
  );

  const handleOwlClick = useCallback(() => {
    if (phase !== 'sleeping') return;

    // Phase 2: Wake up
    setPhase('waking');

    // Phase 3: Start greeting after eyes open
    setTimeout(() => {
      setPhase('greeting');
    }, 900);
  }, [phase]);

  // When typing finishes, wait a beat then transition
  useEffect(() => {
    if (phase === 'greeting' && typingDone) {
      const timer = setTimeout(() => {
        setPhase('transitioning');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [phase, typingDone]);

  // Navigate after transition animation
  useEffect(() => {
    if (phase === 'transitioning') {
      const timer = setTimeout(() => {
        navigate('/home');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, navigate]);

  const isTalking = phase === 'greeting' && !typingDone;

  // Background color transitions
  const bgGradient =
    phase === 'sleeping'
      ? 'radial-gradient(ellipse at 50% 60%, #0f2140 0%, #0a1628 60%, #060e1a 100%)'
      : phase === 'waking'
        ? 'radial-gradient(ellipse at 50% 60%, #142a4f 0%, #0f2140 60%, #0a1628 100%)'
        : phase === 'greeting'
          ? 'radial-gradient(ellipse at 50% 60%, #1a3562 0%, #132a50 60%, #0d1e3a 100%)'
          : 'radial-gradient(ellipse at 50% 50%, #e8f0fe 0%, #dff3ff 50%, #f0f4ff 100%)';

  return (
    <motion.div
      className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative select-none"
      style={{
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}
      animate={{
        background: bgGradient,
      }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      {/* Stars — only visible while dark */}
      <AnimatePresence>
        {phase !== 'transitioning' && (
          <motion.div
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FloatingStars />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient glow behind OWL */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 500,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          background: 'radial-gradient(circle, rgba(24,120,169,0.25) 0%, rgba(11,76,121,0.1) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={
          phase === 'sleeping'
            ? { scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }
            : phase === 'transitioning'
              ? { scale: 3, opacity: 0 }
              : { scale: 1.2, opacity: 1 }
        }
        transition={
          phase === 'sleeping'
            ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 1 }
        }
      />

      {/* Moon — subtle ambient light top-right */}
      <AnimatePresence>
        {phase !== 'transitioning' && (
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              top: '8%',
              right: '12%',
              width: 60,
              height: 60,
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              boxShadow: '0 0 60px 20px rgba(255,255,255,0.05)',
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* ═══ Clock & Date (top) ═══ */}
      <AnimatePresence>
        {phase !== 'transitioning' && (
          <motion.div
            className="absolute top-6 left-0 right-0 flex justify-center z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <span
                className="text-sm font-semibold tracking-widest uppercase tabular-nums"
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: "'Work Sans', sans-serif",
                }}
              >
                {time}
              </span>
              <div
                className="rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: 'rgba(255,255,255,0.25)',
                }}
              />
              <span
                className="text-sm tracking-wide"
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: "'Work Sans', sans-serif",
                }}
              >
                {date}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Central OWL ═══ */}
      <motion.div
        className="relative flex flex-col items-center"
        animate={
          phase === 'sleeping'
            ? { y: [0, -8, 0], scale: 1 }
            : phase === 'waking'
              ? { y: 0, scale: [1, 1.15, 1] }
              : phase === 'transitioning'
                ? { scale: 4, opacity: 0, y: -100 }
                : { y: 0, scale: 1 }
        }
        transition={
          phase === 'sleeping'
            ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
            : phase === 'waking'
              ? { duration: 0.6, ease: 'backOut' }
              : phase === 'transitioning'
                ? { duration: 1, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0.3 }
        }
      >
        {/* OWL container */}
        <motion.div
          className="relative cursor-pointer"
          style={{ width: 280, height: 280 }}
          onClick={handleOwlClick}
          whileHover={phase === 'sleeping' ? { scale: 1.05 } : undefined}
          whileTap={phase === 'sleeping' ? { scale: 0.97 } : undefined}
        >
          {/* Zzz indicators — only in sleeping */}
          <AnimatePresence>
            {phase === 'sleeping' && <SleepZzz />}
          </AnimatePresence>

          <SleepingOwlSvg phase={phase} isTalking={isTalking} />
        </motion.div>

        {/* ═══ Speech bubble (greeting phase) ═══ */}
        <AnimatePresence>
          {(phase === 'greeting' || (phase === 'transitioning')) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={
                phase === 'greeting'
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: -20, scale: 0.8 }
              }
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              className="mt-4 relative"
            >
              {/* Speech bubble triangle */}
              <div
                className="absolute left-1/2 -top-2"
                style={{
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: '10px solid rgba(255,255,255,0.12)',
                }}
              />
              <div
                className="px-8 py-4 rounded-2xl text-center"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  minWidth: 320,
                }}
              >
                <p
                  className="text-lg font-semibold"
                  style={{
                    color: '#ffffff',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    letterSpacing: '0.01em',
                  }}
                >
                  {displayed}
                  {!typingDone && (
                    <motion.span
                      className="inline-block ml-0.5"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      style={{ color: '#00c1fd' }}
                    >
                      |
                    </motion.span>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ "Click the OWL to wake up" label ═══ */}
        <AnimatePresence>
          {phase === 'sleeping' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <motion.p
                className="text-lg font-semibold tracking-wide"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: "'Hanken Grotesk', sans-serif",
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                Click the OWL to wake up
              </motion.p>

              {/* Subtle animated tap icon */}
              <motion.div
                animate={{ y: [0, 5, 0], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                    fill="rgba(255,255,255,0.3)"
                  />
                  <path
                    d="M12 7c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"
                    fill="rgba(255,255,255,0.3)"
                  />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══ Bright wipe overlay for transition ═══ */}
      <AnimatePresence>
        {phase === 'transitioning' && (
          <motion.div
            className="absolute inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #e8f0fe 60%, #dff3ff 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ Footer ═══ */}
      <AnimatePresence>
        {phase !== 'transitioning' && (
          <motion.footer
            className="absolute bottom-4 left-0 right-0 flex justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p
              className="text-xs tracking-widest uppercase"
              style={{
                color: 'rgba(255,255,255,0.2)',
                fontFamily: "'Work Sans', sans-serif",
              }}
            >
              Powered by OWL AI · Universidad de Dagupan
            </p>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* ── Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Work+Sans:wght@500;600;700&display=swap');
      `}</style>
    </motion.div>
  );
}
