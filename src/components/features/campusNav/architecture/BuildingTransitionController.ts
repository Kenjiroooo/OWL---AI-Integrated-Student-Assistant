// ─────────────────────────────────────────────────────────────────────────────
// BuildingTransitionController.ts – Cinematic camera choreography
//
// Both building scenes stay mounted; each owns a set of MotionValues (its
// "camera pose"). This controller animates those values imperatively so that:
//   • switching never remounts a scene (no flicker),
//   • every timeline is tagged with a generation number – starting a new one
//     stops the running animations in place and the next timeline continues
//     from the CURRENT values, so rapid switching never stacks or jumps,
//   • reduced-motion users get short crossfades with no camera movement.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, motionValue, type MotionValue } from 'motion/react';
import {
  CAMPUS_BUILDINGS,
  type CameraPose,
  type CampusBuildingId,
  getBuilding,
} from './buildings';

export interface ScenePose {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  blur: MotionValue<number>;
  /** 0 → 1 light sweep across the facade (reveal highlight). */
  sheen: MotionValue<number>;
}

type PoseKey = keyof ScenePose;
type PoseTarget = Partial<Record<PoseKey, number>>;

export type TransitionPhase =
  | 'idle'
  | 'intro'
  | 'pullback'
  | 'crossing'
  | 'reveal'
  | 'settling';

// Cinematic ease curves (slow-in / slow-out, no overshoot).
const EASE_CINE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ZOOM_MIN = 0.9;
const ZOOM_MAX = 1.9;
const ORBIT_LIMIT = 22;

