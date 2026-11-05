// ─────────────────────────────────────────────────────────────────────────────
// engModel.ts – Procedural 3D model of the UdD Engineering Building (E-Building)
//
// Modelled directly from the 3 on-site reference photographs:
//   • 4-storey corner academic & engineering laboratory building on Arellano
//     Street, Pantal, Dagupan City.
//   • Stepped front facade massing:
//       - Left/Center Projecting Section (Bays 1–3): projects forward toward
//         the street, housing ground-floor windows (Bays 1–2) and the main
//         silver-aluminum & glass storefront entrance portal (Bay 3).
//       - Right Recessed Section (Bays 4–5): steps back (~0.75m) and its
//         cantilevered balcony slabs & top parapet step down (~0.35m).
//   • Left Return / Side Elevation (3 structural bays deep):
//       - Wrap-around cantilevered balcony bands on 2F & 3F and terracotta
//         top parapet on 4F.
//       - Two tall vertical galvanized steel laboratory exhaust/ventilation
//         duct stacks rising along the far rear-left corner past the roofline.
//   • Signature Color Palette & Horizontal Cantilevered Bands:
//       - Ground Floor (1F): crisp white upper wall, continuous horizontal
//         sky-blue (#3582c4) mid-wall stripe, slate-grey (#6e7680) lower dado
//         band, and a stepped royal-blue concrete plinth/bench along Bays 1–2.
//       - 2nd & 3rd Floors: deep cantilevered warm cream / light peach-beige
//         (#f0d8bc) concrete balcony/sun-breaker slabs with exposed underside
//         concrete cross-beams (soffit ribs) and brown/copper PVC corner
//         drainage pipes.
//       - 4th Floor Crown: wrap-around terracotta / salmon-peach (#dc8b6c)
//         top parapet fascia with recessed dark soffit bays underneath.
//   • Fenestration & HVAC:
//       - Dark bronze/black multi-pane casement window grids with outward-
//         angled open casement sashes on 2F, 3F, and 4F.
//       - White window-type air conditioner (AC) units mounted on angled steel
//         brackets protruding from the upper window panes.
//   • Main Entrance Portal (Bay 3):
//       - Full-height silver anodized aluminum frame with double glass swing
//         doors, transom grid, and "ENTRANCE" / "EXIT" header signs.
//       - Left pier: vertical UDD "DRESS CODE" infographic poster board, green
//         "NO ID / NO ENTRY" sign, and "MUST WEAR YOUR ID" notices.
//       - Right pier & alcove: bronze historical dedication plaque, blue
//         "SMOKING IS STRICTLY PROHIBITED" sign, white tiled handwashing sink,
//         and wooden security guard desk.
//   • Perimeter Black Wrought-Iron Picket Fence & Street Context:
//       - Black iron vertical picket fence & swing gates enclosing the front
//         setback, with a white/blue "YOU ARE ENTERING A NO SMOKING ZONE" sign
//         on the left corner gate and yellow "NO PARKING" signs on the pickets.
//       - Left neighbor: 2-storey lime-green house with an arched 2F loggia
//         balcony (mint interior wall & wooden balusters) + bright cyan/
//         turquoise painted concrete wall in the foreground corner.
//       - Narrow concrete street with rectangular storm-drainage manhole covers
//         and across-the-street weathered grey building with a red steel cage
//         balcony.
//
// Exploded view: floorGroups = [
//   Ground Floor, Entrance Portal & Street Context,
//   2nd Floor Classrooms & Cantilevered Cream Balcony Band,
//   3rd Floor Engineering Labs & Cantilevered Cream Balcony Band,
//   4th Floor Senior Studios, Terracotta Parapet & Side Exhaust Stacks
// ].
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { getCachedBoxGeometry, getCachedCylinderGeometry } from './geometryCache';
import { getMaterials, type Building3DResult } from './proceduralModels';

const PALETTE = {
  whiteWall: '#f4f3ee',
  creamBalcony: '#f0d8bc',
  creamBalconyDark: '#e2c6a6',
  terracottaParapet: '#dc8b6c',
  terracottaDark: '#c47557',
  skyBlueBand: '#3582c4',
  royalBlueBench: '#1d70b8',
  dadoGrey: '#6e7680',
  soffitDark: '#585c62',
  windowFrame: '#262220',
  silverAluminum: '#c8d0d8',
  copperPipe: '#9c5a3c',
  ironFence: '#1a1d21',
  limeHouse: '#9ab87a',
  mintWall: '#64d8cb',
  cyanWall: '#40cfc8',
  redCage: '#b83b3b',
  galvanizedSteel: '#b8c0c8',
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
 * Multi-pane dark bronze/black casement window grid texture.
 */
function createCasementWindowTexture(cols = 4, rows = 2): THREE.CanvasTexture {
  const W = 512;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = PALETTE.windowFrame;
  ctx.fillRect(0, 0, W, H);

  const pad = 7;
  const cellW = (W - pad * (cols + 1)) / cols;
  const cellH = (H - pad * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = pad + c * (cellW + pad);
      const y = pad + r * (cellH + pad);
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, '#1e242b');
      grad.addColorStop(0.5, '#323b44');
      grad.addColorStop(1, '#171b20');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, cellW, cellH);

      // Subtle interior horizontal muntin bar
      ctx.fillStyle = PALETTE.windowFrame;
      ctx.fillRect(x, y + cellH * 0.5, cellW, 3);
    }
  }

  return toTexture(canvas);
}

/**
 * Window-type air conditioner (AC) unit front grille texture.
 */
function createACFrontTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 160;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#e9edf0';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#9aa3ab';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, W - 6, H - 6);

  ctx.fillStyle = '#cfd6dc';
  ctx.fillRect(14, 14, 165, H - 28);
  ctx.fillStyle = '#6c757d';
  for (let y = 20; y < H - 20; y += 8) {
    ctx.fillRect(18, y, 157, 3);
  }

  ctx.fillStyle = '#2d343b';
  ctx.fillRect(190, 18, 48, 65);
  ctx.fillStyle = '#adb5bd';
  ctx.fillRect(190, 95, 48, 45);

  return toTexture(canvas);
}

/**
 * Creates the vertical UDD "DRESS CODE" poster board texture mounted on the
 * left pier of the main entrance (Photos 2 & 3).
 */
function createDressCodePosterTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 384;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, W - 6, H - 6);

  // Top header banner
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(10, 10, W - 20, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', W / 2, 28);
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('STUDENT DRESS CODE POLICY', W / 2, 46);

  // Rows of prohibited / allowed attire icons (circles + text lines)
  for (let row = 0; row < 5; row++) {
    const ry = 74 + row * 56;
    // Left text block
    ctx.fillStyle = '#334155';
    ctx.fillRect(18, ry, 105, 8);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(18, ry + 14, 90, 6);
    ctx.fillRect(18, ry + 24, 75, 6);

    // Right circular prohibited icon badges
    [155, 205].forEach((cx) => {
      ctx.beginPath();
      ctx.arc(cx, ry + 16, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#fee2e2';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#dc2626';
      ctx.stroke();
      // Diagonal slash
      ctx.beginPath();
      ctx.moveTo(cx - 12, ry + 4);
      ctx.lineTo(cx + 12, ry + 28);
      ctx.stroke();
    });
  }

  // Bottom red footer bar
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(10, H - 30, W - 20, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('STRICT COMPLIANCE IS REQUIRED', W / 2, H - 16);

  return toTexture(canvas);
}

/**
 * Creates the green & white "NO ID / NO ENTRY" sign texture on the left glass panel (Photos 2 & 3).
 */
function createNoIdNoEntryTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 160;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  ctx.fillStyle = '#15803d';
  ctx.font = '900 44px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NO ID', W / 2, 68);
  ctx.font = '900 36px Arial, sans-serif';
  ctx.fillText('NO ENTRY', W / 2, 128);

  return toTexture(canvas);
}

