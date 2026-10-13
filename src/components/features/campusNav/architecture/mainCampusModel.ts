// ─────────────────────────────────────────────────────────────────────────────
// mainCampusModel.ts – Unified procedural 3D model of UDD Main Campus
//
// Modelled faithfully from the official SZD Architectural Design Studio renders:
//   • 6-storey Main Academic Tower with perforated aluminium mesh facade,
//     dual converging chevron blue arrow / dark wedge motifs per tier, and
//     the circular Universidad de Dagupan seal at the top center.
//   • Front-right Chapel Pavilion: modern asymmetrical A-frame with split-face
//     ledger stone wall, glass entrance, and a monumental Latin cross with brace.
//   • Right-side Main Campus Entrance Portal: grand blue portal beam with
//     "UNIVERSIDAD DE DAGUPAN" signage, overhead steel arch truss with UDD badge,
//     black security iron grille gates, and covered inner-campus driveway.
//   • Elevated digital LED billboard on column: "ENROLLMENT ONGOING".
//   • Left side wall: large wall-mounted LED billboard & classroom ribbon windows.
//   • Rooftop: elevator/stair core penthouse tower and white 3D letters
//     "UNIVERSIDAD DE DAGUPAN" along the rooftop parapet.
//   • Street level: paved sidewalk, planter boxes with manicured boxwood shrubs,
//     blue horizontal canopy, and parked vehicles along the road.
//
// Exploded view: 6 tiers [Ground + Chapel + Gate, 2F, 3F, 4F, 5F + Seal, Roof + Penthouse].
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { getMaterials, createEmblemTexture, type Building3DResult } from './proceduralModels';

// ── Palette (sampled from the architectural renders) ────────────────────────
const C = {
  mesh: '#c5cacf',
  meshDot: '#9da5af',
  band: '#e4e8ed',
  seam: '#aab1b9',
  darkWedge: '#585e66',
  blue: '#1b63d6',
  blueDark: '#11449c',
  charcoal: '#3e444a',
  stoneDark: '#2a2f35',
  stoneMid: '#4b525a',
  stoneLight: '#737b85',
  whiteWall: '#f0f3f6',
  metalSilver: '#cfd4da',
  accentCyan: '#00a3e0',
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

/** Perforated aluminium mesh – staggered micro-dot grid. */
function perforated(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.mesh;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.meshDot;
  let row = 0;
  for (let yy = y + 2; yy < y + h; yy += 5, row++) {
    for (let xx = x + 2 + (row % 2) * 2.5; xx < x + w; xx += 5) {
      ctx.fillRect(xx, yy, 2.0, 2.0);
    }
  }
}

// ── Textures ────────────────────────────────────────────────────────────────
/** Front perforated mesh facade tier with dual converging chevron arrows. */
function createFrontMeshTierTexture(tier: number): THREE.CanvasTexture {
  const W = 2048;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  perforated(ctx, 0, 0, W, H);

  // Horizontal light architectural bands
  ctx.fillStyle = C.band;
  ctx.fillRect(0, 90, W, 180);
  panelLines(ctx, 0, 90, W, 180, 24, 1, C.seam, 2);

  // Left chevron set: dark wedge tapering towards right, leading into blue diamond
  poly(ctx, [[0, 140], [680, 175], [680, 195], [0, 240]], C.darkWedge);
  poly(ctx, [[640, 95], [860, 95], [1160, 265], [920, 265]], C.blue);
  poly(ctx, [[860, 95], [890, 95], [1185, 265], [1160, 265]], C.blueDark);

  // Right chevron set: dark wedge tapering from right, leading into blue diamond
  poly(ctx, [[W, 140], [W - 680, 175], [W - 680, 195], [W, 240]], C.darkWedge);
  poly(ctx, [[W - 640, 95], [W - 860, 95], [W - 1160, 265], [W - 920, 265]], C.blue);
  poly(ctx, [[W - 860, 95], [W - 890, 95], [W - 1185, 265], [W - 1160, 265]], C.blueDark);

  // Vertical panel seams
  panelLines(ctx, 0, 0, W, H, 24, 2, C.seam, 1.5);
  return toTexture(canvas);
}

/** Side wrap-around perforated mesh with single chevron. */
function createSideMeshTierTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  perforated(ctx, 0, 0, W, H);

  ctx.fillStyle = C.band;
  ctx.fillRect(0, 90, W, 180);
  panelLines(ctx, 0, 90, W, 180, 10, 1, C.seam, 2);

  // Chevron wrapping around the corner
  poly(ctx, [[0, 140], [420, 175], [420, 195], [0, 240]], C.darkWedge);
  poly(ctx, [[380, 95], [560, 95], [780, 265], [580, 265]], C.blue);

  panelLines(ctx, 0, 0, W, H, 10, 2, C.seam, 1.5);
  return toTexture(canvas);
}

