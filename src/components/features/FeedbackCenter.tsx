import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FeedbackCenter() {
  const { profile } = useAuth();
  const [category, setCategory] = useState('General');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        studentId: profile?.uid || 'guest',
        category,
        content,
        createdAt: new Date()
      });
      setSubmitted(true);
      setContent('');
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-50"
        >
          <CheckCircle2 className="w-16 h-16" />
        </motion.div>
        <h2 className="text-4xl font-black text-slate-800 mb-4">Thank you for your feedback!</h2>
        <p className="text-xl text-slate-500 font-medium max-w-md mb-10 leading-relaxed">
          Your suggestions help us improve the Universidad de Dagupan campus experience for everyone.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="bg-blue-600 text-white font-black px-10 py-5 rounded-[2rem] shadow-xl shadow-blue-200 active:scale-95 transition-all text-xl"
        >
          Submit Another Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-violet-100 text-violet-600 rounded-[2rem] mb-4">
           <MessageSquare className="w-10 h-10" />
        </div>
        <h2 className="text-5xl font-black text-slate-800 tracking-tight">Suggestion Box</h2>
        <p className="text-xl text-slate-500 font-medium">Have something in mind? Share your thoughts with us.</p>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['General', 'Facilities', 'Academic', 'Food Service'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-5 rounded-2xl font-bold transition-all border-2 ${
                  category === cat 
                    ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200' 
                    : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="text-lg font-black text-slate-800 ml-2">Describe your feedback in detail</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your suggestions here..."
              className="w-full h-80 bg-slate-50 border-none rounded-[2rem] p-8 text-xl font-medium outline-none focus:ring-4 focus:ring-violet-200 transition-all resize-none shadow-inner"
            ></textarea>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
             <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Anonymous submission is always enabled by default
             </div>
             <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-[1.5rem] shadow-xl shadow-blue-200 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Feedback'} <Send className="w-6 h-6" />
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
