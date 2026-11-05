// ─────────────────────────────────────────────────────────────────────────────
// shsModel.ts – Procedural 3D model of the UdD School of Health Sciences
//
// Modelled directly from the 5 on-site reference photographs:
//   • 7-bay, 3-storey + covered roof-deck academic & clinical building
//     fronting the street.
//   • Signature white/cream spandrel bands on 2F & 3F painted with diagonal
//     slate-grey triangular wedges in every bay above bright sky-blue ledges.
//   • Characteristic stepped / split sky-blue sun-canopy hoods (awning ledges)
//     with vertical drop fins between 2F and 3F across all 7 bays.
//   • Dual multi-pane bronze/brown-framed casement window grids per bay with
//     white window-type AC units mounted on black steel brackets in the upper
//     window corners, plus outward-hinged open casement sashes on the right bay.
//   • Vertical grey concrete pilasters with full-height PVC rainwater downspouts.
//   • Ground floor:
//       - Bays 1–6: recessed dark-tinted low window strips with black iron
//         security grilles behind a continuous white-curbed concrete planter
//         filled with lush green bushes, "NO PARKING" stand, and yellow bollards.
//       - Bay 7 (far right): recessed dark navy-blue 4-leaf steel entrance gate
//         bearing the circular Universidad de Dagupan seal on a white plate,
//         overhead UDD sign & fluorescent tube light, angled sky-blue portal
//         canopy, hanging vertical UdD SHS signboard, and twin round electric
//         meters with an orange PVC conduit pipe.
//   • Rooftop (4th level):
//       - Tall cream parapet band framed in sky-blue borders and bay dividers.
//       - Bays 1–6: open-air covered rooftop deck under a maroon / dark-red
//         corrugated metal roof with red gable end on the left.
//       - Bay 7 (far right): raised white concrete flat-roof penthouse slab
//         with gooseneck floodlight.
//   • Neighboring context: 2-storey cream & brick-tile building on the left
//     with "NO PARKING / DO NOT BLOCK DRIVEWAY" sign, and adjacent house &
//     utility poles along the street.
//
// Exploded view: floorGroups = [Ground Floor & Site, 2nd Floor, 3rd Floor, Rooftop & Parapet].
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { getMaterials, createEmblemTexture, type Building3DResult } from './proceduralModels';

const PALETTE = {
  cream: '#f2eee4',
  creamDark: '#e4dfd3',
  skyBlue: '#2582d8',
  skyBlueDark: '#1b64ad',
  wedgeGrey: '#7d858f',
  pilasterGrey: '#9098a0',
  pipeGrey: '#7a828a',
  windowFrame: '#3a2d24',
  windowGlass: '#262322',
  windowReflect: '#4a433e',
  navyGate: '#13223f',
  roofRed: '#7b1e24',
  roofRedDark: '#5c1419',
  shrubGreen: '#356f28',
  shrubLight: '#498c39',
  planterWhite: '#e8e6e0',
  brickTan: '#b88662',
};

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

/**
 * Creates the diagonal grey wedge spandrel texture seen under every bay's
 * 2F and 3F windows: cream background with a slate-grey right-pointing wedge
 * sweeping from bottom-left to right.
 */
function createDiagonalWedgeSpandrelTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 128;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(0, 0, W, H);

  // Diagonal grey triangle wedge from left to right-bottom
  ctx.fillStyle = PALETTE.wedgeGrey;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(W - 12, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Subtle top sill shadow line
  ctx.fillStyle = '#c8c3b8';
  ctx.fillRect(0, 0, W, 6);

  return toTexture(canvas);
}

/**
 * Creates a multi-pane brown/bronze casement window grid texture (4 cols x 3 rows)
 * with warm-dark tinted glass and subtle interior blinds/reflections.
 */
function createMultiPaneWindowTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 384;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = PALETTE.windowFrame;
  ctx.fillRect(0, 0, W, H);

  const cols = 4;
  const rows = 3;
  const pad = 6;
  const cellW = (W - pad * (cols + 1)) / cols;
  const cellH = (H - pad * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = pad + c * (cellW + pad);
      const y = pad + r * (cellH + pad);
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, '#2a2625');
      grad.addColorStop(0.55, '#3b3532');
      grad.addColorStop(1, '#1f1c1b');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, cellW, cellH);

      // Subtle horizontal mullion bar inside each casement pane
      ctx.fillStyle = PALETTE.windowFrame;
      ctx.fillRect(x, y + cellH * 0.5, cellW, 3);
    }
  }

  return toTexture(canvas);
}

/**
 * Creates the white window-type air conditioner front grille texture.
 */
function createACFrontTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 160;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#e8ecef';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#9aa3ab';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, W - 6, H - 6);

  // Left louvered vent grille
  ctx.fillStyle = '#cfd6dc';
  ctx.fillRect(14, 14, 165, H - 28);
  ctx.fillStyle = '#6c757d';
  for (let y = 20; y < H - 20; y += 8) {
    ctx.fillRect(18, y, 157, 3);
  }

  // Right control panel + dark vent slot
  ctx.fillStyle = '#2d343b';
  ctx.fillRect(190, 18, 48, 65);
  ctx.fillStyle = '#adb5bd';
  ctx.fillRect(190, 95, 48, 45);

  return toTexture(canvas);
}

/**
 * Creates the vertical hanging "UNIVERSIDAD DE DAGUPAN - SCHOOL OF HEALTH SCIENCES"
 * signboard texture mounted on the right entrance column.
 */
function createSHSSignboardTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, W - 10, H - 10);

  // Top UDD circular emblem
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.arc(W / 2, 70, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UDD', W / 2, 77);

  // Header text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('UNIVERSIDAD', W / 2, 145);
  ctx.fillText('DE DAGUPAN', W / 2, 170);

  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(28, 190, W - 56, 6);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('SCHOOL OF', W / 2, 232);
  ctx.fillText('HEALTH', W / 2, 260);
  ctx.fillText('SCIENCES', W / 2, 288);

  // Course lines below
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 14px sans-serif';
  const lines = ['BS NURSING', 'BS PHARMACY', 'BS MEDICAL TECH', 'CAMPUS CLINIC', 'HEALTH LABS'];
  lines.forEach((line, idx) => {
    ctx.fillText(line, W / 2, 335 + idx * 30);
  });

  return toTexture(canvas);
}

/**
 * Creates the yellow & red "NO PARKING / DO NOT BLOCK DRIVEWAY" sign texture
 * on the left neighboring driveway post.
 */
function createNoParkingDrivewayTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 320;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, W - 10, H - 10);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(14, 18, W - 28, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NO PARKING', W / 2, 60);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('DO NOT BLOCK', W / 2, 135);
  ctx.fillText('DRIVEWAY', W / 2, 175);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(36, 215, W - 72, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('TOW-AWAY ZONE', W / 2, 246);

  return toTexture(canvas);
}

/**
 * Creates the portable white "NO PARKING" sign texture in front of the planter.
 */
function createWhiteNoParkingTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 160;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NO', W / 2, 64);
  ctx.fillText('PARKING', W / 2, 116);

  return toTexture(canvas);
}

/**
 * Creates the tan brick-tile spandrel texture for the 2-storey neighbor building on the left.
 */
function createBrickTileTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 128;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#c29979';
  ctx.fillRect(0, 0, W, H);

  const rows = 6;
  const cols = 6;
  const bh = H / rows;
  const bw = W / cols;
  for (let r = 0; r < rows; r++) {
    for (let c = -1; c <= cols; c++) {
      const x = c * bw + (r % 2 === 0 ? 0 : bw * 0.5);
      const y = r * bh;
      ctx.fillStyle = (r + c) % 2 === 0 ? '#b37d56' : '#c9936b';
      ctx.fillRect(x + 2, y + 2, bw - 4, bh - 4);
    }
  }
  return toTexture(canvas);
}

/**
 * Corrugated red metal roof texture.
 */
function createCorrugatedRedRoofTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = PALETTE.roofRed;
  ctx.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 8) {
    ctx.fillStyle = x % 16 === 0 ? '#8f242b' : '#63151a';
    ctx.fillRect(x, 0, 4, H);
  }
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
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true;
  return m;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDING: UdD School of Health Sciences (SHS)