/**
 * Creates the white & blue "YOU ARE ENTERING A NO SMOKING ZONE" sign texture
 * mounted on the left corner black iron fence gate (Photo 1).
 */
function createNoSmokingZoneGateTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 320;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  // No-smoking red circle icon at top
  const cx = W / 2;
  const cy = 68;
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#dc2626';
  ctx.stroke();
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(cx - 20, cy - 4, 34, 8);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(cx + 14, cy - 4, 6, 8);
  ctx.beginPath();
  ctx.moveTo(cx - 26, cy - 26);
  ctx.lineTo(cx + 26, cy + 26);
  ctx.stroke();

  // Blue bold text
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOU ARE', W / 2, 148);
  ctx.fillText('ENTERING A', W / 2, 182);
  ctx.font = '900 28px Arial, sans-serif';
  ctx.fillText('NO SMOKING', W / 2, 224);
  ctx.fillText('ZONE', W / 2, 260);

  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(16, 280, W - 32, 20);

  return toTexture(canvas);
}

/**
 * Creates the yellow "NO PARKING" warning sign texture clipped to the black iron fence (Photos 2 & 3).
 */
function createYellowNoParkingTexture(): THREE.CanvasTexture {
  const W = 192;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  // Circle with P and slash
  const cx = W / 2;
  const cy = 78;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#dc2626';
  ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.font = '900 52px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('P', cx, cy + 18);
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy - 30);
  ctx.lineTo(cx + 30, cy + 30);
  ctx.stroke();

  ctx.fillStyle = '#111827';
  ctx.font = '900 24px Arial, sans-serif';
  ctx.fillText('NO PARKING', cx, 168);
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('BOTH SIDES', cx, 202);
  ctx.fillText('OF GATE', cx, 228);

  return toTexture(canvas);
}

/**
 * Creates the bronze historical dedication plaque texture on the right entrance pier (Photos 2 & 3).
 */
function createBronzePlaqueTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 320;
  const { canvas, ctx } = makeCanvas(W, H);

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#c5a063');
  grad.addColorStop(0.5, '#a37e40');
  grad.addColorStop(1, '#7c5c28');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#4a3514';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // Top circular seal relief
  ctx.beginPath();
  ctx.arc(W / 2, 64, 28, 0, Math.PI * 2);
  ctx.fillStyle = '#5c4119';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e2c185';
  ctx.stroke();

  ctx.fillStyle = '#3b280c';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ENGINEERING BUILDING', W / 2, 122);
  ctx.font = '14px Georgia, serif';
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(36, 145 + i * 22, W - 72, 6);
  }

  return toTexture(canvas);
}

/**
 * Creates the blue "SMOKING IS STRICTLY PROHIBITED" sign texture below the bronze plaque (Photos 2 & 3).
 */
function createBlueNoSmokingSignTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 192;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NO SMOKING', W / 2, 54);
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText('SMOKING & VAPING ARE', W / 2, 96);
  ctx.fillText('STRICTLY PROHIBITED', W / 2, 122);
  ctx.fillText('WITHIN CAMPUS PREMISES', W / 2, 148);

  return toTexture(canvas);
}

/**
 * Helper to create a positioned box mesh with shadow support.
 */
