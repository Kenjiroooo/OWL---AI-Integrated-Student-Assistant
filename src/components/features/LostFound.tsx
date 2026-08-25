import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  PackageSearch, Plus, MapPin, Tag, Clock,
  CheckCircle2, ImagePlus, Loader2, HandshakeIcon, X, User, Hash, Phone, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface LostFoundItem {
  id: string;
  itemName: string;
  location: string;
  description: string;
  type: 'lost' | 'found';
  imageUrl?: string | null;
  status: string;
  createdAt?: { seconds: number } | null;
}

interface ClaimForm {
  fullName: string;
  studentId: string;
  contactNumber: string;
  proofDescription: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function LostFound() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Report form state
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [itemName, setItemName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Claim modal state
  const [claimItemId, setClaimItemId] = useState<string | null>(null);
  const [claimItemName, setClaimItemName] = useState('');
  const [claimForm, setClaimForm] = useState<ClaimForm>({
    fullName: '',
    studentId: '',
    contactNumber: '',
    proofDescription: '',
  });
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchItems = async () => {
    const q = query(collection(db, 'lostAndFound'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as LostFoundItem)));
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  // ── Report Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      // Image upload — non-blocking: if it fails we submit without the image
      let imageUrl: string | null = null;
      if (imageFile) {
        try {
          const IMGBB_API_KEY = '3cce0debb2a3eba977c2cd07c90dee61';
          const formData = new FormData();
          formData.append('image', imageFile);
          const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          if (data.success && data.data) {
            imageUrl = data.data.url;
          } else {
            console.warn('Image upload failed, submitting without image:', data);
          }
        } catch (imgErr) {
          console.warn('Image upload error, submitting without image:', imgErr);
        }
      }

      await addDoc(collection(db, 'lostAndFound'), {
        itemName,
        location,
        description,
        type,
        imageUrl,
        status: 'active',
        createdAt: new Date(),
      });

      // Success — clear & close form
      setSubmitSuccess(true);
      setItemName(''); setLocation(''); setDescription('');
      setImageFile(null); setImagePreview(null);
      fetchItems();
      setTimeout(() => {
        setShowForm(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error('Lost/Found submit error:', err);
      setSubmitError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Open Claim Modal ───────────────────────────────────────────────────────
  const openClaimModal = (item: LostFoundItem) => {
    setClaimItemId(item.id);
    setClaimItemName(item.itemName);
    setClaimSuccess(false);
    setClaimForm({ fullName: '', studentId: '', contactNumber: '', proofDescription: '' });
  };

  const closeClaimModal = () => {
    setClaimItemId(null);
    setClaimItemName('');
    setClaimSuccess(false);
  };

  // ── Claim Submit ───────────────────────────────────────────────────────────
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimItemId) return;
    setClaiming(true);
    try {
      // Save claim record
      await addDoc(collection(db, 'lostAndFoundClaims'), {
        itemId: claimItemId,
        itemName: claimItemName,
        claimantName: claimForm.fullName,
        studentId: claimForm.studentId,
        contactNumber: claimForm.contactNumber,
        proofDescription: claimForm.proofDescription,
        claimedAt: new Date(),
      });

      // Remove item from active list
      await deleteDoc(doc(db, 'lostAndFound', claimItemId));

      setClaimSuccess(true);
      fetchItems();

      // Auto-close after 2.5 seconds
      setTimeout(() => closeClaimModal(), 2500);
    } catch (err) {
      console.error('Claim error:', err);
    } finally {
      setClaiming(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Lost &amp; Found Center</h2>
          <p className="text-slate-500 text-lg font-medium mt-1">Help return missing items to their owners.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-8 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-[2rem] shadow-xl shadow-amber-100 flex items-center gap-3 font-black text-lg transition-all active:scale-95"
        >
          {showForm ? 'Cancel Report' : <><Plus className="w-6 h-6" /> Report Item</>}
        </button>
      </div>

      <AnimatePresence>
        {/* ── Claim Modal ──────────────────────────────────────────────────── */}
        {claimItemId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeClaimModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-slate-100"
            >
              {/* Close Button */}
              <button
                onClick={closeClaimModal}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              {claimSuccess ? (
                /* ── Success State ─────────────────────────────────────── */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-12 h-12 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Claim Submitted!</h3>
                    <p className="text-slate-500 font-medium mt-3 leading-relaxed">
                      Your claim for <span className="font-black text-slate-700">"{claimItemName}"</span> has been recorded.
                      The item has been removed from the listing.
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Closing automatically…</p>
                </motion.div>
              ) : (
                /* ── Claim Form ────────────────────────────────────────── */
                <>
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                        <HandshakeIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Claim Item</h3>
                    </div>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                      You are claiming: <span className="font-black text-slate-700">"{claimItemName}"</span>.
                      Please provide your details to complete the claim.
                    </p>
                  </div>

                  <form onSubmit={handleClaim} className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Full Name
                      </label>
                      <input
                        required
                        value={claimForm.fullName}
                        onChange={e => setClaimForm(f => ({ ...f, fullName: e.target.value }))}
                        placeholder="e.g. Juan dela Cruz"
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 text-sm"
                      />
                    </div>

                    {/* Student ID */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Hash className="w-3 h-3" /> Student ID Number
                      </label>
                      <input
                        required
                        value={claimForm.studentId}
                        onChange={e => setClaimForm(f => ({ ...f, studentId: e.target.value }))}
                        placeholder="e.g. 2024-00001"
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 text-sm"
                      />
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> Contact Number
                      </label>
                      <input
                        required
                        value={claimForm.contactNumber}
                        onChange={e => setClaimForm(f => ({ ...f, contactNumber: e.target.value }))}
                        placeholder="e.g. 09XXXXXXXXX"
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 text-sm"
                      />
                    </div>

                    {/* Proof / Description */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" /> How can you prove ownership? <span className="normal-case font-medium">(optional)</span>
                      </label>
                      <textarea
                        value={claimForm.proofDescription}
                        onChange={e => setClaimForm(f => ({ ...f, proofDescription: e.target.value }))}
                        placeholder="Describe a unique feature, contents, or markings that prove this is yours…"
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 text-sm h-24 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={claiming}
                      className="w-full bg-amber-500 disabled:opacity-50 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-100 transition-all text-base uppercase tracking-widest flex justify-center items-center gap-2 active:scale-95"
                    >
                      {claiming
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Claim…</>
                        : <><CheckCircle2 className="w-5 h-5" /> Submit Claim</>
                      }
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* ── Report Form ──────────────────────────────────────────────────── */}
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-10 rounded-[3rem] border-2 border-amber-500 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Type toggle */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setType('lost')}
                    className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all border-2 ${type === 'lost' ? 'bg-red-500 border-red-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    I Lost Something
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('found')}
                    className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all border-2 ${type === 'found' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    I Found Something
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
                    <input
                      required
                      value={itemName}
                      onChange={e => setItemName(e.target.value)}
                      placeholder="e.g. Blue Hydroflask, ID Card"
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                    <input
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Library 3rd Floor"
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Details to help identify the item..."
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 h-32 resize-none"
                  />
                </div>

                {/* Photo upload */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Photo (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setImageFile(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <div className="space-y-4">
                      {imagePreview && (
                        <div className="w-full h-64 rounded-3xl overflow-hidden border-4 border-amber-500 shadow-lg bg-slate-100">
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                      )}
                      <label
                        htmlFor="image-upload"
                        className="flex items-center gap-3 w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-colors border-2 border-dashed border-slate-200 hover:border-amber-500 text-slate-500 font-bold"
                      >
                        <ImagePlus className="w-5 h-5 text-amber-500" />
                        <span className="flex-1 truncate">{imageFile ? imageFile.name : 'Click to upload an image'}</span>
                        {imageFile && (
                          <button
                            type="button"
                            onClick={e => { e.preventDefault(); setImageFile(null); setImagePreview(null); }}
                            className="text-red-500 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Error banner */}
                {submitError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                    <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="font-bold text-sm">{submitError}</p>
                  </div>
                )}

                {/* Success banner */}
                {submitSuccess && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="font-bold text-sm">Report submitted! Closing form…</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || submitSuccess}
                  className="w-full bg-slate-900 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all text-xl uppercase tracking-widest flex justify-center items-center gap-2"
                >
                  {uploading
                    ? <><Loader2 className="w-6 h-6 animate-spin" /> Submitting…</>
                    : submitSuccess
                      ? <><CheckCircle2 className="w-6 h-6" /> Submitted!</>
                      : 'Submit Report'
                  }
                </button>
              </form>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Item Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col gap-6 relative group transition-all"
          >
            <div className="flex justify-between items-start">
              <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {item.type}
              </div>
              <div className="text-slate-300">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h4 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{item.itemName}</h4>
              <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">{item.description}</p>
            </div>

            {item.imageUrl && (
              <div className="w-full h-64 rounded-3xl overflow-hidden mt-4 shadow-inner border border-slate-200 bg-slate-100">
                <img
                  src={`https://images.weserv.nl/?url=${encodeURIComponent(item.imageUrl)}&default=https://via.placeholder.com/400x300?text=Image+Not+Available`}
                  alt={item.itemName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                <MapPin className="w-4 h-4 text-amber-500" />
                {item.location}
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-tight">
                <Tag className="w-3.5 h-3.5" />
                ID: {item.id.slice(0, 8)}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Posted {item.createdAt?.seconds
                  ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </div>
              <button
                onClick={() => openClaimModal(item)}
                className="flex items-center gap-2 text-[11px] font-black text-amber-600 hover:text-white hover:bg-amber-500 uppercase tracking-widest transition-all px-5 py-3 bg-amber-50 rounded-2xl active:scale-95"
              >
                <HandshakeIcon className="w-4 h-4" /> Claim Item
              </button>
            </div>
          </motion.div>
        ))}

        {items.length === 0 && !loading && (
          <div className="col-span-full py-40 text-center text-slate-200">
            <PackageSearch className="w-32 h-32 mx-auto mb-6 opacity-5" />
            <p className="text-3xl font-black italic">No items reported yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
