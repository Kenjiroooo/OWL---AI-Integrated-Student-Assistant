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
import { buildUnifiedMainCampus3D } from './mainCampusModel';
import type { ShapePoint, TrackerMode } from './ShapeTrackerOverlay';

/** Procedural model factory per building id. */
const MODEL_FACTORIES: Record<CampusBuildingId, () => Building3DResult> = {
  'udd-main': buildUnifiedMainCampus3D,
  'udd-main-tower': buildUnifiedMainCampus3D,
  'udd-main-front': buildUnifiedMainCampus3D,
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
  // Interactive Lasso / Shape Tracker Props
  trackerActive?: boolean;
  trackerMode?: TrackerMode;
  trackerSnap?: number;
  trackerPoints?: ShapePoint[];
  isShapeClosed?: boolean;
  hoverCoord?: { x: number; z: number } | null;
  onPointsChange?: (points: ShapePoint[]) => void;
  onHoverCoord?: (coord: { x: number; z: number } | null) => void;
  onCloseShape?: () => void;
}

/** Visual Builder: Point corner marker sphere + glowing halo ring on ground */
function createPointMarker(pt: ShapePoint, isFirst: boolean, isLast: boolean, isClosed: boolean): THREE.Group {
  const group = new THREE.Group();
  group.position.set(pt.x, pt.y, pt.z);

  const color = isFirst ? (isClosed ? 0x00f0ff : 0x10b981) : isLast ? 0x38bdf8 : 0x00e5ff;

  const sphereGeo = new THREE.SphereGeometry(isFirst ? 0.35 : 0.25, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({ color, depthTest: false });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.renderOrder = 999;
  group.add(sphere);

  const ringGeo = new THREE.RingGeometry(isFirst ? 0.45 : 0.3, isFirst ? 0.65 : 0.42, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
    depthTest: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  ring.renderOrder = 998;
  group.add(ring);

  return group;
}

/** Visual Builder: Neon boundary line + glowing vertical translucent ribbon */
function createBoundaryRibbon(points: ShapePoint[], isClosed: boolean): THREE.Group {
  const group = new THREE.Group();
  if (points.length < 2) return group;

  const allPts = isClosed ? [...points, points[0]] : points;

  // 1. Neon Line
  const linePositions: number[] = [];
  for (const p of allPts) {
    linePositions.push(p.x, p.y + 0.05, p.z);
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const line = new THREE.Line(lineGeo, lineMat);
  line.renderOrder = 997;
  group.add(line);

  // 2. Translucent vertical ribbon (0.45m tall wall)
  const ribbonPositions: number[] = [];
  const ribbonIndices: number[] = [];
  const h = 0.45;

  for (let i = 0; i < allPts.length; i++) {
    const p = allPts[i];
    ribbonPositions.push(p.x, p.y, p.z);
    ribbonPositions.push(p.x, p.y + h, p.z);
  }

  for (let i = 0; i < allPts.length - 1; i++) {
    const b0 = i * 2;
    const t0 = i * 2 + 1;
    const b1 = (i + 1) * 2;
    const t1 = (i + 1) * 2 + 1;
    ribbonIndices.push(b0, b1, t0);
    ribbonIndices.push(b1, t1, t0);
  }

  const ribbonGeo = new THREE.BufferGeometry();
  ribbonGeo.setAttribute('position', new THREE.Float32BufferAttribute(ribbonPositions, 3));
  ribbonGeo.setIndex(ribbonIndices);
  ribbonGeo.computeVertexNormals();

  const ribbonMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  });
  const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbonMesh.renderOrder = 996;
  group.add(ribbonMesh);

  return group;
}

/** Visual Builder: Translucent enclosed footprint polygon on the ground */
function createPolygonFill(points: ShapePoint[]): THREE.Mesh | null {
  if (points.length < 3) return null;
  try {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, -points[0].z);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, -points[i].z);
    }
    shape.closePath();

    const shapeGeo = new THREE.ShapeGeometry(shape);
    const shapeMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(shapeGeo, shapeMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.21;
    mesh.renderOrder = 995;
    return mesh;
  } catch (e) {
    console.warn('Polygon fill error:', e);
    return null;
  }
}

