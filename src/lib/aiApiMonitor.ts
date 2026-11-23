import { db, ensureKioskAuth } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  runTransaction,
} from 'firebase/firestore';

export type AIEndpointType =
  | 'askOwlChat'
  | 'moderateContent'
  | 'moderateImage'
  | 'moderateEvaluation';

export type AIRequestStatus = 'success' | 'error' | 'rate_limited';

export interface AIRequestLogEntry {
  id: string;
  timestamp: string;
  dateKey: string;
  endpoint: AIEndpointType;
  endpointLabel: string;
  model: string;
  status: AIRequestStatus;
  statusCode: number;
  latencyMs: number;
  estimatedTokens: number;
}

export interface AIDailyUsageStat {
  date: string; // YYYY-MM-DD
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitedRequests: number;
  totalLatencyMs: number;
  estimatedTokens: number;
  byEndpoint: Record<AIEndpointType, number>;
  hourly: number[]; // 24 hours (0..23)
}

export interface AIQuotaConfig {
  dailyLimit: number;
  warningThresholdPct: number;
}

export const ENDPOINT_META: Record<
  AIEndpointType,
  { label: string; path: string; model: string; description: string }
> = {
  askOwlChat: {
    label: 'OWL AI Chat Assistant',
    path: '/api/askOwlChat',
    model: 'DeepSeek-V3',
    description: 'Campus Q&A, navigation help, and student inquiry chat',
  },
  moderateContent: {
    label: 'Lost & Found Text Moderation',
    path: '/api/moderateContent',
    model: 'DeepSeek-V3',
    description: 'Automated profanity, spam, and troll detection for reports',
  },
  moderateImage: {
    label: 'Lost & Found Vision Check',
    path: '/api/moderateImage',
    model: 'Gemini 2.5 Flash',
    description: 'Multimodal image verification for uploaded item photos',
  },
  moderateEvaluation: {
    label: 'Faculty Feedback Moderation',
    path: '/api/moderateEvaluation',
    model: 'DeepSeek-V3',
    description: 'Constructive comment verification on faculty evaluations',
  },
};

// Legacy v1 keys held synthetic demo data; purge them so only real usage is shown.
const LEGACY_DAILY_KEY = 'owl_ai_api_daily_stats_v1';
const LEGACY_LOGS_KEY = 'owl_ai_api_recent_logs_v1';

const STORAGE_DAILY_KEY = 'owl_ai_api_daily_stats_v2';
const STORAGE_LOGS_KEY = 'owl_ai_api_recent_logs_v2';
const STORAGE_QUOTA_KEY = 'owl_ai_api_quota_v1';

function purgeLegacySeedStorage(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LEGACY_DAILY_KEY);
      localStorage.removeItem(LEGACY_LOGS_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

purgeLegacySeedStorage();

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEmptyDailyStat(dateKey: string): AIDailyUsageStat {
  return {
    date: dateKey,
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
  };
}

function normalizeDailyStat(dateKey: string, raw?: Partial<AIDailyUsageStat> | null): AIDailyUsageStat {
  const base = createEmptyDailyStat(dateKey);
  if (!raw) return base;
  return {
    date: dateKey,
    totalRequests: Number(raw.totalRequests) || 0,
    successfulRequests: Number(raw.successfulRequests) || 0,
    failedRequests: Number(raw.failedRequests) || 0,
    rateLimitedRequests: Number(raw.rateLimitedRequests) || 0,
    totalLatencyMs: Number(raw.totalLatencyMs) || 0,
    estimatedTokens: Number(raw.estimatedTokens) || 0,
    byEndpoint: {
      askOwlChat: Number(raw.byEndpoint?.askOwlChat) || 0,
      moderateContent: Number(raw.byEndpoint?.moderateContent) || 0,
      moderateImage: Number(raw.byEndpoint?.moderateImage) || 0,
      moderateEvaluation: Number(raw.byEndpoint?.moderateEvaluation) || 0,
    },
    hourly:
      Array.isArray(raw.hourly) && raw.hourly.length === 24
        ? raw.hourly.map((n) => Number(n) || 0)
        : Array(24).fill(0),
  };
}

function loadLocalDailyStats(): Record<string, AIDailyUsageStat> {
  try {
    const raw = localStorage.getItem(STORAGE_DAILY_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLocalDailyStats(stats: Record<string, AIDailyUsageStat>): void {
  try {
    localStorage.setItem(STORAGE_DAILY_KEY, JSON.stringify(stats));
  } catch {
    // ignore storage errors
  }
}

export function loadLocalRecentLogs(): AIRequestLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((l: AIRequestLogEntry) => l && !String(l.id).startsWith('seed-'))
      : [];
  } catch {
    return [];
  }
}

function saveLocalRecentLogs(logs: AIRequestLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 60)));
  } catch {
    // ignore
  }
}

