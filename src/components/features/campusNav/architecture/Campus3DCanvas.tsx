// ─────────────────────────────────────────────────────────────────────────────
// Campus3DCanvas.tsx – Interactive Three.js 3D Architectural Viewport
//
// Features:
// 1. Physically-based architectural rendering (PBR, soft shadows, tone mapping).
// 2. Exploded Floor Animation: Vertical separation of levels when toggled.
// 3. Cinematic Camera Controller: OrbitControls + programmatic camera sequences.
// 4. Seamless transitions between Building 1 and Building 2.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CampusBuildingId } from './buildings';
import { buildMainTower3D, buildFrontBuilding3D, type Building3DResult } from './proceduralModels';
import { buildFameBuilding3D } from './fameModel';

/** Procedural model factory per building id. */
const MODEL_FACTORIES: Record<CampusBuildingId, () => Building3DResult> = {
  'udd-main-tower': buildMainTower3D,
  'udd-main-front': buildFrontBuilding3D,
  'udd-fame': buildFameBuilding3D,
};

export interface Campus3DCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  orbitLeft: () => void;
  orbitRight: () => void;
  resetView: () => void;
}

interface Props {
  /** Buildings to build into this scene (only these are instantiated). */
  buildingIds: readonly CampusBuildingId[];
  activeBuildingId: CampusBuildingId;
  exploded: boolean;
  cinematicNonce: number; // Incrementing counter to trigger cinematic flythrough
  onCinematicComplete?: () => void;
}