/** Split-face ledger stone wall for the chapel entrance. */
function createStoneWallTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = C.stoneDark;
  ctx.fillRect(0, 0, 512, 512);

  const colors = [C.stoneDark, C.stoneMid, C.stoneLight, '#383e46', '#22262b'];
  let y = 0;
  while (y < 512) {
    const h = 10 + Math.floor(Math.random() * 12);
    let x = 0;
    while (x < 512) {
      const w = 24 + Math.floor(Math.random() * 40);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x + 1, y + 1, w - 2, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x + 1, y + h - 2, w - 2, 2);
      x += w;
    }
    y += h;
  }
  return toTexture(canvas);
}

/** Digital LED Billboard: "UNIVERSIDAD DE DAGUPAN - ENROLLMENT ONGOING". */
function createBillboardTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  // Screen background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Top header banner
  ctx.fillStyle = '#0f4ba3';
  ctx.fillRect(0, 0, W, 72);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', 40, 48);

  // Left simulated campus photo frame
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(40, 100, 340, 360);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(40, 100, 340, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('UDD CAMPUS', 60, 150);
  ctx.fillStyle = '#38bdf8';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(60, 210 + i * 50, 300, 30);
  }

  // Right text block
  ctx.fillStyle = '#0f4ba3';
  ctx.font = '900 64px sans-serif';
  ctx.fillText('ENROLLMENT', 420, 175);
  ctx.fillText('ONGOING', 420, 245);

  // Subtitle badges
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(420, 275, 480, 42);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('2ND SEMESTER A.Y. 2022-2023', 440, 304);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('NEW STUDENTS AND TRANSFEREES ACCEPTED', 420, 370);

  ctx.fillStyle = '#64748b';
  ctx.font = '18px sans-serif';
  ctx.fillText('CLASSES START FEBRUARY 2023', 420, 415);

  // Blue diagonal accent graphic in the corner
  poly(ctx, [[W - 140, 0], [W, 0], [W, 140]], '#0284c7');
  poly(ctx, [[W - 80, 0], [W, 0], [W, 80]], '#38bdf8');

  // Outer border
  ctx.strokeStyle = '#0f4ba3';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  return toTexture(canvas);
}

/** Blue entrance portal sign: "UNIVERSIDAD DE DAGUPAN". */
function createPortalSignTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = '#0b4da2';
  ctx.fillRect(0, 0, W, H);

  // White borders
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, 14);
  ctx.fillRect(0, H - 14, W, 14);

  // Bold 3D-like text
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 128px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', W / 2, H / 2);

  return toTexture(canvas);
}

/** Rooftop parapet 3D lettering banner: "UNIVERSIDAD DE DAGUPAN". */
function createRooftopLettersTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#0f4ba3';
  ctx.font = '900 118px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', W / 2, H / 2);

  return toTexture(canvas);
}

