// ─────────────────────────────────────────────────────────────────────────────
// fameModel.ts – Procedural 3D model of the UDD FAME Building
//
// Modelled from the reference photograph (public/campus-buildings/fame building.png):
//   • Left main mass clad in perforated aluminium mesh panels with three
//     light horizontal bands, each carrying a dark tapering wedge and a blue
//     right-pointing parallelogram ("arrow") motif.
//   • Plain white ACP panels along the ground floor.
//   • Cantilevered silver-panel top box that overhangs the whole building,
//     with a dark horizontal stripe, a dark wedge and a large blue diamond.
//   • Set-back beige concrete stair/office block on the right with ribbon
//     windows, jalousie windows and the circular Universidad de Dagupan seal.
//   • Covered entrance: dark metal canopy on steel columns, raised landing,
//     wide concrete stairs with blue handrails.
//   • Blue steel perimeter fence, lawn, sidewalk, road, utility pole and trees.
//
// Exploded view: floorGroups = [ground, 2F, 3F, 4F, cantilevered top box].
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { getCachedBoxGeometry, getCachedCylinderGeometry } from './geometryCache';
import { getMaterials, createEmblemTexture, type Building3DResult } from './proceduralModels';

// ── Palette (sampled from the photograph) ───────────────────────────────────
const C = {
  mesh: '#c3c8ce',
  meshDot: '#9aa1a9',
  band: '#dde1e6',
  seam: '#a9b0b8',
  darkWedge: '#5f656d',
  blue: '#1f62d1',
  blueDark: '#1748a8',
  whitePanel: '#e8ebee',
  silverTop: '#d4d9df',
  silverBottom: '#bec4cb',
};

// ── Canvas helpers ──────────────────────────────────────────────────────────
function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.anisotropy = 8;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function poly(ctx: CanvasRenderingContext2D, pts: Array<[number, number]>, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

function panelLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
  color: string,
  width = 2
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let c = 0; c <= cols; c++) {
    const xx = x + (w / cols) * c;
    ctx.moveTo(xx, y);
    ctx.lineTo(xx, y + h);
  }
  for (let r = 0; r <= rows; r++) {
    const yy = y + (h / rows) * r;
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
  }
  ctx.stroke();
}

/** Perforated aluminium mesh – staggered dot grid. */
function perforated(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.mesh;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.meshDot;
  let row = 0;
  for (let yy = y + 2; yy < y + h; yy += 6, row++) {
    for (let xx = x + 2 + (row % 2) * 3; xx < x + w; xx += 6) {
      ctx.fillRect(xx, yy, 2.4, 2.4);
    }
  }
}

// ── Facade textures ─────────────────────────────────────────────────────────
/** Upper floors of the main mass: mesh + light band with wedge & blue arrow. */
function createMeshFloorTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);
  perforated(ctx, 0, 0, W, H);

  // Light horizontal band
  ctx.fillStyle = C.band;
  ctx.fillRect(0, 44, W, 96);
  panelLines(ctx, 0, 44, W, 96, 12, 1, C.seam);

  // Dark tapering wedge coming in from the left
  poly(ctx, [[0, 72], [660, 88], [660, 96], [0, 120]], C.darkWedge);

  // Blue right-pointing parallelogram
  poly(ctx, [[640, 46], [770, 46], [1018, 138], [830, 138]], C.blue);
  poly(ctx, [[770, 46], [790, 46], [1024, 134], [1018, 138]], C.blueDark);

  // Vertical panel seams through the mesh
  panelLines(ctx, 0, 0, W, H, 12, 1, C.seam, 1);
  return toTexture(canvas);
}

/** Ground floor of the main mass: mesh above, plain white panels below. */
function createGroundFloorTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);
  perforated(ctx, 0, 0, W, 132);
  panelLines(ctx, 0, 0, W, 132, 12, 1, C.seam, 1);
  ctx.fillStyle = C.whitePanel;
  ctx.fillRect(0, 132, W, H - 132);
  panelLines(ctx, 0, 132, W, H - 132, 8, 1, '#b8bec5');
  return toTexture(canvas);
}

/** Front of the cantilevered top box: silver panels, stripe, wedge, blue diamond. */
function createTopBoxFrontTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 576;
  const { canvas, ctx } = makeCanvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.silverTop);
  g.addColorStop(1, C.silverBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  panelLines(ctx, 0, 0, W, H, 22, 5, '#99a1aa');

  // Dark horizontal stripe
  ctx.fillStyle = C.darkWedge;
  ctx.fillRect(0, 150, W, 40);

  // Dark wedge tapering to the right towards the diamond
  poly(ctx, [[0, 300], [1160, 248], [1160, 262], [0, 364]], C.darkWedge);

  // Large blue diamond / parallelogram
  poly(ctx, [[860, 240], [1120, 240], [1560, 540], [1220, 520]], C.blue);
  poly(ctx, [[1120, 240], [1150, 240], [1592, 540], [1560, 540]], C.blueDark);

  // Dark soffit edge on the lower right
  poly(ctx, [[1540, 512], [W, 498], [W, H], [1580, H]], '#4b5158');
  return toTexture(canvas);
}

/** Side faces of the top box (stripe continues along the extended 300% length). */
function createTopBoxSideTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.silverTop);
  g.addColorStop(1, C.silverBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  panelLines(ctx, 0, 0, W, H, 30, 5, '#99a1aa');
  ctx.fillStyle = C.darkWedge;
  ctx.fillRect(0, 133, W, 36);
  ctx.fillStyle = '#4b5158';
  ctx.fillRect(0, H - 40, W, 40);
  return toTexture(canvas);
}

/** Generic light ACP panel grid for rear faces. */
function createPanelGridTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 256);
  ctx.fillStyle = '#d3d8dd';
  ctx.fillRect(0, 0, 512, 256);
  panelLines(ctx, 0, 0, 512, 256, 6, 2, '#a7aeb6');
  return toTexture(canvas);
}

/** Light ACP panel grid for extended long side faces. */
function createSidePanelGridTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(1024, 256);
  ctx.fillStyle = '#d3d8dd';
  ctx.fillRect(0, 0, 1024, 256);
  panelLines(ctx, 0, 0, 1024, 256, 18, 2, '#a7aeb6');
  return toTexture(canvas);
}