const Campus3DCanvas = forwardRef<Campus3DCanvasHandle, Props>(function Campus3DCanvas(
  { buildingIds, activeBuildingId, exploded, cinematicNonce, onCinematicComplete },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to keep animation state across renders without re-initializing WebGL
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    controls: OrbitControls | null;
    models: Partial<Record<CampusBuildingId, Building3DResult>>;
    activeId: CampusBuildingId;
    isExploded: boolean;
    cinematicTarget: {
      active: boolean;
      progress: number;
      startCam: THREE.Vector3;
      startLook: THREE.Vector3;
      endCam: THREE.Vector3;
      endLook: THREE.Vector3;
    } | null;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    models: {},
    activeId: activeBuildingId,
    isExploded: exploded,
    cinematicTarget: null,
  });

  const [webGLFailed, setWebGLFailed] = useState(false);

  // Expose camera controls to parent UI buttons
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const { camera, controls } = stateRef.current;
      if (!camera || !controls) return;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, 3.5);
      controls.update();
    },
    zoomOut: () => {
      const { camera, controls } = stateRef.current;
      if (!camera || !controls) return;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, -3.5);
      controls.update();
    },
    orbitLeft: () => {
      const { camera, controls } = stateRef.current;
      if (!camera || !controls) return;
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.25);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    },
    orbitRight: () => {
      const { camera, controls } = stateRef.current;
      if (!camera || !controls) return;
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.25);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    },
    resetView: () => {
      const { camera, controls, models, activeId } = stateRef.current;
      if (!camera || !controls) return;
      const model = models[activeId];
      if (!model) return;
      stateRef.current.cinematicTarget = {
        active: true,
        progress: 0,
        startCam: camera.position.clone(),
        startLook: controls.target.clone(),
        endCam: model.defaultCameraPos.clone(),
        endLook: model.targetLookAt.clone(),
      };
    },
  }));

  // Sync prop changes into stateRef and animate camera on building change
  useEffect(() => {
    const prevId = stateRef.current.activeId;
    stateRef.current.activeId = activeBuildingId;

    if (prevId !== activeBuildingId) {
      const { camera, controls, models } = stateRef.current;
      if (!camera || !controls) return;
      const targetModel = models[activeBuildingId];
      if (!targetModel) return;

      stateRef.current.cinematicTarget = {
        active: true,
        progress: 0,
        startCam: camera.position.clone(),
        startLook: controls.target.clone(),
        endCam: targetModel.defaultCameraPos.clone(),
        endLook: targetModel.targetLookAt.clone(),
      };
    }
  }, [activeBuildingId]);

  useEffect(() => {
    stateRef.current.isExploded = exploded;
  }, [exploded]);

  // Trigger cinematic sequence on nonce change
  useEffect(() => {
    if (cinematicNonce === 0) return;
    const { camera, controls, models, activeId } = stateRef.current;
    if (!camera || !controls) return;

    const currentModel = models[activeId];
    if (!currentModel) return;

    // Establishing wide position
    const startCam = currentModel.defaultCameraPos.clone().multiplyScalar(1.9).add(new THREE.Vector3(0, 15, 0));
    const startLook = currentModel.targetLookAt.clone();

    // Intermediate/settled camera
    const endCam = currentModel.defaultCameraPos.clone();
    const endLook = currentModel.targetLookAt.clone();

    camera.position.copy(startCam);
    controls.target.copy(startLook);
    controls.update();

    stateRef.current.cinematicTarget = {
      active: true,
      progress: 0,
      startCam,
      startLook,
      endCam,
      endLook,
    };
  }, [cinematicNonce]);

  // Main WebGL Scene Initialization
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animFrameId: number;

    try {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      // 1. Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // 2. Scene & Fog
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a1424);
      scene.fog = new THREE.FogExp2(0x0a1424, 0.009);

      // 3. Camera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
      camera.position.set(28, 24, 42);

      // 4. Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 14;
      controls.maxDistance = 85;
      controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep camera above ground
      controls.target.set(0, 10, 0);

      // 5. Lighting Setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.7);
      hemiLight.position.set(0, 50, 0);
      scene.add(hemiLight);

      const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
      sunLight.position.set(45, 60, 35);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 150;
      sunLight.shadow.camera.left = -40;
      sunLight.shadow.camera.right = 40;
      sunLight.shadow.camera.top = 40;
      sunLight.shadow.camera.bottom = -40;
      sunLight.shadow.bias = -0.0004;
      scene.add(sunLight);

      const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.85);
      fillLight.position.set(-35, 30, -25);
      scene.add(fillLight);

      // 6. Architectural Grid Ground Plane
      const groundGeo = new THREE.PlaneGeometry(160, 160);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x07111e,
        roughness: 0.95,
        metalness: 0.1,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.5;
      ground.receiveShadow = true;
      scene.add(ground);

      const grid = new THREE.GridHelper(160, 40, 0x1e3a8a, 0x0f2347);
      grid.position.y = -0.48;
      scene.add(grid);

      // 7. Procedural Buildings (only those belonging to this campus)
      const models: Partial<Record<CampusBuildingId, Building3DResult>> = {};
      for (const id of buildingIds) {
        const m = MODEL_FACTORIES[id]();
        // Start hidden; the animation loop scales the active one in.
        m.root.scale.setScalar(id === activeBuildingId ? 1 : 0.001);
        m.root.visible = id === activeBuildingId;
        scene.add(m.root);
        models[id] = m;
      }

      stateRef.current.renderer = renderer;
      stateRef.current.scene = scene;
      stateRef.current.camera = camera;
      stateRef.current.controls = controls;
      stateRef.current.models = models;

      // Start initial camera on active building
      const initModel = models[activeBuildingId] ?? Object.values(models)[0]!;
      camera.position.copy(initModel.defaultCameraPos);
      controls.target.copy(initModel.targetLookAt);
      controls.update();

      // Trigger initial intro sweep
      stateRef.current.cinematicTarget = {
        active: true,
        progress: 0,
        startCam: initModel.defaultCameraPos.clone().multiplyScalar(1.7).add(new THREE.Vector3(0, 12, 0)),
        startLook: initModel.targetLookAt.clone(),
        endCam: initModel.defaultCameraPos.clone(),
        endLook: initModel.targetLookAt.clone(),
      };

      // 8. Render & Animation Loop
      const clock = new THREE.Clock();

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.1);

        const { activeId, isExploded, cinematicTarget } = stateRef.current;

        // Transition model visibility (smooth scale in/out)
        const scaleTarget = new THREE.Vector3();
        for (const [id, m] of Object.entries(models) as [CampusBuildingId, Building3DResult][]) {
          const s = id === activeId ? 1 : 0.001;
          m.root.scale.lerp(scaleTarget.setScalar(s), delta * 5);
          m.root.visible = m.root.scale.x > 0.01;
        }

        // Exploded View Floor Separation
        const activeData = models[activeId];
        if (activeData) {
          const explodeSpacing = activeData.explodeSpacing ?? 4;
          activeData.floorGroups.forEach((floorGroup, idx) => {
            // Keep ground floor fixed; elevate subsequent floors
            const targetElevation = isExploded && idx > 0 ? idx * explodeSpacing : 0;
            floorGroup.position.y = THREE.MathUtils.lerp(floorGroup.position.y, targetElevation, delta * 4.5);
          });
        }

        // Cinematic Flythrough Controller
        if (cinematicTarget && cinematicTarget.active) {
          cinematicTarget.progress += delta * 0.45;

          if (cinematicTarget.progress >= 1) {
            cinematicTarget.active = false;
            camera.position.copy(cinematicTarget.endCam);
            controls.target.copy(cinematicTarget.endLook);
            controls.update();
            onCinematicComplete?.();
          } else {
            // Smooth ease-in-out cubic
            const t = cinematicTarget.progress;
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            // Arc interpolation around building
            const currentPos = new THREE.Vector3().lerpVectors(
              cinematicTarget.startCam,
              cinematicTarget.endCam,
              ease
            );
            // Add gentle orbital lateral curve
            const arcOffset = Math.sin(ease * Math.PI) * 6;
            currentPos.x += arcOffset;

            camera.position.copy(currentPos);
            controls.target.lerpVectors(cinematicTarget.startLook, cinematicTarget.endLook, ease);
            controls.update();
          }
        } else {
          controls.update();
        }

        renderer.render(scene, camera);
      };

      animate();

      // 9. Resize Handling
      const handleResize = () => {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // Cleanup on unmount
      return () => {
        cancelAnimationFrame(animFrameId);
        resizeObserver.disconnect();
        renderer.dispose();
      };
    } catch (err) {
      console.error('WebGL initialization error:', err);
      setWebGLFailed(true);
    }
  }, []); // Run once on mount

  if (webGLFailed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white/70 p-6 text-center">
        <p>WebGL 3D rendering is not supported on this device. Fallback reference photos remain available.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing outline-none" />
    </div>
  );
});

export default Campus3DCanvas;
