// ─────────────────────────────────────────────────────────────────────────────
// Transport.tsx – Campus Transport feature (Enhanced Shell — Option A)
//
// Keeps the SakayUDD iframe as the primary live tracker while adding a
// premium interactive wrapper with tabs, quick stats, a route map, a
// departure schedule, and a how-to-ride guide.
//
// SakayUDD is an official Universidad de Dagupan thesis project. We embed
// their service with respect and attribution via the Live Tracker tab.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, Map, CalendarClock, BookOpen } from 'lucide-react';

import TransportHero from './transport/TransportHero';
import TransportQuickStats from './transport/TransportQuickStats';
import TransportLiveTracker from './transport/TransportLiveTracker';
import TransportRouteMap from './transport/TransportRouteMap';
import TransportSchedule from './transport/TransportSchedule';
import TransportHowToRide from './transport/TransportHowToRide';
import TransportSidebar from './transport/TransportSidebar';

// Leaflet CSS must be imported globally for map rendering
import 'leaflet/dist/leaflet.css';

type TabId = 'live' | 'map' | 'schedule' | 'guide';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: Tab[] = [
  {
    id: 'live',
    label: 'Live Tracker',
    icon: <Wifi className="w-4 h-4" />,
    description: 'Real-time e-jeepney location',
  },
  {
    id: 'map',
    label: 'Route Map',
    icon: <Map className="w-4 h-4" />,
    description: 'Interactive stop map',
  },
  {
    id: 'schedule',
    label: 'Schedules',
    icon: <CalendarClock className="w-4 h-4" />,
    description: 'Departure timetable',
  },
  {
    id: 'guide',
    label: 'How to Ride',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Rider guide & tips',
  },
];

export default function Transport() {
  const [activeTab, setActiveTab] = useState<TabId>('live');

  return (
    <div className="space-y-5">
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <TransportHero />

      {/* ── Quick Stats Row ──────────────────────────────────── */}
      <TransportQuickStats />

      {/* ── Tab Navigation ──────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-2">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-[1.5rem] text-xs font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-100'
                  : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-0 bg-orange-500 rounded-[1.5rem]"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
              <span className={`relative z-10 text-[10px] font-medium hidden md:block ${
                activeTab === tab.id ? 'text-orange-100' : 'text-slate-400'
              }`}>
                {tab.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content + Sidebar ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 items-start">
        {/* Tab content */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              {activeTab === 'live'     && <TransportLiveTracker />}
              {activeTab === 'map'      && <TransportRouteMap />}
              {activeTab === 'schedule' && <TransportSchedule />}
              {activeTab === 'guide'    && <TransportHowToRide />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar — always visible */}
        <div className="xl:sticky xl:top-24">
          <TransportSidebar />
        </div>
      </div>
    </div>
  );
}
