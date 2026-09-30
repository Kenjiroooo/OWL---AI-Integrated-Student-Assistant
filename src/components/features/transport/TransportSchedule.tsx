// ─────────────────────────────────────────────────────────────────────────────
// TransportSchedule.tsx – Departure timetable cards with time-based highlighting
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Sun, CloudSun, Sunset, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { TRANSPORT_ROUTES, Route } from '../../../data/transportData';

type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'evening';

function getTimeOfDay(timeStr: string): TimeOfDay {
  const [hourMin, ampm] = timeStr.split(' ');
  let [h] = hourMin.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  if (h < 10) return 'morning';
  if (h < 12) return 'midday';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function isPast(timeStr: string): boolean {
  const now = new Date();
  const [hourMin, ampm] = timeStr.split(' ');
  let [h, m] = hourMin.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const t = new Date(now); t.setHours(h, m, 0, 0);
  return t < now;
}

function isNext(timeStr: string, schedule: string[]): boolean {
  const firstFuture = schedule.find(t => !isPast(t));
  return firstFuture === timeStr;
}

const periodConfig = {
  morning:   { label: 'Early Morning', icon: Sun,      color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  midday:    { label: 'Mid-Morning',   icon: CloudSun,  color: 'text-sky-500',     bg: 'bg-sky-50',     border: 'border-sky-100' },
  afternoon: { label: 'Afternoon',     icon: Sunset,    color: 'text-orange-500',  bg: 'bg-orange-50',  border: 'border-orange-100' },
  evening:   { label: 'Evening',       icon: Moon,      color: 'text-violet-500',  bg: 'bg-violet-50',  border: 'border-violet-100' },
};

function groupByPeriod(schedule: string[]) {
  const groups: Record<TimeOfDay, string[]> = {
    morning: [], midday: [], afternoon: [], evening: [],
  };
  for (const t of schedule) {
    groups[getTimeOfDay(t)].push(t);
  }
  return groups;
}

interface ScheduleGroupProps {
  key?: React.Key;
  period: TimeOfDay;
  times: string[];
  schedule: string[];
}

function ScheduleGroup({ period, times, schedule }: ScheduleGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  if (times.length === 0) return null;
  const cfg = periodConfig[period];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-[1.5rem] border ${cfg.border} shadow-sm overflow-hidden`}
    >
      {/* Group header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={`w-full flex items-center justify-between px-5 py-4 ${cfg.bg} hover:brightness-95 transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`${cfg.color} p-2 rounded-xl bg-white/70`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={`font-black text-sm ${cfg.color}`}>{cfg.label}</span>
          <span className="text-[10px] font-bold bg-white/70 text-slate-500 px-2 py-0.5 rounded-full">
            {times.length} trips
          </span>
        </div>
        {collapsed
          ? <ChevronDown className="w-4 h-4 text-slate-400" />
          : <ChevronUp className="w-4 h-4 text-slate-400" />
        }
      </button>

      {/* Time grid */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {times.map(t => {
                const past = isPast(t);
                const next = isNext(t, schedule);
                return (
                  <motion.div
                    key={t}
                    whileHover={!past ? { scale: 1.04 } : {}}
                    className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${
                      next
                        ? 'text-white border-transparent shadow-lg scale-[1.03]'
                        : past
                        ? 'bg-slate-50 border-slate-100 text-slate-300 line-through'
                        : `${cfg.bg} ${cfg.border} ${cfg.color} hover:shadow-md`
                    }`}
                    style={next ? {
                      background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                      backgroundColor: '#f97316',
                    } : {}}
                  >
                    {next && (
                      <motion.div
                        className="absolute -top-1.5 -right-1.5 bg-green-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider z-10"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        NEXT
                      </motion.div>
                    )}
                    {t}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TransportSchedule() {
  const [activeRoute, setActiveRoute] = useState(TRANSPORT_ROUTES[0].id);
  const [dayType, setDayType] = useState<'weekday' | 'saturday'>('weekday');

  const selected = TRANSPORT_ROUTES.find(r => r.id === activeRoute) ?? TRANSPORT_ROUTES[0];
  const schedule = dayType === 'weekday' ? selected.weekdaySchedule : selected.saturdaySchedule;
  const groups = groupByPeriod(schedule);

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Route selector */}
        <div className="flex gap-2">
          {TRANSPORT_ROUTES.map(route => (
            <button
              key={route.id}
              onClick={() => setActiveRoute(route.id)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all duration-200 ${
                activeRoute === route.id
                  ? 'text-white shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              style={
                activeRoute === route.id
                  ? { backgroundColor: route.color, borderColor: route.color }
                  : {}
              }
            >
              {route.shortName}
            </button>
          ))}
        </div>

        {/* Day type toggle */}
        <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
          {(['weekday', 'saturday'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDayType(d)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                dayType === d
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {d === 'weekday' ? 'Mon – Fri' : 'Saturday'}
            </button>
          ))}
        </div>
      </div>

      {/* Route info */}
      <div className="bg-white rounded-2xl border border-slate-100 px-5 py-3 flex items-center gap-3 shadow-sm">
        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
        <p className="text-slate-600 text-sm font-medium">
          <span className="font-black text-slate-800">{selected.name}</span> ·{' '}
          {schedule.length} trips · {selected.fare} · {selected.duration} per loop
        </p>
      </div>

      {/* Schedule groups */}
      <div className="flex flex-col gap-3">
        {(Object.entries(groups) as [TimeOfDay, string[]][]).map(([period, times]) => (
          <ScheduleGroup key={period} period={period} times={times} schedule={schedule} />
        ))}
      </div>

      <p className="text-center text-[11px] text-slate-400 font-medium">
        Schedules are approximate. Actual departure times may vary due to traffic conditions.
      </p>
    </div>
  );
}
