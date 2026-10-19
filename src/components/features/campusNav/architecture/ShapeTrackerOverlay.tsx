// ─────────────────────────────────────────────────────────────────────────────
// ShapeTrackerOverlay.tsx – Interactive 3D Lasso & Polygon Building Outline Tracker
//
// Features:
// 1. Point-by-Point Corner Tracking: Click to place corners with real-time (X, Z) coordinates.
// 2. Freehand Lasso Mode: Click and drag to smoothly trace building curves and perimeters.
// 3. Live 3D Ground Raycaster HUD: Displays cursor coordinates (X, Z) and elevation in real time.
// 4. Shape Inspector & Measurements: Computes perimeter, segment lengths, and enclosed area.
// 5. One-Click Clipboard Export: Generates formatted coordinates ready to paste into chat.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenTool,
  Lasso,
  Crosshair,
  Copy,
  Check,
  Undo2,
  Trash2,
  CheckCircle2,
  Ruler,
  Maximize2,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';

export interface ShapePoint {
  x: number;
  y: number;
  z: number;
}

export type TrackerMode = 'polygon' | 'lasso';

interface Props {
  active: boolean;
  onToggle: () => void;
  mode: TrackerMode;
  onModeChange: (mode: TrackerMode) => void;
  snap: number; // 0 for free (0.1m), 0.5 for 0.5m, 1.0 for 1m
  onSnapChange: (snap: number) => void;
  points: ShapePoint[];
  hoverCoord: { x: number; z: number } | null;
  isClosed: boolean;
  onCloseShape: () => void;
  onUndo: () => void;
  onClear: () => void;
}

