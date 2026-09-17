/**
 * owlSpeech.ts — Universal Text-to-Speech Engine for OWL Kiosk
 * 
 * Optimized for Orange Pi 3B (Debian XFCE) and modern browsers.
 * Implements a resilient 3-tier fallback architecture:
 *   Tier 1: Web Speech API (with Linux voice detection, Chromium resume fix, and start/end watchdogs)
 *   Tier 2: HTML5 Audio TTS (Google Translate TTS chunks via Audio element — works without speech-dispatcher)
 *   Tier 3: Visual Lip-Sync Simulation (timed lip animation so the character never freezes)
 */

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  onBoundary?: (charIndex: number, text: string) => void;
}

export type SpeechEngine = 'webspeech' | 'audio-tts' | 'visual-only' | 'idle';

// ── State ────────────────────────────────────────────────────────────────────
let currentEngine: SpeechEngine = 'idle';
let isTalkingState = false;
const talkingListeners = new Set<(talking: boolean) => void>();

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;
let currentAudio: HTMLAudioElement | null = null;
let visualTimer: ReturnType<typeof setTimeout> | null = null;
let watchdogTimer: ReturnType<typeof setTimeout> | null = null;
let audioUnlocked = false;

// ── Helpers ──────────────────────────────────────────────────────────────────

function setTalking(talking: boolean) {
  if (isTalkingState === talking) return;
  isTalkingState = talking;
  talkingListeners.forEach((cb) => {
    try {
      cb(talking);
    } catch (e) {
      console.error('[OwlSpeech] Listener error:', e);
    }
  });
}

/**
 * Remove markdown, emojis, URLs, and symbols so TTS produces clean spoken audio.
 */
export function cleanTextForSpeech(raw: string): string {
  if (!raw) return '';
  return raw
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bold/italics markers and code blocks
    .replace(/[*#_`~]/g, '')
    // Remove emojis (Unicode symbols and emoticons)
    .replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, '')
    // Remove bullet points and special punctuation
    .replace(/[•▪►–—]/g, ' ')
    // Collapse extra spaces and newlines
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split text into natural sentence or punctuation chunks (max characters each)
 * for browsers or audio APIs with length limitations.
 */
export function chunkTextBySentences(text: string, maxChars = 140): string[] {
  if (!text) return [];
  if (text.length <= maxChars) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((currentChunk + ' ' + trimmed).length <= maxChars) {
      currentChunk += (currentChunk ? ' ' : '') + trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);

      // If a single sentence exceeds maxChars, split by words
      if (trimmed.length > maxChars) {
        const words = trimmed.split(' ');
        let wordChunk = '';
        for (const w of words) {
          if ((wordChunk + ' ' + w).length <= maxChars) {
            wordChunk += (wordChunk ? ' ' : '') + w;
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = w;
          }
        }
        if (wordChunk) currentChunk = wordChunk;
        else currentChunk = '';
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks.length > 0 ? chunks : [text];
}

// ── Audio Context & User Gesture Unlock ──────────────────────────────────────

/**
 * Unlocks audio and resumes speech synthesis upon user interaction (touch/click).
 * Essential for Chromium kiosks on Debian to satisfy autoplay policies.
 */
export function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    // Create and play silent buffer to unlock HTMLAudioElement restrictions
    const dummyAudio = new Audio();
    dummyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    dummyAudio.volume = 0.01;
    dummyAudio.play().catch(() => {});
  } catch (e) {
    // Ignore unlock failures
  }
}

// Attach automatic unlock listener to document
if (typeof window !== 'undefined') {
  const autoUnlock = () => {
    unlockAudio();
    window.removeEventListener('click', autoUnlock);
    window.removeEventListener('touchstart', autoUnlock);
    window.removeEventListener('keydown', autoUnlock);
  };
  window.addEventListener('click', autoUnlock, { once: true, passive: true });
  window.addEventListener('touchstart', autoUnlock, { once: true, passive: true });
  window.addEventListener('keydown', autoUnlock, { once: true, passive: true });
}

// ── Voice Loading & Selection ────────────────────────────────────────────────

/**
 * Asynchronously loads voices, handling the lazy `voiceschanged` event on Linux Chromium.
 */
export function initVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  if (cachedVoices.length > 0) {
    return Promise.resolve(cachedVoices);
  }

  if (voicesLoadedPromise) {
    return voicesLoadedPromise;
  }

  voicesLoadedPromise = new Promise((resolve) => {
    const immediate = window.speechSynthesis.getVoices();
    if (immediate && immediate.length > 0) {
      cachedVoices = immediate;
      resolve(immediate);
      return;
    }

    let resolved = false;
    const onVoicesChanged = () => {
      if (resolved) return;
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        resolved = true;
        cachedVoices = v;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(v);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    // Timeout watchdog: resolve after 1000ms if voiceschanged never fires (e.g. Debian with no speech-dispatcher)
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        const finalCheck = window.speechSynthesis.getVoices();
        cachedVoices = finalCheck || [];
        resolve(cachedVoices);
      }
    }, 1000);
  });

  return voicesLoadedPromise;
}

