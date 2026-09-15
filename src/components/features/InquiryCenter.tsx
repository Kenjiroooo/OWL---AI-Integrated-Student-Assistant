import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { HelpCircle, ChevronDown, Search, BookOpen, Quote, BrainCircuit, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOwlAssistant } from '../../context/OwlAssistantContext';

// ── Hardcoded FAQ fallback ────────────────────────────────────────────────────
// Shown immediately while Firestore loads, and used if the collection is empty.

const FALLBACK_FAQS = [
  {
    id: 'faq-1',
    question: 'How do I request a Transcript of Records?',
    answer:
      "Visit the Registrar's Office at the Administration Building (A Building). Fill out the request form, pay the processing fee at the Finance Office, and allow 3–5 working days. Bring a valid school ID.",
    category: 'Registrar',
  },
  {
    id: 'faq-2',
    question: 'What are the enrollment steps for new students?',
    answer:
      '1) Submit admission requirements online or at the Registrar\'s Office. 2) Take the entrance exam if applicable. 3) Receive your assessment. 4) Pay tuition at the Finance Office or via online payment. 5) Claim your class schedule and school ID.',
    category: 'Enrollment',
  },
  {
    id: 'faq-3',
    question: 'Where can I find my class schedule and grades?',
    answer:
      'Access your class schedule and grades through the UdD student portal at site.udd.edu.ph. Log in with your student credentials. For enrollment-related concerns, visit the Registrar\'s Office directly.',
    category: 'Academics',
  },
  {
    id: 'faq-4',
    question: 'What should I do if I lost my school ID?',
    answer:
      'Report the lost ID to the Student Affairs Office immediately. Fill out the ID replacement form and pay the replacement fee at the Finance Office. Processing usually takes 3–5 working days.',
    category: 'Student Affairs',
  },
  {
    id: 'faq-5',
    question: 'How do I apply for a Leave of Absence?',
    answer:
      "Submit a written letter of intent to the Registrar's Office stating the reason and expected duration. A parent or guardian signature is required. You may re-enroll for the next applicable semester after the LOA is processed.",
    category: 'Registrar',
  },
  {
    id: 'faq-6',
    question: 'What are the campus clinic hours and services?',
    answer:
      'The campus clinic at the School of Health Sciences building is open Monday to Friday, 8:00 AM – 5:00 PM. Services include first aid, basic health consultations, and medical clearance for enrollment.',
    category: 'Health Services',
  },
  {
    id: 'faq-7',
    question: 'How do I contact the Finance Office for tuition concerns?',
    answer:
      'The Finance Office is at the Administration Building (A Building), open Monday–Friday 8:00 AM–5:00 PM. For online payment instructions and bank details, visit the official UdD website at udd.edu.ph.',
    category: 'Finance',
  },
];

