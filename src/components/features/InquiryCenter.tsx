import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { HelpCircle, ChevronDown, Search, BookOpen, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InquiryCenter() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      const snap = await getDocs(collection(db, 'inquiryBase'));
      setFaqs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="bg-sky-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-sky-100 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4">Inquiry Center</h2>
          <p className="text-sky-100 text-xl font-medium opacity-90 max-w-xl leading-relaxed">
            Quickly find answers to common questions about campus life, academics, and services.
          </p>
        </div>
        <HelpCircle className="w-64 h-64 text-white opacity-10 absolute -right-10 -bottom-10" />
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 flex items-center gap-6">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-3xl flex items-center justify-center">
           <Search className="w-8 h-8" />
        </div>
        <input 
          type="text" 
          placeholder="What are you looking for?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-2xl font-bold text-slate-800 placeholder:text-slate-300"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {filteredFaqs.map((faq, idx) => (
          <div key={faq.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-8 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-6">
                 <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-black group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                    ?
                 </div>
                 <span className="text-xl font-bold text-slate-800 tracking-tight">{faq.question}</span>
              </div>
              <ChevronDown className={`w-6 h-6 text-slate-300 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-sky-600' : ''}`} />
            </button>
            
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="p-8 pt-0 pl-[calc(2.5rem+3.5rem)]">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative">
                       <Quote className="w-10 h-10 text-sky-100 absolute left-4 top-4" />
                       <p className="text-slate-600 text-lg font-medium leading-relaxed relative z-10">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-10" />
             <p className="text-xl font-bold tracking-tight">We couldn't find an answer to that.</p>
             <p className="font-medium mt-1">Try a different search or visit the Guidance office.</p>
          </div>
        )}
      </div>
    </div>
  );
}
