// ─────────────────────────────────────────────────────────────────────────────
// TransportHero.tsx – Animated hero banner for the Campus Transport feature
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bus, Wifi, MapPin } from 'lucide-react';

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

export default function TransportHero() {
  const time = useLiveClock();

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 shadow-2xl shadow-orange-200 text-white"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-rose-400/20 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Animated bus path track */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
        <motion.div
          className="h-full w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ['-10%', '110%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative z-10 px-8 py-7 flex flex-col gap-4">
        {/* Top row: title + live badge + clock */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Animated bus icon container */}
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm p-3.5 rounded-2xl border border-white/30">
                <motion.div
                  animate={{ x: [0, 3, 0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Bus className="w-7 h-7 text-white" />
                </motion.div>
              </div>
              {/* Pulsing dot */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-orange-500"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-3xl font-black italic tracking-tight leading-none">
                  SakayUDD
                </h2>
                <span className="bg-green-400 text-green-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Wifi className="w-2.5 h-2.5" />
                  LIVE
                </span>
              </div>
              <p className="text-orange-100 text-sm font-medium mt-0.5">
                Campus E-Jeepney Transport System
              </p>
            </div>
          </div>

          {/* Clock */}
          <div className="text-right">
            <div className="text-2xl font-black tabular-nums tracking-tight">{time}</div>
            <div className="text-orange-200 text-xs font-medium uppercase tracking-widest">
              {new Date().toLocaleDateString('en-PH', { weekday: 'long' })}
            </div>
          </div>
        </div>

        {/* Description + stop indicators */}
        <div className="flex items-center justify-between">
          <p className="text-orange-100 text-sm font-medium max-w-xl leading-relaxed">
            Track your e-jeepney in real-time, view route stops, check departure schedules, 
            and learn how to ride. Powered by SakayUDD — an official UdD transport thesis project.
          </p>

          {/* Route pills */}
          <div className="flex gap-2 ml-4 shrink-0">
            {['Route A', 'Route B'].map((r, i) => (
              <div
                key={r}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold"
              >
                <MapPin className="w-3 h-3" />
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Large decorative bus silhouette */}
      <Bus className="absolute -right-10 top-1/2 -translate-y-1/2 w-52 h-52 text-white/8 -rotate-12 pointer-events-none" />
    </motion.div>
  );
}
