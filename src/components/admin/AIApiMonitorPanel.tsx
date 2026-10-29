import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BarChart3,
  RefreshCw,
  Sliders,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Image as ImageIcon,
  ClipboardCheck,
  Play,
  Calendar,
  TrendingUp,
  Layers,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getAIApiUsageHistory,
  recordAIApiRequest,
  saveAIQuotaConfig,
  ENDPOINT_META,
  getLocalDateKey,
  type AIDailyUsageStat,
  type AIRequestLogEntry,
  type AIQuotaConfig,
  type AIEndpointType,
} from '../../lib/aiApiMonitor';

const ENDPOINT_STYLES: Record<
  AIEndpointType,
  {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    barColor: string;
    badgeBg: string;
    badgeText: string;
    shortLabel: string;
  }
> = {
  askOwlChat: {
    icon: MessageSquare,
    gradient: 'from-blue-500 to-sky-500',
    barColor: 'linear-gradient(90deg, #2563eb, #0ea5e9)',
    badgeBg: 'rgba(14,165,233,0.1)',
    badgeText: '#0284c7',
    shortLabel: 'OWL AI Chat',
  },
  moderateContent: {
    icon: ShieldCheck,
    gradient: 'from-indigo-500 to-violet-500',
    barColor: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    badgeBg: 'rgba(99,102,241,0.1)',
    badgeText: '#4f46e5',
    shortLabel: 'Text Moderation',
  },
  moderateImage: {
    icon: ImageIcon,
    gradient: 'from-emerald-500 to-teal-500',
    barColor: 'linear-gradient(90deg, #10b981, #14b8a6)',
    badgeBg: 'rgba(16,185,129,0.1)',
    badgeText: '#059669',
    shortLabel: 'Vision Check',
  },
  moderateEvaluation: {
    icon: ClipboardCheck,
    gradient: 'from-amber-400 to-orange-500',
    barColor: 'linear-gradient(90deg, #f59e0b, #f97316)',
    badgeBg: 'rgba(245,158,11,0.12)',
    badgeText: '#d97706',
    shortLabel: 'Eval Moderation',
  },
};

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeekday(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatLogTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

export default function AIApiMonitorPanel() {
  const [rangeDays, setRangeDays] = useState<7 | 14>(14);
  const [dailyStats, setDailyStats] = useState<AIDailyUsageStat[]>([]);
  const [recentLogs, setRecentLogs] = useState<AIRequestLogEntry[]>([]);
  const [quota, setQuota] = useState<AIQuotaConfig>({
    dailyLimit: 500,
    warningThresholdPct: 80,
  });
  const [quotaInput, setQuotaInput] = useState<string>('500');
  const [quotaSaved, setQuotaSaved] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() =>
    getLocalDateKey()
  );
  const [logFilter, setLogFilter] = useState<'all' | AIEndpointType>('all');
  const [simulatingEndpoint, setSimulatingEndpoint] =
    useState<AIEndpointType>('askOwlChat');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await getAIApiUsageHistory(14);
      setDailyStats(data.dailyStats);
      setRecentLogs(data.recentLogs);
      setQuota(data.quota);
      setQuotaInput(String(data.quota.dailyLimit));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    const handleUpdate = () => {
      void loadData();
    };
    window.addEventListener('owl_ai_api_updated', handleUpdate);
    return () => window.removeEventListener('owl_ai_api_updated', handleUpdate);
  }, [loadData]);

  const todayKey = getLocalDateKey();

  const visibleStats = useMemo(() => {
    return dailyStats.slice(-rangeDays);
  }, [dailyStats, rangeDays]);

  const todayStat = useMemo(() => {
    return (
      dailyStats.find((s) => s.date === todayKey) ||
      dailyStats[dailyStats.length - 1] || {
        date: todayKey,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        rateLimitedRequests: 0,
        totalLatencyMs: 0,
        estimatedTokens: 0,
        byEndpoint: {
          askOwlChat: 0,
          moderateContent: 0,
          moderateImage: 0,
          moderateEvaluation: 0,
        },
        hourly: Array(24).fill(0),
      }
    );
  }, [dailyStats, todayKey]);

  const selectedDayStat = useMemo(() => {
    return (
      dailyStats.find((s) => s.date === selectedDateKey) || todayStat
    );
  }, [dailyStats, selectedDateKey, todayStat]);

  // Aggregate metrics over visible range
  const summaryMetrics = useMemo(() => {
    if (visibleStats.length === 0) {
      return {
        totalPeriodRequests: 0,
        avgRequestsPerDay: 0,
        peakDay: { date: todayKey, count: 0 },
        successRate: 100,
        avgLatencyMs: 0,
        vsAvgPct: 0,
      };
    }

    const totalPeriodRequests = visibleStats.reduce(
      (sum, d) => sum + d.totalRequests,
      0
    );
    const avgRequestsPerDay = Math.round(
      totalPeriodRequests / visibleStats.length
    );

    let peakDay = { date: visibleStats[0].date, count: visibleStats[0].totalRequests };
    visibleStats.forEach((d) => {
      if (d.totalRequests > peakDay.count) {
        peakDay = { date: d.date, count: d.totalRequests };
      }
    });

    const totalSuccess = visibleStats.reduce(
      (sum, d) => sum + d.successfulRequests,
      0
    );
    const successRate =
      totalPeriodRequests > 0
        ? Math.round((totalSuccess / totalPeriodRequests) * 1000) / 10
        : 100;

    const totalLatency = visibleStats.reduce(
      (sum, d) => sum + d.totalLatencyMs,
      0
    );
    const avgLatencyMs =
      totalPeriodRequests > 0
        ? Math.round(totalLatency / totalPeriodRequests)
        : 0;

    const vsAvgPct =
      avgRequestsPerDay > 0
        ? Math.round(
            ((todayStat.totalRequests - avgRequestsPerDay) /
              avgRequestsPerDay) *
              100
          )
        : 0;

    return {
      totalPeriodRequests,
      avgRequestsPerDay,
      peakDay,
      successRate,
      avgLatencyMs,
      vsAvgPct,
    };
  }, [visibleStats, todayStat, todayKey]);

  const maxDailyRequests = useMemo(() => {
    const maxStat = Math.max(
      ...visibleStats.map((d) => d.totalRequests),
      10
    );
    return Math.ceil(maxStat * 1.15);
  }, [visibleStats]);

  const maxHourlyRequests = useMemo(() => {
    const hourly = selectedDayStat?.hourly || [];
    return Math.max(...hourly, 5);
  }, [selectedDayStat]);

  const peakHourInfo = useMemo(() => {
    const hourly = selectedDayStat?.hourly || Array(24).fill(0);
    let maxVal = 0;
    let maxHr = 10;
    hourly.forEach((val, hr) => {
      if (val > maxVal) {
        maxVal = val;
        maxHr = hr;
      }
    });
    const period = maxHr >= 12 ? 'PM' : 'AM';
    const hr12 = maxHr % 12 === 0 ? 12 : maxHr % 12;
    return { label: `${hr12}:00 ${period}`, count: maxVal };
  }, [selectedDayStat]);

  const quotaPct = useMemo(() => {
    if (!quota.dailyLimit || quota.dailyLimit <= 0) return 0;
    return Math.min(
      100,
      Math.round((todayStat.totalRequests / quota.dailyLimit) * 1000) / 10
    );
  }, [todayStat.totalRequests, quota.dailyLimit]);

  const handleSaveQuota = async () => {
    const parsed = parseInt(quotaInput, 10);
    if (isNaN(parsed) || parsed < 10) return;
    const newConfig: AIQuotaConfig = {
      dailyLimit: parsed,
      warningThresholdPct: quota.warningThresholdPct || 80,
    };
    setQuota(newConfig);
    await saveAIQuotaConfig(newConfig);
    setQuotaSaved(true);
    setTimeout(() => setQuotaSaved(false), 2500);
  };

  const handleSimulateRequest = async () => {
    const latency =
      simulatingEndpoint === 'askOwlChat'
        ? 640 + Math.floor(Math.random() * 350)
        : simulatingEndpoint === 'moderateImage'
        ? 850 + Math.floor(Math.random() * 300)
        : 410 + Math.floor(Math.random() * 240);

    await recordAIApiRequest({
      endpoint: simulatingEndpoint,
      status: 'success',
      statusCode: 200,
      latencyMs: latency,
    });
    setSelectedDateKey(todayKey);
  };

  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return recentLogs.slice(0, 12);
    return recentLogs.filter((l) => l.endpoint === logFilter).slice(0, 12);
  }, [recentLogs, logFilter]);

  return (
    <div className="space-y-6">
      {/* ── Top KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's AI API Requests */}
        <div
          className="rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 8px 30px rgba(14,165,233,0.12)',
          }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-sky-400 text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-slate-900 leading-none">
                {todayStat.totalRequests.toLocaleString()}
              </p>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  summaryMetrics.vsAvgPct >= 0
                    ? 'bg-sky-50 text-sky-600 border border-sky-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {summaryMetrics.vsAvgPct >= 0
                  ? `+${summaryMetrics.vsAvgPct}%`
                  : `${summaryMetrics.vsAvgPct}%`}{' '}
                vs avg
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Requests Today ({formatShortDate(todayKey)})
            </p>
          </div>
        </div>

        {/* Card 2: Daily Average Requests */}
        <div
          className="rounded-3xl p-5 flex items-center gap-4"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 8px 30px rgba(99,102,241,0.12)',
          }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-black text-slate-900 leading-none">
                {summaryMetrics.avgRequestsPerDay.toLocaleString()}
              </p>
              <span className="text-xs font-bold text-slate-400">/ day</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {rangeDays}-Day Avg · Peak {summaryMetrics.peakDay.count}
            </p>
          </div>
        </div>

        {/* Card 3: API Success Rate */}
        <div
          className="rounded-3xl p-5 flex items-center gap-4"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 8px 30px rgba(16,185,129,0.12)',
          }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-slate-900 leading-none">
                {summaryMetrics.successRate}%
              </p>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                200 OK
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Success Rate ({summaryMetrics.totalPeriodRequests.toLocaleString()} total)
            </p>
          </div>
        </div>

        {/* Card 4: Avg Response Latency & Tokens */}
        <div
          className="rounded-3xl p-5 flex items-center gap-4"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 8px 30px rgba(245,158,11,0.12)',
          }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-black text-slate-900 leading-none">
                {summaryMetrics.avgLatencyMs}
              </p>
              <span className="text-xs font-bold text-slate-400">ms</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Avg Latency · {(todayStat.estimatedTokens / 1000).toFixed(1)}k tokens today
            </p>
          </div>
        </div>
      </div>

      {/* ── Daily Quota & Rate Limit Control Bar ── */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 4px 20px rgba(0,49,126,0.06)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-800 text-base">
                      Daily AI API Request Quota
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        quotaPct >= 90
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : quotaPct >= 75
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {quotaPct >= 90
                        ? 'Near Limit'
                        : quotaPct >= 75
                        ? 'Moderate Load'
                        : 'Healthy'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold">
                    Monitors total daily requests across DeepSeek-V3 and Gemini 2.5 Flash endpoints
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900">
                  {todayStat.totalRequests.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  {' '}
                  / {quota.dailyLimit.toLocaleString()} req
                </span>
                <span className="ml-2 text-xs font-black text-sky-600">
                  ({quotaPct}%)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${quotaPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background:
                    quotaPct >= 90
                      ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
                      : quotaPct >= 75
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                      : 'linear-gradient(90deg, #2563eb, #0ea5e9, #10b981)',
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>
                Remaining Today:{' '}
                <strong className="text-slate-700">
                  {Math.max(
                    0,
                    quota.dailyLimit - todayStat.totalRequests
                  ).toLocaleString()}{' '}
                  requests
                </strong>
              </span>
              <span>
                Rate Limit Protection: <strong className="text-emerald-600">15 req / min per IP active</strong>
              </span>
            </div>
          </div>

          {/* Quota Config Controls */}
          <div className="flex flex-wrap items-center gap-2 lg:pl-6 lg:border-l border-slate-200/80">
            <div className="flex items-center gap-1.5 mr-1">
              {[250, 500, 1000, 2500].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setQuotaInput(String(preset))}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    Number(quotaInput) === preset
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={50}
                max={50000}
                value={quotaInput}
                onChange={(e) => setQuotaInput(e.target.value)}
                className="w-24 px-3 py-2 rounded-xl text-xs font-black text-slate-800 bg-white border-2 border-sky-100 focus:border-sky-400 outline-none"
              />
              <button
                onClick={handleSaveQuota}
                className="px-4 py-2 rounded-xl text-white font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                  boxShadow: '0 4px 12px rgba(14,165,233,0.25)',
                }}
              >
                <Save className="w-3.5 h-3.5" />
                {quotaSaved ? 'Saved!' : 'Set Limit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Daily Requests Bar Chart ── */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 8px 30px rgba(0,49,126,0.06)',
        }}
      >
        {/* Chart Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-black text-slate-900">
                AI API Requests Per Day
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-200/80">
                Click any bar to inspect day
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              Daily request volume across all OWL Kiosk AI services (Chat, Text & Vision Moderation, Evaluations)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Simulate Request Control for Live Demo/Testing */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
              <select
                value={simulatingEndpoint}
                onChange={(e) =>
                  setSimulatingEndpoint(e.target.value as AIEndpointType)
                }
                className="text-xs font-bold text-slate-700 bg-transparent px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="askOwlChat">OWL AI Chat</option>
                <option value="moderateContent">Lost & Found Text</option>
                <option value="moderateImage">Lost & Found Vision</option>
                <option value="moderateEvaluation">Evaluation Filter</option>
              </select>
              <button
                onClick={handleSimulateRequest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all active:scale-95 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 2px 10px rgba(16,185,129,0.25)',
                }}
                title="Trigger a test AI request to verify real-time counter updates"
              >
                <Play className="w-3 h-3 fill-white" />
                Test Request
              </button>
            </div>

            {/* 7D / 14D Range Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
              {([7, 14] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setRangeDays(days)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    rangeDays === days
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Last {days} Days
                </button>
              ))}
            </div>

            <button
              onClick={() => void loadData()}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-200 transition-all cursor-pointer"
              title="Refresh stats"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="relative pt-8 pb-2">
          {/* Horizontal grid lines */}
          <div className="absolute inset-x-0 top-6 bottom-12 flex flex-col justify-between pointer-events-none">
            {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
              <div
                key={ratio}
                className="flex items-center gap-3 w-full"
              >
                <span className="text-[10px] font-bold text-slate-300 w-8 text-right">
                  {Math.round(maxDailyRequests * ratio)}
                </span>
                <div className="flex-1 border-b border-dashed border-slate-100" />
              </div>
            ))}
          </div>

          {/* Bars */}
          <div
            className="relative z-10 pl-10 grid gap-2 sm:gap-3 items-end h-60"
            style={{
              gridTemplateColumns: `repeat(${visibleStats.length}, minmax(0, 1fr))`,
            }}
          >
            {visibleStats.map((day, idx) => {
              const isToday = day.date === todayKey;
              const isSelected = day.date === selectedDateKey;
              const heightPct = Math.max(
                6,
                Math.min(100, Math.round((day.totalRequests / maxDailyRequests) * 100))
              );

              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDateKey(day.date)}
                  className="group h-full flex flex-col justify-end items-center cursor-pointer select-none"
                >
                  {/* Value pill above bar */}
                  <div
                    className={`mb-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-md transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm scale-105'
                        : isToday
                        ? 'bg-sky-100 text-sky-700'
                        : 'text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-100'
                    }`}
                  >
                    {day.totalRequests}
                  </div>

                  {/* Bar track */}
                  <div className="w-full max-w-[44px] h-44 bg-slate-100/70 rounded-2xl p-1 flex items-end overflow-hidden border border-transparent group-hover:border-sky-200 transition-all">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.45, delay: idx * 0.02 }}
                      className="w-full rounded-xl relative overflow-hidden transition-all"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(180deg, #00c1fd 0%, #2559bf 100%)'
                          : isToday
                          ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)'
                          : 'linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%)',
                        opacity: isSelected || isToday ? 1 : 0.78,
                        boxShadow: isSelected
                          ? '0 4px 16px rgba(37,89,191,0.35)'
                          : 'none',
                      }}
                    />
                  </div>

                  {/* Date Label */}
                  <div className="mt-2 text-center">
                    <p
                      className={`text-[10px] font-black leading-tight ${
                        isSelected
                          ? 'text-blue-600'
                          : isToday
                          ? 'text-sky-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {isToday ? 'Today' : formatWeekday(day.date)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400">
                      {formatShortDate(day.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Selected Day Breakdown (Endpoint Share + 24-Hour Distribution) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Breakdown by AI Endpoint (5 cols) */}
        <div
          className="lg:col-span-5 rounded-3xl p-6 flex flex-col justify-between"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 8px 30px rgba(0,49,126,0.06)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Requests by AI Endpoint
                  </h3>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  {selectedDayStat.date === todayKey
                    ? `Today · ${formatFullDate(selectedDayStat.date)}`
                    : formatFullDate(selectedDayStat.date)}
                </p>
              </div>
              {selectedDayStat.date !== todayKey && (
                <button
                  onClick={() => setSelectedDateKey(todayKey)}
                  className="px-3 py-1 rounded-xl text-[11px] font-black bg-sky-50 text-sky-600 hover:bg-sky-100 transition-all cursor-pointer"
                >
                  Back to Today
                </button>
              )}
            </div>

            <div className="space-y-4">
              {(Object.keys(ENDPOINT_META) as AIEndpointType[]).map((epKey) => {
                const meta = ENDPOINT_META[epKey];
                const style = ENDPOINT_STYLES[epKey];
                const Icon = style.icon;
                const count = selectedDayStat.byEndpoint?.[epKey] || 0;
                const pct =
                  selectedDayStat.totalRequests > 0
                    ? Math.round((count / selectedDayStat.totalRequests) * 100)
                    : 0;

                return (
                  <div
                    key={epKey}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${style.gradient} text-white flex items-center justify-center shadow-sm flex-shrink-0`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-slate-800 truncate">
                              {meta.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-[10px] font-bold text-slate-400">
                              {meta.path}
                            </code>
                            <span
                              className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                              style={{
                                background: style.badgeBg,
                                color: style.badgeText,
                              }}
                            >
                              {meta.model}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-black text-slate-900 leading-none">
                          {count}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {pct}% of day
                        </p>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-200/70 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.45 }}
                        className="h-full rounded-full"
                        style={{ background: style.barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Footer Summary */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400">
              Selected Day Total:{' '}
              <strong className="text-slate-800">
                {selectedDayStat.totalRequests} requests
              </strong>
            </span>
            <span className="font-bold text-slate-400">
              Est. Tokens:{' '}
              <strong className="text-sky-600">
                {selectedDayStat.estimatedTokens.toLocaleString()}
              </strong>
            </span>
          </div>
        </div>

        {/* Right Column: 24-Hour Request Distribution (7 cols) */}
        <div
          className="lg:col-span-7 rounded-3xl p-6 flex flex-col justify-between"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 8px 30px rgba(0,49,126,0.06)',
          }}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-500" />
                  <h3 className="text-base font-black text-slate-900">
                    Hourly Request Distribution (24h)
                  </h3>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  Time-of-day AI request activity for{' '}
                  {selectedDayStat.date === todayKey
                    ? 'Today'
                    : formatShortDate(selectedDayStat.date)}
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-sky-50 border border-sky-100">
                <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-xs font-black text-sky-800">
                  Peak Hour: {peakHourInfo.label} ({peakHourInfo.count} req)
                </span>
              </div>
            </div>

            {/* 24-hour vertical micro-bars */}
            <div
              className="grid gap-1.5 items-end h-52 pt-6 pb-2 px-1"
              style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
            >
              {(selectedDayStat.hourly || Array(24).fill(0)).map(
                (count, hr) => {
                  const pct = Math.max(
                    6,
                    Math.round((count / maxHourlyRequests) * 100)
                  );
                  const isCurrentHour =
                    selectedDayStat.date === todayKey &&
                    hr === new Date().getHours();

                  return (
                    <div
                      key={hr}
                      className="group h-full flex flex-col justify-end items-center"
                      title={`${String(hr).padStart(2, '0')}:00 — ${count} requests`}
                    >
                      <span className="text-[9px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        {count}
                      </span>
                      <div className="w-full h-36 bg-slate-100/80 rounded-lg flex items-end overflow-hidden p-0.5">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: count === 0 ? '4%' : `${pct}%` }}
                          transition={{ duration: 0.4, delay: hr * 0.01 }}
                          className="w-full rounded-md"
                          style={{
                            background: isCurrentHour
                              ? 'linear-gradient(180deg, #10b981, #059669)'
                              : count > 0
                              ? 'linear-gradient(180deg, #38bdf8, #2563eb)'
                              : '#e2e8f0',
                          }}
                        />
                      </div>
                      <span
                        className={`mt-1.5 text-[9px] font-bold ${
                          isCurrentHour
                            ? 'text-emerald-600 font-black'
                            : hr % 3 === 0
                            ? 'text-slate-500'
                            : 'text-transparent sm:text-slate-300'
                        }`}
                      >
                        {String(hr).padStart(2, '0')}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Status breakdown strip */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700">
                Successful (200)
              </span>
              <span className="text-sm font-black text-emerald-800">
                {selectedDayStat.successfulRequests}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700">
                Rate Limited (429)
              </span>
              <span className="text-sm font-black text-amber-800">
                {selectedDayStat.rateLimitedRequests}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700">
                Failed / Timeout
              </span>
              <span className="text-sm font-black text-rose-800">
                {selectedDayStat.failedRequests}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Live AI API Request Logs ── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 8px 30px rgba(0,49,126,0.06)',
        }}
      >
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-sky-400 flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Recent AI API Request Log
              </h3>
              <p className="text-xs font-bold text-slate-400">
                Live stream of incoming AI endpoint invocations from the kiosk
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'All Endpoints' },
                { id: 'askOwlChat', label: 'OWL Chat' },
                { id: 'moderateContent', label: 'Text Mod' },
                { id: 'moderateImage', label: 'Vision Check' },
                { id: 'moderateEvaluation', label: 'Eval Mod' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLogFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  logFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                style={{
                  background: 'rgba(0,49,126,0.03)',
                  borderBottom: '1px solid rgba(0,49,126,0.07)',
                }}
              >
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  AI Endpoint
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Model
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Latency
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Est. Tokens
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const style =
                  ENDPOINT_STYLES[log.endpoint] || ENDPOINT_STYLES.askOwlChat;
                return (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100/80 hover:bg-sky-50/30 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-xs font-bold text-slate-600 whitespace-nowrap">
                      {formatLogTime(log.timestamp)}
                      <span className="ml-2 text-[10px] text-slate-400">
                        {formatShortDate(log.dateKey)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: style.badgeText }}
                        />
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            {log.endpointLabel}
                          </p>
                          <code className="text-[10px] font-bold text-slate-400">
                            {ENDPOINT_META[log.endpoint]?.path}
                          </code>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className="text-[10px] font-black px-2.5 py-1 rounded-full"
                        style={{
                          background: style.badgeBg,
                          color: style.badgeText,
                        }}
                      >
                        {log.model}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs font-black text-slate-700">
                      {log.latencyMs} ms
                    </td>
                    <td className="px-6 py-3.5 text-xs font-bold text-slate-500">
                      ~{log.estimatedTokens}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.status === 'rate_limited'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {log.status === 'success'
                          ? `${log.statusCode} OK`
                          : log.status === 'rate_limited'
                          ? '429 Rate Limit'
                          : `${log.statusCode} Error`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
