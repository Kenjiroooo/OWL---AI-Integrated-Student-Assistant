import React from 'react';
import { motion } from 'motion/react';
import { useOwlAssistant } from '../context/OwlAssistantContext';
import { OwlCharacter } from './OwlCharacter';
import { useLocation } from 'react-router-dom';

/**
 * OwlAIFab — Floating Action Button for the OWL AI Assistant.
 *
 * Appears in the bottom-right corner on all pages except /owl-chat.
 * Clicking it opens/closes the OwlChatDrawer.
 */
export default function OwlAIFab() {
  const { isOpen, toggleDrawer } = useOwlAssistant();
  const location = useLocation();

  // Don't render on the full OWL chat page, starting page, or dashboard
  const hiddenPaths = ['/', '/home', '/owl-chat'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[800] flex flex-col items-end gap-3">
      {/* Tooltip — shown only when drawer is closed */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl whitespace-nowrap pointer-events-none"
        >
          Ask OWL AI 🦉
          {/* Tooltip arrow */}
          <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-slate-800 rotate-45 rounded-sm" />
        </motion.div>
      )}

      {/* Main FAB Button */}
      <motion.button
        onClick={toggleDrawer}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={{
          boxShadow: isOpen
            ? '0 0 0 0px rgba(99,102,241,0), 0 20px 60px rgba(99,102,241,0.4)'
            : [
                '0 0 0 0px rgba(99,102,241,0.3), 0 20px 60px rgba(99,102,241,0.3)',
                '0 0 0 12px rgba(99,102,241,0), 0 20px 60px rgba(99,102,241,0.3)',
                '0 0 0 0px rgba(99,102,241,0), 0 20px 60px rgba(99,102,241,0.3)',
              ],
        }}
        transition={
          isOpen
            ? { duration: 0.2 }
            : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        }
        className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center overflow-hidden relative border-4 border-white"
        aria-label={isOpen ? 'Close OWL AI Assistant' : 'Open OWL AI Assistant'}
      >
        {/* Glowing background pulse */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Owl mascot / close icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 0.8 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative z-10 w-full h-full flex items-center justify-center"
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <OwlCharacter className="w-16 h-16 scale-[1.3] translate-y-1.5" hideShadow />
          )}
        </motion.div>

        {/* Notification dot — always visible when closed, subtle */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"
          />
        )}
      </motion.button>
    </div>
  );
}
