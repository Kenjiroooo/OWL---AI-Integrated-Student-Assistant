import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  FileCheck,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AcademicAssistance() {
  const { profile } = useAuth();
  
  if (!profile) return null;

  const missingReqs = profile.missingRequirements || [];
  const balance = profile.balance || 0;
  const isClear = missingReqs.length === 0 && balance === 0;

  // Generate Next Steps dynamically
  const nextSteps = [];
  if (missingReqs.includes('Transcript of Records')) {
    nextSteps.push('Submit Transcript of Records to Registrar\'s Office (Building V, Room 101)');
  }
  if (missingReqs.includes('Good Moral Certificate')) {
    nextSteps.push('Request Good Moral from Student Affairs (Building F, Room 202)');
  }
  if (balance > 0) {
    nextSteps.push('Settle outstanding balance using Digital Cashier');
  }

  // Smart Guidance Engine
  const getGuidance = (year: string, program: string) => {
    if (year === '4' || year === '4th') {
      return `As a graduating ${program} student, we recommend starting your Internship application early. Visit the Linkage Office for partner lists.`;
    }
    if (year === '1' || year === '1st') {
      return `Welcome to ${program}! Make sure to familiarize yourself with the campus map and attend the upcoming Freshman Orientation.`;
    }
    return `Keep up the good work in ${program}! Check the library for new resources related to your major subjects this semester.`;
  };

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Requirements Section */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <FileCheck className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">Enrollment Checklist</h2>
          </div>
          
          <div className="space-y-6">
            {missingReqs.length === 0 ? (
              <div className="p-6 bg-emerald-50 rounded-2xl text-emerald-700 font-bold flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6" /> All documentary requirements completed!
              </div>
            ) : (
              missingReqs.map((req, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-red-100">
                  <span className="font-bold text-slate-700">{req}</span>
                  <span className="flex items-center gap-2 text-red-500 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" /> Missing
                  </span>
                </div>
              ))
            )}
            {/* Dummy Completed Items for visual context */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl opacity-60">
              <span className="font-bold text-slate-700">PSA Birth Certificate</span>
              <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Submitted
              </span>
            </div>
          </div>

          {nextSteps.length > 0 && (
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h3 className="font-black text-blue-900 mb-4">Next Steps to Complete Enrollment</h3>
              <ul className="space-y-3">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-blue-800 font-medium">
                    <span className="font-black shrink-0">{i + 1}.</span> {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* AI Smart Guidance */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[3rem] text-white shadow-xl shadow-blue-200">
          <div className="flex items-center gap-4 mb-8">
            <BrainCircuit className="w-8 h-8 text-blue-200" />
            <h2 className="text-2xl font-bold">Smart Guidance Advisor</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 mb-8">
            <p className="text-white/90 leading-relaxed font-medium">
              "{getGuidance(profile.yearLevel || '1', profile.program || 'your program')}"
            </p>
          </div>

          <button className="w-full bg-white text-blue-700 font-bold py-5 rounded-2xl shadow-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-3">
            <TrendingUp className="w-5 h-5" />
            View Career Path Recommendation
          </button>
        </div>
      </div>
    </div>
  );
}
