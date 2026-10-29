// ─────────────────────────────────────────────────────────────────────────────
// CampusArchitectureShowcase.tsx – Dual-building architectural showcase (Option B: 3D + Photo Reference)
//
// Features:
// 1. Direct interactive 3D procedural architectural model in Three.js (Option B).
// 2. High-resolution on-site photograph reference comparison mode.
// 3. Exploded Architectural View separating levels along the vertical axis with live floor breakdown badge.
// 4. Cinematic flythrough and orbital camera navigation with touch & button controls.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  X,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Camera,
  Box,
  Image as ImageIcon,
  Sparkles,
  PenTool,
} from 'lucide-react';
import {
  CAMPUS_BUILDINGS,
  CAMPUS_GROUPS,
  DEFAULT_BUILDING_ID,
  getBuilding,
  getCampusBuildings,
  type CampusBuildingId,
  type CampusGroupId,
} from './buildings';
import { useBuildingTransitionController, type TransitionPhase } from './BuildingTransitionController';
import Campus3DCanvas, { type Campus3DCanvasHandle } from './Campus3DCanvas';
import CampusBuildingScene from './CampusBuildingScene';
import CampusBuildingSelector from './CampusBuildingSelector';
import ShapeTrackerOverlay, { type ShapePoint, type TrackerMode } from './ShapeTrackerOverlay';

interface Props {
  onClose?: () => void;
  campusGroup?: CampusGroupId;
  initialBuildingId?: CampusBuildingId;
  showcaseTitle?: string;
}

const PHASE_LABEL: Record<TransitionPhase, string> = {
  idle: '',
  intro: 'Approaching',
  pullback: 'Pulling back',
  crossing: 'Moving across campus',
  reveal: 'Revealing facade',
  settling: 'Settling view',
};