// ─────────────────────────────────────────────────────────────────────────────
export function buildSHSBuilding3D(): Building3DResult {
  const root = new THREE.Group();
  root.name = 'UDD_SHS_Building_Root';
  const mats = getMaterials();
  const floorGroups: THREE.Group[] = [];

  // Building dimensions (7 structural bays across the street facade)
  const numBays = 7;
  const bayW = 4.2;
  const totalW = numBays * bayW; // 29.4m
  const startX = -totalW / 2; // -14.7
  const endX = totalW / 2; // +14.7
  const depth = 13.5;
  const frontZ = 5.0;
  const backZ = frontZ - depth; // -8.5
  const centerZ = (frontZ + backZ) / 2; // -1.75

  const groundH = 2.6;
  const floor2H = 3.5;
  const floor3H = 3.5;
  const parapetH = 1.35;

  // Shared materials
  const creamMat = new THREE.MeshStandardMaterial({ color: PALETTE.cream, roughness: 0.75 });
  const creamDarkMat = new THREE.MeshStandardMaterial({ color: PALETTE.creamDark, roughness: 0.8 });
  const skyBlueMat = new THREE.MeshStandardMaterial({ color: PALETTE.skyBlue, roughness: 0.45, metalness: 0.15 });
  const skyBlueDarkMat = new THREE.MeshStandardMaterial({ color: PALETTE.skyBlueDark, roughness: 0.5, metalness: 0.15 });
  const pilasterMat = new THREE.MeshStandardMaterial({ color: PALETTE.pilasterGrey, roughness: 0.7 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: PALETTE.pipeGrey, roughness: 0.4, metalness: 0.3 });
  const spandrelWedgeMat = new THREE.MeshStandardMaterial({
    map: createDiagonalWedgeSpandrelTexture(),
    roughness: 0.65,
  });
  const windowGridMat = new THREE.MeshStandardMaterial({
    map: createMultiPaneWindowTexture(),
    roughness: 0.25,
    metalness: 0.45,
  });
  const windowFrameMat = new THREE.MeshStandardMaterial({ color: PALETTE.windowFrame, roughness: 0.55 });
  const acFrontMat = new THREE.MeshStandardMaterial({ map: createACFrontTexture(), roughness: 0.4 });
  const acBodyMat = new THREE.MeshStandardMaterial({ color: '#e6eaee', roughness: 0.5 });
  const bracketMat = new THREE.MeshStandardMaterial({ color: '#1e242b', roughness: 0.6, metalness: 0.5 });
  const navyGateMat = new THREE.MeshStandardMaterial({ color: PALETTE.navyGate, roughness: 0.45, metalness: 0.5 });
  const redRoofMat = new THREE.MeshStandardMaterial({
    map: createCorrugatedRedRoofTexture(),
    roughness: 0.55,
    metalness: 0.3,
  });
  const redFasciaMat = new THREE.MeshStandardMaterial({ color: PALETTE.roofRedDark, roughness: 0.5 });
  const planterMat = new THREE.MeshStandardMaterial({ color: PALETTE.planterWhite, roughness: 0.85 });
  const shrubMat1 = new THREE.MeshStandardMaterial({ color: PALETTE.shrubGreen, roughness: 0.9 });
  const shrubMat2 = new THREE.MeshStandardMaterial({ color: PALETTE.shrubLight, roughness: 0.9 });
  const roadConcreteMat = new THREE.MeshStandardMaterial({ color: '#9ca3ab', roughness: 0.92 });
  const roadAsphaltMat = new THREE.MeshStandardMaterial({ color: '#393e46', roughness: 0.95 });
  const manholeMat = new THREE.MeshStandardMaterial({ color: '#6c737a', roughness: 0.85, metalness: 0.2 });
  const orangePipeMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.4 });
  const yellowBollardMat = new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.4, metalness: 0.3 });
  const glowLightMat = new THREE.MeshBasicMaterial({ color: '#f8fafc' });

  // Helper to add a window-type AC unit with black steel triangular wall brackets
  const addWindowAC = (parent: THREE.Group, x: number, y: number, z: number) => {
    const acW = 0.68;
    const acH = 0.44;
    const acD = 0.55;
    const acMats = [acBodyMat, acBodyMat, acBodyMat, acBodyMat, acFrontMat, acBodyMat];
    parent.add(box(acW, acH, acD, acMats, x, y, z + acD / 2 - 0.08));
    // Left & right black angled support brackets underneath AC
    [-0.24, 0.24].forEach((dx) => {
      parent.add(box(0.04, 0.04, acD * 0.85, bracketMat, x + dx, y - acH / 2 - 0.02, z + acD * 0.35, false));
      parent.add(
        rod(
          new THREE.Vector3(x + dx, y - acH / 2 - 0.38, z + 0.02),
          new THREE.Vector3(x + dx, y - acH / 2 - 0.02, z + acD * 0.72),
          0.018,
          bracketMat
        )
      );
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 0: GROUND FLOOR, PLANTER, NAVY GATE, ROAD & NEIGHBORING CONTEXT
  // ═══════════════════════════════════════════════════════════════════════════
  const groundGroup = new THREE.Group();
  groundGroup.name = 'SHS_Ground_Floor';

  // Street pavement & dark asphalt center lane (as seen in Photos 4 & 5)
  groundGroup.add(box(58, 0.3, 42, roadConcreteMat, 0, -0.15, 2, false));
  groundGroup.add(box(58, 0.04, 5.2, roadAsphaltMat, 0, 0.01, 13.8, false));

  // Concrete utility / drainage double manhole covers along the driveway apron
  [-11.5, -5.5, 0.8, 6.4, 11.8].forEach((mx) => {
    groundGroup.add(box(1.35, 0.03, 0.78, manholeMat, mx, 0.02, 8.6, false));
    groundGroup.add(box(0.58, 0.035, 0.64, roadConcreteMat, mx - 0.31, 0.022, 8.6, false));
    groundGroup.add(box(0.58, 0.035, 0.64, roadConcreteMat, mx + 0.31, 0.022, 8.6, false));
  });

  // Main Ground Floor Building Volume (Bays 1–6 solid recessed base, Bay 7 entrance bay)
  const bays1to6W = 6 * bayW; // 25.2m
  const bays1to6Cx = startX + bays1to6W / 2; // -2.1
  groundGroup.add(box(bays1to6W, groundH, depth - 0.4, creamMat, bays1to6Cx, groundH / 2, centerZ - 0.2));

  // Bays 1–6 Ground-level dark horizontal windows & black iron security grilles
  for (let b = 0; b < 6; b++) {
    const bx = startX + (b + 0.5) * bayW;
    // Center dark horizontal basement/ground window
    groundGroup.add(box(2.3, 0.72, 0.08, windowGridMat, bx, 1.35, frontZ - 0.36, false));
    // Flanking square grilled vent windows with black iron bars
    [-1.55, 1.55].forEach((dx) => {
      const gx = bx + dx;
      groundGroup.add(box(0.68, 0.68, 0.06, windowFrameMat, gx, 1.35, frontZ - 0.36, false));
      for (let bar = -0.22; bar <= 0.22; bar += 0.11) {
        groundGroup.add(box(0.02, 0.66, 0.08, bracketMat, gx + bar, 1.35, frontZ - 0.33, false));
        groundGroup.add(box(0.66, 0.02, 0.08, bracketMat, gx, 1.35 + bar, frontZ - 0.33, false));
      }
    });
  }

  // Continuous white-curbed concrete planter box in front of Bays 1–6
  const planterZ = frontZ + 0.65;
  const planterW = bays1to6W - 0.3;
  groundGroup.add(box(planterW, 0.48, 1.25, planterMat, bays1to6Cx, 0.24, planterZ));

  // Lush green shrubs/bushes along the planter box
  for (let sx = startX + 0.7; sx < startX + bays1to6W - 0.5; sx += 0.85) {
    const mat = Math.round(sx * 10) % 2 === 0 ? shrubMat1 : shrubMat2;
    const r = 0.48 + (Math.sin(sx * 3.1) + 1) * 0.12;
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
    bush.scale.set(1.15, 0.85, 0.9);
    bush.position.set(sx, 0.68, planterZ + 0.05);
    bush.castShadow = true;
    groundGroup.add(bush);
  }

  // Portable white "NO PARKING" sign on concrete blocks + yellow bollards in front of planter
  const npSignX = startX + 5 * bayW + 0.2;
  const npSignZ = planterZ + 0.95;
  groundGroup.add(box(0.76, 0.48, 0.06, new THREE.MeshStandardMaterial({ map: createWhiteNoParkingTexture() }), npSignX, 0.42, npSignZ));
  groundGroup.add(box(0.22, 0.16, 0.22, roadConcreteMat, npSignX - 0.2, 0.08, npSignZ));
  groundGroup.add(box(0.22, 0.16, 0.22, roadConcreteMat, npSignX + 0.2, 0.08, npSignZ));
  // Yellow safety bollards
  [startX + 2.2 * bayW, startX + 4.3 * bayW, startX + 5.8 * bayW].forEach((bx) => {
    groundGroup.add(rod(new THREE.Vector3(bx, 0, planterZ + 0.95), new THREE.Vector3(bx, 0.85, planterZ + 0.95), 0.04, yellowBollardMat));
    groundGroup.add(box(0.24, 0.08, 0.24, yellowBollardMat, bx, 0.04, planterZ + 0.95));
  });

  // ── Bay 7 (Far Right): Recessed Dark Navy-Blue 4-Panel Entrance Gate & UDD Seal ──
  const bay7Cx = startX + 6.5 * bayW; // 12.6
  groundGroup.add(box(bayW, groundH, depth - 1.2, creamMat, bay7Cx, groundH / 2, centerZ - 0.6));

  // Navy-blue 4-leaf steel gate
  const gateZ = frontZ - 0.55;
  const gateW = bayW - 0.45;
  const gateH = 2.15;
  groundGroup.add(box(gateW, gateH, 0.1, navyGateMat, bay7Cx, gateH / 2, gateZ));
  // 4 gate leaf divider frames & top grille bars
  for (let leaf = 0; leaf <= 4; leaf++) {
    const lx = bay7Cx - gateW / 2 + (gateW / 4) * leaf;
    groundGroup.add(box(0.05, gateH, 0.14, bracketMat, lx, gateH / 2, gateZ + 0.01, false));
  }
  groundGroup.add(box(gateW, 0.06, 0.14, bracketMat, bay7Cx, gateH - 0.35, gateZ + 0.01, false));

  // White square backing plate + circular Universidad de Dagupan seal on the 3rd/4th gate panel
  const sealX = bay7Cx + 0.92;
  const sealY = 1.18;
  groundGroup.add(box(0.66, 0.66, 0.03, mats.whiteWall, sealX, sealY, gateZ + 0.06, false));
  const gateSeal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.04, 36),
    new THREE.MeshStandardMaterial({ map: createEmblemTexture(), roughness: 0.3 })
  );
  gateSeal.rotation.x = Math.PI / 2;
  gateSeal.position.set(sealX, sealY, gateZ + 0.08);
  groundGroup.add(gateSeal);

  // Overhead UDD sign header & glowing fluorescent tube light above gate
  groundGroup.add(box(1.1, 0.24, 0.1, bracketMat, bay7Cx - 0.45, groundH - 0.18, frontZ - 0.05, false));
  groundGroup.add(box(0.95, 0.07, 0.08, glowLightMat, bay7Cx + 0.45, groundH - 0.15, frontZ - 0.02, false));

  // Continuous sky-blue canopy ledge above Ground Floor (Bays 1–6 + angled Bay 7 portal hood)
  const canopy1Y = groundH + 0.08;
  groundGroup.add(box(bays1to6W + 0.2, 0.22, 0.95, skyBlueMat, bays1to6Cx, canopy1Y, frontZ + 0.35));
  groundGroup.add(box(bayW + 0.3, 0.22, 1.15, skyBlueMat, bay7Cx, canopy1Y, frontZ + 0.45));
  // Distinctive upward-angled blue portal fin on the far-right above the electric meters (Photo 1)
  const finMesh = box(0.95, 0.72, 0.95, skyBlueMat, endX - 0.35, canopy1Y + 0.32, frontZ + 0.35);
  finMesh.rotation.z = -0.25;
  groundGroup.add(finMesh);

  // Twin round electric watt-hour meters + orange PVC conduit pipe on the far-right column
  [endX - 0.48, endX - 0.18].forEach((mx) => {
    groundGroup.add(box(0.24, 0.32, 0.16, pilasterMat, mx, canopy1Y + 0.05, frontZ + 0.86));
    const meterGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 20), windowGridMat);
    meterGlass.rotation.x = Math.PI / 2;
    meterGlass.position.set(mx, canopy1Y + 0.07, frontZ + 0.95);
    groundGroup.add(meterGlass);
  });
  // Orange PVC conduit pipe rising from meters up the right pilaster
  groundGroup.add(
    rod(
      new THREE.Vector3(endX - 0.2, canopy1Y + 0.22, frontZ + 0.75),
      new THREE.Vector3(endX - 0.15, groundH + floor2H + 0.5, frontZ + 0.25),
      0.035,
      orangePipeMat
    )
  );

  // Hanging vertical "UNIVERSIDAD DE DAGUPAN - SCHOOL OF HEALTH SCIENCES" signboard on right column
  const signMat = new THREE.MeshStandardMaterial({ map: createSHSSignboardTexture(), roughness: 0.35 });
  groundGroup.add(box(0.12, 1.65, 0.85, [bracketMat, bracketMat, bracketMat, bracketMat, signMat, signMat], endX + 0.05, groundH + 1.35, frontZ + 0.65));

  // 8 Vertical grey concrete pilasters + PVC rainwater downspouts spanning the facade
  const totalFacadeH = groundH + floor2H + floor3H;
  for (let i = 0; i <= numBays; i++) {
    const px = startX + i * bayW;
    groundGroup.add(box(0.32, groundH, 0.35, pilasterMat, px, groundH / 2, frontZ + 0.05));
    // PVC downspout pipe along each pilaster
    groundGroup.add(
      rod(
        new THREE.Vector3(px + 0.06, 0.2, frontZ + 0.24),
        new THREE.Vector3(px + 0.06, groundH, frontZ + 0.24),
        0.045,
        pipeMat
      )
    );
  }

  // ── Left Neighboring 2-Storey Cream & Brick-Tile Building (Photos 4 & 5) ──
  const leftBldgW = 9.5;
  const leftBldgCx = startX - leftBldgW / 2 - 0.1;
  const leftBldgH = 6.6;
  groundGroup.add(box(leftBldgW, leftBldgH, depth - 1.0, creamDarkMat, leftBldgCx, leftBldgH / 2, centerZ - 0.3));
  // 2F overhang slab & weathered top parapet
  groundGroup.add(box(leftBldgW + 0.2, 0.32, 1.2, creamMat, leftBldgCx, 3.1, frontZ + 0.4));
  groundGroup.add(box(leftBldgW + 0.2, 0.95, 0.35, pilasterMat, leftBldgCx, leftBldgH + 0.45, frontZ + 0.25));
  // 3 white-framed 2F windows with tan brick-tile spandrel panels underneath
  const brickMat = new THREE.MeshStandardMaterial({ map: createBrickTileTexture(), roughness: 0.85 });
  [-2.8, 0, 2.8].forEach((dx) => {
    const wx = leftBldgCx + dx;
    groundGroup.add(box(1.85, 1.15, 0.08, windowGridMat, wx, 5.1, frontZ + 0.22, false));
    groundGroup.add(box(1.95, 0.08, 0.12, mats.whiteWall, wx, 5.7, frontZ + 0.24, false));
    groundGroup.add(box(1.95, 0.08, 0.12, mats.whiteWall, wx, 4.5, frontZ + 0.24, false));
    groundGroup.add(box(2.1, 1.1, 0.08, brickMat, wx, 3.85, frontZ + 0.22, false));
  });
  // Ground-level double cream entrance doors & decorative iron-grilled window
  groundGroup.add(box(1.8, 2.2, 0.08, creamMat, leftBldgCx + 1.8, 1.2, frontZ - 0.65, false));
  groundGroup.add(box(2.4, 1.3, 0.08, windowGridMat, leftBldgCx - 2.0, 1.5, frontZ - 0.65, false));
  groundGroup.add(box(2.5, 0.75, 0.1, brickMat, leftBldgCx - 2.0, 0.4, frontZ - 0.62, false));
  // Yellow & Red "NO PARKING / DO NOT BLOCK DRIVEWAY" sign on boundary column
  groundGroup.add(
    box(
      0.85,
      1.05,
      0.06,
      new THREE.MeshStandardMaterial({ map: createNoParkingDrivewayTexture(), roughness: 0.4 }),
      startX - 0.45,
      1.45,
      frontZ + 0.65
    )
  );

  // ── Right Neighboring Small House & Utility Pole (Photos 1 & 3) ──
  const rightHouseW = 6.5;
  const rightHouseCx = endX + rightHouseW / 2 + 0.3;
  groundGroup.add(box(rightHouseW, 2.9, 9.0, new THREE.MeshStandardMaterial({ color: '#e6c29f', roughness: 0.9 }), rightHouseCx, 1.45, centerZ));
  groundGroup.add(box(rightHouseW, 2.4, 9.0, creamDarkMat, rightHouseCx, 4.1, centerZ));
  groundGroup.add(box(rightHouseW + 0.6, 0.25, 9.8, redFasciaMat, rightHouseCx, 5.4, centerZ));

  // Street utility pole on right with crossbars
  groundGroup.add(rod(new THREE.Vector3(endX + 4.5, 0, frontZ + 4.8), new THREE.Vector3(endX + 4.5, 13.5, frontZ + 4.8), 0.16, pilasterMat));
  groundGroup.add(box(2.4, 0.12, 0.12, bracketMat, endX + 4.5, 12.2, frontZ + 4.8));

  floorGroups.push(groundGroup);
  root.add(groundGroup);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FOR 2ND FLOOR & 3RD FLOOR (7 BAYS WITH DIAGONAL WEDGES, WINDOWS, ACs & STEPPED CANOPIES)
  // ═══════════════════════════════════════════════════════════════════════════
  const buildUpperAcademicFloor = (floorNum: 2 | 3, baseY: number, floorH: number): THREE.Group => {
    const fg = new THREE.Group();
    fg.name = `SHS_${floorNum}F`;

    const spandrelH = 0.92;
    const winH = 1.95;
    const upperHeaderH = floorH - spandrelH - winH; // ~0.63m

    // Core floor volume
    fg.add(box(totalW, floorH, depth, creamMat, 0, baseY + floorH / 2, centerZ));

    for (let b = 0; b < numBays; b++) {
      const bayLeftX = startX + b * bayW;
      const bayCx = bayLeftX + bayW / 2;
      const px = bayLeftX;

      // Pilaster column & PVC downspout segment for this floor
      fg.add(box(0.32, floorH, 0.35, pilasterMat, px, baseY + floorH / 2, frontZ + 0.05));
      fg.add(
        rod(
          new THREE.Vector3(px + 0.06, baseY, frontZ + 0.24),
          new THREE.Vector3(px + 0.06, baseY + floorH, frontZ + 0.24),
          0.045,
          pipeMat
        )
      );

      // 1. Spandrel wall with signature diagonal grey triangular wedge
      fg.add(box(bayW - 0.28, spandrelH, 0.12, spandrelWedgeMat, bayCx, baseY + spandrelH / 2, frontZ + 0.04));

      // 2. Two large multi-pane brown-framed casement window units per bay
      const winW = (bayW - 0.56) / 2; // ~1.82m each
      const winY = baseY + spandrelH + winH / 2;
      const leftWinX = bayCx - winW / 2 - 0.05;
      const rightWinX = bayCx + winW / 2 + 0.05;

      fg.add(box(winW, winH, 0.1, windowGridMat, leftWinX, winY, frontZ + 0.03, false));
      fg.add(box(winW, winH, 0.1, windowGridMat, rightWinX, winY, frontZ + 0.03, false));
      // Center mullion & window frame trim
      fg.add(box(0.1, winH, 0.14, windowFrameMat, bayCx, winY, frontZ + 0.04, false));

      // Outward-hinged open casement window sashes on Bay 7 (far right bay, matching Photo 1)
      if (b === 6) {
        const sashL = box(0.45, 0.95, 0.04, windowFrameMat, leftWinX - 0.35, winY - 0.15, frontZ + 0.26);
        sashL.rotation.y = -0.65;
        fg.add(sashL);
        const sashR = box(0.45, 0.95, 0.04, windowFrameMat, leftWinX + 0.45, winY - 0.15, frontZ + 0.26);
        sashR.rotation.y = 0.65;
        fg.add(sashR);
      }

      // 3. White Window-Type Air Conditioner (AC) Units mounted in upper window corners
      const acY = baseY + spandrelH + winH - 0.28;
      if (b < 6) {
        // Bays 1–6 have paired AC units near the pilaster columns (as seen in Photos 1–5)
        addWindowAC(fg, leftWinX - winW / 2 + 0.38, acY, frontZ + 0.06);
        if (b !== 5 || floorNum === 2) {
          addWindowAC(fg, rightWinX + winW / 2 - 0.38, acY, frontZ + 0.06);
        }
      }

      // 4. Upper header band above windows
      fg.add(box(bayW - 0.28, upperHeaderH, 0.12, creamMat, bayCx, baseY + spandrelH + winH + upperHeaderH / 2, frontZ + 0.04));

      // 5. Overhang Sun-Canopy Hoods at the top of the floor
      const topY = baseY + floorH;
      if (floorNum === 2) {
        // Signature stepped / split sky-blue sun-canopy between 2F and 3F!
        // Left half of bay sits slightly higher (+0.22m), right half steps down with vertical blue drop fin
        const halfBayW = (bayW - 0.16) / 2;
        fg.add(box(halfBayW, 0.16, 0.95, skyBlueMat, bayCx - halfBayW / 2, topY + 0.14, frontZ + 0.45));
        fg.add(box(halfBayW, 0.16, 0.95, skyBlueMat, bayCx + halfBayW / 2, topY - 0.08, frontZ + 0.45));
        // Vertical sky-blue drop fins at center step and bay edges
        fg.add(box(0.12, 0.36, 0.95, skyBlueDarkMat, bayCx, topY + 0.03, frontZ + 0.45));
        fg.add(box(0.12, 0.32, 0.95, skyBlueDarkMat, bayLeftX + 0.12, topY + 0.05, frontZ + 0.45));
      } else {
        // Continuous deep sky-blue soffit & fascia ledge above 3F windows
        fg.add(box(bayW, 0.24, 1.05, skyBlueMat, bayCx, topY - 0.06, frontZ + 0.48));
        fg.add(box(0.24, 0.55, 0.45, skyBlueDarkMat, bayLeftX, topY - 0.28, frontZ + 0.22));
      }
    }

    // Rightmost end pilaster & downspout
    fg.add(box(0.32, floorH, 0.35, pilasterMat, endX, baseY + floorH / 2, frontZ + 0.05));
    fg.add(
      rod(
        new THREE.Vector3(endX - 0.06, baseY, frontZ + 0.24),
        new THREE.Vector3(endX - 0.06, baseY + floorH, frontZ + 0.24),
        0.045,
        pipeMat
      )
    );

    return fg;
  };

  // Build 2nd Floor & 3rd Floor
  const floor2Group = buildUpperAcademicFloor(2, groundH, floor2H);
  floorGroups.push(floor2Group);
  root.add(floor2Group);

  const floor3Group = buildUpperAcademicFloor(3, groundH + floor2H, floor3H);
  floorGroups.push(floor3Group);
  root.add(floor3Group);

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 3: 4TH LEVEL PARAPET FASCIA, RED COVERED ROOF DECK & RIGHT PENTHOUSE
  // ═══════════════════════════════════════════════════════════════════════════
  const roofGroup = new THREE.Group();
  roofGroup.name = 'SHS_Roof_Level';
  const roofBaseY = groundH + floor2H + floor3H; // 9.6m

  // 1. Full-width cream parapet wall framed with sky-blue top/bottom bands & vertical bay strips
  roofGroup.add(box(totalW + 0.4, parapetH, 0.45, creamMat, 0, roofBaseY + parapetH / 2, frontZ + 0.42));
  // Bottom sky-blue sill border & top sky-blue coping border
  roofGroup.add(box(totalW + 0.48, 0.16, 0.52, skyBlueMat, 0, roofBaseY + 0.08, frontZ + 0.42));
  roofGroup.add(box(totalW + 0.48, 0.16, 0.52, skyBlueMat, 0, roofBaseY + parapetH - 0.08, frontZ + 0.42));
  // Side parapet returns (left & right walls)
  roofGroup.add(box(0.45, parapetH, depth + 0.8, creamMat, startX - 0.05, roofBaseY + parapetH / 2, centerZ));
  roofGroup.add(box(0.48, 0.16, depth + 0.85, skyBlueMat, startX - 0.05, roofBaseY + parapetH - 0.08, centerZ));
  roofGroup.add(box(0.45, parapetH, depth + 0.8, creamMat, endX + 0.05, roofBaseY + parapetH / 2, centerZ));
  roofGroup.add(box(0.48, 0.16, depth + 0.85, skyBlueMat, endX + 0.05, roofBaseY + parapetH - 0.08, centerZ));

  // Vertical sky-blue divider strips on the parapet aligned with each of the 7 bays
  for (let i = 0; i <= numBays; i++) {
    const px = startX + i * bayW;
    roofGroup.add(box(0.18, parapetH, 0.5, skyBlueMat, px, roofBaseY + parapetH / 2, frontZ + 0.42));
  }

  // Rooftop slab floor
  roofGroup.add(box(totalW, 0.3, depth, roadConcreteMat, 0, roofBaseY + 0.15, centerZ));

  // 2. Bays 1–6 Open-Air Covered Rooftop Deck with Maroon / Crimson Corrugated Metal Roof
  const redRoofW = 6 * bayW + 0.6; // Covers Bays 1–6
  const redRoofCx = startX + (6 * bayW) / 2;
  const roofPostTopY = roofBaseY + parapetH + 0.78;

  // White/grey steel roof support posts visible in the gap between the parapet and red roof
  for (let i = 0; i <= 6; i++) {
    const px = startX + i * bayW;
    roofGroup.add(
      rod(
        new THREE.Vector3(px, roofBaseY + parapetH, frontZ + 0.35),
        new THREE.Vector3(px, roofPostTopY, frontZ + 0.35),
        0.045,
        mats.whiteWall
      )
    );
  }

  // Sloped maroon/red corrugated metal roof deck over Bays 1–6
  const mainRedRoof = box(redRoofW, 0.14, depth + 1.4, redRoofMat, redRoofCx, roofPostTopY + 0.25, centerZ + 0.2);
  mainRedRoof.rotation.x = 0.04;
  roofGroup.add(mainRedRoof);
  // Prominent crimson-red front fascia board & soffit lip (as seen in Photos 1–5)
  roofGroup.add(box(redRoofW + 0.1, 0.28, 0.18, redFasciaMat, redRoofCx, roofPostTopY + 0.05, frontZ + 0.92));
  roofGroup.add(box(0.18, 0.32, depth + 1.4, redFasciaMat, startX - 0.25, roofPostTopY + 0.22, centerZ + 0.2));

  // Left-side red corrugated gable wall enclosure (visible in Photos 4 & 5)
  roofGroup.add(box(0.22, 1.35, depth - 1.5, redRoofMat, startX + 0.1, roofBaseY + parapetH + 0.5, centerZ - 0.4));

  // 3. Bay 7 (Far-Right Bay) Raised White Concrete Penthouse Flat-Roof Overhang (Photos 1 & 3)
  const pentW = bayW + 0.5;
  const pentCx = bay7Cx + 0.1;
  const pentY = roofPostTopY + 0.48;
  // Supporting walls/columns under the raised penthouse slab
  roofGroup.add(box(pentW - 0.3, 1.05, depth - 0.8, creamMat, pentCx, roofBaseY + parapetH + 0.45, centerZ));
  // Overhanging white concrete roof slab with recessed soffit molding
  roofGroup.add(box(pentW + 0.35, 0.28, depth + 1.3, mats.whiteWall, pentCx, pentY, centerZ + 0.25));
  roofGroup.add(box(pentW + 0.1, 0.12, depth + 1.0, creamDarkMat, pentCx, pentY - 0.16, centerZ + 0.25));

  // Gooseneck floodlight on the top-right corner of the penthouse roof (visible in Photo 1)
  const lightX = endX - 0.35;
  const lightZ = frontZ + 0.75;
  roofGroup.add(rod(new THREE.Vector3(lightX, pentY + 0.14, lightZ), new THREE.Vector3(lightX, pentY + 0.75, lightZ + 0.25), 0.02, bracketMat));
  roofGroup.add(box(0.22, 0.1, 0.16, bracketMat, lightX, pentY + 0.75, lightZ + 0.32));

  floorGroups.push(roofGroup);
  root.add(roofGroup);

  return {
    root,
    floorGroups,
    defaultCameraPos: new THREE.Vector3(18, 11, 28),
    targetLookAt: new THREE.Vector3(1, 5.2, 0),
    explodeSpacing: 3.8,
  };
}

