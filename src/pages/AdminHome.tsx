import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  ListOrdered,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Zap,
  Tag,
  Filter,
  AlertTriangle,
  Lightbulb,
  Info,
  Siren,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'students' | 'feedback' | 'queue';
type SentimentFilter = 'all' | 'positive' | 'neutral' | 'negative';
type UrgencyFilter = 'all' | 'low' | 'medium' | 'high' | 'critical';

// ── Evaluation Config ─────────────────────────────────────────────────────────

const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', Icon: ThumbsUp },
  neutral:  { label: 'Neutral',  color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', Icon: Minus },
  negative: { label: 'Negative', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)', Icon: ThumbsDown },
};

const URGENCY_CONFIG = {
  low:      { label: 'Low',      accent: '#10b981', glow: 'rgba(16,185,129,0.08)'  },
  medium:   { label: 'Medium',   accent: '#f59e0b', glow: 'rgba(245,158,11,0.08)'  },
  high:     { label: 'High',     accent: '#f97316', glow: 'rgba(249,115,22,0.1)'   },
  critical: { label: 'Critical', accent: '#ef4444', glow: 'rgba(239,68,68,0.12)'   },
};

const ACTIONABILITY_CONFIG = {
  informational: { label: 'Informational', Icon: Info,          color: '#64748b' },
  suggestion:    { label: 'Suggestion',    Icon: Lightbulb,     color: '#8b5cf6' },
  complaint:     { label: 'Complaint',     Icon: AlertTriangle,  color: '#f59e0b' },
  urgent_issue:  { label: 'Urgent Issue',  Icon: Siren,         color: '#ef4444' },
};

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentSnap = await getDocs(query(collection(db, 'users'), orderBy('fullName')));
        setStudents(studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)).filter(u => u.role === 'student'));

        const feedbackSnap = await getDocs(query(collection(db, 'feedback'), orderBy('createdAt', 'desc')));
        setFeedback(feedbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { id: 'students', label: 'Student Directory', icon: Users, count: students.length },
    { id: 'feedback', label: 'Feedback Viewer', icon: MessageSquare, count: feedback.length },
    { id: 'queue', label: 'Queue Overview', icon: ListOrdered, count: null },
  ];

  return (
    <div className="min-h-screen flex font-sans" style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 45%, #dff3ff 100%)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="w-72 flex-shrink-0 flex flex-col sticky top-0 h-screen overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #00317e 0%, #0b2a63 60%, #071b43 100%)', boxShadow: '4px 0 30px rgba(0,49,126,0.25)' }}
      >
        {/* Sidebar background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,193,253,0.15), transparent 70%)', filter: 'blur(30px)' }} />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-4 px-6 pt-8 pb-6">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2559bf, #00c1fd)' }}>
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-white text-lg leading-tight">OWL Admin</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(0,193,253,0.7)' }}>Control Center</p>
          </div>
        </div>

        {/* Divider */}
        <div className="relative z-10 mx-6 mb-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

        {/* Stats mini cards */}
        <div className="relative z-10 px-4 mb-6 grid grid-cols-2 gap-3">
          {[
            { label: 'Students', value: students.length, icon: Users, color: '#00c1fd' },
            { label: 'Feedback', value: feedback.length, icon: MessageSquare, color: '#a78bfa' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <stat.icon className="w-4 h-4 mb-2" style={{ color: stat.color }} />
              <p className="text-xl font-black text-white leading-none">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(item.id as Tab)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm relative overflow-hidden"
              style={activeTab === item.id ? {
                background: 'linear-gradient(135deg, rgba(0,193,253,0.25), rgba(37,89,191,0.25))',
                border: '1px solid rgba(0,193,253,0.3)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(0,193,253,0.15)',
              } : {
                background: 'transparent',
                border: '1px solid transparent',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: '#00c1fd' }} />
              )}
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== null && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: activeTab === item.id ? 'rgba(0,193,253,0.25)' : 'rgba(255,255,255,0.08)', color: activeTab === item.id ? '#7de8ff' : 'rgba(255,255,255,0.3)' }}>
                  {item.count}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Logout */}
        <div className="relative z-10 px-4 py-6">
          <div className="mb-4 mx-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
          <motion.button
            whileHover={{ x: 3 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm"
            style={{ color: 'rgba(252,165,165,0.7)', border: '1px solid transparent' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fca5a5'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(252,165,165,0.7)'; }}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </motion.button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 px-8 py-5 flex justify-between items-center"
          style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,49,126,0.08)', boxShadow: '0 2px 16px rgba(0,49,126,0.05)' }}
        >
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'students' && 'Student Directory'}
              {activeTab === 'feedback' && 'Feedback Hub'}
              {activeTab === 'queue' && 'Queue Monitor'}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-400" />
              OWL Admin Panel · Real-time Data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
              <motion.div className="w-2 h-2 bg-emerald-500 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              System Online
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">

            {/* ── Students Tab ── */}
            {activeTab === 'students' && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Students', value: students.length, icon: Users, color: 'from-blue-500 to-indigo-600', glow: 'rgba(99,102,241,0.15)' },
                    { label: 'Enrolled', value: students.filter(s => s.enrollmentStatus === 'Enrolled').length, icon: TrendingUp, color: 'from-emerald-400 to-teal-500', glow: 'rgba(20,184,166,0.15)' },
                    { label: 'Inactive', value: students.filter(s => s.enrollmentStatus !== 'Enrolled').length, icon: Activity, color: 'from-amber-400 to-orange-500', glow: 'rgba(251,191,36,0.15)' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-3xl p-6 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: `0 8px 30px ${stat.glow}` }}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 30px rgba(0,49,126,0.06)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr style={{ background: 'rgba(0,49,126,0.03)', borderBottom: '1px solid rgba(0,49,126,0.07)' }}>
                          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Details</th>
                          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, i) => (
                          <motion.tr
                            key={student.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group transition-colors"
                            style={{ borderBottom: '1px solid rgba(0,49,126,0.05)' }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'rgba(0,49,126,0.02)'}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                          >
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-base flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(37,89,191,0.15), rgba(0,193,253,0.15))', color: '#2559bf' }}>
                                  {student.fullName?.[0] ?? '?'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800">{student.fullName}</p>
                                  <p className="text-xs text-slate-400 font-medium">{student.studentId || 'ID Pending'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-slate-700 font-bold">{student.program}</p>
                              <p className="text-xs text-slate-400">Year {student.yearLevel}</p>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-black ${student.enrollmentStatus === 'Enrolled' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {student.enrollmentStatus || 'Inactive'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button className="p-2 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Feedback Tab ── */}
            {activeTab === 'feedback' && (() => {
              // ── Derived stats
              const evaluated = feedback.filter(f => f.sentiment);
              const positiveCount = evaluated.filter(f => f.sentiment === 'positive').length;
              const negativeCount = evaluated.filter(f => f.sentiment === 'negative').length;
              const criticalHighCount = evaluated.filter(f => f.urgency === 'critical' || f.urgency === 'high').length;
              const positivePercent = evaluated.length ? Math.round((positiveCount / evaluated.length) * 100) : 0;
              const negativePercent = evaluated.length ? Math.round((negativeCount / evaluated.length) * 100) : 0;

              // ── Filtered list
              const filtered = feedback.filter(item => {
                const sentimentOk = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
                const urgencyOk   = urgencyFilter   === 'all' || item.urgency   === urgencyFilter;
                return sentimentOk && urgencyOk;
              });

              return (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  {/* ── Stats Row ── */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Total Submissions', value: feedback.length,   icon: MessageSquare, color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.15)' },
                      { label: 'Positive Sentiment', value: `${positivePercent}%`, icon: ThumbsUp,     color: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,0.15)' },
                      { label: 'Negative Sentiment', value: `${negativePercent}%`, icon: ThumbsDown,   color: 'from-rose-400 to-red-500',    glow: 'rgba(239,68,68,0.12)'  },
                      { label: 'High / Critical',    value: criticalHighCount,     icon: Zap,          color: 'from-amber-400 to-orange-500', glow: 'rgba(251,191,36,0.15)' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-3xl p-5 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: `0 8px 30px ${stat.glow}` }}>
                        <div className={`w-11 h-11 bg-gradient-to-br ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Filter Bar ── */}
                  <div className="flex flex-wrap items-center gap-3 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,49,126,0.07)' }}>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Filter className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Filters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sentiment:</span>
                      {(['all', 'positive', 'neutral', 'negative'] as SentimentFilter[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setSentimentFilter(s)}
                          className="px-3 py-1.5 rounded-xl text-xs font-black capitalize transition-all"
                          style={sentimentFilter === s
                            ? { background: 'linear-gradient(135deg, #2559bf, #00c1fd)', color: '#fff', boxShadow: '0 4px 12px rgba(37,89,191,0.25)' }
                            : { background: 'rgba(0,49,126,0.05)', color: '#64748b' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="w-px h-5 bg-slate-200" />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Urgency:</span>
                      {(['all', 'low', 'medium', 'high', 'critical'] as UrgencyFilter[]).map(u => (
                        <button
                          key={u}
                          onClick={() => setUrgencyFilter(u)}
                          className="px-3 py-1.5 rounded-xl text-xs font-black capitalize transition-all"
                          style={urgencyFilter === u
                            ? { background: 'linear-gradient(135deg, #2559bf, #00c1fd)', color: '#fff', boxShadow: '0 4px 12px rgba(37,89,191,0.25)' }
                            : { background: 'rgba(0,49,126,0.05)', color: '#64748b' }}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                    {(sentimentFilter !== 'all' || urgencyFilter !== 'all') && (
                      <button
                        onClick={() => { setSentimentFilter('all'); setUrgencyFilter('all'); }}
                        className="ml-auto text-xs font-black text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                  {/* ── Feedback Cards ── */}
                  <div className="grid grid-cols-1 gap-5">
                    <AnimatePresence mode="popLayout">
                      {filtered.length === 0 ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-24 text-slate-300"
                          style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: '2rem' }}
                        >
                          <MessageSquare className="w-20 h-20 mb-6 opacity-30" />
                          <p className="text-xl font-black text-slate-400">No feedback matches your filters</p>
                        </motion.div>
                      ) : filtered.map((item, i) => {
                        const sentiment = SENTIMENT_CONFIG[item.sentiment as keyof typeof SENTIMENT_CONFIG];
                        const urgency   = URGENCY_CONFIG[item.urgency as keyof typeof URGENCY_CONFIG];
                        const action    = ACTIONABILITY_CONFIG[item.actionability as keyof typeof ACTIONABILITY_CONFIG];
                        const isCritical = item.urgency === 'critical' || item.urgency === 'high';

                        return (
                          <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ delay: i * 0.04 }}
                            className="rounded-3xl overflow-hidden"
                            style={{
                              background: 'rgba(255,255,255,0.85)',
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.8)'}`,
                              boxShadow: `0 4px 24px ${urgency ? urgency.glow : 'rgba(0,49,126,0.05)'}`,
                            }}
                          >
                            {/* Urgency accent bar */}
                            {urgency && (
                              <div className="h-1 w-full" style={{ background: urgency.accent }} />
                            )}

                            <div className="p-7">
                              {/* Top row: category + sentiment + date */}
                              <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider" style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)' }}>
                                  {item.category}
                                </span>

                                {sentiment && (
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black" style={{ background: sentiment.bg, color: sentiment.color, border: `1px solid ${sentiment.border}` }}>
                                    <sentiment.Icon className="w-3 h-3" />
                                    {sentiment.label}
                                  </span>
                                )}

                                {urgency && (
                                  <span className="px-3 py-1.5 rounded-full text-xs font-black" style={{ background: `${urgency.accent}18`, color: urgency.accent, border: `1px solid ${urgency.accent}40` }}>
                                    {urgency.label} Urgency
                                  </span>
                                )}

                                <span className="ml-auto text-slate-400 text-xs font-bold">
                                  {item.createdAt?.seconds
                                    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                                    : '—'}
                                </span>
                              </div>

                              {/* AI Summary */}
                              {item.summary && (
                                <p className="text-sm font-black text-slate-700 mb-3 flex items-start gap-2">
                                  <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                                  {item.summary}
                                </p>
                              )}

                              {/* Full Content */}
                              <p className="text-slate-600 font-medium leading-relaxed text-sm mb-4">{item.content}</p>

                              {/* Bottom row: tags + actionability */}
                              <div className="flex flex-wrap items-center gap-2">
                                {action && (
                                  <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: action.color }}>
                                    <action.Icon className="w-3.5 h-3.5" />
                                    {action.label}
                                  </span>
                                )}
                                {Array.isArray(item.tags) && item.tags.length > 0 && (
                                  <>
                                    <div className="w-px h-4 bg-slate-200" />
                                    {item.tags.map((tag: string) => (
                                      <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: 'rgba(0,49,126,0.06)', color: '#2559bf' }}>
                                        <Tag className="w-2.5 h-2.5" />
                                        {tag}
                                      </span>
                                    ))}
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })()}

            {/* ── Queue Tab ── */}
            {activeTab === 'queue' && (
              <motion.div
                key="queue"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="rounded-3xl p-8 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 20px rgba(0,49,126,0.06)' }}>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Queue Management</h3>
                    <p className="text-slate-400 font-medium text-sm mt-1">Control and monitor active queues</p>
                  </div>
                  <button
                    onClick={async () => {
                      const { seedDummyData } = await import('../seedData');
                      await seedDummyData();
                      alert('Dummy data seeded successfully!');
                    }}
                    className="px-6 py-3 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.25)' }}
                  >
                    Seed Initial App Data
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-24 text-slate-300" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: '2rem' }}>
                  <ListOrdered className="w-20 h-20 mb-6 opacity-30" />
                  <p className="text-xl font-black text-slate-400">Queue dashboard active</p>
                  <p className="text-slate-400 font-medium mt-2">Monitoring live tickets...</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
