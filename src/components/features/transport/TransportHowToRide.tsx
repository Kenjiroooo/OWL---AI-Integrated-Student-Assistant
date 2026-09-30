// ─────────────────────────────────────────────────────────────────────────────
// TransportHowToRide.tsx – Step-by-step onboarding guide for new riders
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { HOW_TO_RIDE_STEPS, RIDER_TIPS, EMERGENCY_CONTACTS } from '../../../data/transportData';

export default function TransportHowToRide() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="text-center">
        <h3 className="text-2xl font-black text-slate-800">How to Ride the E-Jeepney</h3>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Your complete guide to using the SakayUDD campus transport service
        </p>
      </div>

      {/* Step navigator */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {HOW_TO_RIDE_STEPS.map((step, i) => (
          <button
            key={step.step}
            onClick={() => setActiveStep(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap border-2 transition-all duration-200 shrink-0 ${
              activeStep === i
                ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100'
                : 'bg-white text-slate-600 border-slate-200 hover:border-orange-200 hover:text-orange-600'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
              activeStep === i ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
            }`}>
              {step.step}
            </span>
            {step.title}
          </button>
        ))}
      </div>

      {/* Step detail card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-orange-200"
        >
          {/* Decorative blob */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="text-5xl">{HOW_TO_RIDE_STEPS[activeStep].icon}</div>
            <div>
              <p className="text-orange-200 text-xs font-bold uppercase tracking-widest mb-1">
                Step {HOW_TO_RIDE_STEPS[activeStep].step} of {HOW_TO_RIDE_STEPS.length}
              </p>
              <h4 className="text-2xl font-black">{HOW_TO_RIDE_STEPS[activeStep].title}</h4>
              <p className="text-orange-100 text-base font-medium mt-2 max-w-xl leading-relaxed">
                {HOW_TO_RIDE_STEPS[activeStep].description}
              </p>
            </div>
            <div className="flex gap-2">
              {HOW_TO_RIDE_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === activeStep ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            {activeStep < HOW_TO_RIDE_STEPS.length - 1 && (
              <button
                onClick={() => setActiveStep(s => s + 1)}
                className="mt-2 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* All steps at a glance */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">
          All Steps at a Glance
        </h4>
        <div className="flex flex-col gap-3">
          {HOW_TO_RIDE_STEPS.map((step, i) => (
            <motion.button
              key={step.step}
              onClick={() => setActiveStep(i)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 border-2 ${
                activeStep === i
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-slate-50 border-transparent hover:bg-orange-50/50 hover:border-orange-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                activeStep === i ? 'bg-orange-100' : 'bg-white'
              }`}>
                {step.icon}
              </div>
              <div>
                <p className={`font-bold text-sm ${activeStep === i ? 'text-orange-700' : 'text-slate-700'}`}>
                  {step.title}
                </p>
                <p className="text-slate-400 text-xs font-medium mt-0.5 line-clamp-1">
                  {step.description}
                </p>
              </div>
              <CheckCircle2 className={`w-5 h-5 ml-auto shrink-0 ${
                activeStep === i ? 'text-orange-500' : 'text-slate-200'
              }`} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rider tips grid */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">
          🚌 Rider Tips
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RIDER_TIPS.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3"
            >
              <span className="text-xl shrink-0">{tip.icon}</span>
              <p className="text-slate-700 text-sm font-medium leading-snug">{tip.tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