/**
 * Select the most suitable voice:
 * Strictly prioritizes Female English voices based on user preference.
 */
export function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Google or high-quality English Female
  const googleFemale = voices.find(
    (v) =>
      (v.name.includes('Google') || v.name.includes('Natural')) &&
      v.lang.startsWith('en') &&
      v.name.includes('Female')
  );
  if (googleFemale) return googleFemale;

  // 2. Windows Chrome/Edge English Female (Microsoft Zira)
  const msZira = voices.find(
    (v) => v.name.includes('Microsoft Zira') && v.lang.startsWith('en')
  );
  if (msZira) return msZira;

  // 3. Any English Female voice
  const anyFemaleEn = voices.find(
    (v) => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')
  );
  if (anyFemaleEn) return anyFemaleEn;

  // 4. Google or Natural English (any gender, but fallback since explicitly Female wasn't found)
  // We prefer those that don't explicitly say "Male"
  const googleEn = voices.find(
    (v) => (v.name.includes('Google') || v.name.includes('Natural')) && v.lang.startsWith('en') && !v.name.includes('Male')
  ) || voices.find(
    (v) => (v.name.includes('Google') || v.name.includes('Natural')) && v.lang.startsWith('en')
  );
  if (googleEn) return googleEn;

  // 5. Any Microsoft English voice (Windows fallback, avoiding David/Male if possible)
  const msEn = voices.find(
    (v) => v.name.includes('Microsoft') && v.lang.startsWith('en') && !v.name.includes('David') && !v.name.includes('Male')
  ) || voices.find(
    (v) => v.name.includes('Microsoft') && v.lang.startsWith('en')
  );
  if (msEn) return msEn;

  // 6. Any English voice (avoiding Male if possible)
  const anyEn = voices.find((v) => v.lang.startsWith('en') && !v.name.toLowerCase().includes('male')) 
    || voices.find((v) => v.lang.startsWith('en'));
  if (anyEn) return anyEn;

  // 7. Default system voice
  const defaultVoice = voices.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  return voices[0] || null;
}

// ── Tier 1: Web Speech API ───────────────────────────────────────────────────

