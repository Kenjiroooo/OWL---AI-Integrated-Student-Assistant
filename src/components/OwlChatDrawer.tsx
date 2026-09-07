import React, { useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Square, ExternalLink, BrainCircuit, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOwlAssistant } from '../context/OwlAssistantContext';
import { OwlCharacter } from './OwlCharacter';

/**
 * OwlChatDrawer — Slide-in mini chat panel.
 *
 * Renders as a fixed panel on the right side of the screen.
 * Context-aware: greeting and AI prompt change based on the current feature.
 */
export default function OwlChatDrawer() {
  const {
    isOpen,
    closeDrawer,
    messages,
    isTyping,
    sendMessage,
    inputValue,
    setInputValue,
    stopGeneration,
  } = useOwlAssistant();

  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && !isTyping) {
      sendMessage(inputValue);
    }
  };

  const QUICK_PROMPTS = [
    'Where is this office?',
    'Help me understand this',
    'What should I do next?',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[900]"
          />

          {/* Drawer Panel */}
          <motion.div
            key="drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl shadow-slate-900/20 z-[901] flex flex-col border-l border-slate-200"
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/40">
                  <OwlCharacter className="w-10 h-10 scale-[1.3] translate-y-0.5" hideShadow />
                </div>
                <div>
                  <p className="text-white font-black text-base leading-tight">OWL AI Assistant</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-blue-100 text-xs font-semibold">Ready to help</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Open full chat page */}
                <button
                  onClick={() => { closeDrawer(); navigate('/owl-chat'); }}
                  title="Open full screen chat"
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                {/* Close */}
                <button
                  onClick={closeDrawer}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Messages ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                      <OwlCharacter className="w-8 h-8 scale-[1.5] translate-y-1" hideShadow />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-medium shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <OwlCharacter className="w-8 h-8 scale-[1.5] translate-y-1" hideShadow />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Prompts (shown only when only greeting message) ── */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quick questions</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-xs font-semibold px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Input Bar ──────────────────────────────────────────── */}
            <div className="px-4 py-4 bg-white border-t border-slate-100 flex-shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask OWL anything..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full py-3 px-5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {isTyping ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0 shadow-lg shadow-red-200"
                  >
                    <Square className="w-4 h-4" fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>
              <p className="text-center text-[10px] text-slate-400 font-medium mt-2">
                OWL AI • Universidad de Dagupan Campus Assistant
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