function createPose(visible: boolean, pose: CameraPose): ScenePose {
  return {
    opacity: motionValue(visible ? 1 : 0),
    scale: motionValue(pose.scale),
    x: motionValue(pose.x),
    y: motionValue(pose.y),
    rotateX: motionValue(pose.rotateX),
    rotateY: motionValue(pose.rotateY),
    blur: motionValue(visible ? 0 : 8),
    sheen: motionValue(0),
  };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function useBuildingTransitionController(
  initialId: CampusBuildingId,
  reducedMotion: boolean
) {
  // MotionValues are created once (outside the hook-call order) for every building.
  const [poses] = useState<Record<CampusBuildingId, ScenePose>>(() => {
    const out = {} as Record<CampusBuildingId, ScenePose>;
    for (const b of CAMPUS_BUILDINGS) {
      out[b.id] = createPose(b.id === initialId, b.establishingPose);
      if (b.id === initialId) out[b.id].opacity.set(0);
    }
    return out;
  });

  const [activeId, setActiveId] = useState<CampusBuildingId>(initialId);
  const [phase, setPhase] = useState<TransitionPhase>('idle');

  const activeRef = useRef(activeId);
  const genRef = useRef(0);
  const running = useRef<Set<{ stop: () => void }>>(new Set());
  const cancelResolver = useRef<(() => void) | null>(null);
  const cancelPromise = useRef<Promise<void>>(Promise.resolve());

  /** Stop everything in place and invalidate any in-flight timeline. */
  const cancel = useCallback(() => {
    genRef.current += 1;
    running.current.forEach((c) => c.stop());
    running.current.clear();
    cancelResolver.current?.();
    cancelPromise.current = new Promise<void>((res) => {
      cancelResolver.current = res;
    });
    return genRef.current;
  }, []);

  useEffect(() => () => void cancel(), [cancel]);

  /**
   * Animate a set of pose values together. Resolves `true` when finished,
   * `false` if superseded by a newer timeline.
   */
  const step = useCallback(
    async (
      gen: number,
      targets: Array<[ScenePose, PoseTarget]>,
      duration: number,
      ease: [number, number, number, number] = EASE_CINE,
      delay = 0
    ): Promise<boolean> => {
      if (gen !== genRef.current) return false;
      const done: Promise<void>[] = [];
      for (const [pose, target] of targets) {
        for (const key of Object.keys(target) as PoseKey[]) {
          const to = target[key];
          if (to === undefined) continue;
          const ctrl = animate(pose[key], to, { duration, ease, delay });
          running.current.add(ctrl);
          done.push(
            new Promise<void>((res) => {
              ctrl.then(() => {
                running.current.delete(ctrl);
                res();
              });
            })
          );
        }
      }
      await Promise.race([Promise.all(done), cancelPromise.current]);
      return gen === genRef.current;
    },
    []
  );

  const poseOf = (p: CameraPose): PoseTarget => ({
    scale: p.scale,
    x: p.x,
    y: p.y,
    rotateX: p.rotateX,
    rotateY: p.rotateY,
  });

  /** Cinematic introduction for a building (also used by the Play button). */
  const playIntro = useCallback(
    async (id: CampusBuildingId = activeRef.current) => {
      const gen = cancel();
      const b = getBuilding(id);
      const pose = poses[id];

      // Hide every other scene immediately-but-smoothly.
      const others = CAMPUS_BUILDINGS.filter((x) => x.id !== id).map(
        (x) => [poses[x.id], { opacity: 0 }] as [ScenePose, PoseTarget]
      );

      if (reducedMotion) {
        setPhase('settling');
        Object.entries(poseOf(b.defaultPose)).forEach(([k, v]) => pose[k as PoseKey].set(v!));
        pose.blur.set(0);
        await step(gen, [[pose, { opacity: 1 }], ...others], 0.3, EASE_OUT);
        if (gen === genRef.current) setPhase('idle');
        return;
      }

      // 1. Wide, slightly elevated establishing shot.
      setPhase('intro');
      Object.entries(poseOf(b.establishingPose)).forEach(([k, v]) => pose[k as PoseKey].set(v!));
      pose.blur.set(6);
      pose.sheen.set(0);
      if (!(await step(gen, [[pose, { opacity: 1, blur: 2 }], ...others], 0.9, EASE_OUT))) return;

      // 2. Slow approach + facade reveal (light sweep).
      if (
        !(await step(
          gen,
          [[pose, { scale: 0.9, y: 5, rotateX: 7, blur: 0, sheen: 1 }]],
          1.6,
          EASE_CINE
        ))
      )
        return;

      // 3. Three-quarter orbit to reveal overall form.
      if (!(await step(gen, [[pose, poseOf(b.orbitPose)]], 1.8, EASE_CINE))) return;

      // 4. Settle into the interactive resting view.
      setPhase('settling');
      pose.sheen.set(0);
      if (!(await step(gen, [[pose, poseOf(b.defaultPose)]], 1.4, EASE_CINE))) return;
      setPhase('idle');
    },
    [cancel, poses, reducedMotion, step]
  );

  /** Cinematic transition from the current building to `toId`. */
  const switchTo = useCallback(
    async (toId: CampusBuildingId) => {
      const fromId = activeRef.current;
      if (toId === fromId) return;
      const gen = cancel();
      activeRef.current = toId;
      setActiveId(toId);

      const from = poses[fromId];
      const to = poses[toId];
      const toB = getBuilding(toId);
      const fromIdx = CAMPUS_BUILDINGS.findIndex((b) => b.id === fromId);
      const toIdx = CAMPUS_BUILDINGS.findIndex((b) => b.id === toId);
      // Forward = camera travels right (scene exits left); reverse mirrors it.
      const dir = toIdx > fromIdx ? 1 : -1;

      // Any third scene that might still be visible fades away.
      const others = CAMPUS_BUILDINGS.filter((b) => b.id !== fromId && b.id !== toId).map(
        (b) => [poses[b.id], { opacity: 0 }] as [ScenePose, PoseTarget]
      );

      if (reducedMotion) {
        setPhase('crossing');
        Object.entries(poseOf(toB.defaultPose)).forEach(([k, v]) => to[k as PoseKey].set(v!));
        to.blur.set(0);
        if (!(await step(gen, [[from, { opacity: 0 }], [to, { opacity: 1 }], ...others], 0.35, EASE_OUT)))
          return;
        setPhase('idle');
        return;
      }

      // A. Pull back from the current building.
      setPhase('pullback');
      if (
        !(await step(
          gen,
          [[from, { scale: 0.82, y: 4, rotateX: 6, rotateY: 0, x: 0, sheen: 0 }], ...others],
          0.75,
          EASE_CINE
        ))
      )
        return;

      // B + C. Lateral camera move: outgoing slides/orbits away while the
      // incoming scene enters from the opposite side. Opacity overlaps so the
      // background crossfades with no blank frame.
      setPhase('crossing');
      // Only reposition the incoming scene if it is not already partly on screen
      // (e.g. user reversed mid-transition) – otherwise continue from where it is.
      if (to.opacity.get() < 0.05) {
        to.x.set(dir * 42);
        to.y.set(5);
        to.scale.set(0.78);
        to.rotateX.set(6);
        to.rotateY.set(dir * -24);
        to.blur.set(8);
        to.sheen.set(0);
      }
      if (
        !(await step(
          gen,
          [
            [from, { x: dir * -42, rotateY: dir * 24, opacity: 0, blur: 8, scale: 0.76 }],
            [to, { x: dir * 6, rotateY: dir * -8, opacity: 1, blur: 1, scale: 0.88 }],
          ],
          1.15,
          EASE_CINE
        ))
      )
        return;

      // D. Gradual reveal – camera moves toward the incoming facade.
      setPhase('reveal');
      if (
        !(await step(
          gen,
          [[to, { x: 0, rotateY: 0, rotateX: 2, blur: 0, scale: toB.defaultPose.scale * 0.97, sheen: 1 }]],
          1.1,
          EASE_CINE
        ))
      )
        return;

      // E. Settle into the building's default viewing angle.
      setPhase('settling');
      to.sheen.set(0);
      if (!(await step(gen, [[to, poseOf(toB.defaultPose)]], 0.9, EASE_OUT))) return;
      setPhase('idle');
    },
    [cancel, poses, reducedMotion, step]
  );

  // ── User camera controls (only meaningful while idle) ─────────────────────
  const nudge = useCallback(
    (delta: { orbit?: number; zoom?: number; panX?: number; panY?: number }, animated = true) => {
      const pose = poses[activeRef.current];
      const target: PoseTarget = {};
      if (delta.orbit) {
        target.rotateY = clamp(pose.rotateY.get() + delta.orbit, -ORBIT_LIMIT, ORBIT_LIMIT);
        target.x = clamp(pose.x.get() - delta.orbit * 0.35, -12, 12);
      }
      if (delta.zoom) target.scale = clamp(pose.scale.get() + delta.zoom, ZOOM_MIN, ZOOM_MAX);
      const s = target.scale ?? pose.scale.get();
      const panLimit = Math.max(4, (s - 0.8) * 30);
      if (delta.panX) target.x = clamp((target.x ?? pose.x.get()) + delta.panX, -panLimit, panLimit);
      if (delta.panY) target.y = clamp(pose.y.get() + delta.panY, -panLimit, panLimit);

      if (!animated || reducedMotion) {
        (Object.keys(target) as PoseKey[]).forEach((k) => pose[k].set(target[k]!));
        return;
      }
      const gen = cancel();
      void step(gen, [[pose, target]], 0.45, EASE_OUT);
    },
    [cancel, poses, reducedMotion, step]
  );

  const resetView = useCallback(async () => {
    const gen = cancel();
    const id = activeRef.current;
    setPhase('settling');
    if (
      await step(
        gen,
        [[poses[id], { ...poseOf(getBuilding(id).defaultPose), blur: 0, opacity: 1 }]],
        reducedMotion ? 0.2 : 0.8,
        EASE_CINE
      )
    )
      setPhase('idle');
  }, [cancel, poses, reducedMotion, step]);

  return {
    poses,
    activeId,
    phase,
    busy: phase !== 'idle',
    playIntro,
    switchTo,
    nudge,
    resetView,
    cancel,
  };
}