function speakWithWebSpeech(
  text: string,
  voice: SpeechSynthesisVoice | null,
  options?: SpeakOptions
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch (e) {
      // Ignore
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    let hasStarted = false;
    let isFinished = false;

    // Start watchdog: if onstart does not fire within 750ms, assume Web Speech failed (Linux missing voice backend)
    const startWatchdog = setTimeout(() => {
      if (!hasStarted && !isFinished) {
        console.warn('[OwlSpeech] Web Speech onstart timeout (750ms). Falling back to Tier 2 Audio TTS.');
        isFinished = true;
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
        resolve(false);
      }
    }, 750);

    // Max duration watchdog: calculates upper bound based on word count (~90ms/char + 3000ms buffer)
    const maxDuration = Math.max(4000, text.length * 90 + 3000);
    const endWatchdog = setTimeout(() => {
      if (hasStarted && !isFinished) {
        console.warn('[OwlSpeech] Web Speech end watchdog triggered. Forcing speech completion.');
        isFinished = true;
        setTalking(false);
        options?.onEnd?.();
        resolve(true);
      }
    }, maxDuration);

    utterance.onstart = () => {
      hasStarted = true;
      clearTimeout(startWatchdog);
      currentEngine = 'webspeech';
      setTalking(true);
      options?.onStart?.();
    };

    utterance.onboundary = (e) => {
      options?.onBoundary?.(e.charIndex, text);
    };

    utterance.onend = () => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(startWatchdog);
      clearTimeout(endWatchdog);
      setTalking(false);
      currentEngine = 'idle';
      options?.onEnd?.();
      resolve(true);
    };

    utterance.onerror = (e) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(startWatchdog);
      clearTimeout(endWatchdog);
      setTalking(false);
      currentEngine = 'idle';
      console.warn('[OwlSpeech] Web Speech error event:', e);
      options?.onError?.(e);
      // Resolve false if it failed without starting so we fallback
      resolve(hasStarted ? true : false);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      clearTimeout(startWatchdog);
      clearTimeout(endWatchdog);
      console.warn('[OwlSpeech] speechSynthesis.speak threw error:', e);
      resolve(false);
    }
  });
}

// ── Tier 2: HTML5 Audio TTS (Google Translate TTS endpoint) ───────────────────

