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
  landingGrp.add(circBox(0.13, 2.85, 0.13, mats.steelWhite, landingStartLx + 0.12, FH + 1.425, landingFrontLz - 0.08));
  landingGrp.add(circBox(0.13, 2.85, 0.13, mats.steelWhite, landingEndLx - 0.12, FH + 1.425, landingFrontLz - 0.08));
  landingGrp.add(circBox(landingW + 0.45, 0.14, landingDepth + 0.35, mats.steelWhite, landingCx, canopyUndersideY + 0.07, landingCz + 0.08));
  landingGrp.add(circBox(landingW + 0.5, 0.05, landingDepth + 0.4, mats.steelSilver, landingCx, canopyUndersideY + 0.16, landingCz + 0.08));

  floor2F.add(landingGrp);
}

function landingCenterZStart(flightCenterLz: number, flightWidth: number): number {
  return flightCenterLz - flightWidth / 2;
}

/**
 * Adds one vertical tier (floorIndex 0..4 = 1F..5F) of V Building's slender
 * white-framed clear glass Elevator Tower along Seg 1 at the inner corner junction.
 */
export function addVBuildingGlassElevatorFloor(
  floorGroup: THREE.Group,
  floorIndex: number,
  seg1: VBuildingSegment,
  mats: VBuildingCirculationMaterials
): void {
  const { floorHeight: FH, elevator } = V_CIRC_LAYOUT;
  const { centerLx, width, depth, frontOffsetLz } = elevator;
  const baseY = floorIndex * FH;
  const midY = baseY + FH / 2;

  const backLz = frontOffsetLz;
  const frontLz = frontOffsetLz + depth;
  const centerLz = (backLz + frontLz) / 2;
  const halfW = width / 2;

  const grp = new THREE.Group();
  grp.position.set(seg1.cx, 0, seg1.cz);
  grp.rotation.y = seg1.rotY;

  // Ground foundation plinth vs corridor floor landing bridge slab
  if (floorIndex === 0) {
    grp.add(circBox(width + 0.3, 0.22, depth + 0.3, mats.concreteStep, centerLx, 0.11, centerLz));
    // Dark charcoal elevator pit sill at ground entry
    grp.add(circBox(width - 0.18, 0.08, depth - 0.18, mats.treadDark, centerLx, 0.24, centerLz, false));
  } else {
    // Structural bridge apron connecting corridor floor cleanly into elevator vestibule
    grp.add(circBox(width, 0.2, 0.65, mats.steelWhite, centerLx, baseY + 0.1, backLz + 0.25));
  }

  // 4 corner white steel square tube posts
  const corners: Array<[number, number]> = [
    [centerLx - halfW, backLz],
    [centerLx + halfW, backLz],
    [centerLx - halfW, frontLz],
    [centerLx + halfW, frontLz],
  ];
  corners.forEach(([cx, cz]) => {
    grp.add(circBox(0.13, FH, 0.13, mats.steelWhite, cx, midY, cz));
  });

  // Intermediate vertical curtain mullions splitting front & side faces into 2 clear bays each
  grp.add(circBox(0.08, FH, 0.08, mats.steelWhite, centerLx, midY, frontLz, false));
  grp.add(circBox(0.08, FH, 0.08, mats.steelWhite, centerLx - halfW, midY, centerLz, false));
  grp.add(circBox(0.08, FH, 0.08, mats.steelWhite, centerLx + halfW, midY, centerLz, false));

  // Horizontal white steel transom rings (floor line + mid-floor = 2 rows per floor)
  [baseY + 0.05, midY].forEach((ty) => {
    grp.add(circBox(width + 0.06, 0.1, 0.1, mats.steelWhite, centerLx, ty, frontLz, false));
    grp.add(circBox(0.1, 0.1, depth + 0.06, mats.steelWhite, centerLx - halfW, ty, centerLz, false));
    grp.add(circBox(0.1, 0.1, depth + 0.06, mats.steelWhite, centerLx + halfW, ty, centerLz, false));
  });

  // Transparent low-iron clear curtain glazing on front, left, and right walls
  grp.add(circBox(width - 0.12, FH - 0.14, 0.03, mats.clearGlass, centerLx, midY, frontLz - 0.01, false));
  grp.add(circBox(0.03, FH - 0.14, depth - 0.12, mats.clearGlass, centerLx - halfW + 0.01, midY, centerLz, false));
  grp.add(circBox(0.03, FH - 0.14, depth - 0.12, mats.clearGlass, centerLx + halfW - 0.01, midY, centerLz, false));

  // Corridor-side elevator lobby portal & brushed stainless landing doors
  grp.add(circBox(1.55, 2.35, 0.09, mats.steelSilver, centerLx, baseY + 1.25, backLz + 0.06, false));
  grp.add(circBox(0.04, 2.2, 0.11, mats.steelDark, centerLx, baseY + 1.2, backLz + 0.06, false)); // door seam
  grp.add(circBox(1.75, 0.18, 0.14, mats.steelWhite, centerLx, baseY + 2.48, backLz + 0.06, false));

  // Visible interior elevator guide rails, structural cross-braces & hoist cables
  [-0.86, 0.86].forEach((gx) => {
    grp.add(circBox(0.07, FH, 0.09, mats.steelDark, centerLx + gx, midY, centerLz + 0.05, false));
  });
  [-0.22, -0.08, 0.08, 0.22].forEach((cx) => {
    grp.add(
      circRod(
        new THREE.Vector3(centerLx + cx, baseY, centerLz - 0.45),
        new THREE.Vector3(centerLx + cx, baseY + FH, centerLz - 0.45),
        0.015,
        mats.steelDark
      )
    );
  });

  // Rear shaft ring beams at floor level
  grp.add(circBox(width - 0.16, 0.12, 0.14, mats.steelSilver, centerLx, baseY + 0.12, centerLz - 0.55, false));

  // Prominent panoramic glass-backed Elevator Cab inside mid-shaft (3F, floorIndex === 2)
  if (floorIndex === 2) {
    const cabBaseY = baseY + 0.45;
    const cabH = 2.45;
    const cabW = 1.48;
    const cabD = 1.48;
    // Sling platform & top crosshead beam
    grp.add(circBox(cabW + 0.12, 0.16, cabD + 0.1, mats.steelDark, centerLx, cabBaseY, centerLz + 0.05));
    grp.add(circBox(cabW + 0.16, 0.18, 0.22, mats.steelSilver, centerLx, cabBaseY + cabH + 0.12, centerLz + 0.05));
    // Illuminated warm ceiling diffuser inside cab
    grp.add(circBox(cabW - 0.14, 0.08, cabD - 0.14, mats.cabWarmLight, centerLx, cabBaseY + cabH - 0.02, centerLz + 0.05, false));
    // Cab corner stiles & scenic rear/side glass enclosure
    const cabCornerOffsets = [
      [-cabW / 2, -cabD / 2],
      [cabW / 2, -cabD / 2],
      [-cabW / 2, cabD / 2],
      [cabW / 2, cabD / 2],
    ];
    cabCornerOffsets.forEach(([ox, oz]) => {
      grp.add(circBox(0.08, cabH, 0.08, mats.steelSilver, centerLx + ox, cabBaseY + cabH / 2, centerLz + 0.05 + oz, false));
    });
    grp.add(circBox(cabW - 0.08, cabH - 0.12, 0.03, mats.skyTintGlass, centerLx, cabBaseY + cabH / 2, centerLz + 0.05 + cabD / 2, false));
    grp.add(circBox(0.03, cabH - 0.12, cabD - 0.08, mats.skyTintGlass, centerLx - cabW / 2, cabBaseY + cabH / 2, centerLz + 0.05, false));
    grp.add(circBox(0.03, cabH - 0.12, cabD - 0.08, mats.skyTintGlass, centerLx + cabW / 2, cabBaseY + cabH / 2, centerLz + 0.05, false));
    // Stainless interior handrail visible through glass
    grp.add(circBox(cabW - 0.16, 0.04, 0.04, mats.steelSilver, centerLx, cabBaseY + 1.0, centerLz + 0.05 + cabD / 2 - 0.08, false));
  }

  floorGroup.add(grp);
}

