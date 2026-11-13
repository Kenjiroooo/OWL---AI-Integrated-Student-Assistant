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

/**
 * Adds V Building's exterior courtyard staircase along Seg 1 (North Wing):
 * - Ground floor (1F): 14 stepped treads, twin concrete stringers, sloped picket
 *   guardrail, support column, landscape planter & sculptural "UDD" block emblem.
 * - 2F tier: upper cantilevered landing platform, perimeter picket guardrails,
 *   directional notice plaque, and supported flat landing canopy roof.
 */
export function addVBuildingExteriorStairs(
  ground: THREE.Group,
  floor2F: THREE.Group,
  seg1: VBuildingSegment,
  mats: VBuildingCirculationMaterials
): void {
  const { floorHeight: FH, stair } = V_CIRC_LAYOUT;
  const {
    flightStartLx,
    flightEndLx,
    landingStartLx,
    landingEndLx,
    flightCenterLz,
    flightWidth,
    landingDepth,
    stepCount,
  } = stair;

  // ── 1. Ground-Floor Ascending Stair Flight & Plaza Signage ────────────────
  const groundGrp = new THREE.Group();
  groundGrp.position.set(seg1.cx, 0, seg1.cz);
  groundGrp.rotation.y = seg1.rotY;

  const run = flightEndLx - flightStartLx;
  const rise = FH;
  const treadW = run / stepCount;
  const stepRise = rise / stepCount;

  // Concrete entry pad at foot of stairs
  groundGrp.add(circBox(1.2, 0.12, flightWidth + 0.35, mats.concreteStep, flightStartLx - 0.5, 0.06, flightCenterLz, false));

  // Twin sloped reinforced concrete stringer beams
  const innerStringerZ = flightCenterLz - flightWidth / 2 + 0.08;
  const outerStringerZ = flightCenterLz + flightWidth / 2 - 0.08;
  [innerStringerZ, outerStringerZ].forEach((sz) => {
    groundGrp.add(
      circBeam(
        new THREE.Vector3(flightStartLx, 0.14, sz),
        new THREE.Vector3(flightEndLx, rise - 0.12, sz),
        0.16,
        0.26,
        mats.steelWhite
      )
    );
  });

  // Discrete stepped treads & dark anti-slip nosings
  for (let i = 0; i < stepCount; i++) {
    const sx = flightStartLx + (i + 0.5) * treadW;
    const stepTopY = (i + 1) * stepRise;
    const riserH = Math.min(stepRise + 0.14, stepTopY);
    groundGrp.add(
      circBox(treadW + 0.04, riserH, flightWidth - 0.18, mats.concreteStep, sx, stepTopY - riserH / 2, flightCenterLz)
    );
    groundGrp.add(
      circBox(0.06, 0.025, flightWidth - 0.2, mats.treadDark, sx - treadW * 0.35, stepTopY + 0.012, flightCenterLz, false)
    );
  }

  // Structural support piers beneath top of flight and intermediate span
  groundGrp.add(circBox(0.28, rise * 0.5, 0.28, mats.steelWhite, (flightStartLx + flightEndLx) / 2, rise * 0.25, outerStringerZ));
  groundGrp.add(circBox(0.28, rise * 0.5, 0.28, mats.steelWhite, (flightStartLx + flightEndLx) / 2, rise * 0.25, innerStringerZ));
  groundGrp.add(circBox(0.32, rise - 0.14, 0.32, mats.steelWhite, flightEndLx, (rise - 0.14) / 2, outerStringerZ));

  // Sloped white steel picket guardrail along outer stair edge
  const railZ = outerStringerZ + 0.02;
  const railHeight = 0.96;
  groundGrp.add(
    circBeam(
      new THREE.Vector3(flightStartLx, 0.25 + railHeight, railZ),
      new THREE.Vector3(flightEndLx, rise + railHeight, railZ),
      0.05,
      0.06,
      mats.steelWhite,
      false
    )
  );
  groundGrp.add(
    circBeam(
      new THREE.Vector3(flightStartLx, 0.38, railZ),
      new THREE.Vector3(flightEndLx, rise + 0.12, railZ),
      0.035,
      0.04,
      mats.steelWhite,
      false
    )
  );
  const stairPickets = 16;
  for (let p = 0; p <= stairPickets; p++) {
    const t = p / stairPickets;
    const px = flightStartLx + t * run;
    const py = 0.22 + t * (rise - 0.12);
    groundGrp.add(circBox(0.028, railHeight - 0.06, 0.028, mats.steelWhite, px, py + railHeight / 2, railZ, false));
  }

  // Ground plaza planter & 3D royal blue "UDD" sculptural sign beside stairs (from courtyard photo)
  const uddBaseLx = landingEndLx + 1.85;
  groundGrp.add(circBox(3.1, 0.42, 0.95, mats.planterStone, uddBaseLx, 0.21, 1.05));
  groundGrp.add(circBox(2.9, 0.24, 0.78, mats.foliageGreen, uddBaseLx, 0.52, 1.05));
  // Compact 3D "U D D" monumental letters atop planter plinth
  // 'U'
  const uLx = uddBaseLx - 0.88;
  groundGrp.add(circBox(0.18, 0.9, 0.2, mats.uddBlue, uLx - 0.22, 1.05, 1.05));
  groundGrp.add(circBox(0.18, 0.9, 0.2, mats.uddBlue, uLx + 0.22, 1.05, 1.05));
  groundGrp.add(circBox(0.62, 0.18, 0.2, mats.uddBlue, uLx, 0.68, 1.05));
  // First 'D'
  const d1Lx = uddBaseLx;
  groundGrp.add(circBox(0.18, 0.9, 0.2, mats.uddBlue, d1Lx - 0.2, 1.05, 1.05));
  groundGrp.add(circBox(0.45, 0.16, 0.2, mats.uddBlue, d1Lx, 1.42, 1.05));
  groundGrp.add(circBox(0.45, 0.16, 0.2, mats.uddBlue, d1Lx, 0.68, 1.05));
  groundGrp.add(circBox(0.16, 0.76, 0.2, mats.uddBlue, d1Lx + 0.2, 1.05, 1.05));
  // Second 'D'
  const d2Lx = uddBaseLx + 0.85;
  groundGrp.add(circBox(0.18, 0.9, 0.2, mats.uddBlue, d2Lx - 0.2, 1.05, 1.05));
  groundGrp.add(circBox(0.45, 0.16, 0.2, mats.uddBlue, d2Lx, 1.42, 1.05));
  groundGrp.add(circBox(0.45, 0.16, 0.2, mats.uddBlue, d2Lx, 0.68, 1.05));
  groundGrp.add(circBox(0.16, 0.76, 0.2, mats.uddBlue, d2Lx + 0.2, 1.05, 1.05));

  ground.add(groundGrp);

  // ── 2. 2F Covered Stair Landing Platform & Canopy Roof ────────────────────
  const landingGrp = new THREE.Group();
  landingGrp.position.set(seg1.cx, 0, seg1.cz);
  landingGrp.rotation.y = seg1.rotY;

  const landingW = landingEndLx - landingStartLx;
  const landingCx = (landingStartLx + landingEndLx) / 2;
  const landingFrontLz = landingDepth;
  const landingCz = landingDepth / 2 + 0.05;

  // Landing deck slab & blue soffit band matching 2F balcony
  landingGrp.add(circBox(landingW, 0.24, landingDepth, mats.steelWhite, landingCx, FH - 0.12, landingCz));
  landingGrp.add(circBox(landingW + 0.08, 0.1, landingDepth + 0.06, mats.roofNavyTrim, landingCx, FH - 0.24, landingCz, false));

  // Perimeter white picket railings on outer courtyard edge and right return
  addPicketRailing(landingGrp, landingStartLx, landingFrontLz, landingEndLx, landingFrontLz, FH, 1.0, mats);
  addPicketRailing(landingGrp, landingEndLx, 0.08, landingEndLx, landingFrontLz, FH, 1.0, mats);
  // Inner gap guard where stair narrows vs full landing
  addPicketRailing(landingGrp, landingStartLx, 0.08, landingStartLx, landingCenterZStart(flightCenterLz, flightWidth), FH, 1.0, mats);

  // Small rectangular white notice signboard mounted on the landing guardrail
  landingGrp.add(circBox(0.55, 0.72, 0.05, mats.steelWhite, landingStartLx + 0.55, FH + 0.85, landingFrontLz + 0.05, false));
  landingGrp.add(circBox(0.42, 0.14, 0.06, mats.uddBlue, landingStartLx + 0.55, FH + 1.08, landingFrontLz + 0.06, false));

  // Support posts and cantilevered flat canopy roof over 2F landing
  const canopyUndersideY = FH + 2.85;
  landingGrp.add(circBox(0.14, 2.85, 0.14, mats.steelWhite, landingStartLx + 0.12, FH + 1.425, landingFrontLz - 0.08));
  landingGrp.add(circBox(0.14, 2.85, 0.14, mats.steelWhite, landingEndLx - 0.12, FH + 1.425, landingFrontLz - 0.08));
  landingGrp.add(circBox(landingW + 0.45, 0.16, landingDepth + 0.35, mats.steelWhite, landingCx, canopyUndersideY + 0.08, landingCz + 0.08));
  landingGrp.add(circBox(landingW + 0.52, 0.08, landingDepth + 0.42, mats.roofNavyTrim, landingCx, canopyUndersideY + 0.18, landingCz + 0.08));

  floor2F.add(landingGrp);
}

function landingCenterZStart(flightCenterLz: number, flightWidth: number): number {
  return flightCenterLz - flightWidth / 2;
}

