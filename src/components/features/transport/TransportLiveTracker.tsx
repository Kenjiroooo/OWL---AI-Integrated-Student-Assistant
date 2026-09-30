// ─────────────────────────────────────────────────────────────────────────────
// TransportLiveTracker.tsx – iframe wrapper with loading skeleton for SakayUDD
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, RefreshCw, Wifi } from 'lucide-react';

const SAKAYUDD_URL = 'https://uddsoe-sakayudd.firebaseapp.com/';

function LoadingSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 animate-pulse">
      {/* Fake nav bar */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
        <div className="h-6 w-20 bg-slate-200 rounded-lg" />
      </div>
      {/* Fake map area */}
      <div className="flex-1 bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.8s infinite',
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3 text-slate-400">
          <Wifi className="w-10 h-10 animate-pulse" />
          <p className="text-sm font-semibold">Loading Live Tracker…</p>
          <p className="text-xs">Connecting to SakayUDD</p>
        </div>
      </div>
      {/* Fake bottom row */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-slate-200 rounded-xl" />
        <div className="h-10 flex-1 bg-slate-200 rounded-xl" />
        <div className="h-10 w-24 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function TransportLiveTracker() {
  const [loaded, setLoaded] = useState(false);
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setLoaded(false);
    setKey(k => k + 1);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            SakayUDD Live Tracker
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <a
            href={SAKAYUDD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Full Site
          </a>
        </div>
      </div>

      {/* iframe container */}
      <div className="relative w-full h-[600px] bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <AnimatePresence>
          {!loaded && (
            <motion.div
              key="skeleton"
              className="absolute inset-0 bg-white z-10"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LoadingSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        <iframe
          key={key}
          src={SAKAYUDD_URL}
          className="w-full h-full border-0"
          title="SakayUDD E-Jeepney Live Tracker"
          onLoad={() => setLoaded(true)}
          allow="geolocation"
        />
      </div>

      {/* Attribution */}
      <p className="text-center text-[11px] text-slate-400 font-medium">
        Live tracking powered by{' '}
        <a
          href={SAKAYUDD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 hover:text-orange-600 font-bold underline underline-offset-2"
        >
          SakayUDD
        </a>
        {' '}— an official Universidad de Dagupan thesis project. All tracking rights belong to the SakayUDD team.
      </p>
    </div>
  );
}
