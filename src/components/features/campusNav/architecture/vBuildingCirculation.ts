// ─────────────────────────────────────────────────────────────────────────────
// vBuildingCirculation.ts – Exterior Stairs, Glass Elevator Tower & 4-Storey
// Glass Escalator Atrium for V Building (5-Storey Courtyard Building)
//
// Modelled from real-world courtyard reference photography of Universidad de
// Dagupan V Building:
//   1. Left courtyard Exterior Staircase ascending to covered 2F canopy landing
//   2. Slender white-framed clear glass Elevator Tower at inner North-East corner
//   3. 4-Storey projecting white-steel glass Escalator Atrium along East Wing
//      with interior crisscross escalator flights and floor landing bridges
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { getCachedBoxGeometry, getCachedCylinderGeometry, getCachedStandardMaterial } from './geometryCache';

export interface VBuildingSegment {
  idx: number;
  p1: readonly [number, number];
  p2: readonly [number, number];
  len: number;
  cx: number;
  cz: number;
  rotY: number;
}

export interface VBuildingCirculationMaterials {
  steelWhite: THREE.MeshStandardMaterial;
  steelSilver: THREE.MeshStandardMaterial;
  steelDark: THREE.MeshStandardMaterial;
  clearGlass: THREE.MeshStandardMaterial;
  skyTintGlass: THREE.MeshStandardMaterial;
  roofNavyTrim: THREE.MeshStandardMaterial;
  concreteStep: THREE.MeshStandardMaterial;
  treadDark: THREE.MeshStandardMaterial;
  handrailBlack: THREE.MeshStandardMaterial;
  cabWarmLight: THREE.MeshStandardMaterial;
  planterStone: THREE.MeshStandardMaterial;
  foliageGreen: THREE.MeshStandardMaterial;
  uddBlue: THREE.MeshStandardMaterial;
}

/** Shared V Building circulation layout constants along Seg 1 (North) and Seg 2 (East). */
export const V_CIRC_LAYOUT = {
  floorHeight: 3.8,
  stair: {
    flightStartLx: -7.2,
    flightEndLx: -1.4,
    landingStartLx: -1.4,
    landingEndLx: 1.8,
    flightCenterLz: 1.35,
    flightWidth: 1.45,
    landingDepth: 2.05,
    stepCount: 14,
  },
  elevator: {
    centerLx: 7.25,
    width: 2.5,
    depth: 2.5,
    frontOffsetLz: 0.15,
  },
  atrium: {
    startS: 1.0,
    endS: 10.6,
    baysLong: 6,
    baysDeep: 2,
    depth: 3.6,
    backOffsetLz: 0.15,
  },
} as const;

export function createVBuildingCirculationMaterials(): VBuildingCirculationMaterials {
  return {
    steelWhite: getCachedStandardMaterial('v-circ-steel-white', {
      color: 0xf1f5f9,
      roughness: 0.42,
      metalness: 0.25,
    }),
    steelSilver: getCachedStandardMaterial('v-circ-steel-silver', {
      color: 0xcbd5e1,
      roughness: 0.3,
      metalness: 0.72,
    }),
    steelDark: getCachedStandardMaterial('v-circ-steel-dark', {
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.65,
    }),
    clearGlass: getCachedStandardMaterial('v-circ-clear-glass', {
      color: 0xdbeafe,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    }),
    skyTintGlass: getCachedStandardMaterial('v-circ-balustrade-glass', {
      color: 0x93c5fd,
      roughness: 0.1,
      metalness: 0.25,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
    roofNavyTrim: getCachedStandardMaterial('v-circ-roof-navy', {
      color: 0x163d7a,
      roughness: 0.45,
      metalness: 0.35,
    }),
    concreteStep: getCachedStandardMaterial('v-circ-concrete-step', {
      color: 0xe2e8f0,
      roughness: 0.75,
    }),
    treadDark: getCachedStandardMaterial('v-circ-tread-dark', {
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.45,
    }),
    handrailBlack: getCachedStandardMaterial('v-circ-handrail-black', {
      color: 0x0f172a,
      roughness: 0.32,
      metalness: 0.2,
    }),
    cabWarmLight: getCachedStandardMaterial('v-circ-cab-light', {
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 0.55,
      roughness: 0.3,
    }),
    planterStone: getCachedStandardMaterial('v-circ-planter-stone', {
      color: 0x475569,
      roughness: 0.75,
    }),
    foliageGreen: getCachedStandardMaterial('v-circ-foliage-green', {
      color: 0x2e7d32,
      roughness: 0.85,
    }),
    uddBlue: getCachedStandardMaterial('v-circ-udd-blue', {
      color: 0x1153b6,
      roughness: 0.4,
      metalness: 0.35,
    }),
  };
}

/** Creates a box mesh pre-tagged with V Building's buildingId for selection/highlight. */
export function circBox(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  shadow = true
): THREE.Mesh {
  const m = new THREE.Mesh(getCachedBoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  m.userData.buildingId = 'udd-main-v';
  return m;
}

/** Creates an angled beam between two local 3D points, tagged for V Building. */
export function circBeam(
  a: THREE.Vector3,
  b: THREE.Vector3,
  width: number,
  depth: number,
  mat: THREE.Material,
  shadow = true
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(getCachedBoxGeometry(width, len, depth), mat);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  mesh.userData.buildingId = 'udd-main-v';
  return mesh;
}

/** Creates a cylindrical rod between two local 3D points, tagged for V Building. */
export function circRod(
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number,
  mat: THREE.Material
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(getCachedCylinderGeometry(radius, radius, len, 10), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = false;
  m.receiveShadow = true;
  m.userData.buildingId = 'udd-main-v';
  return m;
}

/** Adds a horizontal white vertical-picket guardrail between two X/Z endpoints at baseY. */
export function addPicketRailing(
  parent: THREE.Object3D,
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  baseY: number,
  height: number,
  mats: VBuildingCirculationMaterials,
  spacing = 0.24
): void {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const span = Math.hypot(dx, dz);
  if (span < 0.05) return;

  const railGrp = new THREE.Group();
  railGrp.position.set((x1 + x2) / 2, baseY, (z1 + z2) / 2);
  railGrp.rotation.y = Math.atan2(-dz, dx);

  // Top cap rail, lower rail, and end stanchions
  railGrp.add(circBox(span + 0.04, 0.05, 0.06, mats.steelWhite, 0, height, 0, false));
  railGrp.add(circBox(span, 0.04, 0.04, mats.steelWhite, 0, 0.12, 0, false));
  railGrp.add(circBox(0.05, height, 0.05, mats.steelWhite, -span / 2, height / 2, 0, false));
  railGrp.add(circBox(0.05, height, 0.05, mats.steelWhite, span / 2, height / 2, 0, false));

  const picketCount = Math.max(1, Math.floor(span / spacing) - 1);
  for (let i = 1; i <= picketCount; i++) {
    const px = -span / 2 + (i * span) / (picketCount + 1);
    railGrp.add(circBox(0.025, height - 0.14, 0.025, mats.steelWhite, px, (height + 0.12) / 2, 0, false));
  }

  parent.add(railGrp);
}

