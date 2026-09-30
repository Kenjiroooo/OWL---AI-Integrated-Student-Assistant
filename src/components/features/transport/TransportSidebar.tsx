// ─────────────────────────────────────────────────────────────────────────────
// TransportSidebar.tsx – QR code download card, rider tips, and emergency info
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { motion } from 'motion/react';
import { Phone, Download, Smartphone, ShieldAlert, Info } from 'lucide-react';
import { EMERGENCY_CONTACTS, RIDER_TIPS } from '../../../data/transportData';

const SAKAYUDD_APP_URL = 'https://sakayudd-website.vercel.app/';
const QR_API = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(SAKAYUDD_APP_URL)}&color=f97316&bgcolor=fff7ed`;

export default function TransportSidebar() {
  return (
    <div className="flex flex-col gap-4">
      {/* Download App Card */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-orange-100"
      >
        {/* Blob */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-2xl border border-white/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-black italic tracking-tight">Sakay UdD</h4>
            <p className="text-orange-100 text-xs font-medium mt-1 leading-relaxed">
              Download the official app and track the e-jeep on your phone in real-time.
            </p>
          </div>

          {/* QR Code */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-orange-50 p-3 rounded-2xl shadow-xl border-4 border-white/40"
          >
            <img
              src={QR_API}
              alt="Scan to download Sakay UdD"
              className="w-28 h-28 object-contain rounded-xl"
            />
          </motion.div>

          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="text-[11px] font-black uppercase tracking-widest text-orange-100"
          >
            📱 Scan to Download
          </motion.p>

          <a
            href={SAKAYUDD_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-white text-orange-600 font-black text-sm px-5 py-3 rounded-2xl hover:bg-orange-50 hover:shadow-lg transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Get the App
          </a>
        </div>
      </motion.div>

      {/* Quick Tips Card */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-orange-500 shrink-0" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Quick Tips</h4>
        </div>
        <div className="flex flex-col gap-2">
          {RIDER_TIPS.slice(0, 4).map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-3 py-2">
              <span className="text-sm shrink-0">{tip.icon}</span>
              <p className="text-slate-600 text-[11px] font-medium leading-snug">{tip.tip}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Contacts</h4>
        </div>
        <div className="flex flex-col gap-2">
          {EMERGENCY_CONTACTS.map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
              <span className="text-base shrink-0">{c.icon}</span>
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{c.label}</p>
                <p className="text-slate-700 text-xs font-black">{c.number}</p>
              </div>
              <a
                href={`tel:${c.number.replace(/[^0-9+]/g, '')}`}
                className="ml-auto bg-rose-500 text-white p-1.5 rounded-lg hover:bg-rose-600 transition-colors"
              >
                <Phone className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Attribution notice */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3 text-center">
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          Live tracking data is provided by the{' '}
          <a href="https://uddsoe-sakayudd.firebaseapp.com/" target="_blank" rel="noopener noreferrer"
            className="text-orange-500 font-bold hover:underline">
            SakayUDD
          </a>{' '}
          thesis team. OWL Kiosk embeds their service in accordance with an inter-thesis collaboration.
        </p>
      </div>
    </div>
  );
}