export default function ShapeTrackerOverlay({
  active,
  onToggle,
  mode,
  onModeChange,
  snap,
  onSnapChange,
  points,
  hoverCoord,
  isClosed,
  onCloseShape,
  onUndo,
  onClear,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  if (!active) return null;

  // Calculate perimeter in meters
  const perimeter = points.reduce((acc, pt, idx) => {
    if (idx === 0) return 0;
    const prev = points[idx - 1];
    return acc + Math.hypot(pt.x - prev.x, pt.z - prev.z);
  }, 0) + (isClosed && points.length > 2 ? Math.hypot(points[0].x - points[points.length - 1].x, points[0].z - points[points.length - 1].z) : 0);

  // Approximate polygon area using shoelace formula
  const area = isClosed && points.length >= 3
    ? Math.abs(
        points.reduce((acc, pt, i) => {
          const next = points[(i + 1) % points.length];
          return acc + (pt.x * next.z - next.x * pt.z);
        }, 0) / 2
      )
    : 0;

  const handleCopy = () => {
    if (points.length === 0) return;

    const formattedList = points
      .map((p, i) => `Point ${i + 1}: X: ${p.x.toFixed(1)}, Z: ${p.z.toFixed(1)} (Y: ${p.y.toFixed(1)})`)
      .join('\n');

    const jsonList = JSON.stringify(
      points.map((p, i) => ({ corner: i + 1, x: Number(p.x.toFixed(1)), z: Number(p.z.toFixed(1)) })),
      null,
      2
    );

    const textToCopy = `Building Outline (${points.length} points, Perimeter: ${perimeter.toFixed(1)}m${
      isClosed ? `, Area: ${area.toFixed(1)}m²` : ''
    }):\n${formattedList}\n\nJSON:\n${jsonList}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  };

  const cycleSnap = () => {
    if (snap === 0) onSnapChange(0.5);
    else if (snap === 0.5) onSnapChange(1.0);
    else onSnapChange(0);
  };

  return (
    <>
      {/* ── Top Floating Toolbar HUD ── */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-[#071328]/90 backdrop-blur-xl border border-cyan-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.25)] pointer-events-auto"
      >
        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            onClick={() => onModeChange('polygon')}
            title="Point-by-Point: Click corners to draw straight building walls"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'polygon'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Corners (Polygon)</span>
            <span className="sm:hidden">Corners</span>
          </button>
          <button
            onClick={() => onModeChange('lasso')}
            title="Freehand Lasso: Click and drag to trace smooth curves freely"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'lasso'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Lasso className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Freehand Lasso</span>
            <span className="sm:hidden">Lasso</span>
          </button>
        </div>

        {/* Snap Toggle */}
        <button
          onClick={cycleSnap}
          title="Toggle Grid Snapping"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-cyan-300 transition-all active:scale-95"
        >
          <Ruler className="w-3.5 h-3.5 text-cyan-400" />
          <span>{snap === 0 ? 'Free (0.1m)' : `Snap ${snap}m`}</span>
        </button>

        {/* Live Cursor Coordinate Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-200">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          {hoverCoord ? (
            <span>
              X: <strong className="text-white">{hoverCoord.x.toFixed(1)}</strong>, Z:{' '}
              <strong className="text-white">{hoverCoord.z.toFixed(1)}</strong>
            </span>
          ) : (
            <span className="text-cyan-400/60">Hover 3D scene...</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {points.length >= 3 && !isClosed && (
            <button
              onClick={onCloseShape}
              title="Close polygon by connecting last point to first point"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-bold shadow-md shadow-emerald-500/30 transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          )}

          {points.length > 0 && (
            <>
              <button
                onClick={onUndo}
                title="Undo last placed point"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-95"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClear}
                title="Clear all points"
                className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={onToggle}
            title="Exit Draw Mode"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* ── Instruction Pill ── */}
      <div className="absolute top-36 sm:top-36 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-white/75 font-medium shadow-lg">
          {mode === 'polygon'
            ? 'Left-click: Place corner · Right-click drag: Rotate 360° · Scroll: Zoom'
            : 'Click & drag: Draw continuous lasso · Right-click drag: Rotate 360° · Scroll: Zoom'}
        </span>
      </div>

      {/* ── Bottom-Left Shape Inspector & Coordinates Card ── */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="absolute left-4 sm:left-6 bottom-24 sm:bottom-28 z-30 w-[min(90vw,340px)] rounded-2xl bg-[#071328]/95 backdrop-blur-xl border border-cyan-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(6,182,212,0.2)] pointer-events-auto overflow-hidden"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/40 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Tracked Building Shape
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setInspectorOpen((o) => !o)}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              {inspectorOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card Body */}
        {inspectorOpen && (
          <div className="p-3.5 flex flex-col gap-3">
            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-center font-mono">
              <div>
                <p className="text-[10px] text-white/50 uppercase">Corners</p>
                <p className="text-sm font-bold text-cyan-300">{points.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase">Perimeter</p>
                <p className="text-sm font-bold text-white">{perimeter.toFixed(1)}m</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase">Area</p>
                <p className="text-sm font-bold text-emerald-400">
                  {isClosed ? `${area.toFixed(0)}m²` : 'Open'}
                </p>
              </div>
            </div>

            {/* Vertices List */}
            {points.length === 0 ? (
              <div className="py-4 text-center text-xs text-white/45">
                Click on the 3D ground or building to start tracking corner coordinates.
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
                {points.map((pt, idx) => {
                  const nextPt = points[idx + 1] ?? (isClosed ? points[0] : null);
                  const dist = nextPt ? Math.hypot(nextPt.x - pt.x, nextPt.z - pt.z) : null;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-mono transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            idx === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="text-white/90">
                          X: <strong className="text-cyan-300">{pt.x.toFixed(1)}</strong>, Z:{' '}
                          <strong className="text-cyan-300">{pt.z.toFixed(1)}</strong>
                        </span>
                      </div>
                      {dist !== null && (
                        <span className="text-[10px] text-white/50 font-sans">
                          → {dist.toFixed(1)}m
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Copy Coordinates Button */}
            <button
              onClick={handleCopy}
              disabled={points.length === 0}
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/30'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Coordinates Copied! (Ready to paste)</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>Copy Coordinates for Chat</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-white/45 text-center leading-tight">
              Paste the copied coordinates in chat to have the building shape applied precisely.
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
}