/**
 * Adds the overhanging flat white/navy machine-room cap atop V Building's Glass Elevator Tower.
 */
export function addVBuildingGlassElevatorRoof(
  roofGroup: THREE.Group,
  bldgTopY: number,
  seg1: VBuildingSegment,
  mats: VBuildingCirculationMaterials
): void {
  const { centerLx, width, depth, frontOffsetLz } = V_CIRC_LAYOUT.elevator;
  const centerLz = frontOffsetLz + depth / 2;

  const roofGrp = new THREE.Group();
  roofGrp.position.set(seg1.cx, 0, seg1.cz);
  roofGrp.rotation.y = seg1.rotY;

  roofGrp.add(circBox(width + 0.45, 0.24, depth + 0.45, mats.steelWhite, centerLx, bldgTopY + 0.12, centerLz));
  roofGrp.add(circBox(width + 0.52, 0.1, depth + 0.52, mats.roofNavyTrim, centerLx, bldgTopY + 0.27, centerLz));
  // Compact rooftop hoist motor housing
  roofGrp.add(circBox(width - 0.65, 0.55, depth - 0.65, mats.steelSilver, centerLx, bldgTopY + 0.55, centerLz));

  roofGroup.add(roofGrp);
}

/**
 * Returns local-X bounds of the Escalator Atrium along Seg 2 (East Wing)
 * plus its North/South landing opening intervals for walk-through corridor integration.
 */
