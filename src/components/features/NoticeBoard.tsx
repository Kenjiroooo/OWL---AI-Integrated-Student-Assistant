import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Bell, Calendar, Clock, Megaphone, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NoticeBoard() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({ days: '00', hours: '00', mins: '00' });
  const [featuredEvent, setFeaturedEvent] = useState<any>(null);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Try ordered query first
        const q = query(collection(db, 'announcement'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('[NoticeBoard] Fetched announcements:', data.length, data);
        setAnnouncements(data);
        const eventWithTimer = data.find((ann: any) => ann.eventCountdownTimestamp);
        if (eventWithTimer) setFeaturedEvent(eventWithTimer);
      } catch (err) {
        console.warn('[NoticeBoard] Ordered query failed, trying fallback:', err);
        try {
          // Fallback: fetch without orderBy (works even without createdAt field)
          const snap = await getDocs(collection(db, 'announcement'));
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('[NoticeBoard] Fallback fetched:', data.length, data);
          setAnnouncements(data);
          const eventWithTimer = data.find((ann: any) => ann.eventCountdownTimestamp);
          if (eventWithTimer) setFeaturedEvent(eventWithTimer);
        } catch (fallbackErr) {
          console.error('[NoticeBoard] Fallback also failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (!featuredEvent?.eventCountdownTimestamp) return;

    const targetTime = new Date(featuredEvent.eventCountdownTimestamp.seconds * 1000).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeRemaining({ days: '00', hours: '00', mins: '00' });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        mins: mins.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [featuredEvent]);

  const getUrgencyStyles = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-50 text-red-600 border-red-100';
      case 'event': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency': return Megaphone;
      case 'event': return Calendar;
      default: return Info;
    }
  };

  return (
    <div className="space-y-12">
      {/* Featured Countdown — only show when a real event with a countdown exists */}
      {featuredEvent && (
        <div className="bg-rose-500 rounded-[3rem] p-12 text-white shadow-2xl shadow-rose-100 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
              {featuredEvent ? 'Upcoming Event' : 'Featured Notice'}
            </span>
            <h2 className="text-4xl font-black mb-4">
              {featuredEvent?.title || 'Welcome to the OWL Kiosk'}
            </h2>
            <p className="text-rose-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
              {featuredEvent?.content || 'Stay updated with the latest university announcements, emergency alerts, and community events here on the digital notice board.'}
            </p>
            {featuredEvent?.eventCountdownTimestamp && (
              <div className="flex gap-4">
                 {[
                   { val: timeRemaining.days, label: 'Days' },
                   { val: timeRemaining.hours, label: 'Hrs' },
                   { val: timeRemaining.mins, label: 'Mins' },
                 ].map((t, i) => (
                   <div key={i} className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[100px]">
                      <p className="text-3xl font-black leading-none mb-1">{t.val}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-rose-200">{t.label}</p>
                   </div>
                 ))}
              </div>
            )}
          </div>
          <div className="relative z-10 w-full lg:w-48 aspect-square bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 flex flex-col items-center justify-center p-5 text-center">
              {featuredEvent?.eventCountdownTimestamp ? (
                <>
                  <Calendar className="w-10 h-10 mb-3 text-white/50" />
                  <h3 className="text-sm font-black mb-1 italic underline decoration-rose-400 decoration-2 underline-offset-4">SAVE THE DATE</h3>
                  <p className="font-bold text-xs mt-2">{new Date(featuredEvent.eventCountdownTimestamp.seconds * 1000).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </>
              ) : (
                <>
                  <Megaphone className="w-10 h-10 mb-3 text-white/50" />
                  <h3 className="text-sm font-black mb-1 italic underline decoration-rose-400 decoration-2 underline-offset-4">STAY INFORMED</h3>
                  <p className="font-bold text-xs mt-2">Check regular updates</p>
                </>
              )}
          </div>
          <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
            <Bell className="w-[800px] h-[800px] absolute -right-40 -top-40" />
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Digital Notice Board</h3>
          <span className="text-slate-400 text-sm font-bold">{announcements.length} Active Notices</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {announcements.map((ann, idx) => {
            const Icon = getIcon(ann.type);
            return (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-12 rounded-[3rem] border ${getUrgencyStyles(ann.type)} shadow-sm flex flex-col gap-8 group hover:shadow-lg transition-all bg-white overflow-hidden relative cursor-pointer`}
                onClick={() => setSelectedNotice(ann)}
              >
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                  ann.type === 'emergency' ? 'bg-red-100 text-red-600' : 
                  ann.type === 'event' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                   <Icon className="w-12 h-12" />
                </div>
                
                {/* Image preview grid */}
                {ann.imageUrls && ann.imageUrls.length > 0 && (
                  <div className={`grid gap-2 rounded-2xl overflow-hidden ${
                    ann.imageUrls.length === 1 ? 'grid-cols-1' :
                    ann.imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                  }`}>
                    {ann.imageUrls.slice(0, 3).map((url: string, i: number) => {
                        const ts = ann.updatedAt?.seconds ?? ann.createdAt?.seconds ?? 0;
                        const cacheBust = ts ? `?v=${ts}` : '';
                        const finalSrc = `${url}${cacheBust}`;
                        return (
                          <img
                            key={i}
                            src={finalSrc}
                            alt={`${ann.title} photo ${i + 1}`}
                            className="w-full h-44 object-cover bg-slate-100"
                            onError={(e) => {
                              console.warn('[NoticeBoard] Broken image URL:', finalSrc);
                              (e.target as HTMLImageElement).style.display = 'none';
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-full h-44 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium';
                              placeholder.textContent = '⚠ Image not found';
                              (e.target as HTMLImageElement).parentNode?.appendChild(placeholder);
                            }}
                          />
                        );
                      })}
                  </div>
                )}

                <div>
                   <h4 className="text-2xl font-black text-slate-800 mb-3 leading-tight group-hover:text-rose-600 transition-colors uppercase tracking-tight">{ann.title}</h4>
                   <p className="text-slate-600 text-base font-medium leading-relaxed line-clamp-4">{ann.content}</p>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Clock className="w-4 h-4" />
                  {new Date(ann.createdAt?.seconds * 1000).toLocaleDateString()}
                </div>
                
                <Icon className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal for full notice */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotice(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedNotice(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="overflow-y-auto p-8 sm:p-12">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${
                  selectedNotice.type === 'emergency' ? 'bg-red-100 text-red-600' : 
                  selectedNotice.type === 'event' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {React.createElement(getIcon(selectedNotice.type), { className: "w-12 h-12" })}
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-slate-800 mb-6 uppercase tracking-tight leading-tight">
                  {selectedNotice.title}
                </h3>
                
                <div className="flex items-center gap-3 text-slate-500 text-sm font-bold uppercase tracking-widest mb-10 pb-6 border-b border-slate-100">
                  <Clock className="w-5 h-5" />
                  {new Date(selectedNotice.createdAt?.seconds * 1000).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                {selectedNotice.imageUrls && selectedNotice.imageUrls.length > 0 && (
                  <div className={`grid gap-4 mb-10 ${
                    selectedNotice.imageUrls.length === 1 ? 'grid-cols-1' :
                    selectedNotice.imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {selectedNotice.imageUrls.map((url: string, i: number) => {
                      const ts = selectedNotice.updatedAt?.seconds ?? selectedNotice.createdAt?.seconds ?? 0;
                      const cacheBust = ts ? `?v=${ts}` : '';
                      const finalSrc = `${url}${cacheBust}`;
                      return (
                        <img
                          key={i}
                          src={finalSrc}
                          alt={`${selectedNotice.title} photo ${i + 1}`}
                          className="w-full h-64 object-cover rounded-3xl bg-slate-100 shadow-sm"
                        />
                      );
                    })}
                  </div>
                )}

                <div className="prose prose-slate prose-lg max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                    {selectedNotice.content}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