/** Dark jalousie (louvre) window strip. */
function createJalousieTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 96);
  ctx.fillStyle = '#1f2933';
  ctx.fillRect(0, 0, 512, 96);
  ctx.fillStyle = '#5b6773';
  for (let y = 6; y < 96; y += 12) ctx.fillRect(0, y, 512, 4);
  ctx.fillStyle = '#d9cbb5';
  for (let x = 0; x <= 512; x += 64) ctx.fillRect(x - 3, 0, 6, 96);
  return toTexture(canvas);
}

/**
 * Architectural floor-plan blueprint texture for each FAME Building level (1F–5F),
 * matching the official FAME 3rd Floor Evacuation & Room Layout Plan:
 *   • F{n}01 (front-left/center lecture room)
 *   • FACULTY OFFICE (behind F{n}01 on left)
 *   • CE LABORATORY (middle-left engineering lab)
 *   • F{n}02 (center lecture room)
 *   • F{n}03 (upper-middle left lecture room)
 *   • ECE/ EE/CPE LAB. (rear-left laboratory)
 *   • F{n}04 (rear-right large lecture room with central column)
 *   • Front & Middle CRs (Comfort Rooms) and Front & Rear Stairwells
 *   • Red emergency evacuation arrows, First Aid Kit, Fire Alarm & Fire Extinguisher symbols
 */