export function getVBuildingEscalatorAtriumSeg2Bounds(seg2Len: number) {
  const { startS, endS } = V_CIRC_LAYOUT.atrium;
  const xStart = -seg2Len / 2 + startS;
  const xEnd = -seg2Len / 2 + endS;
  return {
    xStart,
    xEnd,
    northOpening: [xStart + 0.15, xStart + 1.85] as const,
    southOpening: [xEnd - 1.85, xEnd - 0.15] as const,
  };
}

/**
 * Adds a single inclined commercial escalator flight between two local X/Y points,
 * complete with inclined white steel box-truss undercarriage, horizontal comb-plate
 * aprons, stepped dark slate treads with brushed silver nosings, tempered glass
 * balustrades, and continuous dark elastomer handrails with newel heads.
 */
function addEscalatorFlight(
  parent: THREE.Object3D,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  centerZ: number,
  width: number,
  mats: VBuildingCirculationMaterials
): void {
  const dx = xEnd - xStart;
  const dy = yEnd - yStart;
  const dirSign = dx >= 0 ? 1 : -1;
  const stepCount = 14;
  const runW = Math.abs(dx) / stepCount;
  const stepRise = dy / stepCount;
  const sideOffset = width / 2 - 0.04;

  // Horizontal metallic comb-plate entry & exit aprons connecting seamlessly to landings
  parent.add(circBox(0.46, 0.08, width + 0.06, mats.steelSilver, xStart - dirSign * 0.14, yStart - 0.02, centerZ, false));
  parent.add(circBox(0.46, 0.08, width + 0.06, mats.steelSilver, xEnd + dirSign * 0.14, yEnd - 0.02, centerZ, false));

  // White structural inclined box-truss undercarriage beneath steps
  parent.add(
    circBeam(
      new THREE.Vector3(xStart, yStart - 0.34, centerZ),
      new THREE.Vector3(xEnd, yEnd - 0.34, centerZ),
      0.46,
      width + 0.04,
      mats.steelWhite,
      true
    )
  );
  // Subtle dark soffit strip underneath truss belly
  parent.add(
    circBeam(
      new THREE.Vector3(xStart + dirSign * 0.1, yStart - 0.54, centerZ),
      new THREE.Vector3(xEnd - dirSign * 0.1, yEnd - 0.54, centerZ),
      0.06,
      width - 0.08,
      mats.steelDark,
      false
    )
  );

  // Discrete level steps ascending smoothly along flight
  for (let i = 0; i < stepCount; i++) {
    const t = (i + 0.5) / stepCount;
    const sx = xStart + t * dx;
    const stepTopY = yStart + (i + 1) * stepRise;
    parent.add(
      circBox(runW + 0.04, stepRise + 0.04, width - 0.16, mats.treadDark, sx, stepTopY - stepRise * 0.45, centerZ, false)
    );
    parent.add(
      circBox(0.045, 0.024, width - 0.18, mats.steelSilver, sx - dirSign * runW * 0.34, stepTopY + 0.01, centerZ, false)
    );
  }

  // Twin side skirt guards, clear-sky glass balustrades & black elastomer moving handrails
  [-sideOffset, sideOffset].forEach((zo) => {
    const gz = centerZ + zo;
    parent.add(
      circBeam(
        new THREE.Vector3(xStart, yStart + 0.05, gz),
        new THREE.Vector3(xEnd, yEnd + 0.05, gz),
        0.18,
        0.06,
        mats.steelSilver,
        false
      )
    );
    parent.add(
      circBeam(
        new THREE.Vector3(xStart, yStart + 0.54, gz),
        new THREE.Vector3(xEnd, yEnd + 0.54, gz),
        0.82,
        0.03,
        mats.skyTintGlass,
        false
      )
    );
    parent.add(
      circBeam(
        new THREE.Vector3(xStart, yStart + 0.98, gz),
        new THREE.Vector3(xEnd, yEnd + 0.98, gz),
        0.075,
        0.08,
        mats.handrailBlack,
        false
      )
    );
    parent.add(circBox(0.42, 0.075, 0.085, mats.handrailBlack, xStart - dirSign * 0.18, yStart + 0.98, gz, false));
    parent.add(circBox(0.42, 0.075, 0.085, mats.handrailBlack, xEnd + dirSign * 0.18, yEnd + 0.98, gz, false));
    parent.add(circBox(0.12, 0.92, 0.05, mats.steelSilver, xStart - dirSign * 0.34, yStart + 0.5, gz, false));
    parent.add(circBox(0.12, 0.92, 0.05, mats.steelSilver, xEnd + dirSign * 0.34, yEnd + 0.5, gz, false));
  });
}

