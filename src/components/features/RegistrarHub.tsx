import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { FileText, ListOrdered, Send, CheckCircle2, Loader2, Ticket, Users, FilePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type HubTab = 'docs' | 'queue';

export default function RegistrarHub() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<HubTab>('docs');
  
  // Doc Requests state
  const [docRequests, setDocRequests] = useState<any[]>([]);
  const [docType, setDocType] = useState('Transcript of Records');
  const [docRemarks, setDocRemarks] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState(false);

  // Queue state
  const [myTicket, setMyTicket] = useState<any>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [myQueuePosition, setMyQueuePosition] = useState(0);
  const [joiningQueue, setJoiningQueue] = useState(false);

  useEffect(() => {
    if (!profile) return;

    // Fetch Doc Requests
    const fetchDocs = async () => {
      const q = query(collection(db, 'docRequests'), where('studentId', '==', profile.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setDocRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchDocs();

    // Listen to Active Queue
    const qQueue = query(collection(db, 'queueTickets'), where('status', '==', 'waiting'), orderBy('createdAt', 'asc'));
    const unsubscribeQueue = onSnapshot(qQueue, (snap) => {
      setQueueCount(snap.size);
      const index = snap.docs.findIndex(d => d.data().studentId === profile.uid);
      setMyQueuePosition(index >= 0 ? index + 1 : 0);
    });

    // Listen to MY Ticket
    const qMyTicket = query(
      collection(db, 'queueTickets'), 
      where('studentId', '==', profile.uid), 
      where('status', 'in', ['waiting', 'serving']),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeMyTicket = onSnapshot(qMyTicket, (snap) => {
      if (!snap.empty) {
        setMyTicket({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setMyTicket(null);
      }
    });

    return () => {
      unsubscribeQueue();
      unsubscribeMyTicket();
    };
  }, [profile]);

  const handleDocRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingDoc(true);
    try {
      await addDoc(collection(db, 'docRequests'), {
        studentId: profile.uid,
        documentType: docType,
        remarks: docRemarks,
        status: 'pending',
        createdAt: new Date()
      });
      setDocSuccess(true);
      setDocRemarks('');
      setTimeout(() => setDocSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingDoc(false);
    }
  };

  const handleJoinQueue = async () => {
    if (!profile || myTicket) return;
    setJoiningQueue(true);
    try {
      const ticketNumber = `REG-${Math.floor(Math.random() * 900) + 100}`;
      await addDoc(collection(db, 'queueTickets'), {
        studentId: profile.uid,
        ticketNumber,
        serviceType: 'Registrar Inquiry',
        status: 'waiting',
        createdAt: new Date()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningQueue(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex gap-4 bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm w-fit mx-auto">
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black transition-all ${
            activeTab === 'docs' ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-5 h-5" /> Online Document Request
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black transition-all ${
            activeTab === 'queue' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <ListOrdered className="w-5 h-5" /> Registrar E-Queue
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'docs' ? (
          <motion.div 
            key="docs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {/* Form */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                     <FilePlus className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">New Request</h2>
               </div>

               <form onSubmit={handleDocRequest} className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Select Document Type</label>
                     <div className="grid grid-cols-1 gap-3">
                        {['Transcript of Records', 'Certificate of Enrollment', 'Diploma Copy', 'Authentication'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setDocType(type)}
                            className={`p-5 rounded-2xl text-left font-bold border-2 transition-all ${
                              docType === type ? 'bg-purple-50 border-purple-600 text-purple-800' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-100'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Remarks (Optional)</label>
                     <textarea 
                       value={docRemarks}
                       onChange={(e) => setDocRemarks(e.target.value)}
                       placeholder="e.g., For scholarship application purposes..."
                       className="w-full p-6 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-700 resize-none h-32"
                     ></textarea>
                  </div>

                  <button 
                    disabled={submittingDoc || docSuccess}
                    className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl ${
                      docSuccess ? 'bg-emerald-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100'
                    }`}
                  >
                    {submittingDoc ? <Loader2 className="w-6 h-6 animate-spin" /> : docSuccess ? <><CheckCircle2 className="w-6 h-6" /> Request Submitted</> : 'Submit Request'}
                  </button>
               </form>
            </div>

            {/* List */}
            <div className="space-y-6">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 ml-2">
                 <History className="w-5 h-5 text-purple-600" /> Request History
               </h3>
               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {docRequests.map(req => (
                    <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                       <div>
                          <p className="font-bold text-slate-800 text-lg">{req.documentType}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ordered {new Date(req.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                       </div>
                       <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                         req.status === 'ready' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-500'
                       }`}>
                          {req.status}
                       </div>
                    </div>
                  ))}
                  {docRequests.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-300">
                       <FileText className="w-16 h-16 mx-auto mb-4 opacity-10" />
                       <p className="font-bold">No history available.</p>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="queue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {/* My Ticket */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-12 rounded-[4rem] text-white shadow-2xl shadow-indigo-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
               <Ticket className="w-64 h-64 absolute -right-20 -top-20 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
               
               {myTicket ? (
                 <>
                   <span className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-10">Your Active Ticket</span>
                   <h3 className="text-8xl font-black tracking-tighter mb-4">{myTicket.ticketNumber}</h3>
                   <div className="grid grid-cols-2 gap-4 w-full mb-10">
                      <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                         <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-1">Position</p>
                         <p className="text-4xl font-black italic">#{myQueuePosition || '...'}</p>
                      </div>
                      <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                         <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-1">Est. Wait</p>
                         <p className="text-4xl font-black italic">{myQueuePosition * 5}m</p>
                      </div>
                   </div>
                   <p className="text-indigo-100 font-medium">Status: <strong>{myTicket.status.toUpperCase()}</strong>. Please wait near the Registrar counters.</p>
                 </>
               ) : (
                 <>
                   <ListOrdered className="w-20 h-20 mb-8 text-indigo-200" />
                   <h3 className="text-4xl font-black mb-4">Registrar E-Queue</h3>
                   <p className="text-indigo-100 text-xl font-medium mb-12 opacity-80 leading-relaxed max-w-sm mx-auto">
                     Join the queue virtually and save time. We'll handle your inquiries in order of arrival.
                   </p>
                   <button 
                     onClick={handleJoinQueue}
                     disabled={joiningQueue}
                     className="w-full bg-white text-indigo-700 font-black py-6 rounded-3xl shadow-2xl shadow-indigo-900/40 text-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
                   >
                     {joiningQueue ? <Loader2 className="w-8 h-8 animate-spin" /> : <><ListOrdered className="w-8 h-8" /> JOIN THE QUEUE</>}
                   </button>
                 </>
               )}
            </div>

            {/* Queue Stats */}
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-50/50">
                  <Users className="w-12 h-12" />
               </div>
               <h4 className="text-2xl font-black text-slate-800 mb-2">Wait Time Status</h4>
               <p className="text-slate-500 font-medium mb-10">Real-time update of current registrar traffic</p>
               
               <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                     <p className="text-5xl font-black text-slate-800 mb-1">{queueCount}</p>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Waiting Students</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                     <p className="text-5xl font-black text-slate-800 mb-1">~{queueCount * 5}</p>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Est. Mins Wait</p>
                  </div>
               </div>

               <div className="mt-10 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4 text-left">
                  <div className="p-2 bg-white rounded-xl text-amber-600">
                     <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-amber-800 font-bold text-sm">Registrar Notice</p>
                    <p className="text-amber-700 text-xs font-medium leading-relaxed opacity-80 mt-1">Registrar counters are currently experiencing peak traffic. Please expect slight delays.</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple History icon for local use
function History(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
