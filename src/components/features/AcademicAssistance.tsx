import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  FileCheck,
  BrainCircuit,
  TrendingUp,
  BookOpen,
  Award,
  ChevronRight,
  Sparkles,
  GraduationCap,
  BarChart3,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  DUMMY_ACADEMIC_DATA,
  getGradeBadgeClass,
  getStatusBadge,
} from '../../data/dummyAcademicData';
import { useOwlAssistant } from '../../context/OwlAssistantContext';
import SecureFeatureWrapper from '../common/SecureFeatureWrapper';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a UdD 1.0–5.0 GWA to a percentage for visual progress rings */
function gwaToPercent(gwa: number): number {
  // 1.0 = 100%, 3.0 = 50%, 5.0 = 0%
  return Math.max(0, Math.min(100, ((5 - gwa) / 4) * 100));
}

// ── Circular GWA Ring ─────────────────────────────────────────────────────────

function GWARing({ gwa }: { gwa: number }) {
  const pct = gwaToPercent(gwa);
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
        {/* Track */}
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        {/* Progress */}
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#gwaGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="gwaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <p className="text-3xl font-black text-slate-800 leading-none">{gwa.toFixed(2)}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">GWA</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AcademicAssistance() {
  const data = DUMMY_ACADEMIC_DATA;
  const { openDrawer } = useOwlAssistant();
  const [showAllGrades, setShowAllGrades] = useState(false);

  const atRiskSubject = data.grades.find((g) => g.status === 'at-risk');
  const curriculumPct = Math.round((data.completedUnits / data.totalUnits) * 100);
  const isClear = data.missingRequirements.length === 0 && data.balance === 0;

  const handleAiInsight = () => {
    const prompt = atRiskSubject
      ? `My midterm grade in "${atRiskSubject.name}" is ${atRiskSubject.midterm}. Can you give me a 5-day study plan to improve it before finals?`
      : `My current GWA is ${data.gwa}. What can I do to maintain or improve my academic standing as a ${data.yearLevel} ${data.program} student?`;
    openDrawer(prompt);
  };

  return (
    <SecureFeatureWrapper featureName="Academic Hub" demoId="23-7687">
      <div className="space-y-8">

        {/* ── Hero Student Card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full translate-y-16 -translate-x-8 blur-xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/15 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">Academic Profile</p>
              <h2 className="text-3xl font-black text-white leading-tight">{data.studentName}</h2>
              <p className="text-blue-100 font-semibold mt-1">{data.studentId}</p>
              <p className="text-blue-200 text-sm font-medium mt-0.5">
                {data.yearLevel} · {data.program}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* GWA Ring */}
            <div className="text-center">
              <GWARing gwa={data.gwa} />
            </div>
            {/* Honor Status */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-8 py-6 gap-2">
              <Award className="w-8 h-8 text-amber-300" />
              <p className="text-white font-black text-sm text-center leading-tight max-w-[120px]">
                {data.honorStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Semester Badge */}
        <div className="relative z-10 flex items-center gap-3 mt-6 flex-wrap">
          <span className="bg-white/15 border border-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
            {data.semester}
          </span>
          <span className="bg-white/15 border border-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
            {data.academicYear}
          </span>
          <span className="bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-bold px-4 py-1.5 rounded-full">
            ● {data.enrollmentStatus}
          </span>
        </div>
      </motion.div>

      {/* ── Grid Row 1: Curriculum Progress + Enrollment Checklist ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Curriculum Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-800">Curriculum Progress</h2>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-5xl font-black text-slate-800">{curriculumPct}%</p>
                <p className="text-slate-500 font-semibold text-sm mt-1">of total degree units completed</p>
              </div>
              <p className="text-lg font-bold text-slate-400">
                {data.completedUnits}<span className="text-slate-300">/{data.totalUnits}</span>
                <span className="text-sm ml-1 text-slate-400">units</span>
              </p>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${curriculumPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              />
            </div>
          </div>

          {/* Units breakdown */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { label: 'Completed', value: data.completedUnits, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Remaining', value: data.totalUnits - data.completedUnits, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-2xl p-5 text-center`}>
                <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Enrollment Checklist */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <FileCheck className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">Enrollment Checklist</h2>
          </div>

          {/* Overall status */}
          {isClear ? (
            <div className="p-6 bg-emerald-50 rounded-2xl text-emerald-700 font-bold flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              All requirements are complete! You're good to go.
            </div>
          ) : (
            <div className="p-5 bg-amber-50 rounded-2xl text-amber-700 font-bold flex items-center gap-3 mb-6 border border-amber-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {data.missingRequirements.length} requirement(s) pending
            </div>
          )}

          <div className="space-y-3">
            {/* Completed items */}
            {['PSA Birth Certificate', 'Form 137 / High School Card', 'Medical Certificate', 'Enrollment Form'].map((req) => (
              <div key={req} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="font-semibold text-slate-600">{req}</span>
                <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Submitted
                </span>
              </div>
            ))}
            {/* Missing items */}
            {data.missingRequirements.map((req) => (
              <div key={req} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                <span className="font-bold text-slate-700">{req}</span>
                <span className="flex items-center gap-2 text-red-500 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" /> Missing
                </span>
              </div>
            ))}
          </div>

          {data.missingRequirements.length > 0 && (
            <button
              onClick={() => openDrawer(`How and where do I get a "${data.missingRequirements[0]}" at Universidad de Dagupan?`)}
              className="w-full mt-6 py-4 rounded-2xl bg-blue-50 text-blue-700 font-bold border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <BrainCircuit className="w-5 h-5" />
              Ask OWL: Where to get missing documents?
            </button>
          )}
        </motion.div>
      </div>

      {/* ── Current Semester Grades ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Current Semester Grades</h2>
              <p className="text-slate-400 text-sm font-medium">{data.semester} · {data.academicYear}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAllGrades(!showAllGrades)}
            className="text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2 rounded-xl hover:bg-blue-100 transition-colors"
          >
            {showAllGrades ? 'Collapse' : 'View All'}
          </button>
        </div>

        {/* Grade Scale Legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: '1.0–1.5 Excellent', cls: 'bg-emerald-100 text-emerald-700' },
            { label: '1.75–2.0 Good', cls: 'bg-blue-100 text-blue-700' },
            { label: '2.25–2.5 Satisfactory', cls: 'bg-amber-100 text-amber-700' },
            { label: '2.75+ At Risk', cls: 'bg-red-100 text-red-700' },
          ].map((l) => (
            <span key={l.label} className={`text-xs font-bold px-3 py-1.5 rounded-full ${l.cls}`}>
              {l.label}
            </span>
          ))}
        </div>

        {/* Grades Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Subject Code', 'Subject Name', 'Units', 'Midterm Grade', 'Final Grade', 'Status'].map((h) => (
                  <th key={h} className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(showAllGrades ? data.grades : data.grades.slice(0, 4)).map((grade, idx) => {
                const statusBadge = getStatusBadge(grade.status);
                return (
                  <motion.tr
                    key={grade.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-slate-600 text-sm">{grade.code}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{grade.name}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium text-center">{grade.units}</td>
                    <td className="py-4 px-4">
                      {grade.midterm !== null ? (
                        <span className={`px-3 py-1 rounded-full text-sm font-black ${getGradeBadgeClass(grade.midterm)}`}>
                          {grade.midterm.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-medium text-sm">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-300 font-medium text-sm">Not yet released</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── OWL AI Insights ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-32 translate-x-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full translate-y-16 -translate-x-8 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm border border-white/20">
              <Sparkles className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">AI-Powered</p>
              <h2 className="text-2xl font-bold">OWL AI Academic Insights</h2>
            </div>
          </div>

          {/* Smart Insight Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center flex-shrink-0 mt-1">
                {atRiskSubject ? (
                  <AlertCircle className="w-5 h-5 text-amber-300" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-emerald-300" />
                )}
              </div>
              <div>
                {atRiskSubject ? (
                  <>
                    <p className="text-white font-black text-lg mb-2">
                      📊 Heads up! Your midterm in {atRiskSubject.name} is {atRiskSubject.midterm?.toFixed(2)}.
                    </p>
                    <p className="text-indigo-100 font-medium leading-relaxed">
                      This is below your usual performance. The finals carry significant weight — I can create a personalized 5-day study plan to help you recover. Tap below to get started!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-black text-lg mb-2">
                      🌟 Outstanding academic performance this semester!
                    </p>
                    <p className="text-indigo-100 font-medium leading-relaxed">
                      Your current GWA of {data.gwa} puts you firmly on the {data.honorStatus}. You're on the right track — let me suggest some strategies to maintain this through finals week!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleAiInsight}
              className="flex items-center gap-3 bg-white text-indigo-700 font-black px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-indigo-900/20"
            >
              <BrainCircuit className="w-5 h-5" />
              {atRiskSubject ? 'Generate Study Plan' : 'Ask OWL for Tips'}
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDrawer(`What career paths are available for a ${data.yearLevel} ${data.program} student at UdD?`)}
              className="flex items-center gap-3 bg-white/15 border border-white/25 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <TrendingUp className="w-5 h-5" />
              Career Path Advisor
            </button>
          </div>
        </div>
      </motion.div>

      </div>
    </SecureFeatureWrapper>
  );
}