/** Regulation collegiate basketball court texture with UDD branding. */
function createBasketballCourtTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const { canvas, ctx } = makeCanvas(W, H);

  // Outer apron border: UDD Navy Blue
  ctx.fillStyle = '#0a3273';
  ctx.fillRect(0, 0, W, H);

  // Playing area dimensions inside the apron
  const padX = 120;
  const padY = 75;
  const courtW = W - padX * 2; // 1808
  const courtH = H - padY * 2; // 874
  const cx = W / 2;
  const cy = H / 2;

  // Natural polished maple wood planks
  ctx.fillStyle = '#e2b36e';
  ctx.fillRect(padX, padY, courtW, courtH);

  // Wood plank seams
  ctx.strokeStyle = '#d3a158';
  ctx.lineWidth = 1;
  for (let y = padY + 16; y < padY + courtH; y += 16) {
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(padX + courtW, y);
    ctx.stroke();
  }

  // Key / Paint area colors: solid UDD Blue
  const keyW = 380;
  const keyH = 320;
  ctx.fillStyle = '#145cd1';
  ctx.fillRect(padX, cy - keyH / 2, keyW, keyH);
  ctx.fillRect(padX + courtW - keyW, cy - keyH / 2, keyW, keyH);

  // Free throw circles (keys)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(padX + keyW, cy, 115, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(padX + courtW - keyW, cy, 115, 0, Math.PI * 2);
  ctx.stroke();

  // 3-Point arcs (white lines)
  const threeRadius = 420;
  // Left 3-pt arc
  ctx.beginPath();
  ctx.arc(padX + 90, cy, threeRadius, -Math.PI / 2 + 0.16, Math.PI / 2 - 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(padX, cy - threeRadius + 18);
  ctx.lineTo(padX + 90, cy - threeRadius + 18);
  ctx.moveTo(padX, cy + threeRadius - 18);
  ctx.lineTo(padX + 90, cy + threeRadius - 18);
  ctx.stroke();

  // Right 3-pt arc
  ctx.beginPath();
  ctx.arc(padX + courtW - 90, cy, threeRadius, Math.PI / 2 + 0.16, (3 * Math.PI) / 2 - 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(padX + courtW, cy - threeRadius + 18);
  ctx.lineTo(padX + courtW - 90, cy - threeRadius + 18);
  ctx.moveTo(padX + courtW, cy + threeRadius - 18);
  ctx.lineTo(padX + courtW - 90, cy + threeRadius - 18);
  ctx.stroke();

  // Outer boundary line (white line)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(padX, padY, courtW, courtH);

  // Half-court line
  ctx.beginPath();
  ctx.moveTo(cx, padY);
  ctx.lineTo(cx, padY + courtH);
  ctx.stroke();

  // Center jump circle with solid blue fill & white line
  ctx.fillStyle = '#145cd1';
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Center UDD text inside jump circle
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 84px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UDD', cx, cy);

  // Sideline collegiate text on apron: "UNIVERSIDAD DE DAGUPAN"
  ctx.font = '900 44px sans-serif';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', cx, padY / 2);
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', cx, H - padY / 2);

  // Baseline collegiate text: "UDD"
  ctx.font = '900 38px sans-serif';
  ctx.fillText('UDD', padX / 2, cy);
  ctx.fillText('UDD', W - padX / 2, cy);

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
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true;
  return m;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED PROCEDURAL 3D MODEL: UDD MAIN CAMPUS
// ─────────────────────────────────────────────────────────────────────────────
export function buildUnifiedMainCampus3D(): Building3DResult {
  const root = new THREE.Group();
  root.name = 'UDD_Main_Campus_Unified_Root';
  const mats = getMaterials();
  const floorGroups: THREE.Group[] = [];

  // Dimensions & Coordinates
  const FH = 3.8; // floor height
  const mainX0 = -16;
  const mainX1 = 8;
  const mainW = mainX1 - mainX0; // 24m wide
  const mainCx = (mainX0 + mainX1) / 2; // -4m
  const frontZ = 4.0;
  const backZ = -22.0;
  const depth = frontZ - backZ; // 26m deep
  const mainCz = (frontZ + backZ) / 2; // -9m

  // Shared materials
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b939c, roughness: 0.85 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
  const darkGlass = new THREE.MeshStandardMaterial({ color: 0x16222f, roughness: 0.15, metalness: 0.7 });
  const blueWall = new THREE.MeshStandardMaterial({ color: 0x1153b6, roughness: 0.45, metalness: 0.35 });
  const stoneMat = new THREE.MeshStandardMaterial({ map: createStoneWallTexture(), roughness: 0.8 });
  const billboardMat = new THREE.MeshStandardMaterial({ map: createBillboardTexture(), roughness: 0.3 });
  const portalSignMat = new THREE.MeshStandardMaterial({ map: createPortalSignTexture(), roughness: 0.35 });
  const roofLettersMat = new THREE.MeshStandardMaterial({ map: createRooftopLettersTexture(), roughness: 0.35 });
  const emblemMat = new THREE.MeshStandardMaterial({ map: createEmblemTexture(), roughness: 0.25 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xa1a6ad, roughness: 0.9 });
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x34383e, roughness: 0.95 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x3d7a31, roughness: 1 });
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x2e6b29, roughness: 0.9 });
  const carWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.5 });
  const carDark = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.25, metalness: 0.6 });
  const carBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.5 });

  // ── LEVEL 0: GROUND CONCOURSE, CHAPEL, PORTAL GATE & STREET ────────────────
  const ground = new THREE.Group();
  ground.name = 'MainCampus_L0_Ground';

  // 1. Site base, street, sidewalk & markings (extended to cover rear basketball arena)
  ground.add(box(64, 0.3, 76, concrete, 4, -0.15, -16, false));
  ground.add(box(56, 0.08, 12, asphalt, 2, 0.0, 16, false));
  ground.add(box(56, 0.14, 4.5, concrete, 2, 0.07, 7.8, false)); // sidewalk
  for (let x = -24; x <= 28; x += 4) {
    ground.add(box(2.2, 0.02, 0.18, mats.whiteWall, x, 0.04, 16, false)); // road stripe
  }

  // 2. Main building ground floor core & classrooms
  ground.add(box(mainW, FH, depth, [whiteMat, whiteMat, roofMat, roofMat, whiteMat, whiteMat], mainCx, FH / 2, mainCz));

  // Ground floor horizontal blue canopy
  ground.add(box(16, 0.25, 2.8, blueWall, -8, FH - 0.2, frontZ + 1.2));
  ground.add(box(16, 0.35, 0.08, blueWall, -8, FH - 0.2, frontZ + 2.6)); // canopy fascia

  // Ground floor classroom windows behind planters
  [-13.5, -9.5, -5.5].forEach((wx) => {
    ground.add(box(2.8, 1.2, 0.08, darkGlass, wx, 1.8, frontZ + 0.05, false));
    ground.add(box(2.8, 0.08, 0.1, blueWall, wx, 1.2, frontZ + 0.06, false));
  });

  // White planter boxes with lush green boxwood shrubs
  const addPlanter = (x: number, w: number, z: number) => {
    ground.add(box(w, 0.65, 0.7, mats.whiteWall, x, 0.33, z));
    ground.add(box(w - 0.1, 0.1, 0.6, grassMat, x, 0.65, z, false));
    for (let xx = x - w / 2 + 0.4; xx <= x + w / 2 - 0.2; xx += 0.55) {
      const sh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), shrubMat);
      sh.position.set(xx, 0.9, z);
      sh.castShadow = true;
      ground.add(sh);
    }
  };
  addPlanter(-9, 13.5, frontZ + 1.8);
  addPlanter(5.2, 3.4, frontZ + 4.2);

  // 3. Modern Chapel Pavilion (Asymmetrical A-Frame)
  const chapelX = 2.4;
  const chapelZ = frontZ + 2.2;
  const chapelW = 7.6;
  const chapelH = 8.5;
  const chapelD = 4.6;

  // Chapel base podium & stone wall
  ground.add(box(chapelW, 0.35, chapelD, concrete, chapelX, 0.18, chapelZ));
  ground.add(box(3.2, 5.0, 0.18, stoneMat, chapelX - 0.4, 2.7, chapelZ + chapelD / 2 - 0.1));

  // Asymmetrical charcoal A-frame roof rafters
  const roofApex = new THREE.Vector3(chapelX + 0.6, chapelH, chapelZ);
  const leftEave = new THREE.Vector3(chapelX - chapelW / 2 + 0.4, 1.4, chapelZ);
  const rightEave = new THREE.Vector3(chapelX + chapelW / 2 - 0.4, 0.8, chapelZ);

  ground.add(rod(leftEave, roofApex, 0.28, mats.metalDark));
  ground.add(rod(rightEave, roofApex, 0.28, mats.metalDark));
  // White inner fascia/soffit
  ground.add(rod(leftEave.clone().add(new THREE.Vector3(0.2, 0, 0)), roofApex.clone().add(new THREE.Vector3(0, -0.2, 0)), 0.16, whiteMat));
  ground.add(rod(rightEave.clone().add(new THREE.Vector3(-0.2, 0, 0)), roofApex.clone().add(new THREE.Vector3(0, -0.2, 0)), 0.16, whiteMat));

  // Chapel glass entrance doors
  ground.add(box(2.0, 2.6, 0.08, darkGlass, chapelX + 1.2, 1.5, chapelZ + chapelD / 2 - 0.1, false));
  ground.add(box(2.1, 0.08, 0.1, mats.metalSilver, chapelX + 1.2, 2.85, chapelZ + chapelD / 2 - 0.08, false));

  // Monumental Cross in front of Chapel
  const crossX = chapelX - 1.8;
  const crossZ = chapelZ + 1.6;
  // Vertical stem
  ground.add(box(0.5, 9.2, 0.35, whiteMat, crossX, 4.6, crossZ));
  ground.add(box(0.3, 8.8, 0.38, stoneMat, crossX, 4.6, crossZ)); // stone insert
  // Horizontal crossbeam
  ground.add(box(3.4, 0.5, 0.35, whiteMat, crossX, 6.8, crossZ));
  ground.add(box(3.2, 0.3, 0.38, stoneMat, crossX, 6.8, crossZ));
  // Diagonal structural brace to the left
  ground.add(rod(new THREE.Vector3(crossX - 2.8, 0.2, crossZ), new THREE.Vector3(crossX, 6.8, crossZ), 0.14, whiteMat));

  // 4. Campus Main Entrance Portal & Gate (Right side)
  const portalX0 = 8.5;
  const portalX1 = 18.5;
  const portalZ = frontZ + 0.8;
  const portalH = 6.4;

  // Sturdy white pillars
  ground.add(box(1.2, portalH, 1.2, whiteMat, portalX0, portalH / 2, portalZ));
  ground.add(box(1.2, portalH, 1.2, whiteMat, portalX1, portalH / 2, portalZ));

  // Grand Blue Beam: "UNIVERSIDAD DE DAGUPAN"
  const beamY = portalH + 0.9;
  ground.add(box(portalX1 - portalX0 + 2.0, 1.8, 0.9, portalSignMat, (portalX0 + portalX1) / 2, beamY, portalZ));

  // Curved overhead steel arch truss with circular UDD seal
  const archRadius = (portalX1 - portalX0) / 2 + 0.5;
  const archCenter = new THREE.Vector3((portalX0 + portalX1) / 2, beamY + 0.9, portalZ);
  const archGeo = new THREE.TorusGeometry(archRadius, 0.16, 12, 32, Math.PI);
  const archMesh = new THREE.Mesh(archGeo, mats.metalSilver);
  archMesh.rotation.x = 0;
  archMesh.position.copy(archCenter);
  ground.add(archMesh);

  // Inner truss arch
  const innerArch = new THREE.Mesh(new THREE.TorusGeometry(archRadius - 0.6, 0.1, 12, 32, Math.PI), mats.metalSilver);
  innerArch.position.copy(archCenter);
  ground.add(innerArch);

  // Crest seal atop the arch
  const gateSeal = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 36), emblemMat);
  gateSeal.rotation.x = Math.PI / 2;
  gateSeal.position.set((portalX0 + portalX1) / 2, archCenter.y + archRadius - 0.2, portalZ + 0.1);
  gateSeal.castShadow = true;
  ground.add(gateSeal);

  // Black security iron grille gates
  const gateW = (portalX1 - portalX0 - 1.4) / 2;
  ground.add(box(gateW, 2.6, 0.08, mats.metalDark, portalX0 + 0.7 + gateW / 2, 1.3, portalZ));
  ground.add(box(gateW, 2.6, 0.08, mats.metalDark, portalX1 - 0.7 - gateW / 2, 1.3, portalZ));
  // Horizontal bars
  for (let y = 0.4; y < 2.6; y += 0.25) {
    ground.add(box(portalX1 - portalX0 - 1.2, 0.04, 0.1, mats.metalSilver, (portalX0 + portalX1) / 2, y, portalZ));
  }

  // Digital Billboard on cylindrical column (Right of Chapel)
  const signColX = 7.0;
  const signColZ = frontZ + 4.4;
  ground.add(rod(new THREE.Vector3(signColX, 0, signColZ), new THREE.Vector3(signColX, 5.8, signColZ), 0.35, concrete));
  // Double-sided illuminated billboard box
  ground.add(box(3.8, 2.8, 0.5, [mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark, billboardMat, billboardMat], signColX, 6.8, signColZ));

  // Driveway canopy extending into campus interior
  const driveZ0 = portalZ - 1.0;
  const driveZ1 = -18.0;
  const driveL = driveZ0 - driveZ1;
  ground.add(box(8.5, 0.2, driveL, blueWall, (portalX0 + portalX1) / 2, portalH - 0.1, (driveZ0 + driveZ1) / 2));

  // 5. Parked cars along the street
  const createCar = (x: number, z: number, colorMat: THREE.Material) => {
    const c = new THREE.Group();
    c.position.set(x, 0.45, z);
    c.add(box(4.2, 0.75, 1.9, colorMat, 0, 0, 0)); // lower body
    c.add(box(2.4, 0.65, 1.7, darkGlass, -0.2, 0.65, 0)); // cabin glass
    c.add(box(2.2, 0.06, 1.6, colorMat, -0.2, 0.98, 0)); // roof
    // Wheels
    [-1.2, 1.2].forEach((wx) => {
      [-0.95, 0.95].forEach((wz) => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16), mats.metalDark);
        wh.rotation.z = Math.PI / 2;
        wh.position.set(wx, -0.15, wz);
        c.add(wh);
      });
    });
    return c;
  };
  ground.add(createCar(-10, 15.5, carWhite));
  ground.add(createCar(-17, 15.5, carDark));
  ground.add(createCar(15, 15.5, carBlue));

  // 6. UDD Covered Basketball Court Arena (Rear campus athletic arena)
  const courtMat = new THREE.MeshStandardMaterial({ map: createBasketballCourtTexture(), roughness: 0.35, metalness: 0.08 });
  const hoopOrange = new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.3, metalness: 0.4 });
  const netMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
  const trussSilver = new THREE.MeshStandardMaterial({ color: 0xc4cbd4, roughness: 0.4, metalness: 0.5 });
  const courtRoofBlue = new THREE.MeshStandardMaterial({ color: 0x0e4ea6, roughness: 0.45, metalness: 0.35 });

  const courtX = 2.0;
  const courtZ = -38.0;
  const courtW = 32.0; // length along X (east-west)
  const courtD = 18.0; // width along Z

  // Concrete court apron base & tournament acrylic playing floor
  ground.add(box(courtW + 2.0, 0.25, courtD + 2.0, concrete, courtX, 0.08, courtZ, false));
  ground.add(box(courtW, 0.06, courtD, [mats.metalDark, mats.metalDark, courtMat, courtMat, mats.metalDark, mats.metalDark], courtX, 0.23, courtZ));

  // Basketball Hoop Systems (East & West regulation hoops)
  const addHoop = (hx: number, facingDir: number) => {
    // Padded heavy hydraulic stanchion base
    ground.add(box(1.2, 1.3, 1.2, blueWall, hx, 0.65, courtZ));
    // Main cantilever boom angled towards court center
    const boomStart = new THREE.Vector3(hx, 1.3, courtZ);
    const boomEnd = new THREE.Vector3(hx + facingDir * 1.8, 3.4, courtZ);
    ground.add(rod(boomStart, boomEnd, 0.12, blueWall));
    ground.add(rod(new THREE.Vector3(hx, 0.8, courtZ), new THREE.Vector3(hx + facingDir * 1.2, 3.0, courtZ), 0.08, mats.metalSilver));

    // Glass backboard
    const bbX = hx + facingDir * 1.95;
    ground.add(box(0.08, 1.15, 1.85, darkGlass, bbX, 3.4, courtZ));
    ground.add(box(0.09, 1.2, 1.9, mats.whiteWall, bbX, 3.4, courtZ, false)); // border
    ground.add(box(0.11, 0.45, 0.6, mats.whiteWall, bbX + facingDir * 0.02, 3.25, courtZ, false)); // target box

    // Orange Rim (3.05m regulation height)
    const rimX = bbX + facingDir * 0.42;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 12, 24), hoopOrange);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(rimX, 3.05, courtZ);
    rim.castShadow = true;
    ground.add(rim);

    // Basketball Net
    const net = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.14, 0.45, 12, 1, true), netMat);
    net.position.set(rimX, 2.8, courtZ);
    ground.add(net);
  };
  addHoop(courtX - 14.5, 1);  // Left basket facing right
  addHoop(courtX + 14.5, -1); // Right basket facing left

  // Covered Court Steel Arched Canopy (Collegiate sports arena shelter)
  const roofH = 9.8;
  const colRadius = 0.22;
  const colZs = [courtZ - 9.5, courtZ, courtZ + 9.5];
  const colXs = [courtX - 16.2, courtX + 16.2];

  colXs.forEach((cx) => {
    colZs.forEach((cz) => {
      // Robust structural steel columns
      ground.add(rod(new THREE.Vector3(cx, 0, cz), new THREE.Vector3(cx, roofH, cz), colRadius, mats.metalDark));
      // Base footing
      ground.add(box(0.8, 0.6, 0.8, concrete, cx, 0.3, cz));
    });
  });

  // Longitudinal side truss beams
  colXs.forEach((cx) => {
    ground.add(box(0.35, 0.5, 20.0, trussSilver, cx, roofH, courtZ));
  });

  // 3 Transverse arched steel roof trusses spanning over the court (width 32.8m)
  const trussRadius = 17.5;
  colZs.forEach((cz) => {
    const archCenter = new THREE.Vector3(courtX, roofH - 4.5, cz);
    const archGeo = new THREE.TorusGeometry(trussRadius, 0.18, 12, 40, Math.PI * 0.76);
    const archMesh = new THREE.Mesh(archGeo, trussSilver);
    archMesh.rotation.z = Math.PI * 0.12;
    archMesh.position.copy(archCenter);
    ground.add(archMesh);

    // Inner parallel chord truss
    const innerGeo = new THREE.TorusGeometry(trussRadius - 0.7, 0.12, 12, 40, Math.PI * 0.76);
    const innerMesh = new THREE.Mesh(innerGeo, trussSilver);
    innerMesh.rotation.z = Math.PI * 0.12;
    innerMesh.position.copy(archCenter);
    ground.add(innerMesh);

    // Suspended industrial sports LED floodlight fixture in the center
    const lightBank = box(2.4, 0.25, 0.8, mats.metalDark, courtX, roofH + 2.5, cz);
    ground.add(lightBank);
    const lightLens = box(2.2, 0.05, 0.7, mats.whiteWall, courtX, roofH + 2.35, cz, false);
    ground.add(lightLens);
  });

  // Barrel-vault standing seam roof cover
  const barrelW = 33.0;
  const barrelD = 20.2;
  const barrelY = roofH + 2.9;
  ground.add(box(barrelW, 0.25, barrelD, courtRoofBlue, courtX, barrelY, courtZ));
  // Fascia
  ground.add(box(barrelW + 0.2, 0.5, 0.15, mats.metalSilver, courtX, barrelY, courtZ - barrelD / 2));
  ground.add(box(barrelW + 0.2, 0.5, 0.15, mats.metalSilver, courtX, barrelY, courtZ + barrelD / 2));

  // Sideline player team benches & scorer table
  [-6, 6].forEach((bx) => {
    // Blue team benches
    ground.add(box(4.5, 0.45, 0.5, blueWall, courtX + bx, 0.45, courtZ + 8.2));
    ground.add(box(4.5, 0.5, 0.1, blueWall, courtX + bx, 0.85, courtZ + 8.45)); // backrest
  });
  // Official scorer's table
  ground.add(box(2.8, 0.75, 0.9, blueWall, courtX, 0.55, courtZ + 8.2));
  ground.add(box(2.6, 0.4, 0.08, mats.whiteWall, courtX, 0.55, courtZ + 8.68, false));

  floorGroups.push(ground);
  root.add(ground);

  // ── LEVELS 1 – 4: UPPER FLOORS WITH PERFORATED CHEVRON FACADE ──────────────
  for (let f = 1; f <= 4; f++) {
    const g = new THREE.Group();
    g.name = `MainCampus_L${f}_Academic`;
    const baseY = f * FH;
    const cy = baseY + FH / 2;

    const tierFrontMat = new THREE.MeshStandardMaterial({
      map: createFrontMeshTierTexture(f),
      roughness: 0.45,
      metalness: 0.35,
    });
    const tierSideMat = new THREE.MeshStandardMaterial({
      map: createSideMeshTierTexture(),
      roughness: 0.45,
      metalness: 0.35,
    });

    // Main floor volume
    g.add(box(mainW, FH, depth, [tierSideMat, tierSideMat, roofMat, roofMat, tierFrontMat, whiteMat], mainCx, cy, mainCz));

    // Left-side classroom ribbon windows (-x wall)
    for (let wz = -4; wz >= -18; wz -= 6) {
      g.add(box(0.08, 1.2, 4.4, darkGlass, mainX0 - 0.05, cy, wz, false));
      g.add(box(0.12, 0.08, 4.5, blueWall, mainX0 - 0.06, cy - 0.65, wz, false)); // sill
      g.add(box(0.12, 0.08, 4.5, blueWall, mainX0 - 0.06, cy + 0.65, wz, false)); // lintel
    }

    // Right-side windows (+x wall overlooking entrance driveway)
    for (let wz = -2; wz >= -16; wz -= 5) {
      g.add(box(0.08, 1.2, 3.8, darkGlass, mainX1 + 0.05, cy, wz, false));
      g.add(box(0.12, 0.08, 3.9, blueWall, mainX1 + 0.06, cy - 0.65, wz, false));
    }

    // Level 4 (Top Tier): Mount the large circular Universidad de Dagupan Seal
    if (f === 4) {
      const sealRadius = 2.2;
      const seal = new THREE.Mesh(new THREE.CylinderGeometry(sealRadius, sealRadius, 0.28, 64), emblemMat);
      seal.rotation.x = Math.PI / 2;
      seal.position.set(mainCx, baseY + FH / 2 + 0.1, frontZ + 0.18);
      seal.castShadow = true;
      g.add(seal);

      // Deep blue circular bezel ring with bevel
      const ring = new THREE.Mesh(new THREE.TorusGeometry(sealRadius + 0.1, 0.16, 16, 64), blueWall);
      ring.position.set(mainCx, baseY + FH / 2 + 0.1, frontZ + 0.25);
      g.add(ring);
    }

    floorGroups.push(g);
    root.add(g);
  }

  // ── LEVEL 5: ROOFTOP DECK, PENTHOUSE TOWER, SIGNAGE & WALL BILLBOARD ───────
  const roof = new THREE.Group();
  roof.name = 'MainCampus_L5_Rooftop';
  const roofBaseY = 5 * FH;

  // 1. Rooftop Parapet cap
  roof.add(box(mainW + 0.4, 0.8, depth + 0.4, mats.metalSilver, mainCx, roofBaseY + 0.4, mainCz));

  // 2. Elevator & Stair Core Penthouse Tower (rises above roofline)
  const towerW = 7.0;
  const towerH = 6.8;
  const towerD = 8.5;
  const towerX = -10.5;
  const towerZ = -7.5;
  roof.add(box(towerW, towerH, towerD, whiteMat, towerX, roofBaseY + towerH / 2, towerZ));
  roof.add(box(towerW + 0.2, 0.3, towerD + 0.2, mats.metalSilver, towerX, roofBaseY + towerH + 0.15, towerZ)); // tower cap

  // 3. Rooftop 3D Lettering Sign: "UNIVERSIDAD DE DAGUPAN" (Along right roof edge)
  const signLen = 22.0;
  const signH = 1.4;
  roof.add(box(0.12, signH, signLen, roofLettersMat, mainX1 - 0.2, roofBaseY + 0.8 + signH / 2, mainCz));

  // 4. Large Wall-Mounted LED Billboard (Left Side Wall - Image 2)
  const bbW = 10.5;
  const bbH = 5.4;
  roof.add(box(0.2, bbH, bbW, [billboardMat, mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark], mainX0 - 0.12, roofBaseY - 1.2, -6.5));

  // 5. Rooftop HVAC Chiller units & Antenna
  [-14, -18].forEach((az) => {
    roof.add(box(3.2, 1.4, 2.4, mats.metalSilver, 2.5, roofBaseY + 0.9, az));
    roof.add(box(3.4, 0.2, 2.6, mats.metalDark, 2.5, roofBaseY + 1.65, az));
  });
  // Communication mast
  roof.add(rod(new THREE.Vector3(towerX, roofBaseY + towerH, towerZ), new THREE.Vector3(towerX, roofBaseY + towerH + 5.5, towerZ), 0.08, mats.metalSilver));

  floorGroups.push(roof);
  root.add(roof);

  return {
    root,
    floorGroups,
    defaultCameraPos: new THREE.Vector3(26, 22, 46),
    targetLookAt: new THREE.Vector3(0, 8.0, -12),
    explodeSpacing: 4.5,
  };
}