export default function CampusArchitectureShowcase({
  onClose,
  campusGroup: propCampusGroup,
  initialBuildingId,
  showcaseTitle: propTitle,
}: Props) {
  const campusGroup: CampusGroupId =
    propCampusGroup ?? (initialBuildingId === 'udd-fame' ? 'fame' : 'main');
  const buildings = getCampusBuildings(campusGroup);
  const defaultBuildingId: CampusBuildingId =
    initialBuildingId ?? (buildings[0]?.id || DEFAULT_BUILDING_ID);

  const navigate = useNavigate();
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate('..');
    }
  }, [onClose, navigate]);

  const reducedMotion = useReducedMotion() ?? false;
  const ctrl = useBuildingTransitionController(defaultBuildingId, reducedMotion);
  const { poses, activeId, phase, busy, playIntro, switchTo, nudge, resetView } = ctrl;
  const active = getBuilding(activeId);

  // Mode state: '3d' procedural architectural model vs 'photo' reference view
  const [viewMode, setViewMode] = useState<'3d' | 'photo'>('3d');
  const [exploded, setExploded] = useState<boolean>(false);
  const [cinematicNonce, setCinematicNonce] = useState<number>(1);
  const canvas3DRef = useRef<Campus3DCanvasHandle>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Interactive Lasso / Shape Tracker state
  const [trackerActive, setTrackerActive] = useState<boolean>(false);
  const [trackerMode, setTrackerMode] = useState<TrackerMode>('polygon');
  const [trackerSnap, setTrackerSnap] = useState<number>(0.5);
  const [trackerPoints, setTrackerPoints] = useState<ShapePoint[]>([]);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; z: number } | null>(null);
  const [isShapeClosed, setIsShapeClosed] = useState<boolean>(false);

  const handleCloseShape = useCallback(() => {
    setIsShapeClosed(true);
  }, []);

  const handleUndoTrackerPoint = useCallback(() => {
    setTrackerPoints((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      if (next.length < 3) {
        setIsShapeClosed(false);
      }
      return next;
    });
  }, []);

  const handleClearTracker = useCallback(() => {
    setTrackerPoints([]);
    setIsShapeClosed(false);
  }, []);

  // Cinematic intro on open
  useEffect(() => {
    if (viewMode === 'photo') {
      void playIntro(defaultBuildingId);
    }
    closeBtnRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultBuildingId]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'e' || e.key === 'E') {
        if (viewMode === '3d') setExploded((prev) => !prev);
      }
      if (e.key === 'm' || e.key === 'M') {
        setViewMode((m) => (m === '3d' ? 'photo' : '3d'));
      }
      if (e.key === 't' || e.key === 'T' || e.key === 'l' || e.key === 'L') {
        if (viewMode === '3d') setTrackerActive((a) => !a);
      }

      if (viewMode === '3d') {
        if (e.key === '+' || e.key === '=') canvas3DRef.current?.zoomIn();
        if (e.key === '-') canvas3DRef.current?.zoomOut();
        if (e.key === '[') canvas3DRef.current?.orbitLeft();
        if (e.key === ']') canvas3DRef.current?.orbitRight();
        if (e.key === '0') canvas3DRef.current?.resetView();
      } else {
        if (busy) return;
        if (e.key === '+' || e.key === '=') nudge({ zoom: 0.15 });
        if (e.key === '-') nudge({ zoom: -0.15 });
        if (e.key === '[') nudge({ orbit: -8 });
        if (e.key === ']') nudge({ orbit: 8 });
        if (e.key === '0') void resetView();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, nudge, handleClose, resetView, viewMode]);

  // Photo mode direct manipulation
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (busy || viewMode !== 'photo') return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || busy || viewMode !== 'photo') return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    drag.current = { id: d.id, x: e.clientX, y: e.clientY };
    nudge({ orbit: dx * 0.06, panY: dy * 0.04 }, false);
  };
  const endDrag = () => {
    drag.current = null;
  };
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (busy || viewMode !== 'photo') return;
      nudge({ zoom: e.deltaY < 0 ? 0.06 : -0.06 }, false);
    },
    [busy, nudge, viewMode]
  );

  const handleSelect = (id: CampusBuildingId) => {
    if (id !== activeId) {
      void switchTo(id);
    }
  };

  const handleZoomIn = () => {
    if (viewMode === '3d') {
      canvas3DRef.current?.zoomIn();
    } else {
      nudge({ zoom: 0.15 });
    }
  };

  const handleZoomOut = () => {
    if (viewMode === '3d') {
      canvas3DRef.current?.zoomOut();
    } else {
      nudge({ zoom: -0.15 });
    }
  };

  const handleOrbitLeft = () => {
    if (viewMode === '3d') {
      canvas3DRef.current?.orbitLeft();
    } else {
      nudge({ orbit: -8 });
    }
  };

  const handleOrbitRight = () => {
    if (viewMode === '3d') {
      canvas3DRef.current?.orbitRight();
    } else {
      nudge({ orbit: 8 });
    }
  };

  const handleResetCamera = () => {
    if (viewMode === '3d') {
      canvas3DRef.current?.resetView();
    } else {
      void resetView();
    }
  };

  const handlePlay = () => {
    if (viewMode === '3d') {
      setCinematicNonce((n) => n + 1);
    } else {
      void playIntro(activeId);
    }
  };

  const ctrlBtn =
    'flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/15 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300';

  return (
    <motion.section
      role="dialog"
      aria-modal="true"
      aria-labelledby="arch-showcase-title"
      className="fixed inset-0 z-[10000] bg-[#050b18] text-white overflow-hidden select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.4 }}
    >
      {/* ── Viewport: 3D Three.js or Photo Reference ── */}
      {viewMode === '3d' ? (
        <Campus3DCanvas
          ref={canvas3DRef}
          buildingIds={buildings.map((b) => b.id)}
          activeBuildingId={activeId}
          onSelectBuilding={handleSelect}
          exploded={exploded}
          cinematicNonce={cinematicNonce}
          trackerActive={trackerActive}
          trackerMode={trackerMode}
          trackerSnap={trackerSnap}
          trackerPoints={trackerPoints}
          isShapeClosed={isShapeClosed}
          hoverCoord={hoverCoord}
          onPointsChange={setTrackerPoints}
          onHoverCoord={setHoverCoord}
          onCloseShape={handleCloseShape}
        />
      ) : (
        <div
          className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={onWheel}
        >
          {buildings.map((b) => (
            <React.Fragment key={b.id}>
              <CampusBuildingScene building={b} pose={poses[b.id]} isActive={b.id === activeId} />
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="absolute top-0 inset-x-0 z-20 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-b from-[#050b18]/95 via-[#050b18]/60 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleClose}
            aria-label="Back to Dagupan Map"
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 shadow-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] uppercase tracking-[0.25em] text-blue-300/80 font-semibold">
                Campus Navigation · {campusGroup === 'fame' ? 'FAME Campus' : 'Main Campus'} Architecture
              </p>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-medium">
                <Sparkles className="w-2.5 h-2.5 text-blue-400" /> Option B 3D
              </span>
            </div>
            <h1 id="arch-showcase-title" className="text-xl sm:text-2xl font-black tracking-tight">
              {propTitle ?? (campusGroup === 'fame' ? 'UDD FAME Campus Showcase' : 'UDD Main Campus Showcase')}
            </h1>
          </div>
        </div>

        {/* View Mode Segmented Pill + Shape Tracker + Close button */}
        <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 self-start md:self-auto">
          {/* 3D vs Photo segmented control */}
          <div className="flex items-center p-1 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 shadow-xl">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                viewMode === '3d'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>3D Model</span>
            </button>
            <button
              onClick={() => {
                setViewMode('photo');
                setExploded(false);
                setTrackerActive(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                viewMode === 'photo'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photo Reference</span>
            </button>
          </div>

          {/* Interactive Shape / Lasso Tracker Button */}
          <button
            onClick={() => {
              if (viewMode !== '3d') setViewMode('3d');
              setTrackerActive((prev) => !prev);
            }}
            title="Track Real Building Shape / Lasso Coordinates"
            className={`flex items-center gap-2 px-3.5 h-11 sm:h-12 rounded-xl backdrop-blur-xl border font-bold text-xs shadow-xl transition-all active:scale-95 ${
              trackerActive && viewMode === '3d'
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.45)]'
                : 'bg-black/40 text-cyan-300 hover:text-white hover:bg-white/10 border-cyan-500/30'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Track Shape (Lasso)</span>
            <span className="sm:hidden">Lasso</span>
            {trackerPoints.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          <button
            ref={closeBtnRef}
            id="arch-showcase-close"
            onClick={handleClose}
            aria-label="Close showcase and return to campus map"
            className="flex items-center gap-2 px-4 h-11 sm:h-12 rounded-xl bg-white text-blue-700 font-bold shadow-lg hover:bg-blue-50 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Back to map</span>
          </button>
        </div>
      </header>

      {/* ── Interactive 3D Shape & Lasso Tracker Overlay ── */}
      {viewMode === '3d' && (
        <ShapeTrackerOverlay
          active={trackerActive}
          onToggle={() => setTrackerActive((prev) => !prev)}
          mode={trackerMode}
          onModeChange={setTrackerMode}
          snap={trackerSnap}
          onSnapChange={setTrackerSnap}
          points={trackerPoints}
          hoverCoord={hoverCoord}
          isClosed={isShapeClosed}
          onCloseShape={handleCloseShape}
          onUndo={handleUndoTrackerPoint}
          onClear={handleClearTracker}
        />
      )}

      {/* ── Phase / Hint indicator ────────────────────────────────────────── */}
      <div className="absolute top-28 sm:top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none" aria-live="polite">
        <AnimatePresence>
          {!trackerActive && (
            viewMode === '3d' ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-xs font-medium text-white/80 shadow-lg"
              >
                <Box className="w-3.5 h-3.5 text-blue-400" />
                <span>Drag to orbit 360° · Scroll / pinch to zoom · Exploded view ready</span>
              </motion.div>
            ) : (
              busy && PHASE_LABEL[phase] && (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-medium text-white/80"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-300" />
                  {PHASE_LABEL[phase]}
                </motion.div>
              )
            )
          )}
        </AnimatePresence>
      </div>

      {/* ── Exploded View Floors Blueprint Overlay ───────────────────────── */}
      <AnimatePresence>
        {viewMode === '3d' && exploded && active.floors && (
          <motion.div
            initial={{ opacity: 0, x: -24, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute left-4 sm:left-6 top-32 z-20 max-w-xs p-4 rounded-2xl bg-black/70 backdrop-blur-xl border border-blue-500/30 shadow-2xl pointer-events-auto"
          >
            <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Exploded Elevation View
                </span>
              </div>
              <button
                onClick={() => setExploded(false)}
                className="text-[10px] text-blue-300 hover:text-white px-2 py-0.5 rounded bg-white/10"
              >
                Collapse
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
              {[...active.floors].reverse().map((f) => (
                <div
                  key={f.level}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-600/60 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                    L{f.level}
                  </span>
                  <span className="text-xs text-white/85 font-medium leading-tight">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Right-side camera controls ─────────────────────────────────────── */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2" aria-label="Camera controls">
        <button id="arch-zoom-in" className={ctrlBtn} onClick={handleZoomIn} disabled={viewMode === 'photo' && busy} aria-label="Zoom in">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button id="arch-zoom-out" className={ctrlBtn} onClick={handleZoomOut} disabled={viewMode === 'photo' && busy} aria-label="Zoom out">
          <ZoomOut className="w-5 h-5" />
        </button>
        <div className="h-px bg-white/15 my-1" />
        <button id="arch-orbit-left" className={ctrlBtn} onClick={handleOrbitLeft} disabled={viewMode === 'photo' && busy} aria-label="Orbit left">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button id="arch-orbit-right" className={ctrlBtn} onClick={handleOrbitRight} disabled={viewMode === 'photo' && busy} aria-label="Orbit right">
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="h-px bg-white/15 my-1" />
        <button id="arch-reset" className={ctrlBtn} onClick={handleResetCamera} aria-label="Reset camera">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* ── Bottom controls: selector + actions (Clean, non-intrusive) ────────── */}
      <footer className="absolute bottom-0 inset-x-0 z-20 p-4 sm:p-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3 pointer-events-auto">
          {buildings.length > 1 && (
            <CampusBuildingSelector buildings={buildings} activeId={activeId} onSelect={handleSelect} />
          )}
          <div className="flex items-center gap-2">
            <button
              id="arch-play-cinematic"
              onClick={handlePlay}
              title="Play Cinematic Camera Flythrough"
              className="flex items-center justify-center gap-2 px-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold shadow-lg shadow-blue-900/40 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <Play className="w-4 h-4 fill-current" />
              <span className="text-xs">Play Flythrough</span>
            </button>
            <button
              id="arch-exploded-toggle"
              onClick={() => {
                if (viewMode !== '3d') setViewMode('3d');
                setExploded((prev) => !prev);
              }}
              title="Toggle Exploded Architectural View"
              className={`flex items-center gap-2 px-4 h-12 rounded-xl border transition-all active:scale-95 ${
                exploded && viewMode === '3d'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-400'
                  : 'bg-black/50 hover:bg-white/15 border-white/15 text-white backdrop-blur-xl'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold">
                {exploded && viewMode === '3d' ? 'Collapse' : 'Exploded View'}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </motion.section>
  );
}