// ── Category badge colors ─────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Registrar:       { bg: 'rgba(99,102,241,0.1)',  text: '#4f46e5' },
  Enrollment:      { bg: 'rgba(16,185,129,0.1)',  text: '#059669' },
  Academics:       { bg: 'rgba(6,182,212,0.1)',   text: '#0891b2' },
  'Student Affairs': { bg: 'rgba(245,158,11,0.1)', text: '#b45309' },
  'Health Services': { bg: 'rgba(244,63,94,0.1)',  text: '#e11d48' },
  Finance:         { bg: 'rgba(139,92,246,0.1)',  text: '#7c3aed' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function InquiryCenter() {
  const [faqs, setFaqs] = useState<any[]>(FALLBACK_FAQS);
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { openDrawer } = useOwlAssistant();

  // Fetch from Firestore and merge — Firestore data wins if present
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const snap = await getDocs(collection(db, 'inquiryBase'));
        if (!snap.empty) {
          setFaqs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch {
        // Firestore unavailable — keep using fallback
      }
    };
    fetchFaqs();
  }, []);

  // Unique categories for filter chips
  const categories = Array.from(new Set(faqs.map(f => f.category).filter(Boolean)));

  const filteredFaqs = faqs.filter(f => {
    const matchSearch =
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !activeCategory || f.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-10 pb-10">

      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <div
        className="rounded-[3rem] p-12 text-white shadow-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)', filter: 'blur(40px)' }} />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.4)', filter: 'blur(30px)' }} />
        <HelpCircle className="w-48 h-48 text-white opacity-10 absolute -right-8 -bottom-8" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white/90 text-xs font-black uppercase tracking-widest mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-5xl font-black mb-3 leading-tight">Inquiry Center</h2>
          <p className="text-sky-100 text-xl font-medium opacity-90 max-w-xl leading-relaxed">
            Quickly find answers to common questions about campus life, academics, and services.
          </p>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────── */}
      <div
        className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-900/5 flex items-center gap-5"
        style={{ boxShadow: '0 4px 24px rgba(2,132,199,0.08)' }}
      >
        <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Search className="w-7 h-7" />
        </div>
        <input
          type="text"
          placeholder="Search questions or topics..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setOpenIndex(null); }}
          className="flex-1 bg-transparent border-none outline-none text-2xl font-bold text-slate-800 placeholder:text-slate-300"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-slate-300 hover:text-slate-500 transition-colors font-black text-xl px-3"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Category Filter Chips ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => { setActiveCategory(null); setOpenIndex(null); }}
          className="px-5 py-2.5 rounded-2xl text-sm font-black transition-all"
          style={!activeCategory
            ? { background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', color: '#fff', boxShadow: '0 4px 14px rgba(2,132,199,0.3)' }
            : { background: 'rgba(2,132,199,0.07)', color: '#64748b' }}
        >
          All Topics
        </button>
        {categories.map(cat => {
          const colors = CATEGORY_COLORS[cat as string] || { bg: 'rgba(100,116,139,0.1)', text: '#64748b' };
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(isActive ? null : cat); setOpenIndex(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all"
              style={isActive
                ? { background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', color: '#fff', boxShadow: '0 4px 14px rgba(2,132,199,0.3)' }
                : { background: colors.bg, color: colors.text }}
            >
              <Tag className="w-3.5 h-3.5" />
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── FAQ Count Label ───────────────────────────────────────────────── */}
      {filteredFaqs.length > 0 && (
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
          {activeCategory && ` in ${activeCategory}`}
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      )}

      {/* ── FAQ Accordion ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredFaqs.map((faq, idx) => {
            const colors = CATEGORY_COLORS[faq.category] || { bg: 'rgba(100,116,139,0.1)', text: '#64748b' };
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-3xl border overflow-hidden group transition-all"
                style={{
                  borderColor: isOpen ? 'rgba(2,132,199,0.25)' : '#f1f5f9',
                  boxShadow: isOpen ? '0 8px 32px rgba(2,132,199,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-7 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    {/* Number badge */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-all"
                      style={isOpen
                        ? { background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#fff' }
                        : { background: '#f1f5f9', color: '#94a3b8' }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xl font-black text-slate-800 tracking-tight block leading-snug">
                        {faq.question}
                      </span>
                      {faq.category && (
                        <span
                          className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {faq.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 transition-all"
                    style={isOpen
                      ? { background: 'rgba(2,132,199,0.1)', color: '#0284c7' }
                      : { background: '#f8fafc', color: '#cbd5e1' }}
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-7 pb-7 pl-[calc(1.75rem+2.5rem+1.25rem)]">
                        <div
                          className="p-7 rounded-2xl relative"
                          style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '1px solid rgba(2,132,199,0.1)' }}
                        >
                          <Quote className="w-8 h-8 text-sky-200 absolute left-4 top-4" />
                          <p className="text-slate-700 text-lg font-medium leading-relaxed relative z-10">
                            {faq.answer}
                          </p>
                        </div>

                        {/* Ask OWL follow-up */}
                        <button
                          onClick={() => openDrawer(`I have a follow-up question about: ${faq.question}`)}
                          className="mt-4 flex items-center gap-2 text-sm font-black text-sky-500 hover:text-sky-700 transition-colors"
                        >
                          <BrainCircuit className="w-4 h-4" />
                          Ask OWL a follow-up question
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Empty State ──────────────────────────────────────────────────── */}
        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 px-8"
          >
            <BookOpen className="w-14 h-14 mx-auto mb-4 text-slate-200" />
            <p className="text-xl font-black text-slate-700 tracking-tight">No FAQ found for that.</p>
            <p className="font-medium text-slate-400 mt-2 mb-8">
              But OWL AI might know the answer! Let me ask on your behalf.
            </p>
            <button
              onClick={() => openDrawer(searchTerm || 'I have a question about campus services at UdD.')}
              className="inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-[1.5rem] shadow-xl transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', boxShadow: '0 8px 24px rgba(2,132,199,0.3)' }}
            >
              <BrainCircuit className="w-5 h-5" />
              Ask OWL AI Instead
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
