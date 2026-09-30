// ─────────────────────────────────────────────────────────────────────────────
// TransportQuickStats.tsx – At-a-glance stat cards for the transport feature
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Route, Banknote } from 'lucide-react';
import { TRANSPORT_ROUTES, getNextDeparture, getMinutesUntilNext } from '../../../data/transportData';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function TransportQuickStats() {
  const [nextDeparture, setNextDeparture] = useState<string | null>(null);
  const [minsLeft, setMinsLeft] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const nd = getNextDeparture(TRANSPORT_ROUTES[0]);
      const ml = getMinutesUntilNext(TRANSPORT_ROUTES[0]);
      setNextDeparture(nd);
      setMinsLeft(ml);
    };
    update();
    const id = setInterval(update, 30000); // refresh every 30s
    return () => clearInterval(id);
  }, []);

  const isWeekday = new Date().getDay() >= 1 && new Date().getDay() <= 5;

  const stats: StatCard[] = [
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Next Departure',
      value: nextDeparture ?? 'No more trips',
      sub: minsLeft !== null ? `in ${minsLeft} min` : 'See you tomorrow',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Pickup Point',
      value: 'Main Gate',
      sub: 'Primary terminal stop',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
    {
      icon: <Route className="w-5 h-5" />,
      label: 'Active Routes',
      value: '2 Routes',
      sub: isWeekday ? 'Weekday schedule' : 'Saturday schedule',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
    },
    {
      icon: <Banknote className="w-5 h-5" />,
      label: 'Student Fare',
      value: 'FREE',
      sub: 'Route A with valid ID',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className={`bg-white rounded-2xl border ${stat.borderColor} p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          <div className={`${stat.bgColor} ${stat.color} p-2.5 rounded-xl shrink-0`}>
            {stat.icon}
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
              {stat.label}
            </p>
            <p className={`${stat.color} text-sm font-black leading-tight`}>
              {stat.value}
            </p>
            {stat.sub && (
              <p className="text-slate-400 text-[10px] font-medium mt-0.5 truncate">
                {stat.sub}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
