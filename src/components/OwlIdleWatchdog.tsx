import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Hand } from 'lucide-react';
import { OwlCharacter } from './OwlCharacter';
import { speak, cancelSpeech } from '../lib/owlSpeech';
import { useOwlAssistant } from '../context/OwlAssistantContext';

const IDLE_TIMEOUT_MS = 40_000; // 40 seconds of inactivity before OWL shows up
const COUNTDOWN_SECONDS = 10;   // 10 seconds countdown before returning to StartPage (/)

/**
 * OwlIdleWatchdog — Global Kiosk Idle Timer & Sleep Prompt
 *
 * - Monitors user activity across kiosk pages (/home, /feature/*, /owl-chat).
 * - After 40 seconds of inactivity, OWL pops up asking:
 *   "Are you still there? If not, I'm going back to sleep!"
 * - Starts a 10-second countdown. If the user does not respond within 10 seconds,
 *   navigates back to the HomeStart page ('/').
 */
export default function OwlIdleWatchdog() {
  const location = useLocation();
  const navigate = useNavigate();
  const { closeDrawer } = useOwlAssistant();

  const [showPrompt, setShowPrompt] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isTalking, setIsTalking] = useState(false);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const showPromptRef = useRef(false);

  // Pages where the idle timer should NOT run (already on StartPage, mobile QR upload, or admin)
  const isExcludedPath =
    location.pathname === '/' ||
    location.pathname.startsWith('/mobile-upload') ||
    location.pathname.startsWith('/admin');

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const goToSleep = useCallback(() => {
    clearTimers();
    cancelSpeech();
    setIsTalking(false);
    showPromptRef.current = false;
    setShowPrompt(false);
    closeDrawer();
    navigate('/');
  }, [clearTimers, closeDrawer, navigate]);

  const startIdleTimer = useCallback(() => {
    clearTimers();
    if (isExcludedPath) return;

    idleTimerRef.current = setTimeout(() => {
      showPromptRef.current = true;
      setCountdown(COUNTDOWN_SECONDS);
      setShowPrompt(true);

      // Have OWL speak the idle prompt
      speak("Hey there! Are you still there? If not, I'm going to sleep in 10 seconds.", {
        onStart: () => setIsTalking(true),
        onEnd: () => setIsTalking(false),
        onError: () => setIsTalking(false),
      });
    }, IDLE_TIMEOUT_MS);
  }, [clearTimers, isExcludedPath]);

  const handleStayAwake = useCallback(() => {
    cancelSpeech();
    setIsTalking(false);
    showPromptRef.current = false;
    setShowPrompt(false);
    setCountdown(COUNTDOWN_SECONDS);
    startIdleTimer();
  }, [startIdleTimer]);

  // Manage the 10-second countdown when the prompt is visible
  useEffect(() => {
    if (!showPrompt) return;

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          goToSleep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [showPrompt, goToSleep]);

  // Listen for user activity to reset the 40-second idle timer
  useEffect(() => {
    if (isExcludedPath) {
      clearTimers();
      showPromptRef.current = false;
      setShowPrompt(false);
      return;
    }

    startIdleTimer();

    let lastReset = Date.now();
    const onUserActivity = () => {
      // If the prompt is already showing, require explicit tap on the modal/button
      // or tap anywhere if desired — here we only throttle resets while browsing
      if (showPromptRef.current) return;
      const now = Date.now();
      if (now - lastReset < 250) return;
      lastReset = now;
      startIdleTimer();
    };

    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'pointermove',
      'mousedown',
      'touchstart',
      'keydown',
      'wheel',
      'scroll',
      'click',
    ];

    events.forEach((evt) => window.addEventListener(evt, onUserActivity, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onUserActivity));
      clearTimers();
    };
  }, [isExcludedPath, location.pathname, startIdleTimer, clearTimers]);

  if (isExcludedPath) return null;

  const progressFraction = countdown / COUNTDOWN_SECONDS;
  const circleRadius = 38;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progressFraction);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleStayAwake}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 select-none"
          style={{
            background: 'rgba(6, 20, 46, 0.78)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden text-center p-8 sm:p-10"
            style={{
              background: 'linear-gradient(165deg, #0b2244 0%, #07162c 100%)',
              border: '2px solid rgba(96, 165, 250, 0.35)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.65), 0 0 40px rgba(37, 99, 235, 0.25)',
            }}
          >
            {/* Subtle top glow */}
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(56,189,248,0.22) 0%, transparent 70%)',
              }}
            />

            {/* OWL Character + Countdown Ring */}
            <div className="relative mx-auto w-44 h-44 flex items-center justify-center mb-4">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-40 h-40"
              >
                <OwlCharacter isTalking={isTalking} className="w-full h-full" />
              </motion.div>

              {/* Floating Countdown Ring Badge */}
              <div
                className="absolute -top-2 -right-2 w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: '#0f172a',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
                }}
              >
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
                  <circle
                    cx="44"
                    cy="44"
                    r={circleRadius}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.2)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="44"
                    cy="44"
                    r={circleRadius}
                    fill="none"
                    stroke={countdown <= 3 ? '#f87171' : '#38bdf8'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="font-extrabold leading-none"
                    style={{
                      fontSize: 22,
                      color: countdown <= 3 ? '#f87171' : '#ffffff',
                    }}
                  >
                    {countdown}s
                  </span>
                </div>
              </div>
            </div>

            {/* Speech Bubble */}
            <div
              className="rounded-2xl px-6 py-4 mb-6 mx-auto"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
              }}
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Are you still there? 🦉
              </h2>
              <p className="text-base sm:text-lg text-sky-100/90 font-medium leading-relaxed">
                I haven&apos;t noticed any activity for a while. If no one is here, I&apos;m going to sleep in{' '}
                <span className="font-extrabold text-amber-300">{countdown} second{countdown !== 1 ? 's' : ''}</span>!
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden mb-7">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progressFraction * 100}%`,
                  background:
                    countdown <= 3
                      ? 'linear-gradient(90deg, #ef4444, #f97316)'
                      : 'linear-gradient(90deg, #38bdf8, #3b82f6)',
                  transition: 'width 0.95s linear',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={handleStayAwake}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
                  boxShadow: '0 10px 25px rgba(37, 99, 235, 0.45)',
                }}
              >
                <Hand className="w-5 h-5" />
                Yes, I&apos;m still here!
              </button>

              <button
                type="button"
                onClick={goToSleep}
                className="w-full sm:w-auto py-4 px-5 rounded-2xl font-semibold text-base text-slate-300 hover:text-white flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <Moon className="w-4 h-4" />
                Sleep Now
              </button>
            </div>

            <p className="mt-4 text-xs font-medium text-slate-400">
              Tap anywhere on the screen to stay awake
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

