import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, User, Clock, Info, AlertTriangle, X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Maximize2, BrainCircuit, Megaphone, FileText, ArrowUpRight, ShieldCheck, CalendarClock, Hourglass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import conflictExamImg from '../../assets/conflict_exam_schedule.webp';
import { DUMMY_EXAMS } from '../../data/dummyExamData';
import { useOwlAssistant } from '../../context/OwlAssistantContext';

export default function ExamTimetable() {
  const { profile } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const { openDrawer } = useOwlAssistant();

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsImageModalOpen(false);
      }
    };
    if (isImageModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setZoomLevel(1);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isImageModalOpen]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
  };

  useEffect(() => {
    const fetchExams = async () => {
      if (!profile) return;
      const q = query(collection(db, 'examSchedules'), where('studentId', '==', profile.uid));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a: any, b: any) => (a.date?.seconds || 0) - (b.date?.seconds || 0));

      if (fetched.length === 0) {
        // No real exam data available — use dummy data for the demo
        setExams(DUMMY_EXAMS);
        setUsingDummyData(true);
      } else {
        setExams(fetched);
        setUsingDummyData(false);
      }
      setLoading(false);
    };
    fetchExams();
  }, [profile]);

  const filteredExams = exams.filter(exam => {
    if (showAll) return true;
    const examDate = new Date(exam.date?.seconds * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return examDate >= today;
  });

  const MASTER_SCHEDULE_URL = 'https://drive.google.com/file/d/1aB-whaM-7_CRp_xqmRI6TblH5y36nXQO/view?fbclid=IwY2xjawTUbBlleHRuA2FlbQIxMQBzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEe-cEg2xeU7dRGT0BNB1gJPO-bvzNQcqlfxBGUW0ZK1z2ZH-YtQbNL3UiES7A_aem_SDlTa8NGlGp9wtLwYrYbqQ&pli=1';

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcomingExams = exams.filter(e => new Date(e.date?.seconds * 1000) >= startOfToday);
  const nextExam = upcomingExams[0];

  const daysUntil = (seconds: number) => {
    const d = new Date(seconds * 1000);
    d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - startOfToday.getTime()) / 86400000);
  };

  const countdownLabel = (seconds: number) => {
    const n = daysUntil(seconds);
    if (n < 0) return 'Done';
    if (n === 0) return 'Today';
    if (n === 1) return 'Tomorrow';
    return `In ${n} days`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Hero ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-10 md:p-12 text-white shadow-2xl shadow-indigo-300/40"
        >
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
          <CalendarClock className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 text-white/[0.06] hidden md:block pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5">
                <Calendar className="w-3.5 h-3.5" /> 2nd Semester · A.Y. 2025-2026
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Exam Timetable</h2>
              <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                Review your upcoming examination schedule, assigned rooms, and proctors. Ensure you have your Universidad de Dagupan ID Card during exams.
              </p>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl px-6 py-4 min-w-[8.5rem]">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Upcoming</p>
                <p className="text-3xl font-black leading-none">{loading ? '—' : upcomingExams.length}</p>
                <p className="text-xs font-semibold text-indigo-200 mt-1">exams</p>
              </div>
              <div className="bg-white text-indigo-700 rounded-3xl px-6 py-4 min-w-[8.5rem] shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 flex items-center gap-1"><Hourglass className="w-3 h-3" /> Next Exam</p>
                <p className="text-2xl font-black leading-none">{nextExam ? countdownLabel(nextExam.date?.seconds) : '—'}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1 max-w-[9rem] truncate">{nextExam ? nextExam.subject.split('—')[0].trim() : 'None scheduled'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Priority Notices: Announcement + Master Schedule ── */}
        <section aria-labelledby="priority-notices-heading" className="space-y-4">
          <div className="flex items-center gap-3 ml-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <h3 id="priority-notices-heading" className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Priority Notices</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Official Announcement */}
            <motion.button
              id="exam-announcement-card"
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => setIsImageModalOpen(true)}
              className="lg:col-span-3 text-left rounded-[2.5rem] overflow-hidden bg-white border-2 border-amber-300 shadow-xl shadow-amber-200/40 group/ann-card transition-shadow hover:shadow-2xl hover:shadow-amber-300/50 flex flex-col"
            >
              <div className="bg-gradient-to-r from-amber-400 via-amber-400 to-orange-400 px-6 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-amber-900/10 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-amber-950" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-amber-950 font-black text-xs uppercase tracking-widest leading-none mb-1">Official Announcement</p>
                    <p className="text-amber-950/90 font-bold text-base leading-tight truncate">Conflict &amp; Special Exam Final Schedule</p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider bg-white/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 flex-shrink-0">
                  <Maximize2 className="w-3 h-3" /> Tap to view
                </span>
              </div>
              <div className="relative overflow-hidden bg-slate-900 flex-1 min-h-[16rem]">
                <img
                  src={conflictExamImg}
                  alt="Conflict & Special Exam Final Schedule – 2nd Semester A.Y. 2025-2026"
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover/ann-card:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between gap-3">
                  <span className="text-white/90 text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Registrar Bulletin · 2nd Sem 2025-2026
                  </span>
                  <span className="bg-white/95 text-indigo-800 font-black text-sm px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 group-hover/ann-card:bg-white transition-all">
                    <ZoomIn className="w-4 h-4 text-indigo-600" /> View full notice
                  </span>
                </div>
              </div>
            </motion.button>

            {/* Official Master Schedule */}
            <motion.a
              id="exam-master-schedule-card"
              href={MASTER_SCHEDULE_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 text-white shadow-xl shadow-indigo-300/40 hover:shadow-2xl hover:shadow-indigo-400/40 transition-shadow group/doc flex flex-col"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                    <ShieldCheck className="w-3 h-3" /> Official
                  </span>
                  <h4 className="text-2xl font-black leading-tight">Official Master Schedule</h4>
                  <p className="text-indigo-200 text-sm font-medium mt-2">Complete examination timetable for all departments.</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 group-hover/doc:bg-white group-hover/doc:text-indigo-700 transition-colors">
                  <ArrowUpRight className="w-5 h-5 group-hover/doc:rotate-45 transition-transform duration-300" />
                </div>
              </div>

              {/* Document preview */}
              <div className="relative z-10 flex-1 flex items-center justify-center py-2">
                <div className="relative w-full max-w-[15rem]">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl rotate-6 translate-x-2" />
                  <div className="absolute inset-0 bg-white/40 rounded-2xl rotate-3 translate-x-1" />
                  <div className="relative bg-white rounded-2xl shadow-2xl p-5 group-hover/doc:-rotate-1 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 w-3/4 bg-slate-200 rounded-full" />
                        <div className="h-1.5 w-1/2 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mb-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className={`h-2 rounded-sm ${i < 4 ? 'bg-indigo-200' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <p className="text-slate-800 font-black text-sm leading-tight truncate">MIDTERM EXAM SCHEDULE</p>
                    <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-widest mt-0.5">2nd Semester, A.Y. 2025-2026</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 w-full bg-white text-indigo-700 font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg group-hover/doc:bg-amber-300 group-hover/doc:text-indigo-950 transition-colors">
                <ExternalLink className="w-4 h-4" /> Open Master Schedule
              </div>
            </motion.a>
          </div>
        </section>

                {/* ── Personal schedule + protocols ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between ml-2">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <Clock className="w-6 h-6 text-indigo-600" /> Upcoming Subjects
              </h3>
              <button 
                onClick={() => setShowAll(!showAll)}
                className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                {showAll ? 'Show Upcoming' : 'Show All'}
              </button>
            </div>
            
            {filteredExams.map((exam, idx) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 group hover:shadow-xl hover:shadow-indigo-900/5 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl font-black text-slate-800">{exam.subject}</h4>
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase mt-1">
                       <Calendar className="w-4 h-4" /> {new Date(exam.date?.seconds * 1000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-xl">
                     {new Date(exam.date?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 group-hover:bg-indigo-50/50 transition-colors">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Room</p>
                      <p className="font-bold text-slate-700">{exam.room}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 group-hover:bg-indigo-50/50 transition-colors">
                    <User className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Proctor</p>
                      <p className="font-bold text-slate-700">{exam.proctor}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredExams.length === 0 && !loading && (
              <div className="bg-slate-50 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-200">
                 <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-500 font-bold mb-6">No exam schedules found.</p>
                 <button
                   onClick={() => openDrawer('When are the upcoming exams at Universidad de Dagupan this semester?')}
                   className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                 >
                   <BrainCircuit className="w-5 h-5" /> Ask OWL About Exam Schedules
                 </button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                  <Info className="w-8 h-8 text-amber-500" />
                  <h3 className="text-2xl font-bold text-slate-800">Exam Protocols</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Arrive at least 15 minutes before the start time.',
                    'Only Universidad de Dagupan-issued ID cards and examination permits are allowed.',
                    'Electronic devices must be turned off and surrendered.',
                    'Latecomers (more than 30 mins) will not be admitted.'
                  ].map((rule, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-600 font-medium leading-relaxed">
                      <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-black text-slate-400 flex-shrink-0 mt-1">{i+1}</span>
                      {rule}
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </div>

        {/* ── Official Announcement Image Lightbox Modal ──────────────────────────────────────── */}
        <AnimatePresence>
          {isImageModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setIsImageModalOpen(false)}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
              />

              {/* Modal Content Box */}
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-700/60 flex flex-col overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Official Announcement
                        </span>
                        <span className="text-slate-400 text-xs font-semibold">2nd Sem A.Y. 2025-2026</span>
                      </div>
                      <h3 className="text-white font-bold text-base md:text-lg tracking-tight line-clamp-1">
                        Conflict &amp; Special Exam Final Schedule
                      </h3>
                    </div>
                  </div>

                  {/* Toolbar Actions */}
                  <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center bg-slate-800/90 rounded-2xl p-1 border border-slate-700">
                      <button
                        onClick={handleZoomOut}
                        title="Zoom Out"
                        disabled={zoomLevel <= 0.75}
                        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-300 min-w-[3rem] text-center select-none">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        onClick={handleZoomIn}
                        title="Zoom In"
                        disabled={zoomLevel >= 3}
                        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      {zoomLevel !== 1 && (
                        <button
                          onClick={handleResetZoom}
                          title="Reset Zoom"
                          className="p-2 ml-1 rounded-xl text-amber-400 hover:bg-slate-700 transition-all text-xs font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Open external document */}
                    <a
                      href="https://drive.google.com/file/d/1aB-whaM-7_CRp_xqmRI6TblH5y36nXQO/view"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-indigo-600 transition-all border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
                      title="Open PDF Document"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">Drive File</span>
                    </a>

                    {/* Close button */}
                    <button
                      onClick={() => setIsImageModalOpen(false)}
                      className="p-2.5 rounded-2xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-all border border-slate-700"
                      title="Close (ESC)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Image Viewer Body */}
                <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950/60 min-h-[50vh] max-h-[72vh] select-none">
                  <div 
                    className="transition-transform duration-200 ease-out origin-top flex items-center justify-center max-w-full"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    <img
                      src={conflictExamImg}
                      alt="Conflict & Special Exam Final Schedule – 2nd Semester A.Y. 2025-2026"
                      className="max-w-full max-h-[68vh] object-contain rounded-2xl shadow-2xl border border-slate-800/80 pointer-events-auto"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Official University Registrar Bulletin</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Scroll or zoom to inspect schedule</span>
                    <span>•</span>
                    <button
                      onClick={() => setIsImageModalOpen(false)}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
  );
}