function box(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material | THREE.Material[],
  x = 0,
  y = 0,
  z = 0,
  castShadow = true,
  receiveShadow = true
): THREE.Mesh {
  const m = new THREE.Mesh(getCachedBoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = receiveShadow;
  return m;
}

/**
 * Helper to create a cylinder rod between two 3D points.
 */
function rod(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  radius: number,
  mat: THREE.Material
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const m = new THREE.Mesh(getCachedCylinderGeometry(radius, radius, len, 12), mat);
  m.position.copy(p1).add(p2).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true;
  return m;
}

export function buildEngineeringBuilding3D(): Building3DResult {
  const mats = getMaterials();
  const root = new THREE.Group();
  root.name = 'UDD_Engineering_Building';

  const floorGroups: THREE.Group[] = [];

  // Custom Materials
  const whiteWallMat = new THREE.MeshStandardMaterial({
    color: PALETTE.whiteWall,
    roughness: 0.75,
  });
  const creamBalconyMat = new THREE.MeshStandardMaterial({
    color: PALETTE.creamBalcony,
    roughness: 0.7,
  });
  const creamBalconyDarkMat = new THREE.MeshStandardMaterial({
    color: PALETTE.creamBalconyDark,
    roughness: 0.78,
  });
  const terracottaMat = new THREE.MeshStandardMaterial({
    color: PALETTE.terracottaParapet,
    roughness: 0.68,
  });
  const terracottaDarkMat = new THREE.MeshStandardMaterial({
    color: PALETTE.terracottaDark,
    roughness: 0.75,
  });
  const skyBlueBandMat = new THREE.MeshStandardMaterial({
    color: PALETTE.skyBlueBand,
    roughness: 0.5,
  });
  const royalBlueBenchMat = new THREE.MeshStandardMaterial({
    color: PALETTE.royalBlueBench,
    roughness: 0.45,
  });
  const dadoGreyMat = new THREE.MeshStandardMaterial({
    color: PALETTE.dadoGrey,
    roughness: 0.8,
  });
  const soffitDarkMat = new THREE.MeshStandardMaterial({
    color: PALETTE.soffitDark,
    roughness: 0.85,
  });
  const windowFrameMat = new THREE.MeshStandardMaterial({
    color: PALETTE.windowFrame,
    roughness: 0.45,
    metalness: 0.3,
  });
  const silverAlumMat = new THREE.MeshStandardMaterial({
    color: PALETTE.silverAluminum,
    roughness: 0.25,
    metalness: 0.75,
  });
  const clearDoorGlassMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.12,
    metalness: 0.35,
    transparent: true,
    opacity: 0.78,
  });
  const copperPipeMat = new THREE.MeshStandardMaterial({
    color: PALETTE.copperPipe,
    roughness: 0.5,
    metalness: 0.2,
  });
  const ironFenceMat = new THREE.MeshStandardMaterial({
    color: PALETTE.ironFence,
    roughness: 0.4,
    metalness: 0.6,
  });
  const galvanizedMat = new THREE.MeshStandardMaterial({
    color: PALETTE.galvanizedSteel,
    roughness: 0.3,
    metalness: 0.8,
  });
  const windowGridMat = new THREE.MeshStandardMaterial({
    map: createCasementWindowTexture(4, 2),
    roughness: 0.22,
    metalness: 0.35,
  });
  const acFrontMat = new THREE.MeshStandardMaterial({
    map: createACFrontTexture(),
    roughness: 0.4,
  });
  const acBodyMat = new THREE.MeshStandardMaterial({
    color: '#dfe5ea',
    roughness: 0.5,
  });

  // Helper to mount a window-type AC unit on angled steel brackets
  const addWindowAC = (
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    facing: 'front' | 'left' = 'front'
  ) => {
    const acG = new THREE.Group();
    acG.position.set(x, y, z);
    if (facing === 'left') {
      acG.rotation.y = -Math.PI / 2;
    }
    const acMaterials = [acBodyMat, acBodyMat, acBodyMat, acBodyMat, acFrontMat, acBodyMat];
    acG.add(box(0.68, 0.44, 0.56, acMaterials, 0, 0, 0.22));
    // Angled black steel support brackets underneath
    [-0.26, 0.26].forEach((bx) => {
      acG.add(box(0.04, 0.04, 0.54, ironFenceMat, bx, -0.24, 0.22, false));
      acG.add(
        rod(
          new THREE.Vector3(bx, -0.58, -0.02),
          new THREE.Vector3(bx, -0.24, 0.46),
          0.02,
          ironFenceMat
        )
      );
    });
    parent.add(acG);
  };

  // Helper to add outward-hinged open casement window sashes
  const addOpenCasementSashes = (
    parent: THREE.Group,
    wx: number,
    wy: number,
    wz: number,
    count = 2
  ) => {
    for (let i = 0; i < count; i++) {
      const offsetX = (i - (count - 1) / 2) * 0.65;
      const sash = box(0.46, 0.88, 0.04, windowFrameMat, wx + offsetX, wy, wz + 0.22);
      sash.rotation.y = i % 2 === 0 ? -0.55 : 0.55;
      parent.add(sash);
    }
  };

  // ── Building Footprint & Dimensions (+10% length) ──
  // Left/Center Main Projecting Section (Bays 1, 2, 3): X from -12.1 to +3.08 (width = 15.18m, 3 bays of 5.06m)
  // Right Recessed Section (Bays 4, 5): X from +3.08 to +12.76 (width = 9.68m, 2 bays of 4.84m)
  const leftSecStartX = -12.1;
  const leftSecEndX = 3.08;
  const leftSecW = leftSecEndX - leftSecStartX; // 15.18m (+10%)
  const leftSecCx = (leftSecStartX + leftSecEndX) / 2; // -4.51m
  const leftBayW = leftSecW / 3; // 5.06m per bay (+10%)

  const rightSecStartX = 3.08;
  const rightSecEndX = 12.76;
  const rightSecW = rightSecEndX - rightSecStartX; // 9.68m (+10%)
  const rightSecCx = (rightSecStartX + rightSecEndX) / 2; // 7.92m
  const rightBayW = rightSecW / 2; // 4.84m per bay (+10%)

  const backZ = -6.2;
  const mainFrontZ = 5.2;
  const rightFrontZ = 4.45; // Recessed by 0.75m
  const mainDepth = mainFrontZ - backZ; // 11.4m
  const rightDepth = rightFrontZ - backZ; // 10.65m
  const mainCenterZ = (mainFrontZ + backZ) / 2; // -0.5m
  const rightCenterZ = (rightFrontZ + backZ) / 2; // -0.875m

  const groundH = 3.5;
  const floor2H = 3.35;
  const floor3H = 3.35;
  const floor4H = 3.25;
  const rightStepDown = 0.34; // Right wing balcony bands step down slightly relative to main section

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 0: GROUND FLOOR, MAIN ENTRANCE PORTAL, FENCE & STREET CONTEXT
  // ═══════════════════════════════════════════════════════════════════════════
  const groundGroup = new THREE.Group();
  groundGroup.name = 'ENG_1F_Ground_And_Context';

  // Concrete street & sidewalk base slab (Arellano Street alley)
  groundGroup.add(box(48, 0.25, 32, mats.concreteGround, 0, -0.125, 2.5, false, true));
  const streetConcreteMat = new THREE.MeshStandardMaterial({ color: '#c4c7c9', roughness: 0.88 });
  groundGroup.add(box(38, 0.06, 10.5, streetConcreteMat, 0, 0.02, 10.2, false, true));

  // Rectangular concrete storm-drainage manhole covers with reddish-brown steel frames in the street (Photo 1)
  const manholeFrameMat = new THREE.MeshStandardMaterial({ color: '#8c4a3e', roughness: 0.6, metalness: 0.4 });
  [-4.2, -1.2, 3.5, 8.2].forEach((mx) => {
    groundGroup.add(box(1.55, 0.04, 0.92, manholeFrameMat, mx, 0.04, 8.4, false, true));
    groundGroup.add(box(1.42, 0.05, 0.8, streetConcreteMat, mx, 0.045, 8.4, false, true));
    groundGroup.add(box(0.04, 0.055, 0.8, manholeFrameMat, mx, 0.046, 8.4, false, true));
  });

  // Elevated concrete walkway inside the black iron fence
  groundGroup.add(box(leftSecW + rightSecW + 1.0, 0.16, 2.2, mats.concreteGround, 0.3, 0.08, mainFrontZ + 0.85, false, true));

  // ── 1. Ground Floor Core Volumes (Left Main Section + Right Recessed Section) ──
  // Upper white wall
  groundGroup.add(box(leftSecW, groundH, mainDepth, whiteWallMat, leftSecCx, groundH / 2, mainCenterZ));
  groundGroup.add(box(rightSecW, groundH, rightDepth, whiteWallMat, rightSecCx, groundH / 2, rightCenterZ));

  // Continuous horizontal sky-blue mid-wall band (y = 1.15m to 1.68m) & grey lower dado (y = 0 to 1.15m)
  // Left side wall (Z from backZ to mainFrontZ)
  groundGroup.add(box(0.08, 1.15, mainDepth + 0.08, dadoGreyMat, leftSecStartX - 0.02, 0.575, mainCenterZ));
  groundGroup.add(box(0.08, 0.52, mainDepth + 0.08, skyBlueBandMat, leftSecStartX - 0.02, 1.41, mainCenterZ));

  // Front Bays 1 & 2 (left of main entrance, X from -11.0 to -1.8)
  const bays12W = leftBayW * 2; // 9.2m
  const bays12Cx = leftSecStartX + bays12W / 2; // -6.4m
  groundGroup.add(box(bays12W, 1.15, 0.08, dadoGreyMat, bays12Cx, 0.575, mainFrontZ + 0.02));
  groundGroup.add(box(bays12W, 0.52, 0.08, skyBlueBandMat, bays12Cx, 1.41, mainFrontZ + 0.02));

  // Stepped Royal-Blue Painted Concrete Plinth / Bench along Bays 1 & 2 (Photos 1 & 3)
  groundGroup.add(box(4.62, 0.65, 0.55, royalBlueBenchMat, leftSecStartX + leftBayW * 0.52, 0.38, mainFrontZ + 0.32));
  groundGroup.add(box(4.84, 0.45, 0.55, royalBlueBenchMat, leftSecStartX + leftBayW * 1.44, 0.28, mainFrontZ + 0.32));

  // Ground-floor casement windows on Bays 1 & 2 + Left Side Wall
  [leftSecStartX + leftBayW * 0.5, leftSecStartX + leftBayW * 1.5].forEach((wx) => {
    groundGroup.add(box(3.14, 1.35, 0.1, windowGridMat, wx, 2.05, mainFrontZ + 0.04, false));
  });
  // Left side ground window (visible in Photo 1 above the cyan wall)
  groundGroup.add(box(0.1, 1.35, 2.8, windowGridMat, leftSecStartX - 0.04, 2.05, mainFrontZ - 2.3, false));

  // Front Right Recessed Section (Bays 4 & 5)
  groundGroup.add(box(rightSecW, 1.15, 0.08, dadoGreyMat, rightSecCx, 0.575, rightFrontZ + 0.02));
  groundGroup.add(box(rightSecW, 0.52, 0.08, skyBlueBandMat, rightSecCx, 1.41, rightFrontZ + 0.02));
  [rightSecStartX + rightBayW * 0.5, rightSecStartX + rightBayW * 1.5].forEach((wx) => {
    groundGroup.add(box(3.3, 1.35, 0.1, windowGridMat, wx, 2.05, rightFrontZ + 0.04, false));
  });
  // Electric meter box on far-right ground wall (Photo 2)
  groundGroup.add(box(0.38, 0.52, 0.22, dadoGreyMat, rightSecEndX - 0.35, 2.15, rightFrontZ + 0.14));

  // ── 2. Main Entrance Storefront Portal (Bay 3: X from -1.8 to +2.8, center X = +0.5) ──
  const bay3Cx = leftSecStartX + leftBayW * 2.5; // +0.5m
  const portalW = 3.55;
  const portalH = 3.25;
  const portalZ = mainFrontZ + 0.04;

  // Recessed interior lobby floor & dark interior hall
  groundGroup.add(box(portalW - 0.2, portalH - 0.1, 1.8, soffitDarkMat, bay3Cx, portalH / 2, mainFrontZ - 0.85, false));
  // Dark grey lintel beam above storefront (Photos 2 & 3)
  groundGroup.add(box(portalW + 0.3, 0.36, 0.32, dadoGreyMat, bay3Cx, groundH - 0.12, portalZ + 0.06));

  // Silver anodized aluminum outer frame, vertical mullions, and horizontal transom bars
  groundGroup.add(box(0.09, portalH, 0.14, silverAlumMat, bay3Cx - portalW / 2, portalH / 2, portalZ));
  groundGroup.add(box(0.09, portalH, 0.14, silverAlumMat, bay3Cx + portalW / 2, portalH / 2, portalZ));
  groundGroup.add(box(portalW, 0.09, 0.14, silverAlumMat, bay3Cx, portalH, portalZ));
  // Side sidelight vertical mullions
  const leftDoorPostX = bay3Cx - 0.98;
  const rightDoorPostX = bay3Cx + 0.98;
  groundGroup.add(box(0.08, portalH, 0.14, silverAlumMat, leftDoorPostX, portalH / 2, portalZ));
  groundGroup.add(box(0.08, portalH, 0.14, silverAlumMat, rightDoorPostX, portalH / 2, portalZ));
  // Center divider mullion in upper transom & door meet
  groundGroup.add(box(0.07, portalH, 0.12, silverAlumMat, bay3Cx, portalH / 2, portalZ));
  // Horizontal transom bar above doors (y = 2.25m) & upper transom bar (y = 2.75m)
  groundGroup.add(box(portalW, 0.09, 0.14, silverAlumMat, bay3Cx, 2.25, portalZ));
  groundGroup.add(box(portalW, 0.07, 0.12, silverAlumMat, bay3Cx, 2.75, portalZ));
  // Mid-rail bars on sidelights (y = 0.85m and y = 1.55m)
  [-1.38, 1.38].forEach((dx) => {
    groundGroup.add(box(0.75, 0.06, 0.12, silverAlumMat, bay3Cx + dx, 0.85, portalZ));
    groundGroup.add(box(0.75, 0.06, 0.12, silverAlumMat, bay3Cx + dx, 1.55, portalZ));
    // Lower aluminum kick-panel on sidelights
    groundGroup.add(box(0.75, 0.72, 0.06, silverAlumMat, bay3Cx + dx, 0.42, portalZ));
  });

  // Glass panels for transom & sidelights + double glass swing doors
  groundGroup.add(box(portalW - 0.15, 0.95, 0.04, clearDoorGlassMat, bay3Cx, 2.75, portalZ - 0.01, false));
  groundGroup.add(box(0.72, 1.35, 0.04, clearDoorGlassMat, bay3Cx - 1.38, 1.55, portalZ - 0.01, false));
  groundGroup.add(box(0.72, 1.35, 0.04, clearDoorGlassMat, bay3Cx + 1.38, 1.55, portalZ - 0.01, false));

  // Double glass swing doors (slightly ajar for realism, with silver push handles & bottom kickplates)
  [-0.48, 0.48].forEach((dx, idx) => {
    const doorG = new THREE.Group();
    doorG.position.set(bay3Cx + (idx === 0 ? -0.94 : 0.94), 0.16, portalZ);
    doorG.rotation.y = idx === 0 ? 0.18 : -0.12;
    const leafOffsetX = idx === 0 ? 0.46 : -0.46;
    doorG.add(box(0.9, 2.05, 0.04, clearDoorGlassMat, leafOffsetX, 1.025, 0, false));
    doorG.add(box(0.92, 0.18, 0.06, silverAlumMat, leafOffsetX, 0.09, 0));
    doorG.add(box(0.92, 0.06, 0.06, silverAlumMat, leafOffsetX, 2.02, 0));
    doorG.add(box(0.06, 2.05, 0.06, silverAlumMat, leafOffsetX - 0.43, 1.025, 0));
    doorG.add(box(0.06, 2.05, 0.06, silverAlumMat, leafOffsetX + 0.43, 1.025, 0));
    // Vertical silver push/pull handle bar
    const handleX = idx === 0 ? leafOffsetX + 0.32 : leafOffsetX - 0.32;
    doorG.add(box(0.03, 0.38, 0.08, silverAlumMat, handleX, 1.05, 0.04));
    groundGroup.add(doorG);
  });

  // "ENTRANCE" and "EXIT" black sign plates above the left and right doors (Photos 2 & 3)
  groundGroup.add(box(0.46, 0.12, 0.03, ironFenceMat, bay3Cx - 0.48, 2.34, portalZ + 0.07, false));
  groundGroup.add(box(0.46, 0.12, 0.03, ironFenceMat, bay3Cx + 0.48, 2.34, portalZ + 0.07, false));

  // Two oval welcome floor mats right inside the threshold (Photos 2 & 3)
  [-0.48, 0.48].forEach((dx) => {
    const matMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.02, 24),
      ironFenceMat
    );
    matMesh.scale.set(1.2, 1, 0.75);
    matMesh.position.set(bay3Cx + dx, 0.17, portalZ - 0.25);
    groundGroup.add(matMesh);
  });

  // Left Entrance Pier: UDD "DRESS CODE" Poster Board + Green "NO ID / NO ENTRY" Sign (Photos 2 & 3)
  const dressCodeMat = new THREE.MeshStandardMaterial({
    map: createDressCodePosterTexture(),
    roughness: 0.35,
  });
  groundGroup.add(box(0.78, 1.18, 0.04, dressCodeMat, bay3Cx - 2.22, 1.48, mainFrontZ + 0.06, false));

  const noIdMat = new THREE.MeshStandardMaterial({
    map: createNoIdNoEntryTexture(),
    roughness: 0.35,
  });
  groundGroup.add(box(0.56, 0.34, 0.03, noIdMat, bay3Cx - 1.38, 1.16, portalZ + 0.05, false));

  // Right Entrance Pier: Bronze Dedication Plaque + Blue "NO SMOKING" Sign (Photos 2 & 3)
  const plaqueMat = new THREE.MeshStandardMaterial({
    map: createBronzePlaqueTexture(),
    roughness: 0.3,
    metalness: 0.65,
  });
  groundGroup.add(box(0.54, 0.68, 0.04, plaqueMat, bay3Cx + 2.1, 1.62, mainFrontZ + 0.06, false));

  const blueSmokeMat = new THREE.MeshStandardMaterial({
    map: createBlueNoSmokingSignTexture(),
    roughness: 0.35,
  });
  groundGroup.add(box(0.48, 0.38, 0.03, blueSmokeMat, bay3Cx + 2.1, 0.96, mainFrontZ + 0.06, false));

  // White tiled handwashing sink inside right entrance alcove & wooden security guard desk outside (Photo 2)
  groundGroup.add(box(0.55, 0.85, 0.48, whiteWallMat, bay3Cx + 1.32, 0.58, portalZ - 0.38));
  const woodDeskMat = new THREE.MeshStandardMaterial({ color: '#7c4d2b', roughness: 0.7 });
  groundGroup.add(box(0.95, 0.78, 0.58, woodDeskMat, rightSecStartX + 0.95, 0.55, rightFrontZ + 0.65));

  // ── 3. Perimeter Black Wrought-Iron Picket Fence, Swing Gates & Warning Signs ──
  const fenceZ = mainFrontZ + 1.85;
  const fenceH = 1.65;
  const fenceStartX = leftSecStartX - 0.15;
  const fenceEndX = rightSecEndX + 0.15;

  // Left return fence panel with "YOU ARE ENTERING A NO SMOKING ZONE" sign (Photo 1)
  groundGroup.add(box(0.06, fenceH, 1.85, ironFenceMat, fenceStartX, fenceH / 2 + 0.08, mainFrontZ + 0.92));
  const gateNoSmokeMat = new THREE.MeshStandardMaterial({
    map: createNoSmokingZoneGateTexture(),
    roughness: 0.35,
  });
  groundGroup.add(box(0.76, 0.95, 0.04, gateNoSmokeMat, fenceStartX + 0.46, 0.92, fenceZ + 0.03, false));

  // Front black iron picket fence rails & vertical pickets (leaving open pedestrian gateway at Bay 3)
  const gateOpenLeftX = bay3Cx - 1.55;
  const gateOpenRightX = bay3Cx + 1.45;

  // Top, middle, and bottom horizontal iron rails (Left segment & Right segment)
  [
    [fenceStartX, gateOpenLeftX],
    [gateOpenRightX, fenceEndX],
  ].forEach(([x0, x1]) => {
    const segW = x1 - x0;
    const segCx = (x0 + x1) / 2;
    [0.22, 0.72, fenceH].forEach((ry) => {
      groundGroup.add(box(segW, 0.045, 0.045, ironFenceMat, segCx, ry + 0.08, fenceZ));
    });
    // Vertical iron pickets every 0.22m
    const numPickets = Math.floor(segW / 0.22);
    for (let p = 0; p <= numPickets; p++) {
      const px = x0 + p * (segW / numPickets);
      const isPost = p % 10 === 0;
      groundGroup.add(
        box(
          isPost ? 0.065 : 0.026,
          fenceH + (isPost ? 0.08 : 0),
          isPost ? 0.065 : 0.026,
          ironFenceMat,
          px,
          fenceH / 2 + 0.08,
          fenceZ,
          false
        )
      );
    }
  });

  // Sloped concrete pedestrian ramp + black iron handrails at the Bay 2/3 entrance gates (Photos 2 & 3)
  groundGroup.add(box(2.8, 0.14, 0.95, mats.concreteGround, bay3Cx - 0.1, 0.07, fenceZ + 0.35, false, true));
  [-1.55, 1.45].forEach((gx) => {
    groundGroup.add(box(0.06, 1.05, 0.85, ironFenceMat, bay3Cx + gx, 0.6, fenceZ - 0.38));
  });

  // Two yellow "NO PARKING" warning signs clipped to the black iron fence (Photos 2 & 3)
  const yellowNoParkMat = new THREE.MeshStandardMaterial({
    map: createYellowNoParkingTexture(),
    roughness: 0.35,
  });
  groundGroup.add(box(0.42, 0.56, 0.03, yellowNoParkMat, leftSecStartX + 3.2, 1.18, fenceZ + 0.04, false));
  groundGroup.add(box(0.42, 0.56, 0.03, yellowNoParkMat, rightSecStartX + 3.8, 1.18, fenceZ + 0.04, false));

  // ── 4. Neighboring Context: Left 2-Storey Lime-Green House & Cyan Foreground Wall (Photo 1) ──
  const limeHouseMat = new THREE.MeshStandardMaterial({ color: PALETTE.limeHouse, roughness: 0.82 });
  const mintWallMat = new THREE.MeshStandardMaterial({ color: PALETTE.mintWall, roughness: 0.75 });
  const cyanWallMat = new THREE.MeshStandardMaterial({ color: PALETTE.cyanWall, roughness: 0.78 });
  const woodBalusterMat = new THREE.MeshStandardMaterial({ color: '#4a2c1d', roughness: 0.7 });

  const houseW = 8.4;
  const houseCx = leftSecStartX - houseW / 2 - 1.6;
  const houseZ = 1.8;
  // Ground & 2F lime-green mass
  groundGroup.add(box(houseW, 6.4, 7.6, limeHouseMat, houseCx, 3.2, houseZ));
  // Recessed 2nd-floor mint-turquoise balcony alcove on the right of the lime house (Photo 1)
  groundGroup.add(box(3.4, 2.2, 0.15, mintWallMat, houseCx + 1.8, 4.65, houseZ + 3.76));
  // Wooden baluster railing across the 2F balcony opening
  groundGroup.add(box(3.4, 0.1, 0.14, woodBalusterMat, houseCx + 1.8, 3.95, houseZ + 3.82));
  for (let b = -7; b <= 7; b++) {
    groundGroup.add(box(0.08, 0.45, 0.08, woodBalusterMat, houseCx + 1.8 + b * 0.21, 3.7, houseZ + 3.82, false));
  }
  // Left 2F window on the lime-green house with white frame
  groundGroup.add(box(1.95, 1.35, 0.1, windowGridMat, houseCx - 1.85, 4.75, houseZ + 3.8, false));
  groundGroup.add(box(2.08, 0.08, 0.14, whiteWallMat, houseCx - 1.85, 5.45, houseZ + 3.82, false));
  groundGroup.add(box(2.08, 0.08, 0.14, whiteWallMat, houseCx - 1.85, 4.05, houseZ + 3.82, false));
  // Grey pitched hip roof over the lime house
  const hipRoof = new THREE.Mesh(
    new THREE.ConeGeometry(6.2, 2.1, 4),
    new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.6 })
  );
  hipRoof.rotation.y = Math.PI / 4;
  hipRoof.scale.set(1.15, 1, 0.95);
  hipRoof.position.set(houseCx, 7.45, houseZ);
  groundGroup.add(hipRoof);

  // Foreground bright turquoise/cyan concrete wall & corrugated tin fence on the left corner (Photo 1)
  const cyanWallMesh = box(0.24, 2.35, 5.8, cyanWallMat, leftSecStartX - 0.35, 1.18, mainFrontZ + 3.2);
  cyanWallMesh.rotation.y = -0.18;
  groundGroup.add(cyanWallMesh);
  groundGroup.add(box(4.6, 1.65, 0.18, creamBalconyDarkMat, leftSecStartX - 2.6, 0.82, mainFrontZ + 5.8));

  // ── 5. Across-the-Alley Context on Right: Weathered Building with Red Steel Cage Balcony (Photo 1) ──
  const rightAlleyBldgX = rightSecEndX + 5.8;
  const weatheredConcreteMat = new THREE.MeshStandardMaterial({ color: '#787572', roughness: 0.92 });
  const redCageMat = new THREE.MeshStandardMaterial({ color: PALETTE.redCage, roughness: 0.5, metalness: 0.4 });
  groundGroup.add(box(6.5, 11.5, 9.5, weatheredConcreteMat, rightAlleyBldgX, 5.75, 6.2));
  // Red steel security cage balcony projecting on 2F/3F (Photo 1 right edge)
  groundGroup.add(box(0.85, 2.4, 3.2, redCageMat, rightAlleyBldgX - 3.4, 6.8, 6.5));

  floorGroups.push(groundGroup);
  root.add(groundGroup);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FOR 2ND & 3RD FLOORS (CANTILEVERED CREAM BALCONY BANDS, SOFFIT RIBS, WINDOWS & ACs)
  // ═══════════════════════════════════════════════════════════════════════════
  const buildCantileveredAcademicFloor = (floorNum: 2 | 3, baseY: number, floorH: number): THREE.Group => {
    const fg = new THREE.Group();
    fg.name = `ENG_${floorNum}F`;

    const cantD = 1.35; // Deep cantilevered balcony/sun-breaker projection
    const fasciaH = 1.18; // Tall cream concrete balcony parapet/fascia band
    const winH = 1.48;
    const winY = baseY + fasciaH + winH / 2 + 0.15;

    // 1. Core recessed classroom/lab wall volumes (Left Main Section + Right Recessed Section)
    fg.add(box(leftSecW, floorH, mainDepth, whiteWallMat, leftSecCx, baseY + floorH / 2, mainCenterZ));
    fg.add(
      box(
        rightSecW,
        floorH,
        rightDepth,
        whiteWallMat,
        rightSecCx,
        baseY - rightStepDown + floorH / 2,
        rightCenterZ
      )
    );

    // 2. Cantilevered Warm Cream / Peach-Beige Balcony Fascia Band (Left Main Section + Left Return Side)
    const fasciaY = baseY + fasciaH / 2;
    // Front fascia across Bays 1–3
    fg.add(
      box(
        leftSecW + cantD * 2,
        fasciaH,
        0.24,
        creamBalconyMat,
        leftSecCx,
        fasciaY,
        mainFrontZ + cantD
      )
    );
    // Horizontal slab floor of the cantilevered overhang
    fg.add(
      box(
        leftSecW + cantD * 2,
        0.18,
        cantD + 0.1,
        creamBalconyDarkMat,
        leftSecCx,
        baseY + 0.09,
        mainFrontZ + cantD / 2
      )
    );
    // Left return side cantilevered fascia & slab (wrapping all the way along the left side, Photo 1)
    fg.add(
      box(
        0.24,
        fasciaH,
        mainDepth + cantD,
        creamBalconyMat,
        leftSecStartX - cantD,
        fasciaY,
        mainCenterZ + cantD / 2
      )
    );
    fg.add(
      box(
        cantD + 0.1,
        0.18,
        mainDepth + cantD,
        creamBalconyDarkMat,
        leftSecStartX - cantD / 2,
        baseY + 0.09,
        mainCenterZ + cantD / 2
      )
    );
    // Right end return cap of the main section balcony (at X = +2.8 + cantD)
    fg.add(
      box(
        0.22,
        fasciaH,
        cantD + 0.75,
        creamBalconyMat,
        leftSecEndX + 0.1,
        fasciaY,
        mainFrontZ + cantD / 2 - 0.25
      )
    );

    // Exposed underside concrete cross-beams (soffit ribs) under the cantilever (Photos 1, 2, 3)
    for (let i = 0; i <= 3; i++) {
      const bx = leftSecStartX + i * leftBayW;
      fg.add(
        box(0.28, 0.32, cantD + 0.1, creamBalconyDarkMat, bx, baseY - 0.12, mainFrontZ + cantD / 2)
      );
    }
    for (let sz = 0; sz <= 3; sz++) {
      const bz = backZ + sz * (mainDepth / 3);
      fg.add(
        box(cantD + 0.1, 0.32, 0.28, creamBalconyDarkMat, leftSecStartX - cantD / 2, baseY - 0.12, bz)
      );
    }

    // Brown/Copper PVC utility & drainage pipes hugging the front-left corner of the balcony fascia (Photo 1 & 3)
    const cornerX = leftSecStartX - cantD - 0.06;
    const cornerZ = mainFrontZ + cantD + 0.06;
    fg.add(
      rod(
        new THREE.Vector3(cornerX + 0.25, baseY - 0.1, cornerZ),
        new THREE.Vector3(cornerX + 0.25, baseY + fasciaH - 0.1, cornerZ),
        0.035,
        copperPipeMat
      )
    );
    fg.add(
      rod(
        new THREE.Vector3(cornerX, baseY - 0.1, cornerZ - 0.28),
        new THREE.Vector3(cornerX, baseY + fasciaH - 0.1, cornerZ - 0.28),
        0.035,
        copperPipeMat
      )
    );

    // 3. Stepped-Down Cantilevered Cream Balcony Band on Right Recessed Section (Bays 4 & 5, Photos 2 & 3)
    const rightFasciaY = baseY - rightStepDown + fasciaH / 2;
    fg.add(
      box(
        rightSecW + cantD,
        fasciaH,
        0.24,
        creamBalconyMat,
        rightSecCx + cantD / 2,
        rightFasciaY,
        rightFrontZ + cantD
      )
    );
    fg.add(
      box(
        rightSecW + cantD,
        0.18,
        cantD + 0.1,
        creamBalconyDarkMat,
        rightSecCx + cantD / 2,
        baseY - rightStepDown + 0.09,
        rightFrontZ + cantD / 2
      )
    );
    // Right end return cap
    fg.add(
      box(
        0.24,
        fasciaH,
        cantD + 0.2,
        creamBalconyMat,
        rightSecEndX + cantD,
        rightFasciaY,
        rightFrontZ + cantD / 2
      )
    );
    // Underside soffit cross-beams on Right Wing
    for (let i = 0; i <= 2; i++) {
      const bx = rightSecStartX + i * rightBayW;
      fg.add(
        box(
          0.28,
          0.32,
          cantD + 0.1,
          creamBalconyDarkMat,
          bx,
          baseY - rightStepDown - 0.12,
          rightFrontZ + cantD / 2
        )
      );
    }

    // 4. Front Multi-Pane Casement Windows, Open Sashes & Window-Type AC Units (Bays 1–3)
    for (let b = 0; b < 3; b++) {
      const bayCx = leftSecStartX + (b + 0.5) * leftBayW;
      fg.add(box(3.68, winH, 0.1, windowGridMat, bayCx, winY, mainFrontZ + 0.04, false));

      // Outward-angled open casement sashes on Bay 3 (above entrance, Photos 2 & 3)
      if (b === 2) {
        addOpenCasementSashes(fg, bayCx, winY - 0.1, mainFrontZ + 0.04, 3);
      }

      // Window-type AC units on Bays 1 & 2 (matching Photos 1, 2, 3)
      if (b === 0 || b === 1) {
        addWindowAC(fg, bayCx - 0.85, winY + 0.28, mainFrontZ + 0.06, 'front');
      }
    }

    // 5. Front Multi-Pane Casement Windows & Open Sashes on Right Wing (Bays 4 & 5)
    for (let b = 0; b < 2; b++) {
      const bayCx = rightSecStartX + (b + 0.5) * rightBayW;
      const rWinY = winY - rightStepDown;
      fg.add(box(3.46, winH, 0.1, windowGridMat, bayCx, rWinY, rightFrontZ + 0.04, false));
      addOpenCasementSashes(fg, bayCx - 0.35, rWinY - 0.1, rightFrontZ + 0.04, 2);
    }

    // 6. Left Return Side Elevation Windows & AC Units (3 bays along Z, Photo 1)
    const sideBayD = mainDepth / 3;
    for (let sb = 0; sb < 3; sb++) {
      const sbCz = backZ + (sb + 0.5) * sideBayD;
      fg.add(box(0.1, winH, 2.65, windowGridMat, leftSecStartX - 0.04, winY, sbCz, false));
      if (sb === 0 || sb === 2) {
        addWindowAC(fg, leftSecStartX - 0.06, winY + 0.25, sbCz - 0.45, 'left');
      }
    }

    return fg;
  };

  // Build 2nd Floor (y = 3.5m to 6.85m)
  const floor2Y = groundH;
  const floor2Group = buildCantileveredAcademicFloor(2, floor2Y, floor2H);
  floorGroups.push(floor2Group);
  root.add(floor2Group);

  // Build 3rd Floor (y = 6.85m to 10.2m)
  const floor3Y = groundH + floor2H;
  const floor3Group = buildCantileveredAcademicFloor(3, floor3Y, floor3H);
  floorGroups.push(floor3Group);
  root.add(floor3Group);

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 3: 4TH FLOOR SENIOR STUDIOS, TERRACOTTA TOP PARAPET & EXHAUST STACKS
  // ═══════════════════════════════════════════════════════════════════════════
  const floor4Y = groundH + floor2H + floor3H; // 10.2m
  const floor4Group = new THREE.Group();
  floor4Group.name = 'ENG_4F_And_Terracotta_Roof';

  const cantD = 1.35;
  const fasciaH = 1.18;
  const topParapetH = 1.45;
  const win4H = 1.35;
  const win4Y = floor4Y + fasciaH + win4H / 2 + 0.12;

  // 1. 4th Floor Core Wall Volumes
  floor4Group.add(box(leftSecW, floor4H, mainDepth, whiteWallMat, leftSecCx, floor4Y + floor4H / 2, mainCenterZ));
  floor4Group.add(
    box(
      rightSecW,
      floor4H,
      rightDepth,
      whiteWallMat,
      rightSecCx,
      floor4Y - rightStepDown + floor4H / 2,
      rightCenterZ
    )
  );

  // 2. 4th Floor Lower Cantilevered Cream Balcony Band (above 3F windows, Photos 1, 2, 3)
  const fascia4Y = floor4Y + fasciaH / 2;
  floor4Group.add(
    box(leftSecW + cantD * 2, fasciaH, 0.24, creamBalconyMat, leftSecCx, fascia4Y, mainFrontZ + cantD)
  );
  floor4Group.add(
    box(
      leftSecW + cantD * 2,
      0.18,
      cantD + 0.1,
      creamBalconyDarkMat,
      leftSecCx,
      floor4Y + 0.09,
      mainFrontZ + cantD / 2
    )
  );
  floor4Group.add(
    box(
      0.24,
      fasciaH,
      mainDepth + cantD,
      creamBalconyMat,
      leftSecStartX - cantD,
      fascia4Y,
      mainCenterZ + cantD / 2
    )
  );
  floor4Group.add(
    box(
      cantD + 0.1,
      0.18,
      mainDepth + cantD,
      creamBalconyDarkMat,
      leftSecStartX - cantD / 2,
      floor4Y + 0.09,
      mainCenterZ + cantD / 2
    )
  );
  // Step-down right wing 4F cream balcony band
  const rightFascia4Y = floor4Y - rightStepDown + fasciaH / 2;
  floor4Group.add(
    box(
      rightSecW + cantD,
      fasciaH,
      0.24,
      creamBalconyMat,
      rightSecCx + cantD / 2,
      rightFascia4Y,
      rightFrontZ + cantD
    )
  );
  floor4Group.add(
    box(
      rightSecW + cantD,
      0.18,
      cantD + 0.1,
      creamBalconyDarkMat,
      rightSecCx + cantD / 2,
      floor4Y - rightStepDown + 0.09,
      rightFrontZ + cantD / 2
    )
  );

  // Exposed underside cross-beams under 4F balcony slab
  for (let i = 0; i <= 3; i++) {
    const bx = leftSecStartX + i * leftBayW;
    floor4Group.add(
      box(0.28, 0.32, cantD + 0.1, creamBalconyDarkMat, bx, floor4Y - 0.12, mainFrontZ + cantD / 2)
    );
  }
  for (let sz = 0; sz <= 3; sz++) {
    const bz = backZ + sz * (mainDepth / 3);
    floor4Group.add(
      box(cantD + 0.1, 0.32, 0.28, creamBalconyDarkMat, leftSecStartX - cantD / 2, floor4Y - 0.12, bz)
    );
  }

  // 3. 4th Floor Windows, Open Casement Sashes & AC Units
  for (let b = 0; b < 3; b++) {
    const bayCx = leftSecStartX + (b + 0.5) * leftBayW;
    floor4Group.add(box(3.68, win4H, 0.1, windowGridMat, bayCx, win4Y, mainFrontZ + 0.04, false));
    if (b === 0) {
      addWindowAC(floor4Group, bayCx - 0.85, win4Y + 0.22, mainFrontZ + 0.06, 'front');
    }
    if (b === 2) {
      addOpenCasementSashes(floor4Group, bayCx, win4Y - 0.08, mainFrontZ + 0.04, 3);
    }
  }
  for (let b = 0; b < 2; b++) {
    const bayCx = rightSecStartX + (b + 0.5) * rightBayW;
    const rWin4Y = win4Y - rightStepDown;
    floor4Group.add(box(3.46, win4H, 0.1, windowGridMat, bayCx, rWin4Y, rightFrontZ + 0.04, false));
  }
  // Left side 4F windows & AC units (Photo 1)
  const sideBayD = mainDepth / 3;
  for (let sb = 0; sb < 3; sb++) {
    const sbCz = backZ + (sb + 0.5) * sideBayD;
    floor4Group.add(box(0.1, win4H, 2.65, windowGridMat, leftSecStartX - 0.04, win4Y, sbCz, false));
    addWindowAC(floor4Group, leftSecStartX - 0.06, win4Y + 0.22, sbCz - 0.45, 'left');
  }

  // 4. Signature Terracotta / Salmon-Orange Top Roof Parapet Band (Photos 1, 2, 3)
  const roofTopY = floor4Y + floor4H;
  const parapetY = roofTopY + topParapetH / 2 - 0.2;

  // Main Section Front Terracotta Parapet
  floor4Group.add(
    box(leftSecW + cantD * 2, topParapetH, 0.26, terracottaMat, leftSecCx, parapetY, mainFrontZ + cantD)
  );
  // Left Side Return Terracotta Parapet
  floor4Group.add(
    box(
      0.26,
      topParapetH,
      mainDepth + cantD,
      terracottaMat,
      leftSecStartX - cantD,
      parapetY,
      mainCenterZ + cantD / 2
    )
  );
  // Main Section Roof Overhang Soffit & Recessed Dark Soffit Panels (visible looking up in Photos 1, 2, 3)
  floor4Group.add(
    box(
      leftSecW + cantD * 2,
      0.2,
      cantD + 0.15,
      creamBalconyMat,
      leftSecCx,
      roofTopY - 0.1,
      mainFrontZ + cantD / 2
    )
  );
  floor4Group.add(
    box(
      cantD + 0.15,
      0.2,
      mainDepth + cantD,
      creamBalconyMat,
      leftSecStartX - cantD / 2,
      roofTopY - 0.1,
      mainCenterZ + cantD / 2
    )
  );
  for (let b = 0; b < 3; b++) {
    const bayCx = leftSecStartX + (b + 0.5) * leftBayW;
    floor4Group.add(
      box(leftBayW - 0.5, 0.08, cantD - 0.25, soffitDarkMat, bayCx, roofTopY - 0.21, mainFrontZ + cantD / 2)
    );
  }

  // Right Recessed Wing Stepped-Down Terracotta Parapet & Soffit Panels (Photos 2 & 3)
  const rightParapetY = parapetY - rightStepDown;
  floor4Group.add(
    box(
      rightSecW + cantD,
      topParapetH,
      0.26,
      terracottaMat,
      rightSecCx + cantD / 2,
      rightParapetY,
      rightFrontZ + cantD
    )
  );
  floor4Group.add(
    box(
      0.26,
      topParapetH,
      cantD + 0.2,
      terracottaDarkMat,
      rightSecEndX + cantD,
      rightParapetY,
      rightFrontZ + cantD / 2
    )
  );
  floor4Group.add(
    box(
      rightSecW + cantD,
      0.2,
      cantD + 0.15,
      creamBalconyMat,
      rightSecCx + cantD / 2,
      roofTopY - rightStepDown - 0.1,
      rightFrontZ + cantD / 2
    )
  );
  for (let b = 0; b < 2; b++) {
    const bayCx = rightSecStartX + (b + 0.5) * rightBayW;
    floor4Group.add(
      box(
        rightBayW - 0.5,
        0.08,
        cantD - 0.25,
        soffitDarkMat,
        bayCx,
        roofTopY - rightStepDown - 0.21,
        rightFrontZ + cantD / 2
      )
    );
  }

  // Flat concrete roof deck slab behind the terracotta parapet
  floor4Group.add(box(leftSecW, 0.28, mainDepth, mats.concreteGround, leftSecCx, roofTopY, mainCenterZ));
  floor4Group.add(
    box(rightSecW, 0.28, rightDepth, mats.concreteGround, rightSecCx, roofTopY - rightStepDown, rightCenterZ)
  );

  // 5. Two Tall Vertical Galvanized Steel Laboratory Exhaust / Ventilation Duct Stacks on Rear-Left Corner (Photo 1)
  const stackX = leftSecStartX - cantD - 0.28;
  [-4.4, -5.25].forEach((sz, idx) => {
    const stackBottomY = 4.2;
    const stackTopY = roofTopY + 2.35 - idx * 0.35;
    floor4Group.add(
      rod(
        new THREE.Vector3(stackX, stackBottomY, sz),
        new THREE.Vector3(stackX, stackTopY, sz),
        0.22,
        galvanizedMat
      )
    );
    // Conical rain cap at top of exhaust chimney
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.28, 16), galvanizedMat);
    cap.position.set(stackX, stackTopY + 0.22, sz);
    floor4Group.add(cap);
    // Steel wall mounting collar brackets
    [6.8, 10.2, 13.4].forEach((by) => {
      floor4Group.add(box(0.45, 0.1, 0.48, ironFenceMat, stackX + 0.15, by, sz));
    });
  });

  floorGroups.push(floor4Group);
  root.add(floor4Group);

  // Footprint polygon for glowing ground outline
  const engFootprint: [number, number][] = [
    [leftSecStartX - cantD, backZ],
    [rightSecEndX + cantD, backZ],
    [rightSecEndX + cantD, rightFrontZ + cantD],
    [leftSecEndX + 0.2, rightFrontZ + cantD],
    [leftSecEndX + 0.2, mainFrontZ + cantD],
    [leftSecStartX - cantD, mainFrontZ + cantD],
  ];

  const defaultCameraPos = new THREE.Vector3(-19.5, 10.5, 22.5);
  const targetLookAt = new THREE.Vector3(-0.5, 6.2, 0.5);

  return {
    root,
    floorGroups,
    defaultCameraPos,
    targetLookAt,
    explodeSpacing: 4.2,
    focusTargets: [
      {
        id: 'udd-eng',
        cameraPos: defaultCameraPos,
        lookAt: targetLookAt,
        footprint: engFootprint,
        meshes: [],
      },
    ],
  };
}