/**
 * Adds one tier (floorIndex 0..3 = 1F..4F) of V Building's projecting 4-storey
 * white-framed glass Escalator Atrium enclosure along Seg 2 (East Wing), including
 * ground entrance door/gate, 2F-4F bridge landing decks, picket guardrails,
 * diagonal structural knee braces, interior crisscross escalator flights, and the
 * 4F dark-blue overhanging roof canopy.
 */
export function addVBuildingEscalatorAtriumFloor(
  floorGroup: THREE.Group,
  floorIndex: number,
  seg2: VBuildingSegment,
  mats: VBuildingCirculationMaterials
): void {
  if (floorIndex < 0 || floorIndex > 3) return;

  const { floorHeight: FH, atrium } = V_CIRC_LAYOUT;
  const { startS, endS, baysLong, baysDeep, depth, backOffsetLz } = atrium;

  const atrLen = endS - startS;
  const centerLx = -seg2.len / 2 + (startS + endS) / 2;
  const x0 = centerLx - atrLen / 2;
  const x1 = centerLx + atrLen / 2;
  const zBack = backOffsetLz;
  const zFront = backOffsetLz + depth;
  const centerLz = (zBack + zFront) / 2;

  const baseY = floorIndex * FH;
  const midY = baseY + FH / 2;

  const grp = new THREE.Group();
  grp.position.set(seg2.cx, 0, seg2.cz);
  grp.rotation.y = seg2.rotY;

  // ── 1. Outer Steel Curtain Wall Grid (6 long bays x 2 end bays, 2 rows/floor) ─
  // Vertical mullions along courtyard-facing long wall (z = zFront)
  for (let b = 0; b <= baysLong; b++) {
    const mx = x0 + (b * atrLen) / baysLong;
    const isCorner = b === 0 || b === baysLong;
    grp.add(circBox(isCorner ? 0.14 : 0.085, FH, isCorner ? 0.14 : 0.085, mats.steelWhite, mx, midY, zFront));
  }
  // Vertical mullions along North (x0) & South (x1) end walls
  for (let d = 0; d < baysDeep; d++) {
    const mz = zBack + (d * depth) / baysDeep;
    const size = d === 0 ? 0.14 : 0.085;
    grp.add(circBox(size, FH, size, mats.steelWhite, x0, midY, mz));
    grp.add(circBox(size, FH, size, mats.steelWhite, x1, midY, mz));
  }

  // Horizontal white steel transoms (floor + mid-floor) on long wall and North end wall
  [baseY + 0.05, midY].forEach((ty) => {
    grp.add(circBox(atrLen + 0.08, 0.095, 0.1, mats.steelWhite, centerLx, ty, zFront, false));
    grp.add(circBox(0.1, 0.095, depth + 0.06, mats.steelWhite, x0, ty, centerLz, false));
    // South end transom: skip ground-floor base bar where the entrance doorway stands
    if (!(floorIndex === 0 && ty < 0.5)) {
      grp.add(circBox(0.1, 0.095, depth + 0.06, mats.steelWhite, x1, ty, centerLz, false));
    }
  });

  // Transparent low-iron curtain glazing on courtyard face and North end
  grp.add(circBox(atrLen - 0.12, FH - 0.12, 0.03, mats.clearGlass, centerLx, midY, zFront - 0.015, false));
  grp.add(circBox(0.03, FH - 0.12, depth - 0.12, mats.clearGlass, x0 + 0.015, midY, centerLz, false));

  // South End Face (closest to basketball court): ground-floor entrance door + upper glazing
  if (floorIndex === 0) {
    const midEndLz = zBack + depth / 2;
    const halfBay = depth / 2;
    // Outer bay: framed clear-glass swing entrance door + top transom
    const outerBayCz = (midEndLz + zFront) / 2;
    grp.add(circBox(0.08, 2.35, 0.08, mats.steelWhite, x1, 1.175, zFront - 0.08, false));
    grp.add(circBox(0.08, 2.35, 0.08, mats.steelWhite, x1, 1.175, midEndLz + 0.06, false));
    grp.add(circBox(0.1, 0.09, halfBay, mats.steelWhite, x1, 2.36, outerBayCz, false));
    grp.add(circBox(0.04, 2.18, halfBay - 0.22, mats.clearGlass, x1 - 0.01, 1.24, outerBayCz, false));
    // Stainless push bar & handle on door
    grp.add(circBox(0.11, 0.05, halfBay * 0.65, mats.steelSilver, x1 + 0.01, 1.05, outerBayCz, false));
    // Upper transom glazing above door
    grp.add(circBox(0.03, FH - 2.42, halfBay - 0.1, mats.clearGlass, x1 - 0.01, 2.38 + (FH - 2.42) / 2, outerBayCz, false));

    // Inner bay: open walkway pass-through with crisp white picket gate/railing & upper glazing
    const innerBayCz = (zBack + midEndLz) / 2;
    addPicketRailing(grp, x1, zBack + 0.12, x1, midEndLz - 0.08, 0.08, 1.05, mats, 0.2);
    grp.add(circBox(0.03, FH - 1.95, halfBay - 0.1, mats.clearGlass, x1 - 0.01, midY + 0.9, innerBayCz, false));
  } else {
    grp.add(circBox(0.03, FH - 0.12, depth - 0.12, mats.clearGlass, x1 - 0.015, midY, centerLz, false));
  }

  // ── 2. Floor Slab, Bridge Landings, Railings & Knee Braces ────────────────
  if (floorIndex === 0) {
    // Ground concrete plinth & dark charcoal tiled interior lobby floor
    grp.add(circBox(atrLen + 0.25, 0.18, depth + 0.25, mats.concreteStep, centerLx, 0.09, centerLz, false));
    grp.add(circBox(atrLen - 0.18, 0.06, depth - 0.18, mats.treadDark, centerLx, 0.19, centerLz, false));
    // Small exterior concrete threshold outside South entrance door
    grp.add(circBox(0.9, 0.12, depth, mats.concreteStep, x1 + 0.45, 0.06, centerLz, false));
  } else {
    // 2F, 3F, 4F North & South Landing Decks bridging into East Wing corridor
    const landingLen = 1.82;
    const southLandingCx = x1 - landingLen / 2 - 0.04;
    const northLandingCx = x0 + landingLen / 2 + 0.04;

    [
      { lx: southLandingCx, innerEdgeLx: x1 - landingLen - 0.04, endLx: x1 - 0.06 },
      { lx: northLandingCx, innerEdgeLx: x0 + landingLen + 0.04, endLx: x0 + 0.06 },
    ].forEach(({ lx, innerEdgeLx, endLx }) => {
      // Concrete deck slab extending flush from Seg 2 corridor edge (z = -0.1) out to glass face
      grp.add(circBox(landingLen, 0.22, depth + 0.1, mats.steelWhite, lx, baseY + 0.06, centerLz - 0.05));
      grp.add(circBox(landingLen - 0.04, 0.06, depth - 0.1, mats.roofNavyTrim, lx, baseY - 0.08, centerLz, false));

      // White vertical-picket guardrails along outer glass face & escalator well inner edge
      addPicketRailing(grp, endLx, zBack + 0.12, endLx, zFront - 0.12, baseY + 0.16, 1.0, mats);
      addPicketRailing(grp, innerEdgeLx, zBack + 0.12, innerEdgeLx, zBack + 0.65, baseY + 0.16, 1.0, mats);
      addPicketRailing(grp, innerEdgeLx, zFront - 0.65, innerEdgeLx, zFront - 0.12, baseY + 0.16, 1.0, mats);
    });
  }

  // Diagonal white steel structural knee braces placed within the supporting storey
  // beneath 2F, 3F, and 4F landings so exploded floor tiers separate cleanly
  if (floorIndex < 3) {
    const landingLen = 1.82;
    const southEndLx = x1 - 0.06;
    const southInnerEdgeLx = x1 - landingLen - 0.04;
    const northEndLx = x0 + 0.06;
    const northInnerEdgeLx = x0 + landingLen + 0.04;
    const braceTopY = baseY + FH - 0.08;
    const braceLowY = baseY + FH - 1.45;

    [
      { endLx: southEndLx, innerEdgeLx: southInnerEdgeLx },
      { endLx: northEndLx, innerEdgeLx: northInnerEdgeLx },
    ].forEach(({ endLx, innerEdgeLx }) => {
      grp.add(
        circBeam(
          new THREE.Vector3(endLx, braceLowY, zBack + 0.18),
          new THREE.Vector3(endLx, braceTopY, zFront - 0.18),
          0.09,
          0.09,
          mats.steelWhite,
          false
        )
      );
      grp.add(
        circBeam(
          new THREE.Vector3(innerEdgeLx, braceLowY + 0.1, zFront - 0.12),
          new THREE.Vector3(endLx, braceTopY, zFront - 0.12),
          0.085,
          0.085,
          mats.steelWhite,
          false
        )
      );
    });
  }

  // ── 2b. Interior Crisscross Escalator Flights (1F->2F, 2F->3F, 3F->4F) ─────
  if (floorIndex < 3) {
    const northInnerLx = x0 + 1.88;
    const southInnerLx = x1 - 1.88;
    const startElevY = floorIndex === 0 ? 0.22 : baseY + 0.17;
    const endElevY = (floorIndex + 1) * FH + 0.15;
    const innerLaneZ = zBack + 1.15;
    const outerLaneZ = zBack + 2.45;
    const laneWidth = 0.94;

    // Outer courtyard lane rises South -> North; inner corridor lane rises North -> South
    addEscalatorFlight(grp, southInnerLx, startElevY, northInnerLx, endElevY, outerLaneZ, laneWidth, mats);
    addEscalatorFlight(grp, northInnerLx, startElevY, southInnerLx, endElevY, innerLaneZ, laneWidth, mats);
  }

  // ── 3. Overhanging Dark-Blue Roof Canopy atop 4F (floorIndex === 3) ───────
  if (floorIndex === 3) {
    const roofY = baseY + FH;
    // White structural roof ceiling deck overhanging curtain mullions
    grp.add(circBox(atrLen + 0.45, 0.16, depth + 0.42, mats.steelWhite, centerLx, roofY + 0.08, centerLz + 0.04));
    // Prominent overhanging navy/royal-blue roof fascia & sloped upper cap
    grp.add(circBox(atrLen + 0.54, 0.18, depth + 0.5, mats.roofNavyTrim, centerLx, roofY + 0.24, centerLz + 0.04));
    const upperCap = circBox(atrLen + 0.46, 0.12, depth + 0.44, mats.roofNavyTrim, centerLx, roofY + 0.36, centerLz);
    upperCap.rotation.x = -0.04; // subtle pitch sloping away from East Wing
    grp.add(upperCap);
  }

  floorGroup.add(grp);
}