/** Visual Builder: Ghost dashed line connecting last point to hover coordinate */
function createGhostLine(lastPt: ShapePoint, hover: { x: number; z: number }): THREE.Line {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([lastPt.x, lastPt.y + 0.05, lastPt.z, hover.x, 0.27, hover.z], 3)
  );
  const mat = new THREE.LineDashedMaterial({
    color: 0x38bdf8,
    dashSize: 0.6,
    gapSize: 0.3,
    transparent: true,
    opacity: 0.85,
    depthTest: false,
  });
  const line = new THREE.Line(geo, mat);
  line.computeLineDistances();
  line.renderOrder = 997;
  return line;
}

/** Visual Builder: Glowing cursor ring indicator on ground */
function createHoverCursor(hover: { x: number; z: number }, snapToFirst: boolean): THREE.Group {
  const group = new THREE.Group();
  group.position.set(hover.x, 0.23, hover.z);

  const color = snapToFirst ? 0x10b981 : 0x00f0ff;
  const ringGeo = new THREE.RingGeometry(0.35, 0.5, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
    depthTest: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  const dotGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const dotMat = new THREE.MeshBasicMaterial({ color, depthTest: false });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  group.add(dot);

  return group;
}

const Campus3DCanvas = forwardRef<Campus3DCanvasHandle, Props>(function Campus3DCanvas(
  {
    buildingIds,
    activeBuildingId,
    exploded,
    cinematicNonce,
    onCinematicComplete,
    trackerActive = false,
    trackerMode = 'polygon',
    trackerSnap = 0.5,
    trackerPoints = [],
    isShapeClosed = false,
    hoverCoord = null,
    onPointsChange,
    onHoverCoord,
    onCloseShape,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isLassoDraggingRef = useRef(false);

  // Keep latest tracker props accessible to event listeners
  const propsRef = useRef({
    trackerActive,
    trackerMode,
    trackerSnap,
    trackerPoints,
    isShapeClosed,
    hoverCoord,
    onPointsChange,
    onHoverCoord,
    onCloseShape,
  });
  propsRef.current = {
    trackerActive,
    trackerMode,
    trackerSnap,
    trackerPoints,
    isShapeClosed,
    hoverCoord,
    onPointsChange,
    onHoverCoord,
    onCloseShape,
  };

  // References to keep animation state across renders without re-initializing WebGL
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    controls: OrbitControls | null;
    models: Partial<Record<CampusBuildingId, Building3DResult>>;
    activeId: CampusBuildingId;
    isExploded: boolean;
    trackerGroup: THREE.Group | null;
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
    trackerGroup: null,
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

      // 8. Interactive Shape / Lasso Tracker Group
      const trackerGroup = new THREE.Group();
      trackerGroup.name = 'building-tracker-group';
      scene.add(trackerGroup);

      stateRef.current.renderer = renderer;
      stateRef.current.scene = scene;
      stateRef.current.camera = camera;
      stateRef.current.controls = controls;
      stateRef.current.models = models;
      stateRef.current.trackerGroup = trackerGroup;

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

  // Switch OrbitControls mouse buttons when tracking is active:
  // Left-click draws points/lasso, right-click drag rotates camera 360°, middle-click zooms/pans
  useEffect(() => {
    const { controls } = stateRef.current;
    if (!controls) return;
    if (trackerActive) {
      controls.mouseButtons = {
        LEFT: -1 as any,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      controls.touches = {
        ONE: -1 as any,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    } else {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    }
  }, [trackerActive]);

  // Rebuild 3D visual geometries inside trackerGroup whenever points or hover change
  useEffect(() => {
    const { trackerGroup } = stateRef.current;
    if (!trackerGroup) return;

    // Dispose and clear existing children
    while (trackerGroup.children.length > 0) {
      const child = trackerGroup.children[0];
      trackerGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    if (!trackerActive) return;

    const points = trackerPoints ?? [];
    const isClosed = !!isShapeClosed;

    // 1. Vertex point spheres and ground halos
    points.forEach((pt, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === points.length - 1;
      const marker = createPointMarker(pt, isFirst, isLast, isClosed);
      trackerGroup.add(marker);
    });

    // 2. Neon boundary lines and vertical translucent ribbon
    if (points.length >= 2) {
      const ribbon = createBoundaryRibbon(points, isClosed);
      trackerGroup.add(ribbon);
    }

    // 3. Polygon ground footprint fill if shape is closed
    if (isClosed && points.length >= 3) {
      const fillMesh = createPolygonFill(points);
      if (fillMesh) trackerGroup.add(fillMesh);
    }

    // 4. Ghost guide line and live hover cursor
    if (hoverCoord && !isClosed) {
      const isNearFirst =
        points.length >= 3 && Math.hypot(hoverCoord.x - points[0].x, hoverCoord.z - points[0].z) < 1.4;

      if (points.length > 0) {
        const lastPt = points[points.length - 1];
        const targetPt = isNearFirst ? { x: points[0].x, z: points[0].z } : hoverCoord;
        const ghost = createGhostLine(lastPt, targetPt);
        trackerGroup.add(ghost);
      }

      const cursor = createHoverCursor(hoverCoord, isNearFirst);
      trackerGroup.add(cursor);
    }
  }, [trackerActive, trackerPoints, isShapeClosed, hoverCoord]);

  // Ground plane raycaster helper
  const getGroundIntersection = (clientX: number, clientY: number, snap: number): { x: number; z: number } | null => {
    const canvas = canvasRef.current;
    const camera = stateRef.current.camera;
    if (!canvas || !camera) return null;

    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.22);
    const hit = new THREE.Vector3();
    const res = raycaster.ray.intersectPlane(plane, hit);
    if (!res) return null;

    let x = hit.x;
    let z = hit.z;
    if (snap > 0) {
      x = Math.round(x / snap) * snap;
      z = Math.round(z / snap) * snap;
    }
    return {
      x: Number(x.toFixed(2)),
      z: Number(z.toFixed(2)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { trackerActive, trackerMode, trackerSnap, trackerPoints, isShapeClosed, onPointsChange, onCloseShape } =
      propsRef.current;
    if (!trackerActive) return;

    // Right-click is reserved for OrbitControls camera 360° rotation
    if (e.button === 2) return;

    if (e.button === 0) {
      if (isShapeClosed) return;

      const hit = getGroundIntersection(e.clientX, e.clientY, trackerSnap);
      if (!hit) return;

      // Close polygon if clicked near start point
      if (trackerPoints.length >= 3) {
        const first = trackerPoints[0];
        const dist = Math.hypot(hit.x - first.x, hit.z - first.z);
        if (dist < 1.4) {
          onCloseShape?.();
          return;
        }
      }

      if (trackerMode === 'lasso') {
        isLassoDraggingRef.current = true;
      }

      const newPt: ShapePoint = { x: hit.x, y: 0.22, z: hit.z };
      onPointsChange?.([...trackerPoints, newPt]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { trackerActive, trackerMode, trackerSnap, trackerPoints, isShapeClosed, onPointsChange, onHoverCoord } =
      propsRef.current;
    if (!trackerActive) return;

    const hit = getGroundIntersection(e.clientX, e.clientY, trackerSnap);
    if (!hit) {
      onHoverCoord?.(null);
      return;
    }

    onHoverCoord?.(hit);

    // Freehand lasso drag sampling
    if (trackerMode === 'lasso' && isLassoDraggingRef.current && !isShapeClosed) {
      const last = trackerPoints[trackerPoints.length - 1];
      if (!last || Math.hypot(hit.x - last.x, hit.z - last.z) >= 0.75) {
        const newPt: ShapePoint = { x: hit.x, y: 0.22, z: hit.z };
        onPointsChange?.([...trackerPoints, newPt]);
      }
    }
  };

  const handlePointerUp = () => {
    if (isLassoDraggingRef.current) {
      isLassoDraggingRef.current = false;
    }
  };

  const handlePointerLeave = () => {
    isLassoDraggingRef.current = false;
    propsRef.current.onHoverCoord?.(null);
  };

  const handleDoubleClick = () => {
    const { trackerActive, trackerPoints, isShapeClosed, onCloseShape } = propsRef.current;
    if (!trackerActive || isShapeClosed) return;
    if (trackerPoints.length >= 3) {
      onCloseShape?.();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (propsRef.current.trackerActive) {
      e.preventDefault();
    }
  };

  if (webGLFailed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white/70 p-6 text-center">
        <p>WebGL 3D rendering is not supported on this device. Fallback reference photos remain available.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={`w-full h-full block outline-none ${
          trackerActive
            ? isShapeClosed
              ? 'cursor-default'
              : 'cursor-crosshair'
            : 'cursor-grab active:cursor-grabbing'
        }`}
      />
    </div>
  );
});

export default Campus3DCanvas;