export function getLocalQuotaConfig(): AIQuotaConfig {
  try {
    const raw = localStorage.getItem(STORAGE_QUOTA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.dailyLimit === 'number') return parsed;
    }
  } catch {
    // ignore
  }
  return { dailyLimit: 500, warningThresholdPct: 80 };
}

export async function saveAIQuotaConfig(config: AIQuotaConfig): Promise<void> {
  try {
    localStorage.setItem(STORAGE_QUOTA_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('owl_ai_api_updated'));
  } catch {
    // ignore
  }

  try {
    await ensureKioskAuth();
    await setDoc(doc(db, 'settings', 'aiApiQuota'), {
      ...config,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Firestore may be offline; localStorage is already updated
  }
}

function applyIncrementToStat(
  base: AIDailyUsageStat,
  params: {
    endpoint: AIEndpointType;
    status: AIRequestStatus;
    latency: number;
    tokens: number;
    hour: number;
  }
): AIDailyUsageStat {
  const next = normalizeDailyStat(base.date, base);
  next.totalRequests += 1;
  if (params.status === 'success') next.successfulRequests += 1;
  else if (params.status === 'rate_limited') next.rateLimitedRequests += 1;
  else next.failedRequests += 1;

  next.totalLatencyMs += params.latency;
  next.estimatedTokens += params.tokens;
  next.byEndpoint[params.endpoint] = (next.byEndpoint[params.endpoint] || 0) + 1;
  next.hourly[params.hour] = (next.hourly[params.hour] || 0) + 1;
  return next;
}

/**
 * Record a real AI API request. Invoked whenever an AI endpoint is called.
 */
export async function recordAIApiRequest(params: {
  endpoint: AIEndpointType;
  status: AIRequestStatus;
  statusCode: number;
  latencyMs: number;
  estimatedTokens?: number;
}): Promise<AIRequestLogEntry> {
  const now = new Date();
  const dateKey = getLocalDateKey(now);
  const hour = now.getHours();
  const meta = ENDPOINT_META[params.endpoint];

  const defaultTokens =
    params.endpoint === 'askOwlChat'
      ? 780
      : params.endpoint === 'moderateImage'
      ? 510
      : 240;

  const tokens = params.estimatedTokens ?? defaultTokens;
  const latency = Math.max(10, Math.round(params.latencyMs));

  const logEntry: AIRequestLogEntry = {
    id: `${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    dateKey,
    endpoint: params.endpoint,
    endpointLabel: meta.label,
    model: meta.model,
    status: params.status,
    statusCode: params.statusCode,
    latencyMs: latency,
    estimatedTokens: tokens,
  };

  // 1. Update local daily stats starting strictly from 0
  const allStats = loadLocalDailyStats();
  const currentLocal = normalizeDailyStat(dateKey, allStats[dateKey]);
  const updatedLocal = applyIncrementToStat(currentLocal, {
    endpoint: params.endpoint,
    status: params.status,
    latency,
    tokens,
    hour,
  });
  allStats[dateKey] = updatedLocal;
  saveLocalDailyStats(allStats);

  // 2. Prepend to local recent request logs
  const logs = loadLocalRecentLogs();
  logs.unshift(logEntry);
  saveLocalRecentLogs(logs);

  // Notify any open Admin Panel listeners in the same browser immediately
  window.dispatchEvent(new CustomEvent('owl_ai_api_updated'));

  // 3. Persist atomically to Firestore for real-time cross-device monitoring
  try {
    await ensureKioskAuth();
    const dailyRef = doc(db, 'aiApiDailyUsage', dateKey);
    const logRef = doc(db, 'aiApiRequestLogs', logEntry.id);

    await Promise.all([
      runTransaction(db, async (tx) => {
        const snap = await tx.get(dailyRef);
        const base = snap.exists()
          ? normalizeDailyStat(dateKey, snap.data() as AIDailyUsageStat)
          : createEmptyDailyStat(dateKey);
        const next = applyIncrementToStat(base, {
          endpoint: params.endpoint,
          status: params.status,
          latency,
          tokens,
          hour,
        });
        tx.set(dailyRef, next);
      }),
      setDoc(logRef, logEntry),
    ]);
  } catch {
    // Non-blocking fallback when offline
  }

  return logEntry;
}

function buildChronologicalStats(
  days: number,
  statsMap: Record<string, AIDailyUsageStat>
): AIDailyUsageStat[] {
  const now = new Date();
  const result: AIDailyUsageStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = getLocalDateKey(d);
    result.push(normalizeDailyStat(key, statsMap[key]));
  }
  return result;
}

/**
 * Retrieve daily AI API usage stats for the last `days` days (chronological order, ending with today).
 * Never fabricates synthetic data — days without usage return 0 across all metrics.
 */
export async function getAIApiUsageHistory(days = 14): Promise<{
  dailyStats: AIDailyUsageStat[];
  recentLogs: AIRequestLogEntry[];
  quota: AIQuotaConfig;
}> {
  purgeLegacySeedStorage();
  const localStats = loadLocalDailyStats();
  let recentLogs = loadLocalRecentLogs();
  let quota = getLocalQuotaConfig();

  try {
    await ensureKioskAuth();
    const [usageSnap, logsSnap, quotaSnap] = await Promise.all([
      getDocs(collection(db, 'aiApiDailyUsage')),
      getDocs(query(collection(db, 'aiApiRequestLogs'), orderBy('timestamp', 'desc'), limit(60))),
      getDoc(doc(db, 'settings', 'aiApiQuota')),
    ]);

    usageSnap.docs.forEach((d) => {
      const remoteData = d.data() as AIDailyUsageStat;
      if (remoteData && remoteData.date) {
        const normalized = normalizeDailyStat(remoteData.date, remoteData);
        const local = localStats[remoteData.date];
        if (!local || normalized.totalRequests >= (local.totalRequests || 0)) {
          localStats[remoteData.date] = normalized;
        }
      }
    });

    if (!logsSnap.empty) {
      const remoteLogs = logsSnap.docs
        .map((d) => d.data() as AIRequestLogEntry)
        .filter((l) => l && !String(l.id).startsWith('seed-'));
      // Merge remote and local logs by id, sorted newest first
      const mergedMap = new Map<string, AIRequestLogEntry>();
      [...remoteLogs, ...recentLogs].forEach((entry) => {
        if (entry && entry.id && !mergedMap.has(entry.id)) {
          mergedMap.set(entry.id, entry);
        }
      });
      recentLogs = Array.from(mergedMap.values())
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 60);
      saveLocalRecentLogs(recentLogs);
    }

    if (quotaSnap.exists()) {
      const qData = quotaSnap.data();
      if (typeof qData.dailyLimit === 'number') {
        quota = {
          dailyLimit: qData.dailyLimit,
          warningThresholdPct: qData.warningThresholdPct ?? 80,
        };
        localStorage.setItem(STORAGE_QUOTA_KEY, JSON.stringify(quota));
      }
    }
  } catch {
    // Offline or Firestore rules not yet deployed — use local stats cleanly
  }

  saveLocalDailyStats(localStats);

  return {
    dailyStats: buildChronologicalStats(days, localStats),
    recentLogs,
    quota,
  };
}

/**
 * Subscribe to real-time AI API usage updates across Firestore and local tabs.
 */
export function subscribeToAIApiUsage(
  days: number,
  onUpdate: (data: {
    dailyStats: AIDailyUsageStat[];
    recentLogs: AIRequestLogEntry[];
    quota: AIQuotaConfig;
  }) => void
): () => void {
  let unsubDaily: (() => void) | null = null;
  let unsubLogs: (() => void) | null = null;
  let unsubQuota: (() => void) | null = null;
  let cancelled = false;

  const statsMap: Record<string, AIDailyUsageStat> = { ...loadLocalDailyStats() };
  let currentLogs: AIRequestLogEntry[] = loadLocalRecentLogs();
  let currentQuota: AIQuotaConfig = getLocalQuotaConfig();

  const emit = () => {
    if (cancelled) return;
    onUpdate({
      dailyStats: buildChronologicalStats(days, statsMap),
      recentLogs: currentLogs,
      quota: currentQuota,
    });
  };

  // Emit initial local state immediately
  emit();

  const handleLocalEvent = () => {
    Object.assign(statsMap, loadLocalDailyStats());
    currentLogs = loadLocalRecentLogs();
    currentQuota = getLocalQuotaConfig();
    emit();
  };

  window.addEventListener('owl_ai_api_updated', handleLocalEvent);
  window.addEventListener('storage', handleLocalEvent);

  void (async () => {
    try {
      await ensureKioskAuth();
      if (cancelled) return;

      unsubDaily = onSnapshot(
        collection(db, 'aiApiDailyUsage'),
        (snap) => {
          snap.docs.forEach((d) => {
            const remote = d.data() as AIDailyUsageStat;
            if (remote && remote.date) {
              statsMap[remote.date] = normalizeDailyStat(remote.date, remote);
            }
          });
          saveLocalDailyStats(statsMap);
          emit();
        },
        () => {}
      );

      unsubLogs = onSnapshot(
        query(collection(db, 'aiApiRequestLogs'), orderBy('timestamp', 'desc'), limit(60)),
        (snap) => {
          const remoteLogs = snap.docs
            .map((d) => d.data() as AIRequestLogEntry)
            .filter((l) => l && !String(l.id).startsWith('seed-'));
          const mergedMap = new Map<string, AIRequestLogEntry>();
          [...remoteLogs, ...loadLocalRecentLogs()].forEach((entry) => {
            if (entry && entry.id && !mergedMap.has(entry.id)) {
              mergedMap.set(entry.id, entry);
            }
          });
          currentLogs = Array.from(mergedMap.values())
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .slice(0, 60);
          saveLocalRecentLogs(currentLogs);
          emit();
        },
        () => {}
      );

      unsubQuota = onSnapshot(
        doc(db, 'settings', 'aiApiQuota'),
        (snap) => {
          if (snap.exists()) {
            const qData = snap.data();
            if (typeof qData.dailyLimit === 'number') {
              currentQuota = {
                dailyLimit: qData.dailyLimit,
                warningThresholdPct: qData.warningThresholdPct ?? 80,
              };
              localStorage.setItem(STORAGE_QUOTA_KEY, JSON.stringify(currentQuota));
              emit();
            }
          }
        },
        () => {}
      );
    } catch {
      // Fallback to local event listeners if offline
    }
  })();

  return () => {
    cancelled = true;
    window.removeEventListener('owl_ai_api_updated', handleLocalEvent);
    window.removeEventListener('storage', handleLocalEvent);
    unsubDaily?.();
    unsubLogs?.();
    unsubQuota?.();
  };
}

/**
 * Reset all recorded AI API usage stats and logs (both local and Firestore).
 */
export async function resetAIApiUsageHistory(): Promise<void> {
  purgeLegacySeedStorage();
  try {
    localStorage.removeItem(STORAGE_DAILY_KEY);
    localStorage.removeItem(STORAGE_LOGS_KEY);
  } catch {
    // ignore
  }

  try {
    await ensureKioskAuth();
    const [usageSnap, logsSnap] = await Promise.all([
      getDocs(collection(db, 'aiApiDailyUsage')),
      getDocs(collection(db, 'aiApiRequestLogs')),
    ]);
    await Promise.all([
      ...usageSnap.docs.map((d) => deleteDoc(d.ref)),
      ...logsSnap.docs.map((d) => deleteDoc(d.ref)),
    ]);
  } catch {
    // ignore if offline
  }

  window.dispatchEvent(new CustomEvent('owl_ai_api_updated'));
}
