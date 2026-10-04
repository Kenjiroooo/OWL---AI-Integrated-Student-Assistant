import React, { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import {
  X, Smartphone, Loader2, CheckCircle2, RefreshCw, AlertTriangle, Camera, ScanLine, Send,
} from 'lucide-react';
import {
  createUploadSession,
  listenUploadSession,
  deleteUploadSession,
  buildMobileUploadUrl,
  isLocalOnlyUrl,
  SESSION_DURATION_MS,
} from '../../../lib/kioskUpload';

type Phase = 'creating' | 'waiting' | 'received' | 'expired' | 'error';

interface Props {
  onClose: () => void;
  onImageReceived: (dataUrl: string) => void;
}

/**
 * PhoneUploadModal — shows a QR code the user scans with their phone to send a photo
 * to the kiosk. Mount it only while it should be visible; it creates a session on mount
 * and cleans it up on unmount.
 */
export default function PhoneUploadModal({ onClose, onImageReceived }: Props) {
  const [phase, setPhase] = useState<Phase>('creating');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [localOnly, setLocalOnly] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATION_MS / 1000);
  const [attempt, setAttempt] = useState(0); // bump to generate a fresh QR
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const receivedRef = useRef(false);
  const onImageReceivedRef = useRef(onImageReceived);
  const onCloseRef = useRef(onClose);
  onImageReceivedRef.current = onImageReceived;
  onCloseRef.current = onClose;

  // Create a session + listen for the phone's upload
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    let expiryTimer: ReturnType<typeof setTimeout> | null = null;
    let tick: ReturnType<typeof setInterval> | null = null;

    receivedRef.current = false;
    setPhase('creating');
    setErrorMsg(null);
    setQrDataUrl(null);
    setSecondsLeft(SESSION_DURATION_MS / 1000);

    (async () => {
      try {
        const sessionId = await createUploadSession();
        if (cancelled) {
          deleteUploadSession(sessionId);
          return;
        }
        sessionIdRef.current = sessionId;

        const url = buildMobileUploadUrl(sessionId);
        setLocalOnly(isLocalOnlyUrl(url));
        const qr = await QRCode.toDataURL(url, {
          width: 320,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        if (cancelled) return;
        setQrDataUrl(qr);
        setPhase('waiting');

        unsubscribe = listenUploadSession(
          sessionId,
          (data) => {
            if (cancelled || receivedRef.current) return;
            if (data?.status === 'uploaded' && data.image) {
              receivedRef.current = true;
              setPhase('received');
              onImageReceivedRef.current(data.image);
              deleteUploadSession(sessionId);
              setTimeout(() => onCloseRef.current(), 1200);
            }
          },
          (err) => {
            console.error('Upload session listener error:', err);
            if (!cancelled && !receivedRef.current) {
              setErrorMsg(err?.message || null);
              setPhase('error');
            }
          }
        );

        // Countdown + expiry
        const startedAt = Date.now();
        tick = setInterval(() => {
          const left = Math.max(0, Math.round((SESSION_DURATION_MS - (Date.now() - startedAt)) / 1000));
          setSecondsLeft(left);
        }, 1000);
        expiryTimer = setTimeout(() => {
          if (cancelled || receivedRef.current) return;
          setPhase('expired');
          unsubscribe?.();
          deleteUploadSession(sessionId);
        }, SESSION_DURATION_MS);
      } catch (err) {
        console.error('Could not start phone upload session:', err);
        if (!cancelled) {
          setErrorMsg((err as Error)?.message || null);
          setPhase('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (tick) clearInterval(tick);
      if (expiryTimer) clearTimeout(expiryTimer);
      // Clean up an unused session
      if (sessionIdRef.current && !receivedRef.current) {
        deleteUploadSession(sessionIdRef.current);
      }
      sessionIdRef.current = null;
    };
  }, [attempt]);

  const regenerate = useCallback(() => setAttempt((n) => n + 1), []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative bg-white rounded-[3rem] p-10 max-w-3xl w-full shadow-2xl border border-slate-100"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Upload Photo from Phone</h3>
            <p className="text-slate-500 text-sm font-medium">Scan the QR code to send a picture to this kiosk.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* ── QR / status panel ── */}
          <div className="flex flex-col items-center">
            <div className="relative w-72 h-72 rounded-3xl bg-white border-4 border-amber-500 shadow-xl flex items-center justify-center overflow-hidden">
              {phase === 'creating' && <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />}

              {phase === 'waiting' && qrDataUrl && (
                <>
                  <img src={qrDataUrl} alt="Scan to upload a photo" className="w-full h-full p-3" />
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                    animate={{ top: ['6%', '94%', '6%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </>
              )}

              {phase === 'received' && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-3"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </div>
                  <p className="font-black text-slate-800 text-lg">Photo received!</p>
                </motion.div>
              )}

              {phase === 'expired' && (
                <div className="text-center px-6 space-y-3">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
                  <p className="font-black text-slate-800">QR code expired</p>
                </div>
              )}

              {phase === 'error' && (
                <div className="text-center px-6 space-y-3">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                  <p className="font-black text-slate-800">Couldn't start phone upload</p>
                  <p className="text-xs text-slate-500 font-medium">Check the internet connection and try again.</p>
                  {errorMsg && (
                    <p className="text-[10px] text-red-400 font-mono break-words leading-tight">{errorMsg}</p>
                  )}
                </div>
              )}
            </div>

            {phase === 'waiting' && (
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                Waiting for your phone… <span className="tabular-nums text-slate-400">{mm}:{ss}</span>
              </div>
            )}

            {(phase === 'expired' || phase === 'error') && (
              <button
                type="button"
                onClick={regenerate}
                className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-100"
              >
                <RefreshCw className="w-4 h-4" /> Generate new QR
              </button>
            )}
          </div>

          {/* ── Instructions ── */}
          <div className="space-y-5">
            {[
              { icon: ScanLine, title: 'Scan', text: 'Open your phone camera and point it at the QR code.' },
              { icon: Camera, title: 'Take or choose a photo', text: 'Snap a picture of the item or pick one from your gallery.' },
              { icon: Send, title: 'Tap "Send to Kiosk"', text: 'The photo will appear on this screen automatically.' },
            ].map((step, i) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">
                    <span className="text-amber-500 mr-1.5">{i + 1}.</span>
                    {step.title}
                  </p>
                  <p className="text-slate-500 text-sm font-medium leading-snug">{step.text}</p>
                </div>
              </div>
            ))}

            {localOnly && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-bold leading-snug">
                  This QR code points to <code>localhost</code>, which phones can't open. Set{' '}
                  <code>PUBLIC_APP_URL</code> to your workers.dev address.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
