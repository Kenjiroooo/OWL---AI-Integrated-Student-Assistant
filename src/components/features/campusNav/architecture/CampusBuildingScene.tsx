// ─────────────────────────────────────────────────────────────────────────────
// CampusBuildingScene.tsx – One building's visual layer
//
// Photo-reference mode: the building's reference PHOTOGRAPH is presented on a
// perspective panel moved by a virtual camera (scale / pan / tilt / orbit),
// with depth-of-field blur, a reveal light-sweep and vignette. It is NOT a 3D
// model and is labelled as such in the UI.
//
// When `building.modelPath` is set in the future, this is the component to
// replace with a React-Three-Fiber <Canvas> that reads the same ScenePose.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { ImageOff, Loader2 } from 'lucide-react';
import type { CampusBuilding } from './buildings';
import type { ScenePose } from './BuildingTransitionController';

interface Props {
  building: CampusBuilding;
  pose: ScenePose;
  isActive: boolean;
}

export default function CampusBuildingScene({ building, pose, isActive }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(building.referenceImage);
  const [retried, setRetried] = useState(false);

  React.useEffect(() => {
    setCurrentSrc(building.referenceImage);
    setStatus('loading');
    setRetried(false);
  }, [building.referenceImage]);

  const xPct = useTransform(pose.x, (v) => `${v}%`);
  const yPct = useTransform(pose.y, (v) => `${v}%`);
  const filter = useTransform(pose.blur, (v) => `blur(${v.toFixed(2)}px) saturate(${1 + (8 - v) * 0.01})`);
  // Light sweep travels from the left edge to beyond the right edge.
  const sheenX = useTransform(pose.sheen, (v) => `${-60 + v * 220}%`);
  const sheenOpacity = useTransform(pose.sheen, [0, 0.15, 0.85, 1], [0, 0.55, 0.55, 0]);
  // Ground shadow follows the camera scale for a sense of depth.
  const shadowScale = useTransform(pose.scale, (s) => 0.7 + s * 0.3);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity: pose.opacity, pointerEvents: isActive ? 'auto' : 'none' }}
      aria-hidden={!isActive}
    >
      {/* Scene backdrop – crossfades with the scene opacity */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, ${building.theme.skyBottom} 0%, ${building.theme.skyTop} 55%, #050b18 100%)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 opacity-60"
        style={{ background: `linear-gradient(to top, ${building.theme.skyTop}, transparent)` }}
      />

      {/* Perspective stage */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 1400 }}>
        <motion.div
          className="relative w-[min(78vw,1100px)] aspect-[4/3] will-change-transform"
          style={{
            scale: pose.scale,
            x: xPct,
            y: yPct,
            rotateX: pose.rotateX,
            rotateY: pose.rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Ground contact shadow */}
          <motion.div
            className="absolute left-[8%] right-[8%] -bottom-8 h-12 rounded-[50%] bg-black/50 blur-2xl"
            style={{ scaleX: shadowScale }}
          />

          <motion.div
            className="relative w-full h-full rounded-[28px] overflow-hidden border border-white/15 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] bg-slate-900"
            style={{ filter }}
          >
            {status !== 'error' && (
              <img
                src={currentSrc}
                alt={building.referenceImageAlt}
                draggable={false}
                decoding="async"
                onLoad={() => setStatus('ready')}
                onError={() => {
                  if (!retried) {
                    setRetried(true);
                    if (currentSrc.endsWith('.JPG')) {
                      setCurrentSrc(currentSrc.replace(/\.JPG$/, '.jpg'));
                      return;
                    } else if (currentSrc.endsWith('.jpg')) {
                      setCurrentSrc(currentSrc.replace(/\.jpg$/, '.JPG'));
                      return;
                    } else if (currentSrc.endsWith('.PNG')) {
                      setCurrentSrc(currentSrc.replace(/\.PNG$/, '.png'));
                      return;
                    } else if (currentSrc.endsWith('.png')) {
                      setCurrentSrc(currentSrc.replace(/\.png$/, '.PNG'));
                      return;
                    }
                  }
                  setStatus('error');
                }}
                className="absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-700"
                style={{ opacity: status === 'ready' ? 1 : 0 }}
              />
            )}

            {status === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="text-sm font-medium">Loading {building.shortName}…</span>
              </div>
            )}

            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-white/80 bg-gradient-to-br from-slate-800 to-slate-900">
                <ImageOff className="w-12 h-12 text-white/50" />
                <p className="text-lg font-bold">Reference photo unavailable</p>
                <p className="text-sm text-white/60 max-w-md">
                  Expected file: <code className="text-blue-300">public{building.referenceImage}</code>
                </p>
              </div>
            )}

            {/* Reveal light sweep */}
            <motion.div
              className="absolute inset-y-0 w-1/3 pointer-events-none mix-blend-screen"
              style={{
                left: sheenX,
                opacity: sheenOpacity,
                background:
                  'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.35) 45%, rgba(191,219,254,0.5) 50%, rgba(255,255,255,0.35) 55%, transparent 100%)',
              }}
            />

            {/* Vignette + edge glass highlight */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(2,6,23,0.65)]" />
            <div className="absolute inset-0 pointer-events-none rounded-[28px] ring-1 ring-inset ring-white/10" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