function speakWithAudioTTS(text: string, options?: SpeakOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const chunks = chunkTextBySentences(text, 140);
    if (chunks.length === 0) {
      resolve(false);
      return;
    }

    let chunkIndex = 0;
    let charOffset = 0;
    currentEngine = 'audio-tts';

    const playNextChunk = () => {
      if (chunkIndex >= chunks.length) {
        setTalking(false);
        currentEngine = 'idle';
        options?.onEnd?.();
        resolve(true);
        return;
      }

      const chunk = chunks[chunkIndex];
      const encoded = encodeURIComponent(chunk);
      // tw-ob client returns direct audio stream without CORS issues in HTML5 Audio
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=en&client=tw-ob`;

      const audio = new Audio(url);
      currentAudio = audio;
      audio.playbackRate = options?.rate ?? 1.0;

      audio.onplay = () => {
        setTalking(true);
        if (chunkIndex === 0) {
          options?.onStart?.();
        }
        options?.onBoundary?.(charOffset, chunk);
      };

      audio.onended = () => {
        charOffset += chunk.length + 1;
        chunkIndex++;
        playNextChunk();
      };

      audio.onerror = (e) => {
        console.warn('[OwlSpeech] Audio TTS error on chunk:', chunkIndex, e);
        // If first chunk fails, audio TTS isn't working (e.g. offline) -> fallback to Tier 3
        if (chunkIndex === 0) {
          setTalking(false);
          currentAudio = null;
          resolve(false);
        } else {
          // If subsequent chunk fails, try continuing or finish
          chunkIndex++;
          playNextChunk();
        }
      };

      audio.play().catch((err) => {
        console.warn('[OwlSpeech] Audio.play() rejected:', err);
        if (chunkIndex === 0) {
          setTalking(false);
          currentAudio = null;
          resolve(false);
        }
      });
    };

    playNextChunk();
  });
}

// ── Tier 3: Visual Lip-Sync Simulation (Timer Fallback) ───────────────────────

function speakWithVisualSimulation(text: string, options?: SpeakOptions): Promise<void> {
  return new Promise((resolve) => {
    currentEngine = 'visual-only';
    setTalking(true);
    options?.onStart?.();

    // Estimate speaking duration: ~320ms per word + 1000ms minimum
    const words = text.split(/\s+/).filter(Boolean);
    const duration = Math.min(15000, Math.max(2200, words.length * 320));

    // Simulate boundary updates
    const chunks = chunkTextBySentences(text, 120);
    const stepDuration = duration / Math.max(1, chunks.length);
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < chunks.length) {
        options?.onBoundary?.(currentStep * 120, chunks[currentStep]);
      } else {
        clearInterval(interval);
      }
    }, stepDuration);

    visualTimer = setTimeout(() => {
      clearInterval(interval);
      setTalking(false);
      currentEngine = 'idle';
      options?.onEnd?.();
      resolve();
    }, duration);
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Universal Speak Function:
 * Automatically negotiates the best working TTS engine:
 * Web Speech -> HTML5 Audio TTS -> Visual Lip-Sync Fallback.
 */
export async function speak(rawText: string, options?: SpeakOptions): Promise<void> {
  cancelSpeech();

  const text = cleanTextForSpeech(rawText);
  if (!text) {
    options?.onEnd?.();
    return;
  }

  unlockAudio();

  // Tier 1: Try Web Speech API if voices exist or can be loaded
  try {
    const voices = await initVoices();
    if (voices && voices.length > 0) {
      const bestVoice = pickBestVoice(voices);
      console.log(`[OwlSpeech] Attempting Tier 1 (Web Speech) with voice: "${bestVoice?.name || 'default'}"`);
      const success = await speakWithWebSpeech(text, bestVoice, options);
      if (success) {
        return;
      }
    } else {
      console.warn('[OwlSpeech] No speech voices available in browser. Skipping Tier 1.');
    }
  } catch (err) {
    console.warn('[OwlSpeech] Tier 1 error:', err);
  }

  // Tier 2: Try HTML5 Audio TTS (Google Translate stream)
  console.log('[OwlSpeech] Attempting Tier 2 (HTML5 Audio TTS)');
  try {
    const audioSuccess = await speakWithAudioTTS(text, options);
    if (audioSuccess) {
      return;
    }
  } catch (err) {
    console.warn('[OwlSpeech] Tier 2 error:', err);
  }

  // Tier 3: Visual Lip-Sync Fallback (Owl animates mouth naturally without freezing)
  console.log('[OwlSpeech] Falling back to Tier 3 (Visual Lip-Sync Simulation)');
  await speakWithVisualSimulation(text, options);
}

/**
 * Immediately stops all active speech synthesis, audio playback, and animation timers.
 */
export function cancelSpeech(): void {
  // 1. Cancel Web Speech
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  // 2. Pause and reset HTML5 Audio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    } catch (e) {}
  }

  // 3. Clear Visual / Watchdog timers
  if (visualTimer) {
    clearTimeout(visualTimer);
    visualTimer = null;
  }
  if (watchdogTimer) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }

  setTalking(false);
  currentEngine = 'idle';
}

/**
 * Returns whether OWL is currently speaking or animating mouth.
 */
export function isSpeaking(): boolean {
  return isTalkingState;
}

/**
 * Subscribe to talking state changes (useful for character lip-sync sync).
 * Returns an unsubscribe function.
 */
export function onTalkingStateChange(listener: (talking: boolean) => void): () => void {
  talkingListeners.add(listener);
  listener(isTalkingState);
  return () => {
    talkingListeners.delete(listener);
  };
}

/**
 * Returns current status of speech capabilities.
 */
export function getSpeechEngineStatus(): {
  currentEngine: SpeechEngine;
  isTalking: boolean;
  voicesCount: number;
  hasWebSpeech: boolean;
} {
  return {
    currentEngine,
    isTalking: isTalkingState,
    voicesCount: cachedVoices.length,
    hasWebSpeech: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
}
