import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  ClipboardCheck,
  Star,
  Search,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Lock,
  CalendarClock,
  GraduationCap,
  ArrowRight,
  Users,
  Sparkles,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FACULTY_DATA, SCHOOLS, type Faculty } from './facultyLocator/facultyData';

// ── Types ────────────────────────────────────────────────────────────────────

interface EvaluationPeriod {
  startDate: Date;
  endDate: Date;
  periodId: string;
  periodLabel: string;
}

interface RatingCriteria {
  key: string;
  label: string;
  description: string;
}

const CRITERIA: RatingCriteria[] = [
  { key: 'teachingEffectiveness', label: 'Teaching Effectiveness', description: 'Clarity, engagement, and quality of instruction' },
  { key: 'communicationSkills', label: 'Communication Skills', description: 'Responsiveness and clarity in communication' },
  { key: 'availability', label: 'Availability & Accessibility', description: 'Approachable and available during consultation hours' },
  { key: 'subjectKnowledge', label: 'Knowledge of Subject', description: 'Expertise and depth of knowledge in their field' },
  { key: 'fairnessInGrading', label: 'Fairness in Grading', description: 'Fair, transparent, and consistent evaluation' },
];

// ── Star Rating Component ─────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  size = 36,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-colors p-0.5"
        >
          <Star
            style={{ width: size, height: size }}
            className={`transition-all duration-150 ${
              star <= (hover || value)
                ? 'fill-sky-400 text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]'
                : 'fill-transparent text-slate-300'
            }`}
          />
        </motion.button>
      ))}
      {value > 0 && (
        <span className="ml-3 text-sm font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
          {value}/5
        </span>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type Step = 'student-id' | 'select-faculty' | 'evaluate' | 'success';

export default function FeedbackCenter() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('student-id');
  const [studentNumber, setStudentNumber] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [evaluatedFacultyIds, setEvaluatedFacultyIds] = useState<Set<string>>(new Set());
  const [studentIdError, setStudentIdError] = useState('');

  // ── Evaluation period ─────────────────────────────────────────────────────
  const [evalPeriod, setEvalPeriod] = useState<EvaluationPeriod | null>(null);
  const [periodLoading, setPeriodLoading] = useState(true);
  const [periodOpen, setPeriodOpen] = useState(false);

  useEffect(() => {
    const fetchPeriod = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'evaluationPeriod'));
        if (snap.exists()) {
          const data = snap.data();
          const start = data.startDate?.toDate?.() || new Date(data.startDate);
          const end = data.endDate?.toDate?.() || new Date(data.endDate);
          const now = new Date();
          const period: EvaluationPeriod = {
            startDate: start,
            endDate: end,
            periodId: data.periodId || '',
            periodLabel: data.periodLabel || '',
          };
          setEvalPeriod(period);
          setPeriodOpen(now >= start && now <= end);
        } else {
          setPeriodOpen(false);
        }
      } catch (err) {
        console.error('Error fetching evaluation period:', err);
        setPeriodOpen(false);
      } finally {
        setPeriodLoading(false);
      }
    };
    fetchPeriod();
  }, []);

  // ── Fetch already-evaluated faculty for this student ──────────────────────
  const fetchEvaluatedFaculty = async (sn: string) => {
    if (!evalPeriod?.periodId) return;
    try {
      const q = query(
        collection(db, 'facultyEvaluations'),
        where('studentNumber', '==', sn.trim()),
        where('periodId', '==', evalPeriod.periodId)
      );
      const snap = await getDocs(q);
      const ids = new Set<string>();
      snap.docs.forEach((d) => ids.add(d.data().facultyId));
      setEvaluatedFacultyIds(ids);
    } catch (err) {
      console.error('Error fetching evaluated faculty:', err);
    }
  };

  // ── Filtered faculty list ─────────────────────────────────────────────────
  const filteredFaculty = useMemo(() => {
    let list = FACULTY_DATA;
    if (selectedSchool) {
      const schoolName = SCHOOLS.find((s) => s.id === selectedSchool)?.name;
      if (schoolName) list = list.filter((f) => f.school === schoolName);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.school.toLowerCase().includes(q) ||
          f.position.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedSchool, searchQuery]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStudentIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentNumber.trim();
    if (!trimmed) {
      setStudentIdError('Please enter your student number.');
      return;
    }
    setStudentIdError('');
    await fetchEvaluatedFaculty(trimmed);
    setStep('select-faculty');
  };

  const handleSelectFaculty = (faculty: Faculty) => {
    if (evaluatedFacultyIds.has(faculty.id)) return;
    setSelectedFaculty(faculty);
    setRatings({});
    setComment('');
    setStep('evaluate');
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty || !evalPeriod) return;

    // Validate all ratings filled
    const allRated = CRITERIA.every((c) => ratings[c.key] && ratings[c.key] > 0);
    if (!allRated) return;

    setLoading(true);
    try {
      const ratingValues = CRITERIA.map((c) => ratings[c.key]);
      const overallAverage =
        Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 100) / 100;

      await addDoc(collection(db, 'facultyEvaluations'), {
        studentNumber: studentNumber.trim(),
        facultyId: selectedFaculty.id,
        facultyName: selectedFaculty.name,
        schoolId: SCHOOLS.find((s) => s.name === selectedFaculty.school)?.id || '',
        schoolName: selectedFaculty.school,
        periodId: evalPeriod.periodId,
        ratings,
        overallAverage,
        comment: comment.trim(),
        createdAt: new Date(),
      });

      setEvaluatedFacultyIds((prev) => new Set(prev).add(selectedFaculty.id));
      setStep('success');
    } catch (err) {
      console.error('Evaluation submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnother = () => {
    setSelectedFaculty(null);
    setRatings({});
    setComment('');
    setStep('select-faculty');
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (periodLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full"
        />
      </div>
    );
  }

  // ── Evaluation Period Closed ──────────────────────────────────────────────
  if (!periodOpen) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
          style={{ background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', boxShadow: '0 8px 32px rgba(56,189,248,0.15)' }}
        >
          <Lock className="w-14 h-14 text-sky-400" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-black text-slate-800 mb-4"
        >
          Evaluation Period Closed
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-xl text-slate-400 font-medium max-w-lg mb-6 leading-relaxed"
        >
          Faculty evaluations are only available during the official evaluation period each semester.
        </motion.p>
        {evalPeriod && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 font-bold text-sm"
          >
            <CalendarClock className="w-5 h-5" />
            {new Date() < evalPeriod.startDate ? (
              <span>Opens on {evalPeriod.startDate.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            ) : (
              <span>Ended on {evalPeriod.endDate.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // ── Step: Student ID Entry ────────────────────────────────────────────────
  if (step === 'student-id') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          {/* Header */}
          <div
            className="inline-flex p-5 rounded-[2rem] mb-4"
            style={{ background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', boxShadow: '0 8px 32px rgba(56,189,248,0.12)' }}
          >
            <ClipboardCheck className="w-12 h-12 text-sky-500" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Faculty Evaluation</h2>
          <p className="text-lg text-slate-400 font-medium max-w-md mx-auto">
            Enter your student number to begin evaluating your professors for this semester.
          </p>

          {/* Period info */}
          {evalPeriod && (
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-sky-600 bg-sky-50 border border-sky-100 px-5 py-2.5 rounded-2xl mx-auto w-fit">
              <CalendarClock className="w-4 h-4" />
              {evalPeriod.periodLabel}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleStudentIdSubmit} className="space-y-6 mt-8">
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => {
                  setStudentNumber(e.target.value);
                  setStudentIdError('');
                }}
                placeholder="Enter your Student Number"
                className="w-full pl-14 pr-6 py-5 rounded-2xl text-lg font-bold text-slate-800 bg-white border-2 border-sky-100 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all placeholder:text-slate-300 placeholder:font-medium"
                style={{ boxShadow: '0 4px 16px rgba(56,189,248,0.08)' }}
              />
            </div>
            {studentIdError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-500 text-sm font-bold px-2"
              >
                <AlertCircle className="w-4 h-4" />
                {studentIdError}
              </motion.div>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 rounded-2xl text-white text-lg font-black flex items-center justify-center gap-3 transition-all"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
              }}
            >
              Continue <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Step: Faculty Selection ───────────────────────────────────────────────
  if (step === 'select-faculty') {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep('student-id')}
                className="p-3 bg-sky-50 text-sky-500 rounded-2xl hover:bg-sky-100 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Select Faculty</h2>
                <p className="text-slate-400 font-medium text-sm mt-0.5">
                  Student: <span className="text-sky-600 font-bold">{studentNumber}</span> · Choose a professor to evaluate
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-black">
              <Users className="w-4 h-4" />
              {filteredFaculty.length} Faculty
            </div>
          </div>

          {/* Search & School Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty by name, school, or position..."
                className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-bold bg-white border-2 border-sky-100 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all placeholder:text-slate-300 placeholder:font-medium"
              />
            </div>
          </div>

          {/* School chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedSchool(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-black transition-all"
              style={
                !selectedSchool
                  ? { background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: '#fff', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' }
                  : { background: '#f0f9ff', color: '#0284c7', border: '1px solid #e0f2fe' }
              }
            >
              All Schools
            </button>
            {SCHOOLS.map((school) => (
              <button
                key={school.id}
                onClick={() => setSelectedSchool(school.id === selectedSchool ? null : school.id)}
                className="px-4 py-2.5 rounded-xl text-xs font-black transition-all"
                style={
                  selectedSchool === school.id
                    ? { background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: '#fff', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' }
                    : { background: '#f0f9ff', color: '#0284c7', border: '1px solid #e0f2fe' }
                }
              >
                {school.name.replace('School of ', '')}
              </button>
            ))}
          </div>

          {/* Faculty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredFaculty.map((faculty, i) => {
                const alreadyEvaluated = evaluatedFacultyIds.has(faculty.id);
                return (
                  <motion.button
                    layout
                    key={faculty.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelectFaculty(faculty)}
                    disabled={alreadyEvaluated}
                    className={`relative group text-left p-5 rounded-3xl border-2 transition-all ${
                      alreadyEvaluated
                        ? 'opacity-60 cursor-not-allowed border-emerald-100 bg-emerald-50/50'
                        : 'border-sky-50 bg-white hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 active:scale-[0.98] cursor-pointer'
                    }`}
                    style={!alreadyEvaluated ? { boxShadow: '0 2px 12px rgba(56,189,248,0.06)' } : {}}
                  >
                    {/* Evaluated badge */}
                    {alreadyEvaluated && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                        <BadgeCheck className="w-3 h-3" />
                        Evaluated
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-black overflow-hidden"
                        style={{
                          background: faculty.photo ? undefined : 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                          color: '#0284c7',
                        }}
                      >
                        {faculty.photo ? (
                          <img src={faculty.photo} alt={faculty.name} className="w-full h-full object-cover" />
                        ) : (
                          faculty.name[0]
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-800 text-sm leading-tight truncate">{faculty.name}</h3>
                        <p className="text-sky-600 text-xs font-bold mt-0.5">{faculty.position}</p>
                        <p className="text-slate-400 text-[11px] font-medium mt-1 truncate">{faculty.school}</p>
                      </div>

                      {/* Arrow */}
                      {!alreadyEvaluated && (
                        <ChevronRight className="w-5 h-5 text-sky-300 group-hover:text-sky-500 transition-colors flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredFaculty.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <Search className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-black text-slate-400">No faculty found</p>
              <p className="text-slate-400 font-medium text-sm mt-1">Try a different search or school filter</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Step: Evaluation Form ─────────────────────────────────────────────────
  if (step === 'evaluate' && selectedFaculty) {
    const allRated = CRITERIA.every((c) => ratings[c.key] && ratings[c.key] > 0);

    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('select-faculty')}
              className="p-3 bg-sky-50 text-sky-500 rounded-2xl hover:bg-sky-100 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Rate Faculty</h2>
              <p className="text-slate-400 font-medium text-sm mt-0.5">All criteria are required</p>
            </div>
          </div>

          {/* Faculty Card */}
          <div
            className="flex items-center gap-5 p-6 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', border: '1px solid #bae6fd' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl font-black overflow-hidden"
              style={{
                background: selectedFaculty.photo ? undefined : 'linear-gradient(135deg, #7dd3fc, #38bdf8)',
                color: '#fff',
              }}
            >
              {selectedFaculty.photo ? (
                <img src={selectedFaculty.photo} alt={selectedFaculty.name} className="w-full h-full object-cover" />
              ) : (
                selectedFaculty.name[0]
              )}
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl">{selectedFaculty.name}</h3>
              <p className="text-sky-600 font-bold text-sm">{selectedFaculty.position}</p>
              <p className="text-slate-400 font-medium text-xs mt-0.5">{selectedFaculty.school}</p>
            </div>
          </div>

          {/* Rating Form */}
          <form onSubmit={handleSubmitEvaluation} className="space-y-6">
            <div
              className="rounded-[2rem] p-8 space-y-8"
              style={{ background: '#fff', border: '1px solid #e0f2fe', boxShadow: '0 4px 24px rgba(56,189,248,0.08)' }}
            >
              {CRITERIA.map((criteria, i) => (
                <motion.div
                  key={criteria.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-base">{criteria.label}</h4>
                      <p className="text-slate-400 text-xs font-medium">{criteria.description}</p>
                    </div>
                  </div>
                  <StarRating
                    value={ratings[criteria.key] || 0}
                    onChange={(v) => setRatings((prev) => ({ ...prev, [criteria.key]: v }))}
                  />
                  {i < CRITERIA.length - 1 && <div className="border-t border-sky-50 mt-4" />}
                </motion.div>
              ))}
            </div>

            {/* Comment */}
            <div
              className="rounded-[2rem] p-8 space-y-4"
              style={{ background: '#fff', border: '1px solid #e0f2fe', boxShadow: '0 4px 24px rgba(56,189,248,0.08)' }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h4 className="font-black text-slate-800">Additional Comments</h4>
                <span className="text-slate-300 text-xs font-bold">(Optional)</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this professor..."
                className="w-full h-32 bg-sky-50/50 border-2 border-sky-100 rounded-2xl p-5 text-sm font-medium outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all resize-none placeholder:text-slate-300"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between p-6 bg-sky-50 rounded-[2rem] border border-sky-100">
              <div className="flex items-center gap-2 text-sky-500 text-xs font-bold">
                <GraduationCap className="w-4 h-4" />
                Student: {studentNumber}
              </div>
              <motion.button
                type="submit"
                disabled={loading || !allRated}
                whileHover={allRated ? { scale: 1.03 } : {}}
                whileTap={allRated ? { scale: 0.97 } : {}}
                className="px-10 py-4 rounded-2xl text-white font-black flex items-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: allRated ? 'linear-gradient(135deg, #0ea5e9, #38bdf8)' : '#cbd5e1',
                  boxShadow: allRated ? '0 8px 24px rgba(14,165,233,0.3)' : 'none',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Evaluation'}
                <ClipboardCheck className="w-5 h-5" />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Step: Success ─────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
          style={{ background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', boxShadow: '0 8px 32px rgba(56,189,248,0.15)' }}
        >
          <CheckCircle2 className="w-16 h-16 text-sky-500" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-black text-slate-800 mb-4"
        >
          Evaluation Submitted!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-xl text-slate-400 font-medium max-w-md mb-6 leading-relaxed"
        >
          Thank you for evaluating{' '}
          <span className="text-sky-600 font-bold">{selectedFaculty?.name}</span>. Your feedback helps improve teaching quality at Universidad de Dagupan.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={handleEvaluateAnother}
            className="px-10 py-5 rounded-[2rem] text-white font-black text-lg flex items-center gap-3 active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
              boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
            }}
          >
            Evaluate Another Faculty
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
}
