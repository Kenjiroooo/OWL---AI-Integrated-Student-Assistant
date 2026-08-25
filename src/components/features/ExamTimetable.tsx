import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, User, Clock, Info, AlertTriangle, X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import conflictExamImg from '../../assets/conflict_exam_schedule.png';

export default function ExamTimetable() {
  const { profile } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

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
      setExams(fetched);
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

  return (
    <div className="space-y-8">
      <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-200">
        <h2 className="text-4xl font-black mb-4">Exam Timetable</h2>
        <p className="text-indigo-100 text-xl font-medium opacity-90 max-w-2xl">
          Review your upcoming examination schedule, assigned rooms, and proctors. Ensure you have your Universidad de Dagupan ID Card during exams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Conflict Exam Announcement */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setIsImageModalOpen(true)}
            className="rounded-[2rem] overflow-hidden border-2 border-amber-300 shadow-lg shadow-amber-100 cursor-pointer group/ann-card transition-all hover:shadow-xl hover:border-amber-400"
          >
            {/* Banner */}
            <div className="bg-amber-400 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-900 flex-shrink-0" />
                <p className="text-amber-900 font-black text-sm uppercase tracking-widest">Official Announcement</p>
              </div>
              <span className="text-[11px] font-black text-amber-900/80 uppercase tracking-wider bg-amber-300/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Maximize2 className="w-3 h-3" /> Tap to view
              </span>
            </div>
            {/* Image Preview Container */}
            <div className="relative overflow-hidden bg-slate-900">
              <img
                src={conflictExamImg}
                alt="Conflict & Special Exam Final Schedule – 2nd Semester A.Y. 2025-2026"
                className="w-full object-cover group-hover/ann-card:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-indigo-950/20 group-hover/ann-card:bg-indigo-950/40 transition-all flex items-center justify-center">
                <span className="opacity-0 group-hover/ann-card:opacity-100 bg-white/95 text-indigo-800 font-black text-sm px-6 py-3 rounded-full shadow-2xl transform translate-y-3 group-hover/ann-card:translate-y-0 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                  <ZoomIn className="w-4 h-4 text-indigo-600" /> Click to view announcement
                </span>
              </div>
            </div>
          </motion.div>

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
            <div className="bg-slate-50 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
               <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold">No exam schedules found for your profile.</p>
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

           <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[3rem] text-white shadow-lg relative overflow-hidden group mb-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
              
              <h4 className="text-xl font-bold mb-2 relative z-10">Official Master Schedule</h4>
              <p className="text-indigo-100 text-sm font-medium mb-6 relative z-10">
                View the complete examination timetable for all departments.
              </p>
              
              <a 
                href="https://drive.google.com/file/d/1aB-whaM-7_CRp_xqmRI6TblH5y36nXQO/view?fbclid=IwY2xjawTUbBlleHRuA2FlbQIxMQBzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEe-cEg2xeU7dRGT0BNB1gJPO-bvzNQcqlfxBGUW0ZK1z2ZH-YtQbNL3UiES7A_aem_SDlTa8NGlGp9wtLwYrYbqQ&pli=1"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full overflow-hidden rounded-2xl shadow-lg border-2 border-indigo-400/30 hover:border-white/50 hover:shadow-2xl transition-all group/doc relative bg-white/5"
              >
                 <div className="h-32 bg-white flex flex-col items-center justify-center">
                    <Calendar className="w-12 h-12 text-indigo-200 mb-3" />
                    <div className="w-2/3 h-2 bg-slate-100 rounded-full mb-2"></div>
                    <div className="w-1/2 h-2 bg-slate-100 rounded-full mb-2"></div>
                    <div className="w-1/3 h-2 bg-slate-100 rounded-full"></div>
                 </div>
                 <div className="bg-white border-t border-slate-100 p-4">
                    <p className="text-slate-800 font-black text-sm leading-tight mb-1 truncate">MIDTERM EXAM SCHEDULE</p>
                    <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-widest">2nd Semester, A.Y. 2025-2026</p>
                 </div>
                 <div className="absolute inset-0 bg-indigo-900/0 group-hover/doc:bg-indigo-900/20 backdrop-blur-[0px] group-hover/doc:backdrop-blur-[2px] transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover/doc:opacity-100 bg-white text-indigo-600 font-bold text-xs px-5 py-2.5 rounded-full shadow-xl transform translate-y-4 group-hover/doc:translate-y-0 transition-all duration-300">
                       Tap to open
                    </span>
                 </div>
              </a>
           </div>
        </div>
      </div>

      {/* ── Official Announcement Image Lightbox Modal ────────────────────── */}
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
