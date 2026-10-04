import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Kiosk ↔ Phone photo hand-off (Lost & Found).
 *
 * Flow:
 *   1. Kiosk creates `kioskUploads/{sessionId}` with status "waiting" and shows a QR code.
 *   2. Phone opens /mobile-upload?s={sessionId}, compresses a photo and writes it to the same doc.
 *   3. Kiosk's onSnapshot listener fires, reads the image, then deletes the doc.
 *
 * The session expiry window is enforced server-side by firestore.rules (based on createdAt).
 */

const COLLECTION = 'kioskUploads';

/** How long a QR session stays valid (must match firestore.rules). */
export const SESSION_DURATION_MS = 10 * 60 * 1000;

/** Firestore docs are capped at 1 MB — keep the base64 image well below that. */
const MAX_IMAGE_CHARS = 700_000;

export type UploadSessionStatus = 'waiting' | 'uploaded';

export interface UploadSessionData {
  status: UploadSessionStatus;
  image?: string;
}

// ── Session lifecycle (kiosk side) ───────────────────────────────────────────

export async function createUploadSession(): Promise<string> {
  const sessionId = crypto.randomUUID();
  await setDoc(doc(db, COLLECTION, sessionId), {
    status: 'waiting',
    createdAt: serverTimestamp(),
  });
  return sessionId;
}

export function listenUploadSession(
  sessionId: string,
  onData: (data: UploadSessionData | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTION, sessionId),
    (snap) => onData(snap.exists() ? (snap.data() as UploadSessionData) : null),
    (err) => onError?.(err)
  );
}

export async function deleteUploadSession(sessionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, sessionId));
  } catch (err) {
    console.warn('Could not delete upload session:', err);
  }
}

// ── Phone side ───────────────────────────────────────────────────────────────

/** Returns true if the session exists and is still waiting for a photo. */
export async function isSessionOpen(sessionId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, COLLECTION, sessionId));
  return snap.exists() && (snap.data() as UploadSessionData).status === 'waiting';
}

export async function submitPhoneImage(sessionId: string, dataUrl: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, sessionId), {
    status: 'uploaded',
    image: dataUrl,
    uploadedAt: serverTimestamp(),
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Session IDs are UUIDs; reject anything that doesn't look like one. */
export function isValidSessionId(id: string | null): id is string {
  return !!id && /^[a-zA-Z0-9_-]{8,128}$/.test(id);
}

/**
 * URL the phone should open. Prefer PUBLIC_APP_URL (e.g. the *.workers.dev deployment)
 * so a kiosk running on localhost still produces a QR code a phone can reach.
 */
export function getPublicAppUrl(): string {
  const configured = (process.env.PUBLIC_APP_URL || '').trim();
  return (configured || window.location.origin).replace(/\/+$/, '');
}

export function buildMobileUploadUrl(sessionId: string): string {
  return `${getPublicAppUrl()}/mobile-upload?s=${encodeURIComponent(sessionId)}`;
}

/** True when the QR code would point at an address a phone can't reach. */
export function isLocalOnlyUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return false;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this image. Please try another photo.'));
    };
    img.src = url;
  });
}

/**
 * Resizes + re-encodes a photo as a JPEG data URL small enough for Firestore.
 * Starts at 1024px / 0.72 quality and steps down until it fits.
 */
export async function compressImage(file: File): Promise<string> {
  const img = await loadImage(file);

  let maxDim = 1024;
  let quality = 0.72;
  let result = '';

  for (let attempt = 0; attempt < 6; attempt++) {
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not process this image.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    result = canvas.toDataURL('image/jpeg', quality);
    if (result.length <= MAX_IMAGE_CHARS) return result;

    quality = Math.max(0.4, quality - 0.1);
    maxDim = Math.round(maxDim * 0.8);
  }

  if (result.length > MAX_IMAGE_CHARS) {
    throw new Error('This photo is too large to send. Please try a different one.');
  }
  return result;
}