function createFameFloorPlanTexture(floorNum: number): THREE.CanvasTexture {
  const W = 1200;
  const H = 1800;
  const { canvas, ctx } = makeCanvas(W, H);

  // World bounds mapped to canvas: X in [-10.0, 13.7] -> [0, W], Z in [-30.0, 6.0] -> [0, H]
  const xMin = -10.0;
  const xMax = 13.7;
  const zMin = -30.0;
  const zMax = 6.0;
  const toU = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const toV = (z: number) => ((z - zMin) / (zMax - zMin)) * H;
  const rectUV = (x0: number, z0: number, x1: number, z1: number) => {
    const u0 = toU(Math.min(x0, x1));
    const v0 = toV(Math.min(z0, z1));
    const u1 = toU(Math.max(x0, x1));
    const v1 = toV(Math.max(z0, z1));
    return { x: u0, y: v0, w: u1 - u0, h: v1 - v0 };
  };

  // Base architectural blueprint paper / light tile background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);

  // Subtle architectural tile grid
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = 0; gx <= W; gx += 30) {
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H);
  }
  for (let gy = 0; gy <= H; gy += 30) {
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
  }
  ctx.stroke();

  // Room zone fills
  const fillZone = (x0: number, z0: number, x1: number, z1: number, color: string) => {
    const r = rectUV(x0, z0, x1, z1);
    ctx.fillStyle = color;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  };

  // Corridors / circulation spine (warm ivory)
  fillZone(-10.0, -30.0, 13.7, 6.0, '#f1f5f9');
  // Classrooms F{n}01..F{n}04 (soft sky-tinted white)
  fillZone(-9.8, -0.5, 6.0, 5.8, '#e0f2fe');
  fillZone(-9.8, -4.2, -6.8, -0.5, '#e0f2fe');
  fillZone(-6.8, -16.0, 6.4, -10.2, '#e0f2fe');
  fillZone(-9.8, -22.8, -0.2, -16.0, '#e0f2fe');
  fillZone(-0.2, -29.8, 13.5, -22.8, '#e0f2fe');
  // Laboratories (CE Lab & ECE/EE/CPE Lab — soft cyan-mint)
  fillZone(-6.8, -10.2, 3.2, -4.2, '#ccfbf1');
  fillZone(-9.8, -29.8, -3.2, -22.8, '#ccfbf1');
  // Faculty Office (warm amber-cream)
  fillZone(-6.8, -4.2, 1.6, -0.5, '#fef3c7');
  // Comfort Rooms (CR — soft lavender-slate)
  fillZone(8.6, -4.8, 13.5, 0.0, '#ede9fe');
  fillZone(9.2, -17.6, 13.5, -15.2, '#ede9fe');
  // Stairwells (soft slate)
  fillZone(8.6, 0.0, 13.5, 4.4, '#e2e8f0');
  fillZone(6.8, -22.8, 13.5, -17.6, '#e2e8f0');

  // Draw stair treads in both stairwells
  const drawStairLines = (x0: number, z0: number, x1: number, z1: number, treads: number) => {
    const r = rectUV(x0, z0, x1, z1);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    const stepW = r.w / treads;
    for (let i = 1; i < treads; i++) {
      ctx.beginPath();
      ctx.moveTo(r.x + i * stepW, r.y);
      ctx.lineTo(r.x + i * stepW, r.y + r.h);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h / 2);
    ctx.lineTo(r.x + r.w, r.y + r.h / 2);
    ctx.stroke();
  };
  drawStairLines(8.8, 0.2, 13.3, 4.2, 9);
  drawStairLines(7.0, -22.5, 13.3, -17.8, 10);

  // Draw red evacuation arrows matching the photo
  const drawRedArrow = (xA: number, zA: number, xB: number, zB: number) => {
    const uA = toU(xA);
    const vA = toV(zA);
    const uB = toU(xB);
    const vB = toV(zB);
    const ang = Math.atan2(vB - vA, uB - uA);
    const headLen = 18;
    ctx.strokeStyle = '#be123c';
    ctx.fillStyle = '#be123c';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(uA, vA);
    ctx.lineTo(uB, vB);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(uB, vB);
    ctx.lineTo(uB - headLen * Math.cos(ang - 0.42), vB - headLen * Math.sin(ang - 0.42));
    ctx.lineTo(uB - headLen * Math.cos(ang + 0.42), vB - headLen * Math.sin(ang + 0.42));
    ctx.closePath();
    ctx.fill();
  };

  // Evacuation arrows from rooms through corridors to Front & Rear Stairs
  drawRedArrow(-6.6, -28.0, -6.6, -25.2);
  drawRedArrow(-5.8, -24.8, -1.8, -24.8);
  drawRedArrow(-1.6, -28.2, -1.6, -23.5);
  drawRedArrow(8.0, -28.5, 3.0, -28.5);
  drawRedArrow(2.0, -26.0, 2.0, -22.2);
  drawRedArrow(5.5, -24.5, 2.5, -24.5);
  drawRedArrow(1.5, -21.2, 6.2, -21.2);
  drawRedArrow(-3.5, -17.2, 0.5, -17.2);
  drawRedArrow(-3.5, -21.2, 0.5, -21.2);
  drawRedArrow(3.2, -19.5, 3.2, -16.8);
  drawRedArrow(-1.5, -13.0, 2.8, -13.0);
  drawRedArrow(4.8, -13.5, 4.8, -15.8);
  drawRedArrow(4.8, -12.0, 4.8, -9.8);
  drawRedArrow(-1.0, -8.6, 3.5, -8.6);
  drawRedArrow(4.8, -8.6, 4.8, -3.2);
  drawRedArrow(-2.0, -2.3, 4.2, -2.3);
  drawRedArrow(4.5, -2.3, 7.2, -2.3);
  drawRedArrow(-5.5, 2.2, -1.5, 2.2);
  drawRedArrow(-0.8, 3.2, -0.8, -0.2);
  drawRedArrow(1.0, 2.2, 4.2, 2.2);
  drawRedArrow(4.6, 3.2, 4.6, -0.2);
  drawRedArrow(7.4, -1.5, 7.4, 2.2);

  // Room text labels (sharp, high-contrast architectural typography)
  const drawRoomLabel = (text: string, x: number, z: number, fontSize = 36, subText?: string) => {
    const u = toU(x);
    const v = toV(z);
    ctx.save();
    ctx.font = `900 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.strokeText(text, u, v);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(text, u, v);
    if (subText) {
      ctx.font = `800 ${Math.round(fontSize * 0.62)}px Inter, Arial, sans-serif`;
      ctx.strokeText(subText, u, v + fontSize * 0.95);
      ctx.fillStyle = '#1e3a8a';
      ctx.fillText(subText, u, v + fontSize * 0.95);
    }
    ctx.restore();
  };

  drawRoomLabel(`F${floorNum}01`, -1.8, 3.2, 46);
  drawRoomLabel('FACULTY OFFICE', -2.4, -2.3, 25);
  drawRoomLabel('CE', -2.2, -7.2, 30, 'LABORATORY');
  drawRoomLabel(`F${floorNum}02`, -0.8, -13.1, 44);
  drawRoomLabel(`F${floorNum}03`, -4.8, -19.2, 44);
  drawRoomLabel('ECE/ EE/CPE', -6.5, -26.5, 23, 'LAB.');
  drawRoomLabel(`F${floorNum}04`, 6.5, -26.2, 46);
  drawRoomLabel('CR', 11.0, -2.4, 34, '2.50 × 4.09m');
  drawRoomLabel('CR', 11.2, -16.4, 28);
  drawRoomLabel('STAIRS', 11.0, 2.2, 24);
  drawRoomLabel('STAIRS', 10.1, -20.2, 26);

  return toTexture(canvas);
}

// ── Geometry helpers ────────────────────────────────────────────────────────
function box(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material | THREE.Material[],
  x: number,
  y: number,
  z: number,
  shadow = true
): THREE.Mesh {
  const m = new THREE.Mesh(getCachedBoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

/** Cylinder spanning two points (rails, struts). */
function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(getCachedCylinderGeometry(r, r, len, 10), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true;
  return m;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDING: UDD FAME Building
// ─────────────────────────────────────────────────────────────────────────────
export function buildFameBuilding3D(): Building3DResult {
  const root = new THREE.Group();
  root.name = 'UDD_FAME_Building_Root';
  const mats = getMaterials();
  const floorGroups: THREE.Group[] = [];

  // Layout (units ≈ metres)
  const FH = 3.6; // floor height
  const mainX0 = -10;
  const mainX1 = 6;
  const mainW = mainX1 - mainX0; // 16
  const mainCx = (mainX0 + mainX1) / 2;
  const depth = 36; // 300% length (extended 3x from 12m to 36m)
  const frontZ = 6;
  const backZ = frontZ - depth; // -30
  const mainCz = (frontZ + backZ) / 2; // -12

  const beigeX0 = 6;
  const beigeX1 = 13.7; // +10% width increase (7.0m -> 7.7m)
  const beigeW = beigeX1 - beigeX0; // 7.7
  const beigeCx = (beigeX0 + beigeX1) / 2; // 9.85
  const beigeFrontZ = 4.5;
  const beigeD = beigeFrontZ - backZ; // 34.5
  const beigeCz = (beigeFrontZ + backZ) / 2; // -12.75

  // Materials
  const sideMat = new THREE.MeshStandardMaterial({ map: createSidePanelGridTexture(), roughness: 0.4, metalness: 0.35 });
  const backMat = new THREE.MeshStandardMaterial({ map: createPanelGridTexture(), roughness: 0.4, metalness: 0.35 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x9aa1a9, roughness: 0.8 });
  const meshFrontMat = new THREE.MeshStandardMaterial({ map: createMeshFloorTexture(), roughness: 0.45, metalness: 0.3 });
  const groundFrontMat = new THREE.MeshStandardMaterial({ map: createGroundFloorTexture(), roughness: 0.45, metalness: 0.25 });
  const beige = new THREE.MeshStandardMaterial({ color: 0xd9cbb5, roughness: 0.85 });
  const darkGlass = new THREE.MeshStandardMaterial({ color: 0x1f2933, roughness: 0.15, metalness: 0.6 });
  const jalousieMat = new THREE.MeshStandardMaterial({ map: createJalousieTexture(), roughness: 0.5 });
  const fenceBlue = new THREE.MeshStandardMaterial({ color: 0x1d5fbf, roughness: 0.45, metalness: 0.4 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0x9ea3a8, roughness: 0.9 });
  const stairMat = new THREE.MeshStandardMaterial({ color: 0x8b9096, roughness: 0.85 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2f353c, roughness: 0.6, metalness: 0.5 });
  const lawn = new THREE.MeshStandardMaterial({ color: 0x4f8a3c, roughness: 1 });
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x3b3f45, roughness: 0.95 });
  const trunk = new THREE.MeshStandardMaterial({ color: 0x6b4f35, roughness: 0.9 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x3f7d34, roughness: 0.9 });
  const whiteLine = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });

  // Interior floor-plan materials (shared across all 5 FAME floors)
  const intWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.65 });
  const intWallCapMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.45 });
  const colMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.55 });
  const doorWoodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 });
  const deskTopMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
  const labBenchMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.45 });
  const fireRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0x991b1b,
    emissiveIntensity: 0.25,
    roughness: 0.35,
  });
  const firstAidGreenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });

  /**
   * Builds the open-top exterior facade perimeter shell AND the full 3D interior floor plan
   * (matching the uploaded FAME 3rd Floor architectural layout: F{n}01–F{n}04, FACULTY OFFICE,
   * CE LABORATORY, ECE/EE/CPE LAB., Front & Middle CRs, Front & Middle-Right U-turn staircases,
   * structural columns, classroom/lab furniture, First Aid Kits, Fire Alarms & Fire Extinguishers).
   */
  const addFameFloorShellAndInterior = (
    grp: THREE.Group,
    floorNum: number,
    baseY: number,
    shellH: number,
    isCantileveredTop = false
  ) => {
    const wallT = 0.32;
    const slabH = 0.24;
    const partH = Math.min(2.35, shellH - 0.45);
    const partY = baseY + slabH + partH / 2;
    const capY = baseY + slabH + partH + 0.03;

    // 1. Structural floor slab + high-resolution 3D floor-plan blueprint plate
    if (isCantileveredTop) {
      const topX0 = mainX0 - 0.3;
      const topX1 = beigeX1 + 1.2;
      const topFrontZ = frontZ + 0.6;
      const topBackZ = backZ - 0.6;
      const topW = topX1 - topX0;
      const topD = topFrontZ - topBackZ;
      const topCx = (topX0 + topX1) / 2;
      const topCz = (topFrontZ + topBackZ) / 2;
      const soffit = new THREE.MeshStandardMaterial({ color: 0x4b5158, roughness: 0.6 });
      grp.add(box(topW, slabH, topD, [soffit, soffit, roofMat, soffit, soffit, soffit], topCx, baseY + slabH / 2, topCz));
    } else {
      grp.add(box(mainW, slabH, depth, roofMat, mainCx, baseY + slabH / 2, mainCz));
      grp.add(box(beigeW, slabH, beigeD, roofMat, beigeCx, baseY + slabH / 2, beigeCz));
    }

    const planTex = createFameFloorPlanTexture(floorNum);
    const planMat = new THREE.MeshStandardMaterial({ map: planTex, roughness: 0.55 });
    const fullW = beigeX1 - mainX0 - 0.36; // 23.34m
    const fullD = frontZ - backZ - 0.36; // 35.64m
    const fullCx = (mainX0 + beigeX1) / 2;
    const fullCz = (frontZ + backZ) / 2;
    grp.add(box(fullW, 0.04, fullD, [roofMat, roofMat, planMat, roofMat, roofMat, roofMat], fullCx, baseY + slabH + 0.02, fullCz, false));

    // 2. Open-top exterior perimeter facade walls (preserves exact exterior look while open from above)
    if (isCantileveredTop) {
      const topX0 = mainX0 - 0.3;
      const topX1 = beigeX1 + 1.2;
      const topFrontZ = frontZ + 0.6;
      const topBackZ = backZ - 0.6;
      const topW = topX1 - topX0;
      const topD = topFrontZ - topBackZ;
      const topCx = (topX0 + topX1) / 2;
      const topCz = (topFrontZ + topBackZ) / 2;
      const topSide = new THREE.MeshStandardMaterial({ map: createTopBoxSideTexture(), roughness: 0.35, metalness: 0.4 });
      const topFront = new THREE.MeshStandardMaterial({ map: createTopBoxFrontTexture(), roughness: 0.35, metalness: 0.4 });
      const topBack = new THREE.MeshStandardMaterial({ map: createSidePanelGridTexture(), roughness: 0.4, metalness: 0.35 });
      const wCy = baseY + shellH / 2;

      // Front wall (+Z)
      grp.add(box(topW, shellH, wallT, [topSide, topSide, mats.metalSilver, roofMat, topFront, intWallMat], topCx, wCy, topFrontZ - wallT / 2));
      // Back wall (-Z)
      grp.add(box(topW, shellH, wallT, [topSide, topSide, mats.metalSilver, roofMat, intWallMat, topBack], topCx, wCy, topBackZ + wallT / 2));
      // Left wall (-X)
      grp.add(box(wallT, shellH, topD - wallT * 2, [intWallMat, topSide, mats.metalSilver, roofMat, topSide, topSide], topX0 + wallT / 2, wCy, topCz));
      // Right wall (+X)
      grp.add(box(wallT, shellH, topD - wallT * 2, [topSide, intWallMat, mats.metalSilver, roofMat, topSide, topSide], topX1 - wallT / 2, wCy, topCz));
    } else {
      const frontMat = floorNum === 1 ? groundFrontMat : meshFrontMat;
      const wCy = baseY + shellH / 2;

      // Main block front wall (+Z, X: -10..6)
      grp.add(box(mainW, shellH, wallT, [sideMat, sideMat, roofMat, roofMat, frontMat, intWallMat], mainCx, wCy, frontZ - wallT / 2));
      // Main block left wall (-X, Z: -30..6)
      grp.add(box(wallT, shellH, depth - wallT * 2, [intWallMat, sideMat, roofMat, roofMat, sideMat, sideMat], mainX0 + wallT / 2, wCy, mainCz));
      // Main block rear wall (-Z, X: -10..6)
      grp.add(box(mainW, shellH, wallT, [sideMat, sideMat, roofMat, roofMat, intWallMat, backMat], mainCx, wCy, backZ + wallT / 2));
      // Step-back cheek wall at X = 6 between Z = 4.5 and Z = 6.0
      grp.add(box(wallT, shellH, frontZ - beigeFrontZ + wallT, [sideMat, intWallMat, roofMat, roofMat, sideMat, beige], mainX1 - wallT / 2, wCy, (frontZ + beigeFrontZ) / 2));
      // Beige block front wall (+Z, X: 6..13.7)
      grp.add(box(beigeW, shellH, wallT, [beige, beige, roofMat, roofMat, beige, intWallMat], beigeCx, wCy, beigeFrontZ - wallT / 2));
      // Beige block right wall (+X, Z: -30..4.5)
      grp.add(box(wallT, shellH, beigeD - wallT * 2, [beige, intWallMat, roofMat, roofMat, beige, beige], beigeX1 - wallT / 2, wCy, beigeCz));
      // Beige block rear wall (-Z, X: 6..13.7)
      grp.add(box(beigeW, shellH, wallT, [beige, beige, roofMat, roofMat, intWallMat, backMat], beigeCx, wCy, backZ + wallT / 2));
    }

    // 3. Helper to build an interior partition wall segment with blue blueprint top cap
    const addPartitionX = (x0: number, x1: number, z: number, doorGapX?: number, doorW = 1.15) => {
      const t = 0.18;
      if (doorGapX === undefined) {
        const len = Math.abs(x1 - x0);
        const cx = (x0 + x1) / 2;
        grp.add(box(len, partH, t, intWallMat, cx, partY, z));
        grp.add(box(len, 0.06, t + 0.03, intWallCapMat, cx, capY, z, false));
      } else {
        const minX = Math.min(x0, x1);
        const maxX = Math.max(x0, x1);
        const g0 = doorGapX - doorW / 2;
        const g1 = doorGapX + doorW / 2;
        if (g0 > minX + 0.1) {
          addPartitionX(minX, g0, z);
        }
        if (maxX > g1 + 0.1) {
          addPartitionX(g1, maxX, z);
        }
        // Angled open wooden door leaf showing doorway swing
        const doorLeaf = box(doorW * 0.85, partH * 0.86, 0.06, doorWoodMat, g0 + (doorW * 0.85) / 2, baseY + slabH + (partH * 0.86) / 2, z - 0.32);
        doorLeaf.rotation.y = 0.55;
        grp.add(doorLeaf);
      }
    };

    const addPartitionZ = (x: number, z0: number, z1: number, doorGapZ?: number, doorW = 1.15) => {
      const t = 0.18;
      if (doorGapZ === undefined) {
        const len = Math.abs(z1 - z0);
        const cz = (z0 + z1) / 2;
        grp.add(box(t, partH, len, intWallMat, x, partY, cz));
        grp.add(box(t + 0.03, 0.06, len, intWallCapMat, x, capY, cz, false));
      } else {
        const minZ = Math.min(z0, z1);
        const maxZ = Math.max(z0, z1);
        const g0 = doorGapZ - doorW / 2;
        const g1 = doorGapZ + doorW / 2;
        if (g0 > minZ + 0.1) {
          addPartitionZ(x, minZ, g0);
        }
        if (maxZ > g1 + 0.1) {
          addPartitionZ(x, g1, maxZ);
        }
        // Angled open wooden door leaf
        const doorLeaf = box(0.06, partH * 0.86, doorW * 0.85, doorWoodMat, x - 0.32, baseY + slabH + (partH * 0.86) / 2, g0 + (doorW * 0.85) / 2);
        doorLeaf.rotation.y = -0.55;
        grp.add(doorLeaf);
      }
    };

    // ── Interior Room Partitions (Exact FAME 3rd Floor Plan Layout) ──────────
    // A. Room F{n}01 & Left Wing (Z: -0.5 to +5.7, X: -9.7 to +6.0)
    addPartitionX(-9.7, -6.8, -4.2, -8.25); // Left wing exit door
    addPartitionZ(-6.8, -4.2, -0.5); // Wall between F{n}01 left pocket and Faculty Office
    addPartitionX(-6.8, 1.6, -0.5, -0.8); // F{n}01 north wall left half (door at x=-0.8)
    addPartitionX(1.6, 6.0, -0.5, 4.6); // F{n}01 north wall right half (door at x=4.6)
    addPartitionZ(6.0, -0.5, 5.7); // F{n}01 east wall separating front corridor

    // B. FACULTY OFFICE (X: -6.8 to +1.6, Z: -4.2 to -0.5)
    addPartitionX(-6.8, 1.6, -4.2); // North wall shared with CE Lab
    addPartitionZ(-3.4, -4.2, -0.5, -2.3, 0.95); // Internal sub-office partition
    addPartitionZ(1.6, -4.2, -0.5, -2.3); // East wall with office entrance door

    // C. Front Stairwell & Front Comfort Room (CR 2.50 × 4.09m) on Right (+X: 8.6..13.4)
    addPartitionX(8.6, 13.4, 0.0); // Divider wall between Front Stairs and Front CR
    addPartitionZ(8.6, -4.8, 0.0, -1.1); // Front CR west wall with entrance door
    addPartitionX(8.6, 13.4, -4.8); // Front CR north wall
    // Interior T-shaped toilet cubicles inside Front CR
    addPartitionX(9.8, 13.4, -2.5, 11.2, 1.4);
    addPartitionZ(11.4, -4.8, -2.5);

    // D. CE LABORATORY (X: -6.8 to +3.2, Z: -10.2 to -4.2)
    addPartitionZ(-6.8, -10.2, -4.2); // West wall
    addPartitionX(-6.8, 3.2, -10.2); // North wall shared with F{n}02
    addPartitionZ(3.2, -10.2, -4.2, -8.5); // East wall with lab door into inner corridor
    addPartitionZ(6.4, -10.2, -4.2); // Inner corridor east wall

    // E. Room F{n}02 (X: -6.8 to +6.4, Z: -16.0 to -10.2)
    addPartitionZ(-6.8, -16.0, -10.2); // West wall
    addPartitionX(3.2, 6.4, -10.2, 4.8); // South-east door into F{n}02
    addPartitionZ(6.4, -16.0, -10.2); // East wall along main right corridor
    addPartitionX(-6.8, 6.4, -16.0, 4.8); // North wall with pass-through door at x=4.8

    // F. Room F{n}03 (X: -9.7 to -0.2, Z: -22.8 to -16.0)
    addPartitionX(-9.7, -6.8, -16.0, -8.3); // Bottom-left balcony exit door
    addPartitionZ(-0.2, -19.4, -16.0, -17.3); // East wall lower door
    addPartitionZ(-0.2, -22.8, -19.4, -21.3); // East wall upper door
    addPartitionX(-9.7, -0.2, -22.8); // North wall

    // G. Middle Comfort Room (CR) & Rear/Middle Double Staircase (X: 6.8..13.4, Z: -22.8..-15.2)
    addPartitionX(9.2, 13.4, -15.2); // Middle CR south wall
    addPartitionZ(9.2, -17.6, -15.2, -16.4, 0.95); // Middle CR west wall with door
    addPartitionX(6.8, 13.4, -17.6); // South wall of Rear Stairwell
    addPartitionX(6.8, 13.4, -22.8); // North wall of Rear Stairwell
    addPartitionZ(6.8, -21.2, -17.6); // Stairwell west half-wall

    // H. ECE/ EE/CPE LAB. (Rear-Left, X: -9.7 to -3.2, Z: -29.7 to -22.8)
    addPartitionX(-9.7, -3.2, -24.2); // Buffer vestibule divider
    addPartitionZ(-3.2, -29.7, -22.8, -25.0); // East wall with lab entrance door

    // I. Room F{n}04 (Rear-Right, X: -0.2 to +13.4, Z: -29.7 to -22.8)
    addPartitionZ(-0.2, -29.7, -22.8, -28.6); // West wall with upper corridor door
    addPartitionX(-0.2, 6.8, -22.8, 2.1); // South wall with lower lobby door

    // 4. Square Structural Columns (matching the square column boxes in the floor plan)
    const columnCoords: Array<[number, number]> = [
      [-9.5, 5.5], [-4.5, 5.5], [0.5, 5.5], [5.8, 5.5],
      [-6.8, -0.5], [-1.8, -0.5], [1.6, -0.5], [6.0, -0.5],
      [-6.8, -4.2], [1.6, -4.2], [6.4, -4.2],
      [-6.8, -10.2], [-1.5, -10.2], [3.2, -10.2], [6.4, -10.2],
      [-6.8, -16.0], [-0.2, -16.0], [6.4, -16.0],
      [-9.5, -22.8], [-3.2, -22.8], [-0.2, -22.8], [6.8, -22.8],
      [5.5, -26.2], // Signature freestanding central column inside F{n}04!
      [-9.5, -29.5], [-3.2, -29.5], [-0.2, -29.5], [6.5, -29.5], [13.2, -29.5],
    ];
    columnCoords.forEach(([cx, cz]) => {
      grp.add(box(0.52, partH + 0.08, 0.52, colMat, cx, partY + 0.04, cz));
    });

    // 5. 3D Interior U-Turn Staircases (Front Stairwell & Middle-Right Double Stairwell)
    const buildInteriorStairwell = (sx0: number, sx1: number, sz0: number, sz1: number) => {
      const stepsCount = 7;
      const flightW = (sz1 - sz0 - 0.3) / 2;
      const landingDepth = 1.1;
      const runLen = (sx1 - sx0 - landingDepth) / stepsCount;
      const maxRise = partH * 0.85;
      for (let s = 0; s < stepsCount; s++) {
        const h1 = ((s + 1) / stepsCount) * (maxRise * 0.5);
        const h2 = maxRise * 0.5 + ((stepsCount - s) / stepsCount) * (maxRise * 0.5);
        const sx = sx0 + s * runLen + runLen / 2;
        // Lower flight
        grp.add(box(runLen - 0.03, h1, flightW, stairMat, sx, baseY + slabH + h1 / 2, sz0 + flightW / 2));
        // Upper return flight
        grp.add(box(runLen - 0.03, h2, flightW, stairMat, sx, baseY + slabH + h2 / 2, sz1 - flightW / 2));
      }
      // Mid-landing along right wall (+X)
      const landH = maxRise * 0.52;
      grp.add(box(landingDepth, landH, sz1 - sz0, stairMat, sx1 - landingDepth / 2, baseY + slabH + landH / 2, (sz0 + sz1) / 2));
      // Center handrail divider
      grp.add(box(sx1 - sx0 - landingDepth, 0.85, 0.08, fenceBlue, sx0 + (sx1 - sx0 - landingDepth) / 2, baseY + slabH + landH + 0.42, (sz0 + sz1) / 2));
    };
    buildInteriorStairwell(8.8, 13.3, 0.2, 4.2);
    buildInteriorStairwell(7.0, 13.3, -22.6, -17.8);

    // 6. Classroom Desks & Laboratory Workbenches (for realistic 3D floor-plan depth)
    const addDeskGrid = (x0: number, x1: number, z0: number, z1: number, rows: number, cols: number, mat: THREE.Material) => {
      const dx = (x1 - x0) / cols;
      const dz = (z1 - z0) / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          grp.add(box(dx * 0.65, 0.55, dz * 0.52, mat, x0 + (c + 0.5) * dx, baseY + slabH + 0.28, z0 + (r + 0.5) * dz));
        }
      }
    };
    // F{n}01 desks
    addDeskGrid(-5.8, 4.8, 0.6, 4.8, 2, 4, deskTopMat);
    // CE Lab workbenches
    addDeskGrid(-5.6, 1.8, -9.2, -5.2, 2, 2, labBenchMat);
    // F{n}02 desks
    addDeskGrid(-5.6, 3.2, -15.0, -11.2, 2, 3, deskTopMat);
    // F{n}03 desks
    addDeskGrid(-8.5, -1.6, -21.8, -17.0, 2, 3, deskTopMat);
    // ECE/EE/CPE Lab benches
    addDeskGrid(-8.8, -4.4, -28.8, -25.0, 2, 2, labBenchMat);
    // F{n}04 desks
    addDeskGrid(1.2, 11.8, -28.8, -24.0, 2, 4, deskTopMat);

    // 7. 3D Safety Equipment Markers from Floor Plan Legend
    //    (First Aid Kits = green/white cross box, Fire Alarms = red wall box, Fire Extinguishers = red cylinder)
    const addFirstAidKit = (x: number, z: number) => {
      const ky = baseY + slabH + 1.15;
      grp.add(box(0.48, 0.48, 0.48, mats.whiteWall, x, ky, z));
      grp.add(box(0.52, 0.14, 0.52, firstAidGreenMat, x, ky, z));
      grp.add(box(0.14, 0.52, 0.52, firstAidGreenMat, x, ky, z));
    };
    const addFireExtinguisher = (x: number, z: number) => {
      const cyl = new THREE.Mesh(getCachedCylinderGeometry(0.16, 0.16, 0.75, 10), fireRedMat);
      cyl.position.set(x, baseY + slabH + 0.38, z);
      cyl.castShadow = true;
      grp.add(cyl);
    };
    const addFireAlarm = (x: number, z: number) => {
      grp.add(box(0.45, 0.55, 0.45, fireRedMat, x, baseY + slabH + 1.35, z));
    };

    // Exact positions from the FAME 3rd Floor Evacuation Plan
    addFirstAidKit(-3.8, -26.2); // ECE/EE/CPE Lab
    addFirstAidKit(6.8, -23.3);  // F{n}04 bottom wall
    addFirstAidKit(-5.2, -15.4); // F{n}02 bottom-left
    addFirstAidKit(2.5, -6.2);   // CE Lab east wall
    addFirstAidKit(-8.8, 5.1);   // F{n}01 bottom-left

    addFireExtinguisher(-3.7, -25.4); // ECE/EE/CPE Lab
    addFireExtinguisher(5.6, -23.3);  // F{n}04
    addFireExtinguisher(-0.7, -19.2); // F{n}03
    addFireExtinguisher(-1.2, -15.4); // F{n}02
    addFireExtinguisher(2.5, -7.2);   // CE Lab
    addFireExtinguisher(5.4, 4.8);    // F{n}01

    addFireAlarm(7.9, -15.6); // Hallway beside Middle CR
    addFireAlarm(6.4, 3.8);   // Hallway beside Front Staircase & F{n}01
  };

  // ── Ground floor (1F: site, entrance, stairs, canopy, fence + 3D Floor Plan) ─
  const ground = new THREE.Group();
  ground.name = 'FAME_Ground_Floor';

  // Site: lawn, sidewalk, road
  ground.add(box(48, 0.3, 56, concrete, 4, -0.15, -11, false));
  ground.add(box(20, 0.08, 5.6, lawn, -4, 0.04, 9.4, false));
  ground.add(box(9, 0.08, 5.6, lawn, 19.5, 0.04, 9.4, false));
  ground.add(box(48, 0.12, 3.4, concrete, 4, 0.06, 14, false));
  ground.add(box(48, 0.05, 8, asphalt, 4, 0.0, 19.8, false));
  for (let x = -18; x < 26; x += 4) ground.add(box(2, 0.02, 0.18, whiteLine, x, 0.04, 19.8, false));

  // Open-top 1F perimeter facade shell + full 3D interior floor plan (F101–F104, Labs, Faculty Office, CRs, Stairs)
  addFameFloorShellAndInterior(ground, 1, 0, FH, false);
  // Centered main entrance double doors
  ground.add(box(3.4, 2.3, 0.08, darkGlass, beigeCx, 1.4 + 1.15, beigeFrontZ + 0.05, false));
  ground.add(box(3.45, 0.08, 0.1, mats.metalDark, beigeCx, 1.4 + 2.3, beigeFrontZ + 0.06, false)); // door frame
  ground.add(box(0.08, 2.3, 0.1, mats.metalDark, beigeCx, 1.4 + 1.15, beigeFrontZ + 0.06, false)); // center mullion
  // Sidelights and notice board flanking the doors
  ground.add(box(1.2, 2.2, 0.08, darkGlass, 7.3, 1.4 + 1.1, beigeFrontZ + 0.05, false));
  ground.add(box(1.2, 2.2, 0.08, darkGlass, 12.4, 1.4 + 1.1, beigeFrontZ + 0.05, false));
  ground.add(box(1.0, 1.2, 0.06, mats.whiteWall, 12.4, 2.5, beigeFrontZ + 0.09, false)); // notice board

  // Centered raised entrance landing
  const landingW = 6.6;
  ground.add(box(landingW, 1.4, 3.2, stairMat, beigeCx, 0.7, beigeFrontZ + 1.6));

  // Centered wide concrete stairs (6 risers) directly aligned with entrance
  const steps = 6;
  const rise = 1.4 / steps;
  const run = 0.6;
  const stairW = 6.0;
  const stairX0 = beigeCx - stairW / 2; // 6.85
  const stairX1 = beigeCx + stairW / 2; // 12.85
  const stairZ0 = beigeFrontZ + 3.2;
  for (let i = 0; i < steps; i++) {
    const top = 1.4 - i * rise;
    ground.add(
      box(stairW, top, run, stairMat, beigeCx, top / 2, stairZ0 + i * run + run / 2)
    );
  }
  const stairZ1 = stairZ0 + steps * run;

  // Blue handrails flanking the stairs (left & right sides only, unobstructed flight)
  [stairX0 + 0.12, stairX1 - 0.12].forEach((x) => {
    const a = new THREE.Vector3(x, 1.4 + 0.95, stairZ0 - 0.2);
    const b = new THREE.Vector3(x, 0.2 + 0.95, stairZ1);
    ground.add(rod(a, b, 0.05, fenceBlue));
    ground.add(rod(a.clone().setY(a.y - 0.45), b.clone().setY(b.y - 0.45), 0.035, fenceBlue));
    ground.add(rod(new THREE.Vector3(x, 1.4, stairZ0 - 0.2), a, 0.05, fenceBlue));
    ground.add(rod(new THREE.Vector3(x, 0.2, stairZ1), b, 0.05, fenceBlue));
  });

  // Entrance canopy: dark metal roof on steel columns (framing stairs outside edges)
  const canopyY = 5.2;
  const canopy = box(13.2, 0.18, 7, canopyMat, 12.0, canopyY, 7.2);
  canopy.rotation.x = 0.04;
  ground.add(canopy);
  ground.add(box(13.3, 0.3, 0.12, canopyMat, 12.0, canopyY - 0.12, 10.72)); // fascia
  // Columns placed outside the stair flight (no column in front of the stairs)
  [6.5, 13.2, 18.0].forEach((x) => {
    ground.add(rod(new THREE.Vector3(x, 0, 10.4), new THREE.Vector3(x, canopyY, 10.4), 0.11, mats.metalDark));
  });
  ground.add(rod(new THREE.Vector3(18.0, 0, 4.4), new THREE.Vector3(18.0, canopyY, 4.4), 0.11, mats.metalDark));

  // Blue steel perimeter fence (gap matching the aligned stairs)
  const fenceZ = 12.3;
  const fenceH = 1.6;
  const buildFence = (x0: number, x1: number) => {
    ground.add(box(x1 - x0, 0.08, 0.08, fenceBlue, (x0 + x1) / 2, fenceH, fenceZ, false));
    ground.add(box(x1 - x0, 0.08, 0.08, fenceBlue, (x0 + x1) / 2, 0.25, fenceZ, false));
    for (let x = x0; x <= x1 + 0.01; x += 0.32) {
      ground.add(box(0.04, fenceH, 0.04, fenceBlue, x, fenceH / 2, fenceZ, false));
    }
    for (let x = x0; x <= x1 + 0.01; x += 3) {
      ground.add(box(0.14, fenceH + 0.3, 0.14, fenceBlue, x, (fenceH + 0.3) / 2, fenceZ, false));
    }
  };
  buildFence(-15, stairX0 - 0.35);
  buildFence(stairX1 + 0.35, 23);

  // Utility pole (prominent in the photo, front-left)
  ground.add(rod(new THREE.Vector3(-11.5, 0, 13.2), new THREE.Vector3(-11.5, 22, 13.2), 0.22, concrete));
  ground.add(box(3.2, 0.18, 0.18, concrete, -11.5, 20.5, 13.2));
  ground.add(box(2.2, 0.16, 0.16, concrete, -11.5, 15, 13.2));
  [-12.2, -10.8].forEach((x) => {
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12), mats.metalSilver);
    tr.position.set(x, 13.4, 13.5);
    ground.add(tr);
  });

  // Trees: palm by the entrance, broadleaf trees on either side
  const palm = (x: number, z: number, h: number) => {
    ground.add(rod(new THREE.Vector3(x, 0, z), new THREE.Vector3(x + 0.3, h, z), 0.18, trunk));
    for (let i = 0; i < 8; i++) {
      const frond = new THREE.Mesh(new THREE.BoxGeometry(3, 0.05, 0.5), leaf);
      const a = (i / 8) * Math.PI * 2;
      frond.position.set(x + 0.3 + Math.cos(a) * 1.3, h - 0.3, z + Math.sin(a) * 1.3);
      frond.rotation.y = -a;
      frond.rotation.z = -0.45;
      frond.castShadow = true;
      ground.add(frond);
    }
  };
  palm(17.2, 7.8, 6.4);
  palm(20.2, 5, 5.6);
  const tree = (x: number, z: number, s: number) => {
    ground.add(rod(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 2.6 * s, z), 0.22 * s, trunk));
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2 * s, 1), leaf);
    crown.position.set(x, 3.8 * s, z);
    crown.castShadow = true;
    ground.add(crown);
  };
  tree(-15.5, 8, 1.3);
  tree(21.5, 9.5, 1.1);

  floorGroups.push(ground);
  root.add(ground);

  // ── Upper floors 2F – 4F (open-top facade shell + 3D interior floor plan) ──
  for (let f = 1; f <= 3; f++) {
    const g = new THREE.Group();
    g.name = `FAME_Floor_${f + 1}`;
    const baseY = f * FH;
    const cy = baseY + FH / 2;

    addFameFloorShellAndInterior(g, f + 1, baseY, FH, false);

    const fz = beigeFrontZ + 0.05;
    if (f === 1) {
      // 2F – ribbon window (scaled with wider khaki block)
      g.add(box(5.9, 1.1, 0.08, darkGlass, beigeCx, baseY + 2.2, fz, false));
    } else if (f === 2) {
      // 3F – Universidad de Dagupan seal + small window (centered on wider khaki block)
      const seal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.15, 0.12, 48),
        new THREE.MeshStandardMaterial({ map: createEmblemTexture(), roughness: 0.3 })
      );
      seal.rotation.x = Math.PI / 2;
      seal.position.set(8.65, baseY + 1.9, fz + 0.06);
      seal.castShadow = true;
      g.add(seal);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.09, 12, 48), fenceBlue);
      ring.position.set(8.65, baseY + 1.9, fz + 0.1);
      g.add(ring);
      g.add(box(2.5, 0.9, 0.08, darkGlass, 11.9, baseY + 2.1, fz, false));
    } else {
      // 4F – jalousie window strip under the cantilever (scaled with wider khaki block)
      g.add(box(5.7, 1.0, 0.08, jalousieMat, beigeCx, baseY + 2.4, fz, false));
    }

    // Side (+x) classroom windows along the 34.5m beige block
    [-2, -8, -14, -20, -26].forEach((wz) => {
      g.add(box(0.08, 1.1, 4.2, darkGlass, beigeX1 + 0.05, baseY + 2.1, wz, false));
      g.add(box(0.12, 0.08, 4.3, mats.metalDark, beigeX1 + 0.06, baseY + 1.52, wz, false));
      g.add(box(0.12, 0.08, 4.3, mats.metalDark, beigeX1 + 0.06, baseY + 2.68, wz, false));
    });

    // Left-side (-x) classroom windows along the 36m main block
    [-4, -12, -20, -28].forEach((wz) => {
      g.add(box(0.08, 1.1, 5.0, darkGlass, mainX0 - 0.05, cy, wz, false));
      g.add(box(0.12, 0.08, 5.1, mats.metalDark, mainX0 - 0.06, cy - 0.58, wz, false));
      g.add(box(0.12, 0.08, 5.1, mats.metalDark, mainX0 - 0.06, cy + 0.58, wz, false));
    });

    floorGroups.push(g);
    root.add(g);
  }

  // ── Cantilevered top box (5F: open-top cantilevered shell + 3D interior floor plan) ──
  const top = new THREE.Group();
  top.name = 'FAME_Cantilevered_Top_Box';
  const topH = 6.6;
  const topBaseY = 4 * FH;
  addFameFloorShellAndInterior(top, 5, topBaseY, topH, true);

  floorGroups.push(top);
  root.add(top);

  return {
    root,
    floorGroups,
    defaultCameraPos: new THREE.Vector3(22, 17, 44),
    targetLookAt: new THREE.Vector3(2, 9.5, -4),
    explodeSpacing: 6.2,
  };
}
