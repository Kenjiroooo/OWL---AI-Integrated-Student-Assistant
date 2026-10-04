import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Camera, ImagePlus, Send, Loader2, CheckCircle2, AlertTriangle, RefreshCw, MonitorSmartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  isSessionOpen,
  submitPhoneImage,
  compressImage,
  isValidSessionId,
} from '../lib/kioskUpload';

type Phase =
  | 'validating'  // checking the QR session
  | 'ready'       // waiting for the user to pick a photo
  | 'processing'  // compressing
  | 'preview'     // photo chosen, ready to send
  | 'sending'
  | 'success'
  | 'invalid';    // expired / used / broken QR

/**
 * MobileUploadPage — opened on the user's PHONE after scanning the kiosk's QR code.
 * Lets them take/choose a photo and send it to the kiosk's Lost & Found form.
 */
export default function MobileUploadPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('s');

  const [phase, setPhase] = useState<Phase>('validating');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invalidReason, setInvalidReason] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Validate the QR session once anonymous auth is ready
  useEffect(() => {
    if (!isValidSessionId(sessionId)) {
      setInvalidReason('This QR code is not valid. Please scan the code on the kiosk again.');
      setPhase('invalid');
      return;
    }

    let cancelled = false;
    isSessionOpen(sessionId)
      .then((open) => {
        if (cancelled) return;
        if (open) {
          setPhase('ready');
        } else {
          setInvalidReason('This QR code has expired or was already used. Generate a new one on the kiosk.');
          setPhase('invalid');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Session check failed:', err);
        setInvalidReason('Could not reach the kiosk session. Generate a new QR code on the kiosk.');
        setPhase('invalid');
      });

    return () => { cancelled = true; };
  }, [sessionId]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    setError(null);
    setPhase('processing');
    try {
      setPreview(await compressImage(file));
      setPhase('preview');
    } catch (err: any) {
      setError(err?.message || 'Could not process this photo. Please try another one.');
      setPhase('ready');
    }
  };

  const handleSend = async () => {
    if (!preview || !isValidSessionId(sessionId)) return;
    setError(null);
    setPhase('sending');
    try {
      await submitPhoneImage(sessionId, preview);
      setPhase('success');
    } catch (err: any) {
      console.error('Send failed:', err);
      if (err?.code === 'permission-denied') {
        setInvalidReason('This QR code has expired or was already used. Generate a new one on the kiosk.');
        setPhase('invalid');
      } else {
        setError('Could not send the photo. Please try again.');
        setPhase('preview');
      }
    }
  };

  const retake = () => {
    setPreview(null);
    setError(null);
    setPhase('ready');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-50 flex flex-col">
      <header className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-5 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
            <MonitorSmartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight">Send Photo to Kiosk</h1>
            <p className="text-amber-100 text-xs font-semibold">OWL Lost &amp; Found</p>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-5 py-8">
        {/* Hidden inputs */}
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        {phase === 'validating' && (
          <div className="py-24 flex flex-col items-center gap-4 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            <p className="font-bold text-sm">Connecting to kiosk…</p>
          </div>
        )}

        {phase === 'invalid' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center space-y-5">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Can't send photo</h2>
            <p className="text-slate-500 font-medium leading-relaxed">{invalidReason}</p>
          </motion.div>
        )}

        {(phase === 'ready' || phase === 'processing') && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <p className="text-slate-600 font-medium text-center leading-relaxed">
              Take a clear photo of the item, or choose one from your gallery.
            </p>

            <button
              type="button"
              disabled={phase === 'processing'}
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-amber-200 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-60"
            >
              {phase === 'processing'
                ? <><Loader2 className="w-6 h-6 animate-spin" /> Preparing photo…</>
                : <><Camera className="w-6 h-6" /> Take Photo</>}
            </button>

            <button
              type="button"
              disabled={phase === 'processing'}
              onClick={() => galleryInputRef.current?.click()}
              className="w-full py-5 bg-white text-slate-700 border-2 border-dashed border-slate-300 rounded-3xl font-black text-base flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-60"
            >
              <ImagePlus className="w-5 h-5 text-amber-500" /> Choose from Gallery
            </button>

            {error && <p className="text-red-600 text-sm font-bold text-center">{error}</p>}
          </motion.div>
        )}

        {(phase === 'preview' || phase === 'sending') && preview && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="rounded-3xl overflow-hidden border-4 border-amber-500 shadow-xl bg-slate-100">
              <img src={preview} alt="Selected item" className="w-full max-h-[55vh] object-contain" />
            </div>

            <button
              type="button"
              disabled={phase === 'sending'}
              onClick={handleSend}
              className="w-full py-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-60"
            >
              {phase === 'sending'
                ? <><Loader2 className="w-6 h-6 animate-spin" /> Sending…</>
                : <><Send className="w-6 h-6" /> Send to Kiosk</>}
            </button>

            <button
              type="button"
              disabled={phase === 'sending'}
              onClick={retake}
              className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-3xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
            >
              <RefreshCw className="w-4 h-4" /> Choose a different photo
            </button>

            {error && <p className="text-red-600 text-sm font-bold text-center">{error}</p>}
          </motion.div>
        )}

        {phase === 'success' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-16 text-center space-y-5">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-14 h-14 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">Photo sent!</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Look at the kiosk screen — your picture is there now.<br />You can close this page.
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
