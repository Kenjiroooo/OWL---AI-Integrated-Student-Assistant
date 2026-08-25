import React from 'react';
import { Bus } from 'lucide-react';

export default function Transport() {
  return (
    <div className="space-y-8">
      {/* Live Status Header */}
      <div className="bg-orange-500 rounded-[2.5rem] py-6 px-8 text-white shadow-xl shadow-orange-100 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Bus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">SakayUDD</h2>
          </div>
          <p className="text-orange-100 text-sm font-medium opacity-90 max-w-2xl leading-relaxed">
            SakayUDD is a transportation assistance system for Universidad de Dagupan students that provides e-jeepney routes, stops, and schedules, helping students navigate the campus and nearby areas more easily.
          </p>
        </div>
        <Bus className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 -rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Today's Timetable</h3>
            <span className="text-orange-600 font-bold text-xs uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-100 animate-pulse">Live Tracking Enabled</span>
          </div>
          
          <div className="w-full h-[650px] bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <iframe 
              src="https://uddsoe-sakayudd.firebaseapp.com/" 
              className="w-full h-full border-0" 
              title="Sakay UdD Transport Tracker"
            />
          </div>
        </div>

        {/* Promotional / Download Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          {/* Sakay UdD Promotional Section */}
          <div className="flex-1 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl text-white shadow-lg relative overflow-hidden group text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
            
            <h4 className="text-xl font-black italic tracking-tight mb-2 relative z-10">Sakay UdD</h4>
            <p className="text-orange-100 text-xs font-medium text-center mb-5 max-w-[180px] relative z-10">
              Track the E-Jeep in real-time. Download the official app now!
            </p>
            
            <div className="bg-white p-2.5 rounded-2xl shadow-xl mb-4 relative z-10 transform group-hover:scale-105 transition-transform duration-300">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://sakayudd-website.vercel.app/" 
                alt="Sakay UdD QR Code" 
                className="w-24 h-24 object-contain rounded-xl"
              />
            </div>
            
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-100 mb-3 relative z-10 animate-bounce">
              Scan to Download
            </p>

            <a 
              href="https://sakayudd-website.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative z-10 bg-white text-orange-600 font-black text-xs px-5 py-2.5 rounded-full hover:bg-orange-50 hover:shadow-lg transition-all"
            >
              Get the App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
