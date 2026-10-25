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

/** Vibrant cyan/blue entrance portal sign: "UNIVERSIDAD DE DAGUPAN" (from entrance photo). */
function createPortalSignTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  // Signature vibrant cyan/UDD sky blue background from photo
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, W, H);

  // Subtle top highlight and bottom shadow for 3D fascia plate look
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(0, 0, W, 12);
  ctx.fillStyle = 'rgba(0, 40, 90, 0.35)';
  ctx.fillRect(0, H - 14, W, 14);

  // Bold 3D white lettering with depth shadow
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 128px sans-serif';

  // 3D shadow layers
  ctx.fillStyle = 'rgba(2, 38, 80, 0.45)';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', W / 2 + 5, H / 2 + 6);
  ctx.fillStyle = '#0369a1';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', W / 2 + 2, H / 2 + 3);

  // Crisp white face
  ctx.fillStyle = '#ffffff';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', W / 2, H / 2);

  return toTexture(canvas);
}

/** Security Reminder Sign: "NO I.D. NO ENTRY" (from entrance photo). */
function createNoIdSignTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 384;
  const { canvas, ctx } = makeCanvas(W, H);

  // White reflective background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Navy blue outer border & inner double frame
  ctx.strokeStyle = '#0f4ba3';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, W - 14, H - 14);
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Top header bar: "SECURITY REMINDER"
  ctx.fillStyle = '#0f4ba3';
  ctx.fillRect(20, 20, W - 40, 52);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SECURITY REMINDER', W / 2, 46);

  // Big bold "NO I.D."
  ctx.fillStyle = '#0f4ba3';
  ctx.font = '900 86px sans-serif';
  ctx.fillText('NO I.D.', 180, 145);

  // ID Card Badge Icon
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(340, 95, 110, 80);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(352, 107, 40, 56); // photo box
  ctx.fillRect(402, 117, 36, 9);   // lines
  ctx.fillRect(402, 133, 36, 9);
  ctx.fillRect(402, 149, 36, 9);

  // Big bold "NO ENTRY"
  ctx.fillStyle = '#0f4ba3';
  ctx.font = '900 78px sans-serif';
  ctx.fillText('NO ENTRY', W / 2, 235);

  // Bottom blue footer bar: "STUDENTS • EMPLOYEES • VISITORS"
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(20, H - 76, W - 40, 56);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('STUDENTS • EMPLOYEES • VISITORS', W / 2, H - 48);

  return toTexture(canvas);
}

/** Pedestrian Gate Sign: "ENTRANCE ➔" (from entrance photo). */
function createEntranceSignTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  // Crisp white sign background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Navy blue outer border & header
  ctx.strokeStyle = '#0a3273';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  // Top header bar
  ctx.fillStyle = '#0a3273';
  ctx.fillRect(16, 16, W - 32, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PEDESTRIAN ACCESS', W / 2, 36);

  // Main bold "ENTRANCE"
  ctx.fillStyle = '#0a3273';
  ctx.font = '900 64px sans-serif';
  ctx.fillText('ENTRANCE', W / 2, 105);

  // Subtext: "STUDENTS / VISITORS ONLY"
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('STUDENTS / VISITORS ONLY', W / 2, 148);

  // Bold right arrow
  ctx.fillStyle = '#0f172a';
  const arrowX = 140;
  const arrowY = 195;
  const arrowL = 230;
  const arrowH = 20;
  ctx.fillRect(arrowX, arrowY - arrowH / 2, arrowL - 35, arrowH);
  ctx.beginPath();
  ctx.moveTo(arrowX + arrowL - 35, arrowY - 26);
  ctx.lineTo(arrowX + arrowL, arrowY);
  ctx.lineTo(arrowX + arrowL - 35, arrowY + 26);
  ctx.closePath();
  ctx.fill();

  return toTexture(canvas);
}

/** Right perimeter wall placard with "UDD" lettering & seal (from entrance photo). */
function createUddWallPlacardTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);

  // Large Bold "UDD" with blue 3D shadow and white face bevel
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Drop shadow
  ctx.fillStyle = 'rgba(2, 44, 100, 0.4)';
  ctx.font = '900 320px sans-serif';
  ctx.fillText('UDD', W / 2 + 12, H / 2 + 12);

  // Deep royal blue body
  ctx.fillStyle = '#0038a8';
  ctx.fillText('UDD', W / 2, H / 2);

  // White inner highlight outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.strokeText('UDD', W / 2, H / 2);

  ctx.fillStyle = '#0047bb';
  ctx.fillText('UDD', W / 2, H / 2);

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

/** Rooftop banner for Student Services Hall: "UNIVERSIDAD DE DAGUPAN". */
function createServicesRoofSignTexture(): THREE.CanvasTexture {
  const W = 1536;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = '#0b4da2';
  ctx.fillRect(0, 0, W, H);

  // White border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  // Bold white text
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 90px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', W / 2, H / 2);

  return toTexture(canvas);
}

/** Ground floor student services storefronts with signage & warm lights. */
function createServicesOfficeTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  // Dark reflective glass
  ctx.fillStyle = '#111a24';
  ctx.fillRect(0, 0, W, H);

  // Warm interior lights glow in upper half
  const glow = ctx.createLinearGradient(0, 0, 0, H);
  glow.addColorStop(0, 'rgba(255, 230, 180, 0.45)');
  glow.addColorStop(0.6, 'rgba(255, 220, 160, 0.15)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Storefront divisions: 4 offices
  const offices = ['REGISTRAR', 'CASHIER', 'INFORMATION', 'STUDENT SERVICES'];
  const bayW = W / 4;
  for (let i = 0; i < 4; i++) {
    const bx = i * bayW;
    // Signage plate
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx + 16, 20, bayW - 32, 44);
    ctx.strokeStyle = '#0b4da2';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx + 16, 20, bayW - 32, 44);

    ctx.fillStyle = '#0b4da2';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(offices[i], bx + bayW / 2, 42);

    // Aluminum vertical door/window frames
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.strokeRect(bx + 8, 4, bayW - 16, H - 8);
    // Double glass door division
    ctx.strokeRect(bx + 30, 75, bayW - 60, H - 80);
    ctx.beginPath();
    ctx.moveTo(bx + bayW / 2, 75);
    ctx.lineTo(bx + bayW / 2, H - 5);
    ctx.stroke();
  }

  return toTexture(canvas);
}

/** Curtain wall glass panel texture with vertical aluminum mullions. */
function createCurtainGlassTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  // Deep tinted architectural glass
  ctx.fillStyle = '#172a3e';
  ctx.fillRect(0, 0, W, H);

  // Diagonal sky reflection gradient
  const ref = ctx.createLinearGradient(0, 0, W, H);
  ref.addColorStop(0, 'rgba(120, 180, 240, 0.25)');
  ref.addColorStop(0.5, 'rgba(80, 140, 200, 0.08)');
  ref.addColorStop(1, 'rgba(20, 50, 80, 0.35)');
  ctx.fillStyle = ref;
  ctx.fillRect(0, 0, W, H);

  // Aluminum frame lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, W, H);
  for (let x = 128; x < W; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 170; y < H; y += 170) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  return toTexture(canvas);
}

/** Vertical "UDD" Tower Sign texture (from udd-main-tower.JPG). */
function createVerticalUddSignTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 1024);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 1024);

  // University Blue border accents matching the reference photo
  ctx.fillStyle = '#0f4ba3';
  ctx.fillRect(0, 0, 512, 24);
  ctx.fillRect(0, 1000, 512, 24);
  ctx.strokeStyle = '#0a3273';
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 492, 1004);

  // Bold vertical "U D D" lettering with subtle shadow/bevel for 3D effect
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const letters = [
    { char: 'U', y: 260 },
    { char: 'D', y: 512 },
    { char: 'D', y: 764 },
  ];

  letters.forEach(({ char, y }) => {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 20, 60, 0.4)';
    ctx.font = '900 230px sans-serif';
    ctx.fillText(char, 264, y + 8);

    // Deep blue bevel
    ctx.fillStyle = '#072e6b';
    ctx.fillText(char, 260, y + 4);

    // Primary vibrant blue letter face
    ctx.fillStyle = '#0066cc';
    ctx.fillText(char, 256, y);

    // Highlight sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '900 220px sans-serif';
    ctx.fillText(char, 252, y - 4);
  });

  return toTexture(canvas);
}

/** Multi-pane square grid window texture for Tower facade (from udd-main-tower.JPG). */
function createTowerSquareWindowTexture(): THREE.CanvasTexture {
  const S = 512;
  const { canvas, ctx } = makeCanvas(S, S);

  // Deep tinted architectural glass
  ctx.fillStyle = '#142232';
  ctx.fillRect(0, 0, S, S);

  // Sky reflection gradient
  const ref = ctx.createLinearGradient(0, 0, S, S);
  ref.addColorStop(0, 'rgba(130, 190, 250, 0.35)');
  ref.addColorStop(0.5, 'rgba(70, 130, 190, 0.1)');
  ref.addColorStop(1, 'rgba(15, 30, 50, 0.4)');
  ctx.fillStyle = ref;
  ctx.fillRect(0, 0, S, S);

  // Outer white window frame
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, S - 14, S - 14);

  // Grid mullions (4 cols x 3 rows)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 6;
  const cols = 4;
  const rows = 3;
  for (let c = 1; c < cols; c++) {
    const x = (S / cols) * c;
    ctx.beginPath();
    ctx.moveTo(x, 14);
    ctx.lineTo(x, S - 14);
    ctx.stroke();
  }
  for (let r = 1; r < rows; r++) {
    const y = (S / rows) * r;
    ctx.beginPath();
    ctx.moveTo(14, y);
    ctx.lineTo(S - 14, y);
    ctx.stroke();
  }

  return toTexture(canvas);
}

/** Multi-pane window grid texture for classroom ribbon windows (from udd-main-tower.JPG). */
function createTowerWindowGridTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 384;
  const { canvas, ctx } = makeCanvas(W, H);

  // Tinted reflective glass
  ctx.fillStyle = '#142232';
  ctx.fillRect(0, 0, W, H);

  // Reflection
  const ref = ctx.createLinearGradient(0, 0, W, H);
  ref.addColorStop(0, 'rgba(140, 195, 255, 0.3)');
  ref.addColorStop(0.5, 'rgba(80, 140, 200, 0.08)');
  ref.addColorStop(1, 'rgba(15, 30, 50, 0.4)');
  ctx.fillStyle = ref;
  ctx.fillRect(0, 0, W, H);

  // Outer frame
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  // Vertical mullions (8 panels)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 6;
  for (let x = W / 8; x < W; x += W / 8) {
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.lineTo(x, H - 8);
    ctx.stroke();
  }

  // Horizontal transom division (upper transom vs lower slider)
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(8, H * 0.35);
  ctx.lineTo(W - 8, H * 0.35);
  ctx.stroke();

  return toTexture(canvas);
}

/** Air Conditioner Outdoor Compressor Unit texture (from udd-main-tower.JPG). */
function createAcUnitTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = '#d9e2ec';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#9fb3c8';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  // Fan grille circle
  const cx = 150;
  const cy = 135;
  const r = 80;
  ctx.fillStyle = '#243b53';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Grille rings
  ctx.strokeStyle = '#627d98';
  ctx.lineWidth = 3;
  [25, 48, 70].forEach((gr) => {
    ctx.beginPath();
    ctx.arc(cx, cy, gr, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Vent slits on left
  ctx.fillStyle = '#627d98';
  for (let y = 50; y <= 210; y += 14) {
    ctx.fillRect(20, y, 32, 5);
  }

  // Small brand label
  ctx.fillStyle = '#0f4ba3';
  ctx.fillRect(20, 24, 42, 14);

  return toTexture(canvas);
}

/** Announcement & Dean's List Notice Board (from udd-main-tower.JPG). */
function createDeansListBoardTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);

  // Header band
  ctx.fillStyle = '#0f4ba3';
  ctx.fillRect(10, 10, W - 20, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("COLLEGE DEAN'S LIST & ANNOUNCEMENTS", W / 2, 34);

  // Notice papers grid
  const papers = [
    { x: 20, y: 70, w: 90, h: 165 },
    { x: 120, y: 70, w: 90, h: 165 },
    { x: 220, y: 70, w: 90, h: 165 },
    { x: 320, y: 70, w: 90, h: 165 },
    { x: 420, y: 70, w: 75, h: 165 },
  ];
  papers.forEach((p) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#94a3b8';
    for (let ly = p.y + 16; ly < p.y + p.h - 10; ly += 12) {
      ctx.fillRect(p.x + 8, ly, p.w - 16, 4);
    }
  });

  // Aluminum frame
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, W - 6, H - 6);

  return toTexture(canvas);
}

/** Storey 1 curtain wall glazing with warm interior & computing/engineering lab bays. */
function createNewWingCurtainWallTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  // Deep tinted architectural glass
  ctx.fillStyle = '#111a24';
  ctx.fillRect(0, 0, W, H);

  // Warm interior ambient illumination gradient
  const glow = ctx.createLinearGradient(0, 0, 0, H);
  glow.addColorStop(0, 'rgba(255, 235, 190, 0.40)');
  glow.addColorStop(0.55, 'rgba(255, 220, 160, 0.15)');
  glow.addColorStop(1, 'rgba(10, 20, 35, 0.65)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Sky reflection gradient
  const ref = ctx.createLinearGradient(0, 0, W, H);
  ref.addColorStop(0, 'rgba(120, 185, 255, 0.28)');
  ref.addColorStop(0.5, 'rgba(70, 130, 200, 0.08)');
  ref.addColorStop(1, 'rgba(15, 35, 60, 0.35)');
  ctx.fillStyle = ref;
  ctx.fillRect(0, 0, W, H);

  // Outer frame
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, W - 10, H - 10);

  // Vertical aluminum structural mullions (8 bays)
  const bays = 8;
  const bayW = W / bays;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 6;
  for (let i = 1; i < bays; i++) {
    const x = i * bayW;
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x, H - 10);
    ctx.stroke();
  }

  // Horizontal transoms
  ctx.lineWidth = 6;
  [H * 0.28, H * 0.72].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(10, y);
    ctx.lineTo(W - 10, y);
    ctx.stroke();
  });

  // Intermediate vertical glazing bars
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < bays; i++) {
    const midX = i * bayW + bayW / 2;
    ctx.beginPath();
    ctx.moveTo(midX, H * 0.28);
    ctx.lineTo(midX, H * 0.72);
    ctx.stroke();
  }

  // Academic Room Identification Tags
  const labs = [
    'AI & ROBOTICS LAB',
    'SOFTWARE STUDIO',
    'CYBER RESEARCH',
    'MULTIMEDIA SUITE',
  ];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 4; i++) {
    const cx = (i * 2 + 1) * bayW;
    ctx.fillStyle = '#0b4da2';
    ctx.fillRect(cx - 95, 26, 190, 36);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 95, 26, 190, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 15px sans-serif';
    ctx.fillText(labs[i], cx, 44);
  }

  return toTexture(canvas);
}

/** Storey 2 facade texture: high-tech ribbon glass, blue accent spandrel & engineering research labs. */
function createNewWingUpperFacadeTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  // Tinted reflective glass
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  // Sky reflection
  const ref = ctx.createLinearGradient(0, 0, W, H);
  ref.addColorStop(0, 'rgba(135, 205, 255, 0.35)');
  ref.addColorStop(0.5, 'rgba(80, 145, 215, 0.12)');
  ref.addColorStop(1, 'rgba(15, 30, 50, 0.45)');
  ctx.fillStyle = ref;
  ctx.fillRect(0, 0, W, H);

  // Spandrel top band
  ctx.fillStyle = '#1153b6';
  ctx.fillRect(0, 0, W, 48);

  // Spandrel bottom band
  ctx.fillStyle = '#0b3c82';
  ctx.fillRect(0, H - 48, W, 48);

  // Crisp white border
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  // Vertical structural mullions (6 bays)
  const bays = 6;
  const bayW = W / bays;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 6;
  for (let i = 1; i < bays; i++) {
    const x = i * bayW;
    ctx.beginPath();
    ctx.moveTo(x, 48);
    ctx.lineTo(x, H - 48);
    ctx.stroke();
  }

  // Horizontal window division
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(8, H * 0.42);
  ctx.lineTo(W - 8, H * 0.42);
  ctx.stroke();

  // Subtle interior laboratory desks / warm lighting
  ctx.fillStyle = 'rgba(255, 240, 200, 0.12)';
  for (let i = 0; i < bays; i++) {
    ctx.fillRect(i * bayW + 12, H * 0.45, bayW - 24, H * 0.45);
  }

  return toTexture(canvas);
}

/** Prominent architectural signage plate: "UNIVERSIDAD DE DAGUPAN - INNOVATION & RESEARCH WING". */
function createNewWingSignTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  // Deep royal blue background
  ctx.fillStyle = '#0b4da2';
  ctx.fillRect(0, 0, W, H);

  // Gold metallic border
  ctx.strokeStyle = '#e2b342';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  // Inner white accent border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Subtitle
  ctx.fillStyle = '#e2b342';
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', W / 2, 58);

  // Main title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 56px sans-serif';
  ctx.fillText('INNOVATION & RESEARCH WING', W / 2, 130);

  // Bottom secondary text
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '700 24px sans-serif';
  ctx.fillText('ACADEMIC & TECHNOLOGY COMPLEX', W / 2, 195);

  return toTexture(canvas);
}

/** Architectural signage plaque for the 2nd Floor Footbridge / Skybridge */
function createFootbridgeSignTexture(
  title = '2F CONNECTING FOOTBRIDGE',
  subtitle = 'TOWER BUILDING ⮂ 5-STOREY BUILDING'
): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  // Deep royal blue background
  ctx.fillStyle = '#0b4da2';
  ctx.fillRect(0, 0, W, H);

  // Gold metallic border
  ctx.strokeStyle = '#e2b342';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  // Inner white accent border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Header Subtitle
  ctx.fillStyle = '#e2b342';
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UNIVERSIDAD DE DAGUPAN', W / 2, 56);

  // Main title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px sans-serif';
  ctx.fillText(title, W / 2, 128);

  // Subtitle / destination
  ctx.fillStyle = '#93c5fd';
  ctx.font = '700 26px sans-serif';
  ctx.fillText(subtitle, W / 2, 196);

  return toTexture(canvas);
}

/** Recessed classroom wall along open corridors: ivory wall, dark timber doors & ribbon transom windows. */
function createCourtyardCorridorTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  // Crisp white painted wall background (from courtyard reference photos)
  ctx.fillStyle = '#f1f3f6';
  ctx.fillRect(0, 0, W, H);

  // 4 classroom modules per texture repeat
  const moduleW = W / 4;
  for (let i = 0; i < 4; i++) {
    const mx = i * moduleW;

    // Dark timber classroom door on left of module
    const doorX = mx + 20;
    const doorW = 50;
    const doorH = 190;
    const doorY = H - doorH;

    // Door frame
    ctx.fillStyle = '#422814';
    ctx.fillRect(doorX - 3, doorY - 3, doorW + 6, doorH + 3);

    // Door leaf
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(doorX, doorY, doorW, doorH);

    // Vision glass panel in upper door
    ctx.fillStyle = '#17283c';
    ctx.fillRect(doorX + 12, doorY + 25, doorW - 24, 55);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(doorX + 12, doorY + 25, doorW - 24, 55);

    // Silver door handle
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(doorX + doorW - 10, doorY + 105, 6, 14);

    // Classroom multi-pane window on right of door
    const winX = doorX + doorW + 25;
    const winW = moduleW - doorW - 55;
    const winH = 110;
    const winY = doorY + 20;

    // Window frame
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(winX - 3, winY - 3, winW + 6, winH + 6);

    // Window glass
    ctx.fillStyle = '#152538';
    ctx.fillRect(winX, winY, winW, winH);

    // Warm interior illumination gradient
    const glow = ctx.createLinearGradient(winX, winY, winX, winY + winH);
    glow.addColorStop(0, 'rgba(255, 235, 180, 0.45)');
    glow.addColorStop(0.7, 'rgba(255, 220, 160, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = glow;
    ctx.fillRect(winX, winY, winW, winH);

    // Window mullions (3 panes)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    const paneW = winW / 3;
    for (let p = 1; p < 3; p++) {
      ctx.beginPath();
      ctx.moveTo(winX + p * paneW, winY);
      ctx.lineTo(winX + p * paneW, winY + winH);
      ctx.stroke();
    }
    // Horizontal transom bar
    ctx.beginPath();
    ctx.moveTo(winX, winY + winH * 0.4);
    ctx.lineTo(winX + winW, winY + winH * 0.4);
    ctx.stroke();
  }

  // Base skirting board along bottom
  ctx.fillStyle = '#9aa4b2';
  ctx.fillRect(0, H - 8, W, 8);

  return toTexture(canvas);
}

/** 5F top-floor facade: white wall with large louvered window bays framed by blue sills (from courtyard photos). */
function createRibbonWindow5FTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  // White painted wall
  ctx.fillStyle = '#f1f3f6';
  ctx.fillRect(0, 0, W, H);

  // 4 louvered window bays separated by white piers
  const bays = 4;
  const bayW = W / bays;
  for (let i = 0; i < bays; i++) {
    const x = i * bayW + 22;
    const w = bayW - 44;
    const y = 26;
    const h = H - 70;
    // Dark blue recessed frame
    ctx.fillStyle = '#1f4f8a';
    ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
    // Louver background (shadow)
    ctx.fillStyle = '#2a3442';
    ctx.fillRect(x, y, w, h);
    // Horizontal aluminum louver blades
    for (let ly = y + 6; ly < y + h; ly += 12) {
      ctx.fillStyle = '#c7d0db';
      ctx.fillRect(x, ly, w, 5);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x, ly, w, 1);
    }
    // Vertical mullions
    ctx.fillStyle = '#e5e9ef';
    for (let m = 1; m < 3; m++) ctx.fillRect(x + (w * m) / 3 - 2, y, 4, h);
  }

  // Blue sill band along the bottom
  ctx.fillStyle = '#3b82c4';
  ctx.fillRect(0, H - 26, W, 14);

  return toTexture(canvas);
}

/** Courtyard balcony spandrel: white panel with sky-blue / light-grey zigzag triangles (signature UDD pattern). */
function createZigzagSpandrelTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 128;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#f4f6f9';
  ctx.fillRect(0, 0, W, H);

  const seg = W / 4;
  for (let i = 0; i < 4; i++) {
    const x0 = i * seg;
    // Long sky-blue wedge rising left-to-right
    ctx.fillStyle = '#5b9fe0';
    ctx.beginPath();
    ctx.moveTo(x0, H);
    ctx.lineTo(x0 + seg * 0.55, 0);
    ctx.lineTo(x0 + seg * 0.8, 0);
    ctx.closePath();
    ctx.fill();
    // Soft grey shadow wedge falling right
    ctx.fillStyle = '#c9ced6';
    ctx.beginPath();
    ctx.moveTo(x0 + seg * 0.8, 0);
    ctx.lineTo(x0 + seg, H);
    ctx.lineTo(x0 + seg * 0.45, H);
    ctx.closePath();
    ctx.fill();
  }

  // Blue top coping line
  ctx.fillStyle = '#2f6fb5';
  ctx.fillRect(0, 0, W, 6);

  const tex = toTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/** Terracotta red metal standing seam pitched roof texture */
function createTerracottaRoofTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  // Terracotta red base with subtle warmth variation
  ctx.fillStyle = '#9e3428';
  ctx.fillRect(0, 0, W, H);

  // Standing seams / flutes along the slope
  const seams = 32;
  const step = W / seams;
  for (let i = 0; i < seams; i++) {
    const x = i * step;
    // Highlight
    ctx.fillStyle = 'rgba(255, 160, 140, 0.28)';
    ctx.fillRect(x, 0, 2, H);
    // Dark shadow groove
    ctx.fillStyle = 'rgba(60, 15, 10, 0.45)';
    ctx.fillRect(x + 2, 0, 3, H);
  }

  // Subtle horizontal panel segments
  for (let y = 0; y < H; y += 64) {
    ctx.fillStyle = 'rgba(50, 10, 5, 0.35)';
    ctx.fillRect(0, y, W, 2);
    ctx.fillStyle = 'rgba(255, 200, 180, 0.2)';
    ctx.fillRect(0, y + 2, W, 1);
  }

  const tex = toTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** High efficiency monocrystalline silicon solar panel grid texture */
function createSolarPanelTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  // Anodized aluminum dark silver border frame
  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, W, H);

  // Inner black silicon absorber area
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(8, 8, W - 16, H - 16);

  // Solar cells grid (e.g. 6x10 cells)
  const cols = 6;
  const rows = 10;
  const cellW = (W - 20) / cols;
  const cellH = (H - 20) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = 10 + c * cellW;
      const cy = 10 + r * cellH;

      // Dark blue-black wafer with anti-reflective coating
      const wafer = ctx.createLinearGradient(cx, cy, cx + cellW, cy + cellH);
      wafer.addColorStop(0, '#132038');
      wafer.addColorStop(0.5, '#0d1526');
      wafer.addColorStop(1, '#1e293b');
      ctx.fillStyle = wafer;
      ctx.fillRect(cx + 1, cy + 1, cellW - 2, cellH - 2);

      // Silver cell busbar lines
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + cellW * 0.33, cy + 1);
      ctx.lineTo(cx + cellW * 0.33, cy + cellH - 1);
      ctx.moveTo(cx + cellW * 0.67, cy + 1);
      ctx.lineTo(cx + cellW * 0.67, cy + cellH - 1);
      ctx.stroke();
    }
  }

  // Silver outer aluminum frame outline
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  const tex = toTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Corner Glass Atrium Curtain Wall texture: clear glazing on a silver/white aluminium grid (from photos) */
function createGlassAtriumTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  // Clear glass showing a pale interior
  ctx.fillStyle = '#8fa6bb';
  ctx.fillRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, 'rgba(235, 245, 255, 0.55)');
  grad.addColorStop(0.5, 'rgba(150, 175, 200, 0.25)');
  grad.addColorStop(1, 'rgba(60, 80, 100, 0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Silver perimeter frame
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, W - 10, H - 10);

  // Grid mullions (4 bays wide, 8 stories high)
  const cols = 4;
  const rows = 8;
  const bayW = W / cols;
  const bayH = H / rows;

  ctx.strokeStyle = '#d7dde5';
  ctx.lineWidth = 6;
  for (let c = 1; c < cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * bayW, 0);
    ctx.lineTo(c * bayW, H);
    ctx.stroke();
  }
  for (let r = 1; r < rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * bayH);
    ctx.lineTo(W, r * bayH);
    ctx.stroke();
  }

  // Highlights
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      ctx.strokeRect(c * bayW + 4, r * bayH + 4, bayW - 8, bayH - 8);
    }
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

  // Tower & Academic block division along rear (-Z) facade (from udd-main-tower.JPG)
  // Tower moved to right side as requested by user (x = -16.0 to -10.0, blue square):
  const towerX0 = -16.0;
  const towerX1 = -10.0;
  const towerW0 = towerX1 - towerX0; // 6.0m
  const towerCx = (towerX0 + towerX1) / 2; // -13.0m
  const rearTowerZ = backZ - 0.25; // -22.25
  const classX0 = towerX1; // -10.0m
  const classX1 = mainX1; // 8.0m
  const classW = classX1 - classX0; // 18.0m
  const classCx = (classX0 + classX1) / 2; // -1.0m

  // Shared materials
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b939c, roughness: 0.85 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
  const darkGlass = new THREE.MeshStandardMaterial({ color: 0x16222f, roughness: 0.15, metalness: 0.7 });
  const blueWall = new THREE.MeshStandardMaterial({ color: 0x1153b6, roughness: 0.45, metalness: 0.35 });
  const portalBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.2 });
  const gateBlue = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.45, metalness: 0.65 });
  const uddLetterMat = new THREE.MeshStandardMaterial({ color: 0x0038a8, roughness: 0.3, metalness: 0.4 });
  const yellowLineMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const stoneMat = new THREE.MeshStandardMaterial({ map: createStoneWallTexture(), roughness: 0.8 });
  const billboardMat = new THREE.MeshStandardMaterial({ map: createBillboardTexture(), roughness: 0.3 });
  const portalSignMat = new THREE.MeshStandardMaterial({ map: createPortalSignTexture(), roughness: 0.35 });
  const noIdSignMat = new THREE.MeshStandardMaterial({ map: createNoIdSignTexture(), roughness: 0.35 });
  const entranceSignMat = new THREE.MeshStandardMaterial({ map: createEntranceSignTexture(), roughness: 0.35 });
  const uddWallSignMat = new THREE.MeshStandardMaterial({ map: createUddWallPlacardTexture(), roughness: 0.35 });
  const roofLettersMat = new THREE.MeshStandardMaterial({ map: createRooftopLettersTexture(), roughness: 0.35 });
  const emblemMat = new THREE.MeshStandardMaterial({ map: createEmblemTexture(), roughness: 0.25 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xa1a6ad, roughness: 0.9 });
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x34383e, roughness: 0.95 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x3d7a31, roughness: 1 });
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x2e6b29, roughness: 0.9 });
  const shrubDark = new THREE.MeshStandardMaterial({ color: 0x1f5426, roughness: 0.85 });
  const shrubLight = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
  const planterMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
  const finMat = new THREE.MeshStandardMaterial({ color: 0xc8c3b7, roughness: 0.6, metalness: 0.15 });
  const servicesSignMat = new THREE.MeshStandardMaterial({ map: createServicesRoofSignTexture(), roughness: 0.35 });
  const officeGlassMat = new THREE.MeshStandardMaterial({ map: createServicesOfficeTexture(), roughness: 0.2, metalness: 0.5 });
  const curtainGlassMat = new THREE.MeshStandardMaterial({ map: createCurtainGlassTexture(), roughness: 0.15, metalness: 0.6 });
  const carWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.5 });
  const carDark = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.25, metalness: 0.6 });
  const carBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.5 });
  const uddTowerSignMat = new THREE.MeshStandardMaterial({
    map: createVerticalUddSignTexture(),
    roughness: 0.35,
    metalness: 0.2,
  });
  const towerSquareMat = new THREE.MeshStandardMaterial({
    map: createTowerSquareWindowTexture(),
    roughness: 0.2,
    metalness: 0.5,
  });
  const towerRibbonMat = new THREE.MeshStandardMaterial({
    map: createTowerWindowGridTexture(),
    roughness: 0.2,
    metalness: 0.5,
  });
  const acUnitMat = new THREE.MeshStandardMaterial({
    map: createAcUnitTexture(),
    roughness: 0.4,
    metalness: 0.3,
  });
  const deansListMat = new THREE.MeshStandardMaterial({
    map: createDeansListBoardTexture(),
    roughness: 0.3,
  });

  // ── Student Services & New 2-Storey Wing Footprint Dimensions ─────────────
  const admFrontX = -18.0;
  const admBackX = -31.0;
  const admD = admFrontX - admBackX; // 13.0m
  const admCx = (admFrontX + admBackX) / 2; // -24.5m
  const admW = 30.5; // spans from z = -20.0 to z = -50.5 (connects flush to 5-Storey Building at z = -50.5)
  const admCz = -35.25;

  // New 2-Storey Wing Footprint (Reduced 30% from the front, expanding the front terrace promenade)
  const wingFrontX = -23.44; // Was -20.2 (stepped back 3.24m / 30% of 10.8m depth)
  const wingBackX = admBackX; // -31.0m
  const wingD = wingFrontX - wingBackX; // 7.56m (was 10.8m)
  const wingCx = (wingFrontX + wingBackX) / 2; // -27.22m
  const wingZ0 = -20.0;
  const wingZ1 = -50.5; // meets 5-Storey North Wing flush at z = -50.5
  const wingW = wingZ0 - wingZ1; // 30.5m
  const wingCz = (wingZ0 + wingZ1) / 2; // -35.25m

  const newWingCurtainMat = new THREE.MeshStandardMaterial({
    map: createNewWingCurtainWallTexture(),
    roughness: 0.18,
    metalness: 0.55,
  });
  const newWingUpperMat = new THREE.MeshStandardMaterial({
    map: createNewWingUpperFacadeTexture(),
    roughness: 0.2,
    metalness: 0.5,
  });
  const newWingSignMat = new THREE.MeshStandardMaterial({
    map: createNewWingSignTexture(),
    roughness: 0.35,
    metalness: 0.2,
  });
  const footbridgeSignMat = new THREE.MeshStandardMaterial({
    map: createFootbridgeSignTexture('2F PEDESTRIAN SKYBRIDGE', 'TOWER BUILDING  ⮂  5-STOREY BUILDING'),
    roughness: 0.35,
    metalness: 0.2,
  });
  const footbridgeSignMat3F = new THREE.MeshStandardMaterial({
    map: createFootbridgeSignTexture('3F PEDESTRIAN SKYBRIDGE', 'TOWER BUILDING  ⮂  5-STOREY BUILDING'),
    roughness: 0.35,
    metalness: 0.2,
  });

  // ── 5-STOREY COURTYARD BUILDING (Exact 9-Point Pinpointed Boundary) ──────
  // Building Outline shifted inward by +3.5m in Z to connect flush into Student Services / Innovation Wing (at z = -50.5):
  const C5_SHIFT_Z = 3.5;
  const C5_POINTS: readonly [number, number][] = [
    [-31.0, -54.0 + C5_SHIFT_Z], // P1: Corner 1 - West North Wing front (meets Student Services corner at -50.5)
    [-8.0, -54.0 + C5_SHIFT_Z],  // P2: Corner 2 - Bend point from straight to angled North Wing
    [17.0, -57.5 + C5_SHIFT_Z],  // P3: Corner 3 - Inner corner junction (Corner Glass Atrium Tower)
    [23.0, -34.0 + C5_SHIFT_Z],  // P4: Corner 4 - East Wing south inner corner (shortened to remove end bay)
    [32.0, -37.0 + C5_SHIFT_Z],  // P5: Corner 5 - East Wing south outer corner (shortened to remove end bay)
    [24.0, -68.5 + C5_SHIFT_Z],  // P6: Corner 6 - East / North-East outer corner
    [-9.0, -62.5 + C5_SHIFT_Z],  // P7: Corner 7 - North Wing outer bend point A
    [-8.5, -63.0 + C5_SHIFT_Z],  // P8: Corner 8 - North Wing outer bend point B (notch)
    [-31.0, -62.5 + C5_SHIFT_Z], // P9: Corner 9 - West North Wing outer rear corner
  ] as const;

  interface SegmentInfo {
    idx: number;
    p1: readonly [number, number];
    p2: readonly [number, number];
    len: number;
    cx: number;
    cz: number;
    rotY: number;
  }

  const getSegmentInfo = (idx: number, p1: readonly [number, number], p2: readonly [number, number]): SegmentInfo => {
    const dx = p2[0] - p1[0];
    const dz = p2[1] - p1[1];
    const len = Math.hypot(dx, dz);
    const cx = (p1[0] + p2[0]) / 2;
    const cz = (p1[1] + p2[1]) / 2;
    const rotY = Math.atan2(-dz, dx);
    return { idx, p1, p2, len, cx, cz, rotY };
  };

  const C5_SEGMENTS: SegmentInfo[] = C5_POINTS.map((pt, i) => {
    const nextPt = C5_POINTS[(i + 1) % C5_POINTS.length];
    return getSegmentInfo(i, pt, nextPt);
  });

  // Segments 0, 1, 2 are Inner Corridors facing the courtyard; Segments 3..8 are Outer Walls
  const C5_INNER_SEGS = C5_SEGMENTS.slice(0, 3);
  const C5_OUTER_SEGS = C5_SEGMENTS.slice(3);

  // 2D Extrusion shape for floor slabs and roof deck
  const c5Shape = new THREE.Shape();
  c5Shape.moveTo(C5_POINTS[0][0], -C5_POINTS[0][1]);
  for (let i = 1; i < C5_POINTS.length; i++) {
    c5Shape.lineTo(C5_POINTS[i][0], -C5_POINTS[i][1]);
  }
  c5Shape.closePath();

  const createC5FloorSlab = (y: number, thickness: number = 0.28, mat: THREE.Material = concrete): THREE.Mesh => {
    const geom = new THREE.ExtrudeGeometry(c5Shape, { depth: thickness, bevelEnabled: false });
    geom.rotateX(-Math.PI / 2);
    geom.computeVertexNormals();
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.y = y;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
  };

  // Materials for 5-Storey Building
  // Palette from courtyard photos: crisp white walls + UDD sky/royal blue accents
  const creamWall = new THREE.MeshStandardMaterial({ color: 0xf1f3f6, roughness: 0.6 });
  const ochreWall = new THREE.MeshStandardMaterial({ color: 0x3b82c4, roughness: 0.55 });
  const soffitBlue = new THREE.MeshStandardMaterial({ color: 0x1f5fa8, roughness: 0.55 });
  const zigzagBaseTex = createZigzagSpandrelTexture();
  const spandrelMatCache = new Map<number, THREE.MeshStandardMaterial>();
  const getSpandrelMat = (len: number): THREE.MeshStandardMaterial => {
    const key = Math.round(len);
    let m = spandrelMatCache.get(key);
    if (!m) {
      const t = zigzagBaseTex.clone();
      t.wrapS = THREE.RepeatWrapping;
      t.repeat.set(Math.max(1, len / 12), 1);
      t.needsUpdate = true;
      m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.55 });
      spandrelMatCache.set(key, m);
    }
    return m;
  };
  /**
   * Adds the signature balcony detail from the photos to one corridor run:
   * white/blue zigzag spandrel panel, dark-blue ceiling soffit and blue
   * corbel brackets under the lintel beam.
   * axis 'x' = run along X facing +Z; axis 'z' = run along Z facing -X.
   */
  const addCourtyardBalconyDetail = (
    grp: THREE.Object3D, axis: 'x' | 'z', cx: number, cz: number, len: number, baseY: number,
  ) => {
    const sp = getSpandrelMat(len);
    const top = baseY + FH;
    if (axis === 'x') {
      grp.add(box(len, 1.15, 0.05, [creamWall, creamWall, creamWall, creamWall, sp, creamWall], cx, baseY + 0.6, cz + 0.16));
      grp.add(box(len, 0.03, 2.1, soffitBlue, cx, top - 0.17, cz - 1.1, false));
      grp.add(box(len, 0.12, 0.34, soffitBlue, cx, top - 0.56, cz + 0.02));
      for (let bx = cx - len / 2 + 1.5; bx < cx + len / 2; bx += 3.0) {
        grp.add(box(0.16, 0.4, 0.5, soffitBlue, bx, top - 0.82, cz + 0.05));
      }
    } else {
      grp.add(box(0.05, 1.15, len, [creamWall, sp, creamWall, creamWall, creamWall, creamWall], cx - 0.16, baseY + 0.6, cz));
      grp.add(box(2.1, 0.03, len, soffitBlue, cx + 1.1, top - 0.17, cz, false));
      grp.add(box(0.34, 0.12, len, soffitBlue, cx - 0.02, top - 0.56, cz));
      for (let bz = cz - len / 2 + 1.5; bz < cz + len / 2; bz += 3.0) {
        grp.add(box(0.5, 0.4, 0.16, soffitBlue, cx - 0.05, top - 0.82, bz));
      }
    }
  };
  const corridorWallMat = new THREE.MeshStandardMaterial({
    map: createCourtyardCorridorTexture(),
    roughness: 0.5,
  });
  const ribbon5FMat = new THREE.MeshStandardMaterial({
    map: createRibbonWindow5FTexture(),
    roughness: 0.2,
    metalness: 0.5,
  });
  const terracottaRoofMat = new THREE.MeshStandardMaterial({
    map: createTerracottaRoofTexture(),
    roughness: 0.5,
    metalness: 0.15,
  });
  const solarPanelMat = new THREE.MeshStandardMaterial({
    map: createSolarPanelTexture(),
    roughness: 0.18,
    metalness: 0.7,
  });
  const glassAtriumMat = new THREE.MeshStandardMaterial({
    map: createGlassAtriumTexture(),
    roughness: 0.15,
    metalness: 0.6,
    transparent: true,
    opacity: 0.92,
  });
  const latticeSteel = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.35, metalness: 0.8 });
  const latticeRed = new THREE.MeshStandardMaterial({ color: 0xd9381e, roughness: 0.45, metalness: 0.4 });


  // ── LEVEL 0: GROUND CONCOURSE, CHAPEL, PORTAL GATE & STREET ────────────────
  const ground = new THREE.Group();
  ground.name = 'MainCampus_L0_Ground';

  // 1. Site base, street, sidewalk & markings (extended to cover rear basketball court & student services building)
  ground.add(box(84, 0.3, 102, concrete, 2, -0.15, -28, false));
  ground.add(box(56, 0.08, 12, asphalt, 2, 0.0, 16, false));
  ground.add(box(56, 0.14, 4.5, concrete, 2, 0.07, 7.8, false)); // sidewalk
  for (let x = -24; x <= 28; x += 4) {
    ground.add(box(2.2, 0.02, 0.18, mats.whiteWall, x, 0.04, 16, false)); // road stripe
  }

  // 2. Main building ground floor core & classrooms
  ground.add(box(mainW, FH, depth, [whiteMat, whiteMat, roofMat, roofMat, whiteMat, whiteMat], mainCx, FH / 2, mainCz));

  // Driveway side ground windows & accent band (x = mainX1)
  ground.add(box(0.25, 0.45, depth + 0.2, blueWall, mainX1 + 0.12, FH - 0.225, mainCz));
  ground.add(box(0.08, 2.2, 5.0, darkGlass, mainX1 + 0.05, 1.8, -3.5, false));
  ground.add(box(0.08, 2.2, 5.0, darkGlass, mainX1 + 0.05, 1.8, -12.5, false));

  // ── Rear Facade & Covered Canopy facing Basketball Court (from udd-main-tower.JPG) ──
  // A. Tower Core Base (x = 2.0 to 8.0, center x = 5.0)
  ground.add(box(towerW0, FH, 0.5, whiteMat, towerCx, FH / 2, rearTowerZ));
  ground.add(box(0.35, FH, 0.6, blueWall, towerX0 + 0.18, FH / 2, rearTowerZ));
  ground.add(box(0.35, FH, 0.6, blueWall, towerX1 - 0.18, FH / 2, rearTowerZ));
  ground.add(box(2.2, 2.6, 0.1, darkGlass, towerCx, 1.4, rearTowerZ - 0.22, false));
  ground.add(box(2.3, 0.08, 0.12, mats.metalSilver, towerCx, 2.75, rearTowerZ - 0.22, false));

  // B. Classroom Ground Floor Wall (x = -16.0 to 2.0, center x = -7.0)
  ground.add(box(classW - 1.0, 2.8, 0.1, darkGlass, classCx, 1.6, backZ - 0.05, false));
  ground.add(box(classW, 0.45, 0.35, blueWall, classCx, FH - 0.225, backZ - 0.15));

  // C. Concrete Bleachers & Stepped Entrance Terrace under Canopy
  ground.add(box(classW + 1.0, 0.25, 4.6, concrete, classCx, 0.125, backZ - 2.5, false));
  ground.add(box(classW - 0.5, 0.25, 3.6, concrete, classCx, 0.375, backZ - 2.0, false));
  ground.add(box(classW - 1.5, 0.25, 2.6, concrete, classCx, 0.625, backZ - 1.5, false));

  // D. Covered Entrance Awning / Canopy with Arched Steel Trusses (udd-main-tower.JPG)
  const canopyZ0 = backZ; // -22.0
  const canopyZ1 = backZ - 4.8; // -26.8
  const canopyL = canopyZ0 - canopyZ1; // 4.8m projection
  const canopyCz = (canopyZ0 + canopyZ1) / 2; // -24.4
  const canopyY0 = 4.2;
  const canopyY1 = 3.3;
  const canopyYmid = (canopyY0 + canopyY1) / 2; // 3.75

  const canopyRoof = box(classW + 0.6, 0.12, canopyL, mats.metalDark, classCx, canopyYmid, canopyCz);
  canopyRoof.rotation.x = Math.atan2(canopyY0 - canopyY1, canopyL);
  ground.add(canopyRoof);

  // Fascia trim
  ground.add(box(classW + 0.7, 0.25, 0.1, mats.metalSilver, classCx, canopyY1, canopyZ1));
  ground.add(box(0.1, 0.25, canopyL, mats.metalSilver, classX0 - 0.3, canopyYmid, canopyCz));
  ground.add(box(0.1, 0.25, canopyL, mats.metalSilver, classX1 + 0.3, canopyYmid, canopyCz));

  // Canopy Tubular Columns & Arched Brackets
  const canopyColXs = [-8.5, -3.5, 2.5, 7.5];
  canopyColXs.forEach((cx) => {
    ground.add(rod(new THREE.Vector3(cx, 0, canopyZ1 + 0.15), new THREE.Vector3(cx, canopyY1, canopyZ1 + 0.15), 0.12, mats.metalSilver));
    ground.add(rod(new THREE.Vector3(cx, canopyY1 - 0.9, canopyZ1 + 0.15), new THREE.Vector3(cx - 1.4, canopyY1 - 0.05, canopyZ1 + 0.15), 0.06, mats.metalSilver));
    ground.add(rod(new THREE.Vector3(cx, canopyY1 - 0.9, canopyZ1 + 0.15), new THREE.Vector3(cx + 1.4, canopyY1 - 0.05, canopyZ1 + 0.15), 0.06, mats.metalSilver));
    ground.add(rod(new THREE.Vector3(cx, canopyY1 - 0.9, canopyZ1 + 0.15), new THREE.Vector3(cx, canopyYmid, canopyCz), 0.07, mats.metalSilver));
  });

  // E. Dean's List Announcement Board (mounted under canopy)
  ground.add(box(2.4, 1.25, 0.08, [mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark, deansListMat], -0.5, 1.9, canopyZ1 + 0.45));
  ground.add(rod(new THREE.Vector3(-0.5, 0, canopyZ1 + 0.45), new THREE.Vector3(-0.5, 1.3, canopyZ1 + 0.45), 0.05, mats.metalDark));

  // F. Stainless Steel Flagpole with Philippine Flag
  const flagX = 7.8;
  const flagZ = canopyZ1 - 0.3;
  ground.add(rod(new THREE.Vector3(flagX, 0, flagZ), new THREE.Vector3(flagX, 7.5, flagZ), 0.06, mats.metalSilver));
  const flagFinial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2 }));
  flagFinial.position.set(flagX, 7.55, flagZ);
  ground.add(flagFinial);
  const flagMat = new THREE.MeshStandardMaterial({ color: 0x0038a8, roughness: 0.6 });
  ground.add(box(0.9, 0.55, 0.02, flagMat, flagX + 0.48, 6.8, flagZ));

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

  // 4. Campus Main Entrance Portal & Gate (Real-world photo layout)
  // Left side: Dedicated covered Pedestrian Walkway ("people path") with security checkpoint,
  //            turnstile, "NO I.D. NO ENTRY" pillar sign, and "ENTRANCE ➔" guide sign.
  // Right side: Arched-top dark blue steel security gate with vertical pickets.
  // Right perimeter wall: Crisp white wall with giant 3D block letters "UDD" & overflowing landscaping.
  // Courtyard driveway: Row of parked motorcycles / scooters.

  const portalX0 = 8.5;
  const portalX1 = 18.5;
  const portalZ = frontZ + 0.8;
  const portalH = 6.4;
  const pedDividerX = 11.9; // Boundary between people path (left) and vehicular gate (right)
  const pedW = pedDividerX - portalX0; // 3.4m width
  const pedCx = (portalX0 + pedDividerX) / 2; // 10.2m
  const gateW = portalX1 - pedDividerX; // 6.6m width
  const gateCx = (pedDividerX + portalX1) / 2; // 15.2m

  // UDD Cyan/Blue Portal Pillars (as seen in photo)
  // Left pillar (at X = 8.5)
  ground.add(box(1.2, portalH, 1.2, portalBlueMat, portalX0, portalH / 2, portalZ));
  ground.add(box(1.4, 0.25, 1.4, concrete, portalX0, 0.125, portalZ)); // concrete footing
  ground.add(box(1.35, 0.18, 1.35, whiteMat, portalX0, portalH - 0.09, portalZ)); // top capital trim

  // Right pillar (at X = 18.5)
  ground.add(box(1.2, portalH, 1.2, portalBlueMat, portalX1, portalH / 2, portalZ));
  ground.add(box(1.4, 0.25, 1.4, concrete, portalX1, 0.125, portalZ));
  ground.add(box(1.35, 0.18, 1.35, whiteMat, portalX1, portalH - 0.09, portalZ));

  // Grand Cyan Beam: "UNIVERSIDAD DE DAGUPAN"
  const beamY = portalH + 0.9;
  ground.add(box(portalX1 - portalX0 + 2.0, 1.8, 0.9, portalSignMat, (portalX0 + portalX1) / 2, beamY, portalZ));
  // White/silver perimeter fascia trim around beam
  ground.add(box(portalX1 - portalX0 + 2.15, 0.08, 0.96, whiteMat, (portalX0 + portalX1) / 2, beamY + 0.94, portalZ));
  ground.add(box(portalX1 - portalX0 + 2.15, 0.08, 0.96, whiteMat, (portalX0 + portalX1) / 2, beamY - 0.94, portalZ));

  // Curved overhead steel arch truss with circular UDD seal
  const archRadius = (portalX1 - portalX0) / 2 + 0.5;
  const archCenter = new THREE.Vector3((portalX0 + portalX1) / 2, beamY + 0.9, portalZ);
  const archGeo = new THREE.TorusGeometry(archRadius, 0.16, 12, 32, Math.PI);
  const archMesh = new THREE.Mesh(archGeo, mats.metalSilver);
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

  // -------------------------------------------------------------------------
  // A. LEFT SIDE: DEDICATED PEOPLE PATH ("PEDESTRIAN WALKWAY")
  // -------------------------------------------------------------------------
  // Paved walkway slab with tactile guide line
  ground.add(box(pedW - 0.2, 0.06, 9.5, concrete, pedCx, 0.03, portalZ + 1.25, false));
  ground.add(box(0.18, 0.015, 9.3, yellowLineMat, pedCx, 0.068, portalZ + 1.25, false));

  // Overhead Walkway Canopy Awning (dark metal roof extending forward as in photo)
  const pedCanopyZ0 = portalZ - 1.2;
  const pedCanopyZ1 = portalZ + 3.8;
  const pedCanopyL = pedCanopyZ1 - pedCanopyZ0;
  const pedCanopyY = 3.9;
  // Corrugated dark roof awning
  ground.add(box(pedW + 0.4, 0.08, pedCanopyL, mats.metalDark, pedCx, pedCanopyY, (pedCanopyZ0 + pedCanopyZ1) / 2));
  // Roof fascia trim
  ground.add(box(pedW + 0.44, 0.2, 0.06, mats.metalSilver, pedCx, pedCanopyY, pedCanopyZ1));
  ground.add(box(0.06, 0.2, pedCanopyL, mats.metalSilver, pedCx - (pedW + 0.4) / 2, pedCanopyY, (pedCanopyZ0 + pedCanopyZ1) / 2));
  ground.add(box(0.06, 0.2, pedCanopyL, mats.metalSilver, pedCx + (pedW + 0.4) / 2, pedCanopyY, (pedCanopyZ0 + pedCanopyZ1) / 2));

  // Canopy Structural Support Columns (dark steel tubular posts)
  const colMat = mats.metalDark;
  ground.add(box(0.14, pedCanopyY, 0.14, colMat, portalX0 + 0.15, pedCanopyY / 2, pedCanopyZ1 - 0.2));
  ground.add(box(0.14, pedCanopyY, 0.14, colMat, pedDividerX - 0.15, pedCanopyY / 2, pedCanopyZ1 - 0.2));
  ground.add(box(0.14, pedCanopyY, 0.14, colMat, pedDividerX - 0.15, pedCanopyY / 2, portalZ + 1.4));
  // Crossbeams supporting canopy
  ground.add(box(pedW, 0.12, 0.12, colMat, pedCx, pedCanopyY - 0.1, pedCanopyZ1 - 0.2));
  ground.add(box(pedW, 0.12, 0.12, colMat, pedCx, pedCanopyY - 0.1, portalZ + 1.4));
  ground.add(box(pedW, 0.12, 0.12, colMat, pedCx, pedCanopyY - 0.1, portalZ - 1.0));

  // "NO I.D. NO ENTRY" Official Security Sign (Mounted on Left Blue Portal Pillar)
  // Photo reference: Mounted prominently on the front face of the blue entrance pillar
  const noIdSignW = 0.96;
  const noIdSignH = 1.28;
  ground.add(box(noIdSignW + 0.06, noIdSignH + 0.06, 0.03, gateBlue, portalX0, 3.75, portalZ + 0.62)); // frame backing
  ground.add(box(noIdSignW, noIdSignH, 0.02, noIdSignMat, portalX0, 3.75, portalZ + 0.64)); // sign face

  // Divider Barrier / Railing between People Path and Vehicular Gate
  // At X = pedDividerX (11.9), running along Z
  const dividerH = 1.35;
  const dividerZ0 = portalZ - 1.0;
  const dividerZ1 = portalZ + 2.4;
  const dividerL = dividerZ1 - dividerZ0;
  // Main divider post
  ground.add(box(0.24, 2.9, 0.24, portalBlueMat, pedDividerX, 1.45, portalZ));
  ground.add(box(0.28, 0.12, 0.28, whiteMat, pedDividerX, 2.95, portalZ));
  // Divider railing along the walkway
  ground.add(box(0.06, dividerH, dividerL, gateBlue, pedDividerX, dividerH / 2, (dividerZ0 + dividerZ1) / 2));
  // Railing top handrail & mid-rail
  ground.add(box(0.1, 0.06, dividerL + 0.1, mats.metalSilver, pedDividerX, dividerH, (dividerZ0 + dividerZ1) / 2));
  ground.add(box(0.08, 0.05, dividerL + 0.1, mats.metalDark, pedDividerX, dividerH * 0.5, (dividerZ0 + dividerZ1) / 2));
  ground.add(box(0.08, 0.05, dividerL + 0.1, mats.metalDark, pedDividerX, 0.15, (dividerZ0 + dividerZ1) / 2));

  // "ENTRANCE ➔" Directional Sign (Mounted on the divider railing facing incoming students)
  // Photo reference: Mounted at waist/eye height on the barrier facing the street entrance
  const entSignW = 0.88;
  const entSignH = 0.98;
  ground.add(box(entSignW + 0.04, entSignH + 0.04, 0.03, mats.metalDark, pedDividerX - 0.05, 1.45, portalZ + 0.28));
  ground.add(box(entSignW, entSignH, 0.02, entranceSignMat, pedDividerX - 0.05, 1.45, portalZ + 0.3));

  // Pedestrian Checkpoint: Tripod Access Turnstile & Guard Podium
  // Tripod turnstile cabinet
  const turnX = pedCx + 0.55;
  const turnZ = portalZ + 0.1;
  ground.add(box(0.32, 1.02, 0.72, mats.metalSilver, turnX, 0.51, turnZ));
  // Turnstile top scanner / green status LED indicator
  ground.add(box(0.12, 0.02, 0.18, darkGlass, turnX, 1.03, turnZ - 0.15));
  ground.add(box(0.08, 0.02, 0.08, new THREE.MeshBasicMaterial({ color: 0x22c55e }), turnX, 1.035, turnZ + 0.12));
  // Rotating tripod chrome arms
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.55, 12), mats.metalSilver);
  arm1.rotation.z = Math.PI / 4;
  arm1.position.set(turnX - 0.2, 0.88, turnZ);
  ground.add(arm1);
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.55, 12), mats.metalSilver);
  arm2.rotation.z = -Math.PI / 4;
  arm2.rotation.y = Math.PI / 3;
  arm2.position.set(turnX - 0.15, 0.8, turnZ - 0.15);
  ground.add(arm2);

  // Security guard checkpoint desk on the left
  ground.add(box(1.05, 0.82, 0.55, whiteMat, portalX0 + 0.9, 0.41, portalZ - 0.3));
  ground.add(box(1.1, 0.04, 0.6, mats.metalDark, portalX0 + 0.9, 0.84, portalZ - 0.3)); // desk top
  ground.add(box(0.42, 0.28, 0.05, darkGlass, portalX0 + 0.9, 1.02, portalZ - 0.3)); // monitor
  ground.add(box(0.45, 0.95, 0.45, mats.metalDark, portalX0 + 0.9, 0.48, portalZ - 0.8)); // chair

  // Helper: Stylized Scale Pedestrian Figure (Student)
  const createPedestrian = (x: number, z: number, rotY = 0, shirtMat: THREE.Material = blueWall, y = 0) => {
    const ped = new THREE.Group();
    ped.position.set(x, y, z);
    ped.rotation.y = rotY;
    // Legs
    ped.add(box(0.14, 0.82, 0.14, mats.metalDark, -0.1, 0.41, 0));
    ped.add(box(0.14, 0.82, 0.14, mats.metalDark, 0.1, 0.41, 0.08));
    // Torso / shirt
    ped.add(box(0.38, 0.52, 0.22, shirtMat, 0, 1.08, 0.02));
    // Backpack
    ped.add(box(0.3, 0.42, 0.16, carDark, 0, 1.08, -0.16));
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 }));
    head.position.set(0, 1.48, 0.02);
    ped.add(head);
    return ped;
  };
  // Student walking into campus along the people path
  ground.add(createPedestrian(pedCx - 0.25, portalZ + 2.2, Math.PI, blueWall));
  ground.add(createPedestrian(pedCx + 0.1, portalZ + 0.8, Math.PI, carWhite));

  // -------------------------------------------------------------------------
  // B. RIGHT SIDE: VEHICULAR SECURITY GATE (MOVED TO RIGHT SIDE)
  // -------------------------------------------------------------------------
  // Double-leaf arched-top dark blue steel security gate (matching real-life photo)
  // Ground roller wheel guide track
  ground.add(box(gateW, 0.04, 0.16, mats.metalDark, gateCx, 0.02, portalZ, false));

  // Bottom horizontal girder rail
  ground.add(box(gateW - 0.08, 0.12, 0.08, gateBlue, gateCx, 0.16, portalZ));
  // Mid horizontal crossbar rail
  ground.add(box(gateW - 0.08, 0.08, 0.08, gateBlue, gateCx, 1.35, portalZ));

  // Arched top rail profile:
  // Height is 2.85m at sides (x = pedDividerX, portalX1) and rises to 3.35m at gate center (x = gateCx)
  const archH0 = 2.85; // side height
  const archHCenter = 3.35; // peak height at center crown
  const halfGateW = gateW / 2;

  const getGateTopH = (x: number) => {
    const norm = (x - gateCx) / halfGateW;
    return archH0 + (archHCenter - archH0) * Math.max(0, 1 - norm * norm);
  };

  // Build arched top segments and vertical pickets
  const numPickets = 34;
  const picketSpacing = (gateW - 0.2) / (numPickets - 1);
  const picketGeo = new THREE.BoxGeometry(0.038, 1, 0.038);

  for (let i = 0; i < numPickets; i++) {
    const px = pedDividerX + 0.1 + i * picketSpacing;
    const topY = getGateTopH(px);
    const barH = topY - 0.16;
    const barMesh = new THREE.Mesh(picketGeo, gateBlue);
    barMesh.scale.set(1, barH, 1);
    barMesh.position.set(px, 0.16 + barH / 2, portalZ);
    barMesh.castShadow = true;
    ground.add(barMesh);

    // Spear/finial tip atop picket
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.08, 6), mats.metalSilver);
    finial.position.set(px, topY + 0.04, portalZ);
    ground.add(finial);

    // Segment of arched top rail connecting pickets
    if (i < numPickets - 1) {
      const nextX = px + picketSpacing;
      const nextY = getGateTopH(nextX);
      ground.add(rod(new THREE.Vector3(px, topY, portalZ), new THREE.Vector3(nextX, nextY, portalZ), 0.045, gateBlue));
    }
  }

  // Heavy-duty vertical stile framing
  // Left leaf hinge stile
  ground.add(box(0.1, 2.9, 0.1, gateBlue, pedDividerX + 0.05, 1.45, portalZ));
  // Center meeting stiles (split between two gate leaves)
  ground.add(box(0.08, archHCenter, 0.08, gateBlue, gateCx - 0.05, archHCenter / 2, portalZ));
  ground.add(box(0.08, archHCenter, 0.08, gateBlue, gateCx + 0.05, archHCenter / 2, portalZ));
  // Right leaf hinge stile
  ground.add(box(0.1, 2.9, 0.1, gateBlue, portalX1 - 0.05, 1.45, portalZ));
  // Central security lock box & slide bolt
  ground.add(box(0.3, 0.35, 0.12, mats.metalDark, gateCx, 1.35, portalZ));
  ground.add(box(0.12, 0.06, 0.16, mats.metalSilver, gateCx, 1.35, portalZ));

  // -------------------------------------------------------------------------
  // C. RIGHT PERIMETER WALL WITH GIANT 3D "UDD" LETTERS & LANDSCAPING
  // -------------------------------------------------------------------------
  // Photo reference: To the right of the gate/portal stands a crisp white perimeter wall
  // with giant 3D block letters "UDD" in royal blue with white front bevel, backed by
  // lush overflowing landscaping trees and green foliage!
  const wallX0 = portalX1; // 18.5
  const wallX1 = 26.5; // extends 8.0m to the right
  const wallW = wallX1 - wallX0; // 8.0m
  const wallCx = (wallX0 + wallX1) / 2; // 22.5m
  const wallZ = portalZ - 0.15; // 4.65m
  const wallH = 2.15;

  // Base concrete plinth foundation
  ground.add(box(wallW, 0.22, 0.6, concrete, wallCx, 0.11, wallZ));
  // Crisp white wall body
  ground.add(box(wallW, wallH, 0.45, whiteMat, wallCx, wallH / 2 + 0.1, wallZ));
  // Projecting coping cap atop the wall
  ground.add(box(wallW + 0.2, 0.14, 0.55, whiteMat, wallCx, wallH + 0.24, wallZ));

  // High-resolution backing placard on wall face
  ground.add(box(6.8, 1.85, 0.03, uddWallSignMat, wallCx, 1.25, wallZ + 0.24));

  // Helper: Giant 3D Block Letter for "UDD" on the wall
  // Letters stand out 0.16m from wall face in royal blue with crisp white front face
  const add3DLetter = (char: 'U' | 'D', cx: number, cy: number, cz: number) => {
    const d = 0.16;
    const fd = 0.025; // front highlight depth
    const fz = cz + d / 2 + fd / 2;
    if (char === 'U') {
      // Left vertical leg
      ground.add(box(0.26, 1.35, d, uddLetterMat, cx - 0.45, cy, cz));
      ground.add(box(0.26, 1.35, fd, whiteMat, cx - 0.45, cy, fz));
      // Right vertical leg
      ground.add(box(0.26, 1.35, d, uddLetterMat, cx + 0.45, cy, cz));
      ground.add(box(0.26, 1.35, fd, whiteMat, cx + 0.45, cy, fz));
      // Bottom curved base
      ground.add(box(0.68, 0.26, d, uddLetterMat, cx, cy - 0.545, cz));
      ground.add(box(0.68, 0.26, fd, whiteMat, cx, cy - 0.545, fz));
      // Angled inner fillets
      ground.add(rod(new THREE.Vector3(cx - 0.45, cy - 0.35, cz), new THREE.Vector3(cx - 0.2, cy - 0.545, cz), 0.12, uddLetterMat));
      ground.add(rod(new THREE.Vector3(cx + 0.45, cy - 0.35, cz), new THREE.Vector3(cx + 0.2, cy - 0.545, cz), 0.12, uddLetterMat));
    } else {
      // Back vertical spine
      ground.add(box(0.26, 1.35, d, uddLetterMat, cx - 0.45, cy, cz));
      ground.add(box(0.26, 1.35, fd, whiteMat, cx - 0.45, cy, fz));
      // Top bar
      ground.add(box(0.6, 0.24, d, uddLetterMat, cx - 0.02, cy + 0.555, cz));
      ground.add(box(0.6, 0.24, fd, whiteMat, cx - 0.02, cy + 0.555, fz));
      // Bottom bar
      ground.add(box(0.6, 0.24, d, uddLetterMat, cx - 0.02, cy - 0.555, cz));
      ground.add(box(0.6, 0.24, fd, whiteMat, cx - 0.02, cy - 0.555, fz));
      // Right outer curve spine
      ground.add(box(0.26, 0.95, d, uddLetterMat, cx + 0.46, cy, cz));
      ground.add(box(0.26, 0.95, fd, whiteMat, cx + 0.46, cy, fz));
      // Top-right and bottom-right corner transitions
      ground.add(rod(new THREE.Vector3(cx + 0.28, cy + 0.555, cz), new THREE.Vector3(cx + 0.46, cy + 0.38, cz), 0.12, uddLetterMat));
      ground.add(rod(new THREE.Vector3(cx + 0.28, cy - 0.555, cz), new THREE.Vector3(cx + 0.46, cy - 0.38, cz), 0.12, uddLetterMat));
    }
  };

  const letterZ = wallZ + 0.28;
  add3DLetter('U', 20.35, 1.25, letterZ);
  add3DLetter('D', 22.35, 1.25, letterZ);
  add3DLetter('D', 24.35, 1.25, letterZ);

  // Landscaping: Lush tropical foliage planter behind and spilling over the wall
  // (As prominent in the reference photograph)
  const planterZ = wallZ - 1.1;
  ground.add(box(wallW, 0.7, 1.6, planterMat, wallCx, 0.35, planterZ));
  ground.add(box(wallW - 0.2, 0.1, 1.4, grassMat, wallCx, 0.71, planterZ));

  // Shrubbery & tree crowns spilling over wall top
  const foliageGeo = new THREE.DodecahedronGeometry(1.0, 1);
  const foliagePositions: [number, number, number, number, THREE.Material][] = [
    [19.4, 2.7, wallZ - 0.6, 0.85, shrubLight],
    [20.8, 3.2, wallZ - 0.8, 1.15, shrubDark],
    [22.2, 2.9, wallZ - 0.5, 0.95, shrubLight],
    [23.6, 3.4, wallZ - 0.9, 1.25, grassMat],
    [25.0, 3.0, wallZ - 0.6, 1.05, shrubDark],
    [26.1, 2.6, wallZ - 0.5, 0.85, shrubLight],
    // Taller background tropical trees
    [21.5, 4.4, wallZ - 1.4, 1.45, shrubDark],
    [24.2, 4.7, wallZ - 1.5, 1.55, shrubLight],
  ];
  foliagePositions.forEach(([fx, fy, fz, fscale, fmat]) => {
    const fMesh = new THREE.Mesh(foliageGeo, fmat);
    fMesh.scale.set(fscale, fscale * 0.95, fscale);
    fMesh.position.set(fx, fy, fz);
    fMesh.castShadow = true;
    ground.add(fMesh);
  });

  // Low trimmed boxwood hedge along sidewalk in front of wall
  ground.add(box(wallW - 0.4, 0.42, 0.38, shrubMat, wallCx, 0.21, wallZ + 0.85));

  // -------------------------------------------------------------------------
  // D. COURTYARD DRIVEWAY: MOTORCYCLE PARKING ROW (INSIDE GATE)
  // -------------------------------------------------------------------------
  // Photo reference: Looking through the entrance gate, a neat row of parked
  // motorcycles and scooters lines the right side of the inner courtyard driveway.
  const createMotorcycle = (x: number, z: number, rotY: number, colorMat: THREE.Material) => {
    const moto = new THREE.Group();
    moto.position.set(x, 0, z);
    moto.rotation.y = rotY;

    // Dual wheels / tires
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 16);
    const wFront = new THREE.Mesh(wheelGeo, mats.metalDark);
    wFront.rotation.z = Math.PI / 2;
    wFront.position.set(0, 0.28, 0.72);
    moto.add(wFront);
    const wRear = new THREE.Mesh(wheelGeo, mats.metalDark);
    wRear.rotation.z = Math.PI / 2;
    wRear.position.set(0, 0.28, -0.68);
    moto.add(wRear);

    // Chassis frame & engine block
    moto.add(box(0.22, 0.32, 0.75, mats.metalDark, 0, 0.36, 0));
    moto.add(box(0.24, 0.24, 0.35, mats.metalSilver, 0, 0.32, 0.05));

    // Body fairing & fuel tank
    moto.add(box(0.28, 0.25, 0.55, colorMat, 0, 0.58, 0.18));
    // Seat
    moto.add(box(0.24, 0.12, 0.6, mats.metalDark, 0, 0.62, -0.28));

    // Front fork & handlebars
    moto.add(rod(new THREE.Vector3(0, 0.28, 0.72), new THREE.Vector3(0, 0.82, 0.52), 0.025, mats.metalSilver));
    moto.add(box(0.55, 0.04, 0.04, mats.metalDark, 0, 0.82, 0.52)); // handlebars
    // Headlight
    moto.add(box(0.14, 0.12, 0.08, whiteMat, 0, 0.74, 0.62));
    // Exhaust pipe
    moto.add(rod(new THREE.Vector3(0.12, 0.28, 0.05), new THREE.Vector3(0.14, 0.24, -0.72), 0.035, mats.metalSilver));

    // Kickstand lean (slight roll)
    moto.rotation.z = 0.08;
    return moto;
  };

  // Row of 4 parked motorcycles inside courtyard
  const motoZList = [portalZ - 2.2, portalZ - 3.6, portalZ - 5.0, portalZ - 6.4];
  const motoColors = [blueWall, carDark, carWhite, portalBlueMat];
  const motoX = 16.8;

  motoZList.forEach((mz, idx) => {
    // Painted parking stall line
    ground.add(box(2.2, 0.015, 0.08, yellowLineMat, motoX - 0.2, 0.01, mz, false));
    // Parked motorcycle angled into stall
    ground.add(createMotorcycle(motoX, mz, -Math.PI / 3, motoColors[idx]));
  });

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

  // 6. UDD Outdoor Basketball Court (Rear campus athletic court - open-air)
  const courtMat = new THREE.MeshStandardMaterial({ map: createBasketballCourtTexture(), roughness: 0.35, metalness: 0.08 });
  const hoopOrange = new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.3, metalness: 0.4 });
  const netMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });

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

  // Official Basketball ball on court
  const ballMat = new THREE.MeshStandardMaterial({ color: 0xee5d1a, roughness: 0.55, metalness: 0.05 });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), ballMat);
  ball.position.set(courtX + 0.9, 0.48, courtZ - 0.6);
  ball.castShadow = true;
  ground.add(ball);

  // 7. UDD Student Services & Administrative Hall (Rear campus building - SZD Design Studio)
  // Relocated to the exact rear lot area behind the basketball court (facing +X towards court)

  // Paved pedestrian apron connecting basketball court to services building
  ground.add(box(4.0, 0.08, admW + 2, concrete, -16.0, 0.04, admCz, false));

  // Ground concourse foundation slab
  ground.add(box(admD, 0.3, admW, concrete, admCx, 0.15, admCz, false));

  // Rear and left perimeter walls (crisp white ACP cladding)
  ground.add(box(0.4, FH, admW, whiteMat, admBackX, FH / 2, admCz));
  ground.add(box(admD, FH, 0.4, whiteMat, admCx, FH / 2, -20.0));

  // Recessed ground-floor glass storefronts (Cashier, Registrar, Information, Student Services)
  ground.add(box(0.1, FH - 0.4, admW - 2.0, [officeGlassMat, darkGlass, whiteMat, whiteMat, whiteMat, whiteMat], admFrontX - 1.2, FH / 2, admCz));

  // White structural colonnade along the front concourse line (facing court)
  const colZs = [-22.0, -28.0, -34.0, -40.0, -46.0, -50.5];
  colZs.forEach((cz) => {
    ground.add(box(0.65, FH, 0.65, whiteMat, admFrontX, FH / 2, cz));
  });

  // Green landscape planter boxes along the concourse
  [-24.0, -33.0, -42.0, -48.5].forEach((pz) => {
    ground.add(box(0.8, 0.5, 4.5, planterMat, admFrontX + 1.2, 0.25, pz));
    ground.add(box(0.6, 0.35, 4.3, shrubDark, admFrontX + 1.2, 0.6, pz));
  });

  // Parked cars in the courtyard plaza (as seen in SZD render)
  ground.add(createCar(-22.0, -26.0, carWhite));
  ground.add(createCar(-14.0, -36.0, carBlue));
  ground.add(createCar(-14.0, -44.0, carDark));

  // Paved courtyard concourse connecting basketball court to 5-Storey Building colonnade
  ground.add(box(56.0, 0.08, 8.0, concrete, -2.0, 0.04, -47.0, false));
  ground.add(box(8.0, 0.08, 24.0, concrete, 20.5, 0.04, -42.0, false));

  // ── 8. 5-Storey Courtyard Building (Level 0 / 1F: Exact 9-Point Boundary) ──
  // Ground concrete floor slab extruded to exact 9-point perimeter
  ground.add(createC5FloorSlab(0, 0.3, concrete));

  // A. Inner Corridor Colonnades & Recessed Storefronts (Segments 0, 1, 2)
  C5_INNER_SEGS.forEach((seg) => {
    const grp = new THREE.Group();
    grp.position.set(seg.cx, 0, seg.cz);
    grp.rotation.y = seg.rotY;

    // Colonnade along the inner corridor boundary line
    const colSpacing = 4.0;
    const colCount = Math.floor(seg.len / colSpacing);
    for (let c = 0; c <= colCount; c++) {
      const lx = -seg.len / 2 + (c * seg.len) / colCount;
      grp.add(box(0.65, FH, 0.65, creamWall, lx, FH / 2, 0));
    }

    // Corridor ceiling soffit & fascia beam
    grp.add(box(seg.len, 0.4, 0.5, creamWall, 0, FH - 0.2, 0));
    grp.add(box(seg.len, 0.12, 2.2, soffitBlue, 0, FH - 0.06, -1.1, false));

    // Recessed storefront wall (offset 2.2m inward)
    if (seg.idx === 0) {
      // West North Wing: "iHub" Innovation Center & Technology Classrooms
      grp.add(box(seg.len - 0.6, FH - 0.4, 0.18, [darkGlass, officeGlassMat, creamWall, creamWall, creamWall, creamWall], 0, FH / 2, -2.2));
      // "iHub" illuminated portal sign above entrance
      grp.add(box(4.5, 0.8, 0.22, blueWall, -3.0, FH - 0.6, -2.1));
    } else if (seg.idx === 1) {
      // Middle Angled North Wing: Lecture Hall storefronts & double glass doors
      grp.add(box(seg.len - 0.6, FH - 0.4, 0.18, [darkGlass, officeGlassMat, creamWall, creamWall, creamWall, creamWall], 0, FH / 2, -2.2));
    } else {
      // East Wing: "MAC Lab" with technology storefront glazing
      grp.add(box(seg.len - 0.6, FH - 0.4, 0.18, [officeGlassMat, darkGlass, creamWall, creamWall, creamWall, creamWall], 0, FH / 2, -2.2));
      // "MAC" laboratory plaque
      grp.add(box(3.2, 0.75, 0.2, mats.metalDark, 4.0, FH - 0.6, -2.1));
    }

    ground.add(grp);
  });

  // B. Outer Solid Perimeter Walls (Segments 3..8)
  C5_OUTER_SEGS.forEach((seg) => {
    const wall = box(seg.len, FH, 0.35, creamWall, seg.cx, FH / 2, seg.cz);
    wall.rotation.y = seg.rotY;
    ground.add(wall);
  });

  // C. Corner Glass Atrium Foyer at P3 [17.0, -57.5]
  const p3 = C5_POINTS[2];
  ground.add(box(4.8, FH, 4.8, glassAtriumMat, p3[0], FH / 2, p3[1]));
  ground.add(box(0.35, FH, 0.35, blueWall, p3[0] - 2.2, FH / 2, p3[1] + 2.2));
  ground.add(box(0.35, FH, 0.35, blueWall, p3[0] + 2.2, FH / 2, p3[1] - 2.2));



  // Courtyard corner garden planter (from reference photo)
  ground.add(box(2.2, 0.4, 3.2, planterMat, 22.0, 0.2, -22.5 + C5_SHIFT_Z));
  ground.add(box(2.0, 0.25, 3.0, grassMat, 22.0, 0.45, -22.5 + C5_SHIFT_Z));
  const gardenTree = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), shrubLight);
  gardenTree.position.set(22.0, 1.3, -22.5 + C5_SHIFT_Z);
  gardenTree.castShadow = true;
  ground.add(gardenTree);

  // D. Parked Courtyard Vehicles (cleared vehicle at X: 18.0, Z: -25.5 to -27.0)
  ground.add(createCar(18.0, -36.5 + C5_SHIFT_Z, carWhite));

  // ── 9. 2F Footbridge Ground Support Piers (from y = 0 to baseY = FH) ──────
  // Placed along the exact path connecting Tower Building and 5-Storey Building:
  // Approach (10.5, -18.5), Point 1 (14.0, -18.5), Mid-Span 1 (20.0, -18.75),
  // Point 2 Elbow (26.0, -19.0), Mid-Span 2 (27.25, -23.75), Point 3 (28.5, -28.5),
  // and 5-Storey Entrance (28.5, -31.5)
  const footbridgePiers: Array<[number, number, number]> = [
    [8.0, -22.575, 0],
    [14.25, -22.575, 0],
    [19.5, -22.575, 0],
    [23.5, -23.5, 0.5],
    [24.065, -30.77, -0.248],
  ];

  footbridgePiers.forEach(([px, pz, rotY]) => {
    // Square reinforced concrete footing
    ground.add(box(1.2, 0.28, 1.2, concrete, px, 0.14, pz));

    // Sturdy cylindrical concrete shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, FH - 0.5, 16), mats.whiteWall);
    shaft.position.set(px, (FH - 0.5) / 2 + 0.28, pz);
    shaft.castShadow = true;
    ground.add(shaft);

    // Royal blue protective base collar
    const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.34, 0.6, 16), blueWall);
    baseCollar.position.set(px, 0.58, pz);
    baseCollar.castShadow = true;
    ground.add(baseCollar);

    // Royal blue architectural capital collar
    const capCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.28, 0.32, 16), blueWall);
    capCollar.position.set(px, FH - 0.42, pz);
    capCollar.castShadow = true;
    ground.add(capCollar);

    // Transverse pier cap beam supporting bridge box girders
    const capBeam = box(2.6, 0.35, 0.65, concrete, px, FH - 0.175, pz);
    capBeam.rotation.y = rotY;
    ground.add(capBeam);
  });

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

    // Main floor volume (with crisp white ACP wall on +X face matching udd-main-tower.JPG)
    g.add(box(mainW, FH, depth, [whiteMat, tierSideMat, roofMat, roofMat, tierFrontMat, whiteMat], mainCx, cy, mainCz));

    // Left-side classroom ribbon windows (-x wall)
    for (let wz = -4; wz >= -18; wz -= 6) {
      g.add(box(0.08, 1.2, 4.4, darkGlass, mainX0 - 0.05, cy, wz, false));
      g.add(box(0.12, 0.08, 4.5, blueWall, mainX0 - 0.06, cy - 0.65, wz, false)); // sill
      g.add(box(0.12, 0.08, 4.5, blueWall, mainX0 - 0.06, cy + 0.65, wz, false)); // lintel
    }

    // ── Driveway side (x = mainX1) ─────────────────────────────────────────────
    g.add(box(0.25, 0.45, depth + 0.2, blueWall, mainX1 + 0.12, baseY + 0.225, mainCz));
    g.add(box(0.35, 0.22, depth + 0.4, whiteMat, mainX1 + 0.16, baseY + 0.45, mainCz));
    [-7.5, -13.0, -18.5].forEach((wz) => {
      g.add(box(0.08, 1.5, 4.4, darkGlass, mainX1 + 0.05, cy + 0.2, wz, false));
    });

    // ── Rear Facade facing Basketball Court (from udd-main-tower.JPG) ──────────
    // 1. Tower Core Section (x = 2.0 to 8.0, center x = 5.0)
    g.add(box(towerW0, FH, 0.5, whiteMat, towerCx, cy, rearTowerZ));
    g.add(box(0.35, FH, 0.6, blueWall, towerX0 + 0.18, cy, rearTowerZ));
    g.add(box(0.35, FH, 0.6, blueWall, towerX1 - 0.18, cy, rearTowerZ));

    // Multi-pane square grid windows on Tower (f = 1, 2, 3, 4)
    g.add(box(2.2, 1.8, 0.08, [whiteMat, whiteMat, whiteMat, whiteMat, whiteMat, towerSquareMat], towerCx, cy + 0.15, rearTowerZ - 0.22));
    g.add(box(2.4, 0.1, 0.15, mats.whiteWall, towerCx, cy - 0.8, rearTowerZ - 0.22));
    g.add(box(2.4, 0.1, 0.15, mats.whiteWall, towerCx, cy + 1.1, rearTowerZ - 0.22));

    // 2. Academic Classroom Block with Balconies & AC Units (x = -16.0 to 2.0)

    // A. Continuous Royal Blue Horizontal Floor Accent Band
    g.add(box(classW, 0.45, 0.35, blueWall, classCx, baseY + 0.225, backZ - 0.15));
    // Cantilevered white floor slab directly above the blue band
    g.add(box(classW + 0.2, 0.22, 0.45, whiteMat, classCx, baseY + 0.45, backZ - 0.2));

    // B. Classroom Multi-Pane Ribbon Windows (recessed behind balconies)
    const ribbonBays = [-7.0, -1.0, 5.0];
    ribbonBays.forEach((rx) => {
      g.add(box(4.6, 1.6, 0.08, [whiteMat, whiteMat, whiteMat, whiteMat, whiteMat, towerRibbonMat], rx, cy + 0.25, backZ - 0.06));
      g.add(box(0.08, 1.65, 0.1, whiteMat, rx - 1.15, cy + 0.25, backZ - 0.08));
      g.add(box(0.08, 1.65, 0.1, whiteMat, rx + 1.15, cy + 0.25, backZ - 0.08));
    });

    // C. Cantilevered Concrete Balconies
    const balcD = 1.15;
    const balcZ = backZ - balcD / 2; // -22.575
    const balcFrontZ = backZ - balcD; // -23.15
    g.add(box(classW - 0.2, 0.2, balcD, whiteMat, classCx, baseY + 0.55, balcZ));
    g.add(box(classW - 0.2, 0.85, 0.12, whiteMat, classCx, baseY + 1.05, balcFrontZ));
    g.add(box(classW, 0.12, 0.18, blueWall, classCx, baseY + 1.52, balcFrontZ));
    g.add(box(0.15, 0.85, balcD, whiteMat, classX0 + 0.1, baseY + 1.05, balcZ));
    if (f !== 1 && f !== 2) {
      // 2F (f=1) and 3F (f=2) right ends connect directly into the pedestrian skybridges
      g.add(box(0.15, 0.85, balcD, whiteMat, classX1 - 0.1, baseY + 1.05, balcZ));
    }

    // D. Wall-Mounted Air Conditioner Outdoor Compressor Units on Brackets (udd-main-tower.JPG)
    const acConfigs: Record<number, number[]> = {
      1: [-7.0, -1.0],
      2: [-7.5, -1.5, 4.5],
      3: [-6.8, -0.8, 5.2],
      4: [-7.0, -1.2, 5.0],
    };
    (acConfigs[f] || []).forEach((acX) => {
      const acY = baseY + 1.85;
      const acZ = balcFrontZ + 0.15;
      g.add(box(0.85, 0.62, 0.38, [mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver, acUnitMat], acX, acY, acZ));
      g.add(box(0.04, 0.45, 0.42, mats.metalDark, acX - 0.28, acY - 0.35, acZ));
      g.add(box(0.04, 0.45, 0.42, mats.metalDark, acX + 0.28, acY - 0.35, acZ));
    });

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

    // ── Upper Tiers of Student Services & Administrative Hall (Rear Building) ──
    if (f === 1) {
      // 2F Level:
      // Floor slab & perimeter walls
      g.add(box(admD, 0.28, admW, roofMat, admCx, baseY + 0.14, admCz));
      g.add(box(0.4, FH, admW, whiteMat, admBackX, cy, admCz));
      g.add(box(admD, FH, 0.4, whiteMat, admCx, cy, -20.0));

      // Left 2-Storey Royal Blue Portal Box (2F portion, facing +X towards court)
      g.add(box(1.4, FH, 0.65, blueWall, admFrontX + 0.6, cy, -21.35));
      g.add(box(1.4, FH, 0.65, blueWall, admFrontX + 0.6, cy, -31.65));
      g.add(box(1.4, 0.45, 11.0, blueWall, admFrontX + 0.6, baseY + 0.225, -26.5)); // bottom sill
      g.add(box(0.08, FH - 0.6, 9.7, [curtainGlassMat, darkGlass, whiteMat, whiteMat, whiteMat, whiteMat], admFrontX + 1.0, cy, -26.5));
      g.add(box(0.5, FH, 0.4, whiteMat, admFrontX + 0.7, cy, -24.5));
      g.add(box(0.5, FH, 0.4, whiteMat, admFrontX + 0.7, cy, -28.5));

      // Center Vertical Slatted Bay (2F portion)
      g.add(box(0.3, FH, 5.0, whiteMat, admFrontX - 0.2, cy, -34.5));
      for (let sz = -32.4; sz >= -36.6; sz -= 0.42) {
        g.add(box(0.4, FH, 0.12, finMat, admFrontX, cy, sz));
      }

      // Right Dynamic Blue Frame (2F portion, extended to right edge at z = -50.5)
      g.add(box(0.3, 1.2, 13.5, whiteMat, admFrontX, baseY + 0.6, -43.75));
      g.add(box(0.08, 2.3, 13.1, darkGlass, admFrontX + 0.05, baseY + 2.35, -43.75));
      g.add(box(0.5, FH, 0.6, blueWall, admFrontX, cy, -50.5));
      g.add(box(admD, FH, 0.4, whiteMat, admCx, cy, -50.5));
    } else if (f === 2) {
      // 3F Level:
      // Floor slab & perimeter walls
      g.add(box(admD, 0.28, admW, roofMat, admCx, baseY + 0.14, admCz));
      g.add(box(0.4, FH, admW, whiteMat, admBackX, cy, admCz));
      g.add(box(admD, FH, 0.4, whiteMat, admCx, cy, -20.0));
      g.add(box(admD, FH, 0.4, whiteMat, admCx, cy, -50.5));

      // Left 2-Storey Royal Blue Portal Box (3F portion)
      g.add(box(1.4, FH, 0.65, blueWall, admFrontX + 0.6, cy, -21.35));
      g.add(box(1.4, FH, 0.65, blueWall, admFrontX + 0.6, cy, -31.65));
      g.add(box(1.4, 0.6, 11.0, blueWall, admFrontX + 0.6, baseY + FH - 0.3, -26.5)); // top header lintel
      g.add(box(0.08, FH - 0.6, 9.7, [curtainGlassMat, darkGlass, whiteMat, whiteMat, whiteMat, whiteMat], admFrontX + 1.0, cy, -26.5));
      g.add(box(0.5, FH, 0.4, whiteMat, admFrontX + 0.7, cy, -24.5));
      g.add(box(0.5, FH, 0.4, whiteMat, admFrontX + 0.7, cy, -28.5));

      // Center Vertical Slatted Bay & Circular University Seal (3F portion)
      g.add(box(0.3, FH, 5.0, whiteMat, admFrontX - 0.2, cy, -34.5));
      for (let sz = -32.4; sz >= -36.6; sz -= 0.42) {
        g.add(box(0.4, FH, 0.12, finMat, admFrontX, cy, sz));
      }
      // Circular Universidad de Dagupan Seal Medallion (facing +X)
      const sSeal = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.18, 48), emblemMat);
      sSeal.rotation.z = Math.PI / 2;
      sSeal.position.set(admFrontX + 0.25, baseY + 1.9, -34.5);
      sSeal.castShadow = true;
      g.add(sSeal);
      const sRing = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.1, 16, 48), blueWall);
      sRing.rotation.y = Math.PI / 2;
      sRing.position.set(admFrontX + 0.28, baseY + 1.9, -34.5);
      g.add(sRing);

      // Right Dynamic Blue Frame (3F portion, extended to right edge at z = -50.5)
      g.add(box(1.2, 0.7, 13.5, blueWall, admFrontX + 0.4, baseY + FH - 0.35, -43.75));
      g.add(box(1.2, FH, 0.7, blueWall, admFrontX + 0.4, cy, -50.5));
      g.add(box(0.08, 2.5, 13.1, darkGlass, admFrontX + 0.05, baseY + 1.6, -43.75));
    } else if (f === 3) {
      // ── 4F Level: Garden Terrace & Storey 1 of New Innovation Wing ──────────
      // Foundation / Floor slab (spans both terrace and new wing)
      g.add(box(admD, 0.3, admW, concrete, admCx, baseY + 0.15, admCz));

      // 1. Front Garden Terrace & Parapet Signage (facing +X towards court)
      // Front terrace parapet wall with silver coping
      g.add(box(0.3, 1.1, admW, whiteMat, admFrontX, baseY + 0.55, admCz));
      g.add(box(0.4, 0.12, admW + 0.2, mats.metalSilver, admFrontX, baseY + 1.15, admCz));

      // Rooftop Collegiate Signage: "UNIVERSIDAD DE DAGUPAN" (Facing +X)
      g.add(box(0.25, 1.45, 14.5, [servicesSignMat, mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark], admFrontX + 0.15, baseY + 1.825, -35.0));

      // Garden Terrace Planters & Ornamental Trees
      [-24, -30, -36, -42, -48].forEach((rz) => {
        g.add(box(0.8, 0.5, 3.8, planterMat, admFrontX - 0.8, baseY + 0.4, rz));
        g.add(box(0.6, 0.4, 3.6, shrubDark, admFrontX - 0.8, baseY + 0.8, rz));
        const tree = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 1), shrubLight);
        tree.position.set(admFrontX - 0.8, baseY + 1.6, rz);
        tree.castShadow = true;
        g.add(tree);
      });

      // Terrace side safety parapets (from front edge x = -18.0 to building front x = -23.44)
      const terrL = Math.abs(wingFrontX - admFrontX); // 5.44m
      const terrMidX = (admFrontX + wingFrontX) / 2; // -20.72m
      g.add(box(terrL, 1.1, 0.3, whiteMat, terrMidX, baseY + 0.55, -20.0));
      g.add(box(terrL + 0.1, 0.12, 0.38, mats.metalSilver, terrMidX, baseY + 1.15, -20.0));
      // (North end opens seamlessly into the 6-storey North Wing corridor via the hall portal)

      // Paver walkway floor on terrace
      g.add(box(terrL, 0.04, wingW - 0.2, mats.metalDark, terrMidX, baseY + 0.32, wingCz));
      // Connecting bridge threshold from terrace into angled wing portal
      g.add(box(terrL, 0.06, 4.0, mats.metalDark, terrMidX, baseY + 0.32, -48.0));

      // 2. STOREY 1 OF THE NEW INNOVATION WING (on squared area: x = -20.2 to -31.0, z = -20.0 to -46.0)
      // Interior floor finish
      g.add(box(wingD - 0.4, 0.05, wingW - 0.4, roofMat, wingCx, baseY + 0.32, wingCz));

      // Rear Wall (-X face)
      g.add(box(0.4, FH, wingW, whiteMat, wingBackX, cy, wingCz));
      g.add(box(0.08, 1.6, wingW - 4.0, [darkGlass, darkGlass, whiteMat, whiteMat, darkGlass, darkGlass], wingBackX - 0.12, cy + 0.3, wingCz));
      g.add(box(0.12, 0.08, wingW - 3.8, blueWall, wingBackX - 0.14, cy - 0.55, wingCz));
      g.add(box(0.12, 0.08, wingW - 3.8, blueWall, wingBackX - 0.14, cy + 1.15, wingCz));
      // Rear wall AC compressors on brackets
      [-24.0, -33.0, -42.0].forEach((acZ) => {
        const acX = wingBackX - 0.38;
        const acY = cy + 0.4;
        g.add(box(0.85, 0.62, 0.38, [mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver, acUnitMat, mats.metalSilver], acX, acY, acZ));
        g.add(box(0.04, 0.45, 0.42, mats.metalDark, acX + 0.28, acY - 0.35, acZ));
        g.add(box(0.04, 0.45, 0.42, mats.metalDark, acX - 0.28, acY - 0.35, acZ));
      });

      // Left Wall (-Z face, z = wingZ0)
      g.add(box(wingD, FH, 0.4, whiteMat, wingCx, cy, wingZ0));
      g.add(box(wingD - 2.0, 1.5, 0.08, darkGlass, wingCx, cy + 0.2, wingZ0 - 0.05));
      g.add(box(wingD - 1.8, 0.08, 0.12, blueWall, wingCx, cy - 0.6, wingZ0 - 0.06));
      g.add(box(wingD - 1.8, 0.08, 0.12, blueWall, wingCx, cy + 1.0, wingZ0 - 0.06));

      // Right Wall (+Z face, z = wingZ1)
      g.add(box(wingD, FH, 0.4, whiteMat, wingCx, cy, wingZ1));

      // Front Facade (+X face, x = wingFrontX)
      // Corner columns
      g.add(box(0.65, FH, 0.65, whiteMat, wingFrontX, cy, wingZ0 + 0.32));
      g.add(box(0.65, FH, 0.65, whiteMat, wingFrontX, cy, wingZ1 - 0.32));

      // Panoramic Curtain Wall Glazing with warm interior lab bays
      g.add(box(0.12, FH - 0.6, wingW - 1.3, [newWingCurtainMat, darkGlass, whiteMat, whiteMat, whiteMat, whiteMat], wingFrontX, cy, wingCz));

      // Center Double Glass Sliding Door opening to Garden Terrace
      g.add(box(0.16, 2.5, 2.4, officeGlassMat, wingFrontX + 0.05, baseY + 1.25, -33.0));
      g.add(box(0.2, 0.1, 2.6, mats.metalSilver, wingFrontX + 0.06, baseY + 2.55, -33.0));
      g.add(box(0.2, 2.5, 0.1, mats.metalSilver, wingFrontX + 0.06, baseY + 1.25, -33.0 - 1.25));
      g.add(box(0.2, 2.5, 0.1, mats.metalSilver, wingFrontX + 0.06, baseY + 1.25, -33.0 + 1.25));

      // Cantilevered Entrance Canopy above double doors
      g.add(box(1.4, 0.12, 3.4, mats.metalSilver, wingFrontX + 0.7, baseY + 2.68, -33.0));
      g.add(box(1.42, 0.06, 3.44, blueWall, wingFrontX + 0.7, baseY + 2.76, -33.0));
      g.add(rod(new THREE.Vector3(wingFrontX + 1.3, baseY + 2.7, -33.0 - 1.5), new THREE.Vector3(wingFrontX + 0.1, baseY + 3.5, -33.0 - 1.5), 0.03, mats.metalSilver));
      g.add(rod(new THREE.Vector3(wingFrontX + 1.3, baseY + 2.7, -33.0 + 1.5), new THREE.Vector3(wingFrontX + 0.1, baseY + 3.5, -33.0 + 1.5), 0.03, mats.metalSilver));

      // Royal Blue Architectural Portal Frame (left bay, z = -26.0)
      g.add(box(0.45, FH, 0.55, blueWall, wingFrontX + 0.15, cy, -23.5));
      g.add(box(0.45, FH, 0.55, blueWall, wingFrontX + 0.15, cy, -28.5));
      g.add(box(0.45, 0.5, 5.55, blueWall, wingFrontX + 0.15, baseY + FH - 0.25, -26.0));

      // Architectural vertical sun fins (right bay)
      for (let sz = -37.5; sz >= -49.0; sz -= 0.8) {
        g.add(box(0.5, FH, 0.1, finMat, wingFrontX + 0.12, cy, sz));
      }

      // Royal Blue Header Band along entire front
      g.add(box(0.35, 0.45, wingW, blueWall, wingFrontX + 0.08, baseY + FH - 0.225, wingCz));

      // Cantilevered Architectural Eyebrow Sunshade (shelf separating Storey 1 and Storey 2)
      g.add(box(1.0, 0.18, wingW + 0.6, mats.metalSilver, wingFrontX + 0.45, baseY + FH, wingCz));
      g.add(box(1.04, 0.08, wingW + 0.65, blueWall, wingFrontX + 0.47, baseY + FH - 0.06, wingCz));
    } else if (f === 4) {
      // ── 5F Level: STOREY 2 OF THE NEW INNOVATION WING ───────────────────────
      // Base elevation: baseY = 4 * FH (15.2m), cy = baseY + FH / 2 (17.1m)

      // Floor slab
      g.add(box(wingD, 0.28, wingW, roofMat, wingCx, baseY + 0.14, wingCz));

      // Rear Wall (-X face)
      g.add(box(0.4, FH, wingW, whiteMat, wingBackX, cy, wingCz));
      g.add(box(0.08, 1.6, wingW - 4.0, [darkGlass, darkGlass, whiteMat, whiteMat, darkGlass, darkGlass], wingBackX - 0.12, cy + 0.3, wingCz));
      g.add(box(0.12, 0.08, wingW - 3.8, blueWall, wingBackX - 0.14, cy - 0.55, wingCz));
      g.add(box(0.12, 0.08, wingW - 3.8, blueWall, wingBackX - 0.14, cy + 1.15, wingCz));
      // AC compressor units on rear
      [-23.0, -32.0, -41.0].forEach((acZ) => {
        const acX = wingBackX - 0.38;
        const acY = cy + 0.4;
        g.add(box(0.85, 0.62, 0.38, [mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver, acUnitMat, mats.metalSilver], acX, acY, acZ));
        g.add(box(0.04, 0.45, 0.42, mats.metalDark, acX + 0.28, acY - 0.35, acZ));
        g.add(box(0.04, 0.45, 0.42, mats.metalDark, acX - 0.28, acY - 0.35, acZ));
      });

      // Left Wall (-Z face, z = wingZ0)
      g.add(box(wingD, FH, 0.4, whiteMat, wingCx, cy, wingZ0));
      g.add(box(wingD - 2.0, 1.5, 0.08, darkGlass, wingCx, cy + 0.2, wingZ0 - 0.05));
      g.add(box(wingD - 1.8, 0.08, 0.12, blueWall, wingCx, cy - 0.6, wingZ0 - 0.06));
      g.add(box(wingD - 1.8, 0.08, 0.12, blueWall, wingCx, cy + 1.0, wingZ0 - 0.06));

      // Right Wall (+Z face, z = wingZ1, visible above Right Wing 3F roof!)
      g.add(box(wingD, FH, 0.4, whiteMat, wingCx, cy, wingZ1));
      g.add(box(wingD - 2.0, 1.5, 0.08, darkGlass, wingCx, cy + 0.2, wingZ1 + 0.05));
      g.add(box(wingD - 1.8, 0.08, 0.12, blueWall, wingCx, cy - 0.6, wingZ1 + 0.06));
      g.add(box(wingD - 1.8, 0.08, 0.12, blueWall, wingCx, cy + 1.0, wingZ1 + 0.06));

      // Front Facade (+X face, x = wingFrontX)
      // Corner columns
      g.add(box(0.65, FH, 0.65, whiteMat, wingFrontX, cy, wingZ0 + 0.32));
      g.add(box(0.65, FH, 0.65, whiteMat, wingFrontX, cy, wingZ1 - 0.32));

      // Panoramic Upper Ribbon Glazing with blue accent spandrel
      g.add(box(0.12, FH - 0.6, wingW - 1.3, [newWingUpperMat, darkGlass, whiteMat, whiteMat, whiteMat, whiteMat], wingFrontX, cy, wingCz));

      // Cantilevered Observation Viewing Balcony (Center, z = -33.0)
      const balcW = 8.0;
      const balcD = 1.35;
      const balcFrontX = wingFrontX + balcD;
      g.add(box(balcD, 0.22, balcW, concrete, wingFrontX + balcD / 2, baseY + 0.11, -33.0));
      g.add(box(balcD, 0.08, balcW, blueWall, wingFrontX + balcD / 2, baseY + 0.04, -33.0)); // bottom accent
      // Glass front balustrade
      g.add(box(0.06, 1.05, balcW, darkGlass, balcFrontX - 0.03, baseY + 0.65, -33.0));
      g.add(box(0.1, 0.08, balcW + 0.05, mats.metalSilver, balcFrontX - 0.03, baseY + 1.2, -33.0)); // handrail
      // Side glass balustrades
      g.add(box(balcD - 0.1, 1.05, 0.06, darkGlass, wingFrontX + balcD / 2, baseY + 0.65, -33.0 - balcW / 2));
      g.add(box(balcD - 0.1, 1.05, 0.06, darkGlass, wingFrontX + balcD / 2, baseY + 0.65, -33.0 + balcW / 2));
      g.add(box(balcD, 0.08, 0.1, mats.metalSilver, wingFrontX + balcD / 2, baseY + 1.2, -33.0 - balcW / 2));
      g.add(box(balcD, 0.08, 0.1, mats.metalSilver, wingFrontX + balcD / 2, baseY + 1.2, -33.0 + balcW / 2));

      // Double Glass Door opening to Balcony
      g.add(box(0.14, 2.4, 2.4, officeGlassMat, wingFrontX + 0.04, baseY + 1.2, -33.0));

      // Royal Blue Accent Frames flanking the center bay
      g.add(box(0.35, FH, 0.6, blueWall, wingFrontX + 0.12, cy, -23.5));
      g.add(box(0.35, FH, 0.6, blueWall, wingFrontX + 0.12, cy, -47.0));

      // Architectural vertical sun louvers flanking the balcony
      [-25.5, -27.0, -28.5, -37.5, -39.0, -40.5, -42.0, -43.5, -45.0, -46.5].forEach((sz) => {
        g.add(box(0.45, FH - 0.4, 0.1, finMat, wingFrontX + 0.12, cy, sz));
      });

      // Royal Blue top header band
      g.add(box(0.38, 0.5, wingW, blueWall, wingFrontX + 0.08, baseY + FH - 0.25, wingCz));

      // Official Signage Plaque mounted prominently above the balcony
      g.add(box(0.14, 1.1, 9.5, [newWingSignMat, mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark], wingFrontX + 0.18, baseY + 3.1, -33.0));
    }

    // ── 5-Storey Courtyard Building (Floors 2 to 5: Exact 9-Point Boundary) ──
    // Floor slab extruded to exact 9-point perimeter
    g.add(createC5FloorSlab(baseY, 0.28, concrete));

    if (f >= 1 && f <= 3) {
      // Levels 1, 2, 3: Open-Air Corridors with Signature Zigzag Spandrel Balconies (2F, 3F, 4F)
      C5_INNER_SEGS.forEach((seg) => {
        const grp = new THREE.Group();
        grp.position.set(seg.cx, baseY, seg.cz);
        grp.rotation.y = seg.rotY;

        // Front Balustrade along corridor front edge (local Z = 0) - fully intact with signature blue zigzag spandrels
        grp.add(box(seg.len, 1.05, 0.25, creamWall, 0, 0.525, 0));
        grp.add(box(seg.len + 0.1, 0.08, 0.32, creamWall, 0, 1.09, 0)); // coping
        grp.add(box(seg.len, 0.5, 0.3, creamWall, 0, FH - 0.25, 0)); // lintel beam

        // Signature Blue Zigzag Spandrel Panel facing courtyard (+Z)
        grp.add(box(seg.len, 1.15, 0.05, [creamWall, creamWall, creamWall, creamWall, getSpandrelMat(seg.len), creamWall], 0, 0.6, 0.16));

        // Dark Blue Corridor Soffit & Fascia Strip
        grp.add(box(seg.len, 0.03, 2.1, soffitBlue, 0, FH - 0.17, -1.1, false));
        grp.add(box(seg.len, 0.12, 0.34, soffitBlue, 0, FH - 0.56, 0.02));

        // Blue Corbel Brackets every ~3m under the lintel
        for (let bx = -seg.len / 2 + 1.5; bx < seg.len / 2; bx += 3.0) {
          grp.add(box(0.16, 0.4, 0.5, soffitBlue, bx, FH - 0.82, 0.05));
        }

        // Structural columns along the corridor front edge
        const colSpacing = 4.0;
        const colCount = Math.floor(seg.len / colSpacing);
        for (let c = 0; c <= colCount; c++) {
          const lx = -seg.len / 2 + (c * seg.len) / colCount;
          grp.add(box(0.6, FH, 0.6, creamWall, lx, FH / 2, 0));
        }

        // Recessed classroom wall (offset 2.2m inward) with doors, windows & warm illumination
        grp.add(box(seg.len - 0.6, FH, 0.2, [creamWall, creamWall, creamWall, creamWall, corridorWallMat, creamWall], 0, FH / 2, -2.2));

        // Air Conditioner Outdoor Compressor Units mounted on balustrades
        [-seg.len / 4, seg.len / 4].forEach((acX) => {
          grp.add(box(0.85, 0.62, 0.38, [mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver, acUnitMat, mats.metalSilver], acX, 1.35, 0.22));
          grp.add(box(0.04, 0.45, 0.42, mats.metalDark, acX - 0.28, 1.0, 0.22));
          grp.add(box(0.04, 0.45, 0.42, mats.metalDark, acX + 0.28, 1.0, 0.22));
        });

        // 4F Level Portal Connection (on West North Wing meeting 4F Garden Terrace)
        if (f === 3 && seg.idx === 0) {
          const portalLX = -2.0; // aligns near world X = -21.5
          grp.add(box(0.35, 2.75, 0.5, blueWall, portalLX - 1.7, 0.3 + 1.375, 0.05));
          grp.add(box(0.35, 2.75, 0.5, blueWall, portalLX + 1.7, 0.3 + 1.375, 0.05));
          grp.add(box(3.75, 0.45, 0.55, blueWall, portalLX, 2.85, 0.06));
          grp.add(box(4.0, 0.12, 0.85, mats.metalSilver, portalLX, 3.12, 0.42));
          // Propped glass double doors
          grp.add(box(0.06, 2.4, 1.35, [officeGlassMat, darkGlass, mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver], portalLX - 0.7, 1.5, -0.25));
          grp.add(box(0.06, 2.4, 1.35, [officeGlassMat, darkGlass, mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver], portalLX + 0.7, 1.5, -0.25));
          // Walkway threshold connecting terrace seamlessly into North Wing portal
          g.add(box(3.8, 0.06, 2.4, mats.metalDark, -21.5, baseY + 0.32, -50.2));
        }

        g.add(grp);
      });

      // Outer Perimeter Walls (Segments 3..8) with Classroom Ribbon Windows
      C5_OUTER_SEGS.forEach((seg) => {
        const wallGrp = new THREE.Group();
        wallGrp.position.set(seg.cx, baseY, seg.cz);
        wallGrp.rotation.y = seg.rotY;

        // On 2F (f === 1) and 3F (f === 2) for Segment 3 (south end wall meeting footbridge portal at P4),
        // REMOVE the wall across the 2.25m doorway (the blue square in user instruction)
        // so students can walk freely through the portal into the corridor!
        if ((f === 1 || f === 2) && seg.idx === 3) {
          const doorWidth = 2.25;
          const remLen = seg.len - doorWidth;
          const remCx = doorWidth / 2;
          // Solid wall from the doorway to the outer corner P5
          wallGrp.add(box(remLen, FH, 0.35, creamWall, remCx, FH / 2, 0));
          // Overhead lintel beam above the open doorway (from y = 2.8m to FH = 3.8m)
          wallGrp.add(box(doorWidth, FH - 2.8, 0.35, creamWall, -seg.len / 2 + doorWidth / 2, 2.8 + (FH - 2.8) / 2, 0));
        } else {
          wallGrp.add(box(seg.len, FH, 0.35, creamWall, 0, FH / 2, 0));
        }

        // Exterior windows if segment is long enough
        if (seg.len > 12.0) {
          const winCount = Math.floor(seg.len / 6.0);
          for (let w = 0; w < winCount; w++) {
            const wx = -seg.len / 2 + 3.0 + w * 6.0;
            wallGrp.add(box(3.2, 1.4, 0.08, darkGlass, wx, FH / 2 + 0.2, 0.18, false));
            wallGrp.add(box(3.4, 0.08, 0.12, blueWall, wx, FH / 2 - 0.6, 0.2, false));
          }
        }

        g.add(wallGrp);
      });

      // Corner Glass Atrium Tower (Levels 1 to 3) at P3 [17.0, -57.5]
      const p3 = C5_POINTS[2];
      g.add(box(4.8, FH, 4.8, glassAtriumMat, p3[0], cy, p3[1]));
      g.add(box(0.35, FH, 0.35, blueWall, p3[0] - 2.2, cy, p3[1] + 2.2));
      g.add(box(0.35, FH, 0.35, blueWall, p3[0] + 2.2, cy, p3[1] - 2.2));
    } else if (f === 4) {
      // Level 4: 5th Floor Enclosed Academic Hall with Continuous Louvered Window Bays
      C5_INNER_SEGS.forEach((seg) => {
        const grp = new THREE.Group();
        grp.position.set(seg.cx, baseY, seg.cz);
        grp.rotation.y = seg.rotY;

        // 5F Continuous Louvered Window Bays with Blue Sills & Frames
        grp.add(box(seg.len - 0.6, FH - 0.8, 0.2, [creamWall, creamWall, creamWall, creamWall, ribbon5FMat, creamWall], 0, FH / 2 - 0.1, 0));
        grp.add(box(seg.len, 0.7, 0.35, ochreWall, 0, FH - 0.35, 0)); // blue header band
        grp.add(box(seg.len, 0.4, 0.3, creamWall, 0, 0.2, 0)); // base sill band

        // Zigzag spandrel band underneath the 5F louvered window sills
        grp.add(box(seg.len, 1.15, 0.05, [creamWall, creamWall, creamWall, creamWall, getSpandrelMat(seg.len), creamWall], 0, 0.6, 0.16));
        grp.add(box(seg.len, 0.03, 2.1, soffitBlue, 0, FH - 0.17, -1.1, false));

        // Recessed interior classroom wall
        grp.add(box(seg.len - 0.6, FH, 0.2, creamWall, 0, FH / 2, -2.2));

        g.add(grp);
      });

      // Outer Perimeter Walls (5F)
      C5_OUTER_SEGS.forEach((seg) => {
        const wallGrp = new THREE.Group();
        wallGrp.position.set(seg.cx, baseY, seg.cz);
        wallGrp.rotation.y = seg.rotY;

        wallGrp.add(box(seg.len, FH, 0.35, creamWall, 0, FH / 2, 0));

        if (seg.len > 12.0) {
          const winCount = Math.floor(seg.len / 6.0);
          for (let w = 0; w < winCount; w++) {
            const wx = -seg.len / 2 + 3.0 + w * 6.0;
            wallGrp.add(box(3.2, 1.4, 0.08, darkGlass, wx, FH / 2 + 0.2, 0.18, false));
            wallGrp.add(box(3.4, 0.08, 0.12, blueWall, wx, FH / 2 - 0.6, 0.2, false));
          }
        }

        g.add(wallGrp);
      });

      // Corner Glass Atrium Tower & Universidad de Dagupan Crest Seal at P3 [17.0, -57.5]
      const p3 = C5_POINTS[2];
      g.add(box(4.8, FH, 4.8, glassAtriumMat, p3[0], cy, p3[1]));
      g.add(box(0.35, FH, 0.35, blueWall, p3[0] - 2.2, cy, p3[1] + 2.2));
      g.add(box(0.35, FH, 0.35, blueWall, p3[0] + 2.2, cy, p3[1] - 2.2));

      // Circular Universidad de Dagupan Seal Medallion at 45° Inner Corner
      const cornerSealX = p3[0] - 1.2;
      const cornerSealZ = p3[1] + 1.2;
      const sealY = baseY + FH - 0.4;
      const cornerSeal = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.22, 48), emblemMat);
      cornerSeal.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 0, 1).normalize());
      cornerSeal.position.set(cornerSealX, sealY, cornerSealZ);
      cornerSeal.castShadow = true;
      g.add(cornerSeal);

      const cornerRing = new THREE.Mesh(new THREE.TorusGeometry(1.36, 0.12, 16, 48), blueWall);
      cornerRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 1).normalize());
      cornerRing.position.set(cornerSealX, sealY, cornerSealZ);
      g.add(cornerRing);
    }

    if (f === 1 || f === 2) {
      // ── Open-Air Skybridge: Connected into Balcony Path (2F on Level 1, 3F on Level 2) ──
      // 1. Straight span connects directly to the Balcony at [8.0, -22.575] and extends to [19.5, -22.575]
      //    North rail is at Z = -23.15 (flush with balcony front parapet)
      //    South rail is at Z = -22.00 (flush with building rear wall)
      // 2. Streamlined turning ramp following the user blue lines into the corridor doorway portal
      const BR_W = 1.15;

      // ── 1. Straight Tower Connection Span (X: 8.0 to 19.5, Z = -22.575, rotY = 0) ──
      const straightLen = 19.5 - 8.0; // 11.5m
      const straightSpanGrp = new THREE.Group();
      straightSpanGrp.position.set((8.0 + 19.5) / 2, baseY, -22.575);
      straightSpanGrp.rotation.y = 0;

      // Concrete structural deck slab (width 1.15m matching balcony depth)
      straightSpanGrp.add(box(straightLen, 0.22, BR_W, concrete, 0, 0.11, 0));
      // Non-slip paver walkway surface
      straightSpanGrp.add(box(straightLen - 0.04, 0.03, BR_W - 0.16, mats.metalDark, 0, 0.235, 0));
      // Yellow safety warning borders (10cm inside edges)
      straightSpanGrp.add(box(straightLen, 0.015, 0.06, yellowLineMat, 0, 0.245, BR_W / 2 - 0.1, false));
      straightSpanGrp.add(box(straightLen, 0.015, 0.06, yellowLineMat, 0, 0.245, -BR_W / 2 + 0.1, false));
      // Royal blue under-deck girders
      straightSpanGrp.add(box(straightLen, 0.36, 0.16, blueWall, 0, -0.07, BR_W / 2 - 0.08));
      straightSpanGrp.add(box(straightLen, 0.36, 0.16, blueWall, 0, -0.07, -BR_W / 2 + 0.08));
      for (let rx = -straightLen / 2 + 1.5; rx < straightLen / 2; rx += 2.0) {
        straightSpanGrp.add(box(0.12, 0.24, BR_W - 0.16, mats.metalSilver, rx, -0.05, 0));
      }
      // Safety balustrades along straight span
      // North balustrade along Z = -23.15 (flush with balcony front parapet)
      straightSpanGrp.add(box(straightLen - 0.08, 1.05, 0.06, darkGlass, 0, 0.24 + 0.525, -BR_W / 2 + 0.04));
      straightSpanGrp.add(box(straightLen, 0.08, 0.08, blueWall, 0, 0.24 + 0.04, -BR_W / 2 + 0.04));
      straightSpanGrp.add(box(straightLen, 0.08, 0.12, mats.metalSilver, 0, 0.24 + 1.05, -BR_W / 2 + 0.04));
      for (let sx = -straightLen / 2 + 0.9; sx < straightLen / 2; sx += 1.8) {
        straightSpanGrp.add(box(0.06, 1.08, 0.08, mats.metalSilver, sx, 0.24 + 0.54, -BR_W / 2 + 0.04));
      }
      // South balustrade along Z = -22.00 (flush with building rear wall)
      straightSpanGrp.add(box(straightLen - 0.08, 1.05, 0.06, darkGlass, 0, 0.24 + 0.525, BR_W / 2 - 0.04));
      straightSpanGrp.add(box(straightLen, 0.08, 0.08, blueWall, 0, 0.24 + 0.04, BR_W / 2 - 0.04));
      straightSpanGrp.add(box(straightLen, 0.08, 0.12, mats.metalSilver, 0, 0.24 + 1.05, BR_W / 2 - 0.04));
      for (let sx = -straightLen / 2 + 0.9; sx < straightLen / 2; sx += 1.8) {
        straightSpanGrp.add(box(0.06, 1.08, 0.08, mats.metalSilver, sx, 0.24 + 0.54, BR_W / 2 - 0.04));
      }
      // Architectural illuminated signage plaque facing the courtyard (2F / 3F)
      const currentSignMat = f === 1 ? footbridgeSignMat : footbridgeSignMat3F;
      straightSpanGrp.add(
        box(
          5.0,
          0.48,
          0.08,
          [blueWall, blueWall, blueWall, blueWall, currentSignMat, blueWall],
          0,
          -0.07,
          -BR_W / 2 - 0.06
        )
      );
      g.add(straightSpanGrp);

      // ── 2. Streamlined Turning Ramp Deck (Clean Chamfered Corner, No Protrusions) ──
      // Vertices in CCW order:
      // 1. [19.5, -22.5] (straight span south rail connection - outer)
      // 2. [23.0, -22.5] (outer straight extension along south edge)
      // 3. [24.5, -24.5] (outer chamfer bend at pier - user blue arrow line)
      // 4. [25.13, -31.04] (corridor east jamb at classroom wall, wall removed!)
      // 5. [23.0, -30.5] (corridor west jamb at corner column P4)
      // 6. [21.5, -25.0] (inner chamfer bend facing courtyard - clean seamless corner)
      // 7. [19.5, -24.0] (straight span north rail connection - inner)
      const bridgePolyPts: readonly [number, number][] = [
        [19.5, -22.00],  // 1. Straight span south rail connection (outer - flush with building wall)
        [23.0, -22.00],  // 2. Outer straight extension along south edge
        [24.5, -24.5],   // 3. Outer chamfer bend at pier
        [25.13, -31.04], // 4. Corridor East Jamb (at classroom wall - wall removed!)
        [23.0, -30.5],   // 5. Corridor West Jamb (at corner column P4)
        [21.5, -24.5],   // 6. Inner chamfer bend (facing courtyard)
        [19.5, -23.15],  // 7. Straight span north rail connection (inner - flush with balcony parapet)
      ];

      const shapeDeck = new THREE.Shape();
      shapeDeck.moveTo(bridgePolyPts[0][0], -bridgePolyPts[0][1]);
      for (let i = 1; i < bridgePolyPts.length; i++) {
        shapeDeck.lineTo(bridgePolyPts[i][0], -bridgePolyPts[i][1]);
      }
      shapeDeck.closePath();

      // Structural concrete floor slab
      const geomDeckSlab = new THREE.ExtrudeGeometry(shapeDeck, { depth: 0.22, bevelEnabled: false });
      geomDeckSlab.rotateX(-Math.PI / 2);
      geomDeckSlab.computeVertexNormals();
      const slabMeshDeck = new THREE.Mesh(geomDeckSlab, concrete);
      slabMeshDeck.position.y = baseY;
      slabMeshDeck.receiveShadow = true;
      slabMeshDeck.castShadow = true;
      g.add(slabMeshDeck);

      // Non-slip dark paver top walking surface layer
      const geomDeckPaver = new THREE.ExtrudeGeometry(shapeDeck, { depth: 0.03, bevelEnabled: false });
      geomDeckPaver.rotateX(-Math.PI / 2);
      geomDeckPaver.computeVertexNormals();
      const paverMeshDeck = new THREE.Mesh(geomDeckPaver, mats.metalDark);
      paverMeshDeck.position.y = baseY + 0.22;
      paverMeshDeck.receiveShadow = true;
      g.add(paverMeshDeck);

      // Royal blue under-deck fascia girder skirt
      const geomDeckSkirt = new THREE.ExtrudeGeometry(shapeDeck, { depth: 0.36, bevelEnabled: false });
      geomDeckSkirt.rotateX(-Math.PI / 2);
      geomDeckSkirt.computeVertexNormals();
      const skirtMeshDeck = new THREE.Mesh(geomDeckSkirt, blueWall);
      skirtMeshDeck.position.y = baseY - 0.14;
      skirtMeshDeck.castShadow = true;
      g.add(skirtMeshDeck);

      // Architectural Balustrades matching the deck perimeter exactly
      // Open at Edge 7->1 (straight bridge connection) and Edge 4->5 (open corridor entrance portal)
      const railingEdgesDeck: Array<{ p1: [number, number]; p2: [number, number]; name: string }> = [
        // Outer railings along south edge and user blue arrow line
        { p1: [19.5, -22.00], p2: [23.0, -22.00], name: "outer_straight_ext" },
        { p1: [23.0, -22.00], p2: [24.5, -24.5], name: "outer_bend" },
        { p1: [24.5, -24.5], p2: [25.13, -31.04], name: "outer_to_door" }, // meets classroom wall
        // Inner railings facing courtyard (no crossing, no trapped pocket, zero protrusion)
        { p1: [23.0, -30.5], p2: [21.5, -24.5], name: "inner_from_door" }, // meets corner column P4
        { p1: [21.5, -24.5], p2: [19.5, -23.15], name: "inner_to_straight" }, // meets straight north rail
      ];

      railingEdgesDeck.forEach(({ p1, p2 }) => {
        const edx = p2[0] - p1[0];
        const edz = p2[1] - p1[1];
        const elen = Math.hypot(edx, edz);
        const ecx = (p1[0] + p2[0]) / 2;
        const ecz = (p1[1] + p2[1]) / 2;
        const erotY = Math.atan2(-edz, edx);

        const railGrp = new THREE.Group();
        railGrp.position.set(ecx, baseY, ecz);
        railGrp.rotation.y = erotY;

        // Tinted safety glass panel
        railGrp.add(box(elen - 0.08, 1.05, 0.06, darkGlass, 0, 0.24 + 0.525, 0));
        // Royal blue bottom base channel
        railGrp.add(box(elen, 0.08, 0.08, blueWall, 0, 0.24 + 0.04, 0));
        // Stainless steel top handrail
        railGrp.add(box(elen, 0.08, 0.12, mats.metalSilver, 0, 0.24 + 1.05, 0));
        // Stanchions every 1.6m
        for (let sx = -elen / 2 + 0.8; sx < elen / 2; sx += 1.6) {
          railGrp.add(box(0.06, 1.08, 0.08, mats.metalSilver, sx, 0.24 + 0.54, 0));
        }
        g.add(railGrp);

        // Safety warning yellow strip along the edge of the paver floor
        const yellowStrip = new THREE.Group();
        yellowStrip.position.set(ecx, baseY + 0.245, ecz);
        yellowStrip.rotation.y = erotY;
        yellowStrip.add(box(elen, 0.015, 0.08, yellowLineMat, 0, 0, -0.15, false));
        g.add(yellowStrip);
      });

      // Stainless steel structural terminal and corner posts at all perimeter vertices
      bridgePolyPts.forEach(([cx, cz]) => {
        g.add(box(0.12, 1.15, 0.12, mats.metalSilver, cx, baseY + 0.24 + 0.575, cz));
      });

      // ── Main Tower 2F Balcony Direct Connection at x = 8.0 (Flush in Balcony Path, Zero Overshoot) ──
      // Handrail terminal posts connecting balcony rail to bridge rail at x = 8.0
      g.add(box(0.08, 1.08, 0.08, mats.metalSilver, 8.0, baseY + 0.24 + 0.54, -22.00));
      g.add(box(0.08, 1.08, 0.08, mats.metalSilver, 8.0, baseY + 0.24 + 0.54, -23.15));

      // ── 5-Storey Building 2F Corridor Entrance Portal Frame (Blue Square in User Image) ──
      // Open entrance between corner column P4 [23.0, -30.5] and classroom wall [25.13, -31.04] (wall removed!)
      const corMidX = (23.0 + 25.13) / 2; // 24.065
      const corMidZ = (-30.5 + -31.04) / 2; // -30.77
      const corWidth = Math.hypot(25.13 - 23.0, -31.04 - (-30.5)); // 2.20m
      const corRotY = Math.atan2(-(-31.04 - -30.5), 25.13 - 23.0); // -0.248 rad

      const portalGrp = new THREE.Group();
      portalGrp.position.set(corMidX, baseY, corMidZ);
      portalGrp.rotation.y = corRotY;
      // Left portal jamb at corner column P4
      portalGrp.add(box(0.18, FH - 0.3, 0.35, blueWall, -corWidth / 2 + 0.09, (FH - 0.3) / 2, 0));
      // Right portal jamb at classroom wall
      portalGrp.add(box(0.18, FH - 0.3, 0.35, blueWall, corWidth / 2 - 0.09, (FH - 0.3) / 2, 0));
      // Portal overhead header beam
      portalGrp.add(box(corWidth + 0.2, 0.35, 0.45, blueWall, 0, FH - 0.3 - 0.175, 0));
      // Silver architectural canopy trim
      portalGrp.add(box(corWidth + 0.3, 0.08, 0.65, mats.metalSilver, 0, FH - 0.3, 0.1));
      // Flush non-slip landing threshold plate leading directly into the corridor
      portalGrp.add(box(corWidth, 0.04, 0.8, mats.metalDark, 0, 0.25, 0));
      portalGrp.add(box(corWidth - 0.1, 0.015, 0.08, yellowLineMat, 0, 0.27, 0.35, false));
      portalGrp.add(box(corWidth - 0.1, 0.015, 0.08, yellowLineMat, 0, 0.27, -0.35, false));
      g.add(portalGrp);

      // Vertical structural column posts between 2F and 3F skybridge (along railing lines)
      if (f === 1) {
        const tierPosts: Array<[number, number]> = [
          [14.25, -22.00],
          [14.25, -23.15],
          [19.5, -22.00],
          [19.5, -23.15],
          [24.5, -24.5],
          [21.5, -24.5],
        ];
        tierPosts.forEach(([cx, cz]) => {
          g.add(box(0.12, FH, 0.12, mats.metalSilver, cx, baseY + FH / 2, cz));
          g.add(box(0.18, 0.16, 0.18, blueWall, cx, baseY + FH - 0.08, cz));
          g.add(box(0.18, 0.16, 0.18, blueWall, cx, baseY + 0.08, cz));
        });
      }

      // Students walking along the 2F Open-Air Skybridge into the corridor
      g.add(createPedestrian(14.0, -22.575, 0, blueWall, baseY + 0.24));
      g.add(createPedestrian(21.0, -23.25, 0.35, carWhite, baseY + 0.24));
      g.add(createPedestrian(23.8, -28.5, 1.33, carBlue, baseY + 0.24)); // walking through portal into corridor
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
  const pentW = 7.0;
  const pentH = 6.8;
  const pentD = 8.5;
  const pentX = 1.0;
  const pentZ = -7.5;
  roof.add(box(pentW, pentH, pentD, whiteMat, pentX, roofBaseY + pentH / 2, pentZ));
  roof.add(box(pentW + 0.2, 0.3, pentD + 0.2, mats.metalSilver, pentX, roofBaseY + pentH + 0.15, pentZ)); // tower cap

  // 3. Main Tower Rooftop Extension, Vertical UDD Sign & Maintenance Cage (from udd-main-tower.JPG)
  const towerTopY = roofBaseY + 6.8; // 25.8m high

  // Tower penthouse core rising above roofline
  roof.add(box(towerW0, 6.8, 4.2, whiteMat, towerCx, roofBaseY + 3.4, backZ + 1.6));
  // Tower Royal Blue Cap Cornice
  roof.add(box(towerW0 + 0.4, 0.4, 4.6, blueWall, towerCx, towerTopY + 0.2, backZ + 1.6));
  // Tower vertical corner pilasters
  roof.add(box(0.35, 6.8, 0.6, blueWall, towerX0 + 0.18, roofBaseY + 3.4, rearTowerZ));
  roof.add(box(0.35, 6.8, 0.6, blueWall, towerX1 - 0.18, roofBaseY + 3.4, rearTowerZ));

  // The Bold Vertical "UDD" Sign (Mounted on the -Z face of the tower)
  const uddSignH = 5.2;
  const uddSignW = 2.6;
  const uddSignY = roofBaseY + 3.4;
  roof.add(box(uddSignW, uddSignH, 0.08, [blueWall, blueWall, blueWall, blueWall, blueWall, uddTowerSignMat], towerCx, uddSignY, rearTowerZ - 0.25));
  roof.add(box(uddSignW + 0.16, uddSignH + 0.16, 0.06, blueWall, towerCx, uddSignY, rearTowerZ - 0.22, false));

  // Rooftop Maintenance Cage Ladder & Platform (from udd-main-tower.JPG corner of tower)
  const cageX = towerX1 - 1.2;
  const cageZ = rearTowerZ - 0.1;
  const platformY = towerTopY + 0.2;
  roof.add(box(1.4, 0.1, 1.4, mats.metalDark, cageX, platformY + 0.05, cageZ + 0.5));
  roof.add(rod(new THREE.Vector3(cageX - 0.6, platformY, cageZ), new THREE.Vector3(cageX - 0.6, platformY + 1.1, cageZ), 0.03, mats.metalDark));
  roof.add(rod(new THREE.Vector3(cageX + 0.6, platformY, cageZ), new THREE.Vector3(cageX + 0.6, platformY + 1.1, cageZ), 0.03, mats.metalDark));
  roof.add(rod(new THREE.Vector3(cageX - 0.6, platformY + 1.1, cageZ), new THREE.Vector3(cageX + 0.6, platformY + 1.1, cageZ), 0.03, mats.metalDark));

  roof.add(rod(new THREE.Vector3(cageX - 0.22, platformY, cageZ), new THREE.Vector3(cageX - 0.22, platformY + 2.4, cageZ), 0.025, mats.metalDark));
  roof.add(rod(new THREE.Vector3(cageX + 0.22, platformY, cageZ), new THREE.Vector3(cageX + 0.22, platformY + 2.4, cageZ), 0.025, mats.metalDark));
  for (let ly = platformY + 0.3; ly <= platformY + 2.3; ly += 0.3) {
    roof.add(box(0.44, 0.03, 0.03, mats.metalDark, cageX, ly, cageZ));
  }
  [platformY + 1.0, platformY + 1.6, platformY + 2.2].forEach((hy) => {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.02, 8, 16, Math.PI), mats.metalDark);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.set(cageX, hy, cageZ - 0.05);
    roof.add(hoop);
  });

  // Rooftop Parapet Banner: "UNIVERSIDAD DE DAGUPAN" (Facing Basketball Court / -Z)
  roof.add(box(classW, 1.2, 0.3, whiteMat, classCx, roofBaseY + 0.6, backZ - 0.15));
  roof.add(box(classW - 1.0, 1.0, 0.08, [blueWall, blueWall, blueWall, blueWall, blueWall, roofLettersMat], classCx, roofBaseY + 0.6, backZ - 0.32));
  roof.add(box(classW, 0.12, 0.4, blueWall, classCx, roofBaseY + 1.25, backZ - 0.15));

  // 4. Rooftop Lettering Sign along right driveway edge
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
  roof.add(rod(new THREE.Vector3(pentX, roofBaseY + pentH, pentZ), new THREE.Vector3(pentX, roofBaseY + pentH + 5.5, pentZ), 0.08, mats.metalSilver));

  // ── 6. Rooftop of New Innovation & Research Wing ─────────────────────────
  // Structural roof slab
  roof.add(box(wingD + 0.4, 0.35, wingW + 0.4, concrete, wingCx, roofBaseY + 0.175, wingCz));

  // Perimeter parapet walls (1.1m high)
  roof.add(box(0.3, 1.1, wingW + 0.4, whiteMat, wingFrontX + 0.1, roofBaseY + 0.55, wingCz));
  roof.add(box(0.3, 1.1, wingW + 0.4, whiteMat, wingBackX - 0.1, roofBaseY + 0.55, wingCz));
  roof.add(box(wingD + 0.4, 1.1, 0.3, whiteMat, wingCx, roofBaseY + 0.55, wingZ0 - 0.1));
  roof.add(box(wingD + 0.4, 1.1, 0.3, whiteMat, wingCx, roofBaseY + 0.55, wingZ1 + 0.1));

  // Royal blue coping beam all around
  roof.add(box(0.42, 0.14, wingW + 0.6, blueWall, wingFrontX + 0.1, roofBaseY + 1.15, wingCz));
  roof.add(box(0.42, 0.14, wingW + 0.6, blueWall, wingBackX - 0.1, roofBaseY + 1.15, wingCz));
  roof.add(box(wingD + 0.6, 0.14, 0.42, blueWall, wingCx, roofBaseY + 1.15, wingZ0 - 0.1));
  roof.add(box(wingD + 0.6, 0.14, 0.42, blueWall, wingCx, roofBaseY + 1.15, wingZ1 + 0.1));

  // Rooftop Stair & Elevator Penthouse Core (rises 2.8m above roof)
  const npW = 4.6;
  const npD = 3.2;
  const npH = 2.8;
  const npX = wingCx - 0.5;
  const npZ = wingCz + 5.5;
  roof.add(box(npD, npH, npW, whiteMat, npX, roofBaseY + npH / 2, npZ));
  roof.add(box(npD + 0.3, 0.22, npW + 0.3, blueWall, npX, roofBaseY + npH + 0.11, npZ)); // penthouse cap
  roof.add(box(0.08, 2.0, 1.0, blueWall, npX + npD / 2 + 0.02, roofBaseY + 1.0, npZ)); // steel access door

  // Communication / Lightning Mast on penthouse
  roof.add(rod(new THREE.Vector3(npX, roofBaseY + npH, npZ), new THREE.Vector3(npX, roofBaseY + npH + 4.8, npZ), 0.06, mats.metalSilver));

  // Architectural Solar Canopy Pergola on the front roof deck
  // 4 Blue steel support pillars
  const colX0 = wingFrontX - 0.6;
  const colX1 = wingFrontX - 2.8;
  const colZ0 = wingCz - 5.5;
  const colZ1 = wingCz + 1.5;
  [colZ0, colZ1].forEach((pz) => {
    [colX0, colX1].forEach((px) => {
      roof.add(rod(new THREE.Vector3(px, roofBaseY + 0.3, pz), new THREE.Vector3(px, roofBaseY + 2.8, pz), 0.08, blueWall));
    });
  });
  // Overhead steel pergola frame with angled solar louvers
  const pergD = Math.abs(colX1 - colX0) + 0.8; // 3.0m
  const pergW = Math.abs(colZ1 - colZ0) + 1.6; // 8.6m
  const pergCx = (colX0 + colX1) / 2;
  const pergCz = (colZ0 + colZ1) / 2;
  roof.add(box(pergD, 0.14, pergW, mats.metalSilver, pergCx, roofBaseY + 2.85, pergCz));
  // Louver slats inside pergola
  for (let lz = pergCz - pergW / 2 + 0.5; lz <= pergCz + pergW / 2 - 0.5; lz += 0.75) {
    roof.add(box(pergD - 0.2, 0.06, 0.35, blueWall, pergCx, roofBaseY + 2.8, lz));
  }

  // Solar Photovoltaic (PV) Panels Array (2 rows of panels across roof deck)
  [-26.5, -29.0].forEach((pvX) => {
    [-38.0, -40.5, -43.0, -45.5, -48.0].forEach((pvZ) => {
      const panel = box(1.9, 0.06, 1.4, [mats.metalSilver, mats.metalSilver, darkGlass, mats.metalSilver, mats.metalSilver, mats.metalSilver], pvX, roofBaseY + 0.65, pvZ);
      panel.rotation.z = -0.15; // tilted towards sun
      roof.add(panel);
      // Small support frame
      roof.add(box(0.06, 0.4, 1.2, mats.metalDark, pvX + 0.65, roofBaseY + 0.45, pvZ));
      roof.add(box(0.06, 0.2, 1.2, mats.metalDark, pvX - 0.65, roofBaseY + 0.35, pvZ));
    });
  });

  // Rooftop Dual HVAC Chiller Units on vibration isolation pads
  [-26.5, -30.0].forEach((chZ) => {
    roof.add(box(2.6, 1.3, 1.8, mats.metalSilver, wingCx - 0.4, roofBaseY + 0.85, chZ));
    roof.add(box(2.8, 0.16, 2.0, mats.metalDark, wingCx - 0.4, roofBaseY + 1.55, chZ)); // fan top
    roof.add(box(2.5, 0.1, 1.6, mats.metalDark, wingCx - 0.4, roofBaseY + 0.25, chZ)); // base pad
  });

  // ── 7. 5-Storey Courtyard Building Rooftop (Exact 9-Point Boundary Deck & Towers) ─
  const bldgTopY = roofBaseY; // 19.0m (top of Floor 5 / roof level)

  // Structural concrete roof slab extruded to exact 9-point perimeter
  roof.add(createC5FloorSlab(bldgTopY, 0.35, concrete));

  // Perimeter Parapet Walls along ALL 9 segments of the tracked building outline
  C5_SEGMENTS.forEach((seg) => {
    const parapetGrp = new THREE.Group();
    parapetGrp.position.set(seg.cx, bldgTopY, seg.cz);
    parapetGrp.rotation.y = seg.rotY;

    // Solid white parapet wall (1.1m high)
    parapetGrp.add(box(seg.len, 1.1, 0.35, creamWall, 0, 0.55, 0));
    // Royal blue coping cap along the top
    parapetGrp.add(box(seg.len + 0.1, 0.12, 0.42, blueWall, 0, 1.15, 0));

    roof.add(parapetGrp);
  });

  // Corner Glass Atrium Flat Silver Aluminium Roof Cap at P3 [17.0, -57.5]
  const p3Roof = C5_POINTS[2];
  roof.add(box(5.2, 0.35, 5.2, mats.metalSilver, p3Roof[0], bldgTopY + 0.5, p3Roof[1]));

  // Rooftop Stair & Service Penthouses
  // Penthouse 1: West North Wing deck (centered on roof deck between front and back parapets)
  const c5WestDeckCz = (C5_POINTS[0][1] + C5_POINTS[8][1]) / 2; // -54.75
  roof.add(box(4.5, 2.6, 5.2, creamWall, -20.0, bldgTopY + 1.3, c5WestDeckCz));
  roof.add(box(4.8, 0.2, 5.5, blueWall, -20.0, bldgTopY + 2.7, c5WestDeckCz));
  roof.add(box(0.08, 2.0, 0.9, mats.metalDark, -17.7, bldgTopY + 1.0, c5WestDeckCz));

  // Penthouse 2: East Wing deck
  const c5EastPentZ = -38.5 + C5_SHIFT_Z;
  roof.add(box(4.2, 2.6, 5.0, creamWall, 27.5, bldgTopY + 1.3, c5EastPentZ));
  roof.add(box(4.5, 0.2, 5.3, blueWall, 27.5, bldgTopY + 2.7, c5EastPentZ));
  roof.add(box(0.08, 2.0, 0.9, mats.metalDark, 25.3, bldgTopY + 1.0, c5EastPentZ));

  // Solar Photovoltaic Panel Arrays on flat roof decks (tilted 15° facing south)
  const solarFrameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });

  // Arrays on West North Wing deck
  [-13.0, -26.0].forEach((arrX) => {
    const arrW = 8.5;
    const arrL = 4.2;
    const arrY = bldgTopY + 0.7;
    for (let lz = c5WestDeckCz - arrL / 2 + 0.4; lz <= c5WestDeckCz + arrL / 2; lz += 1.6) {
      roof.add(box(0.06, 0.45, 0.06, solarFrameMat, arrX - arrW / 2 + 0.4, arrY - 0.25, lz));
      roof.add(box(0.06, 0.85, 0.06, solarFrameMat, arrX + arrW / 2 - 0.4, arrY - 0.05, lz));
    }
    const sMesh = new THREE.Mesh(new THREE.BoxGeometry(arrW, 0.06, arrL), solarPanelMat);
    sMesh.position.set(arrX, arrY + 0.15, c5WestDeckCz);
    sMesh.rotation.x = 0.26; // ~15 deg tilt
    sMesh.castShadow = true;
    roof.add(sMesh);
  });

  // Arrays on East Wing deck
  [-48.5 + C5_SHIFT_Z].forEach((arrZ) => {
    const arrW = 4.2;
    const arrL = 7.5;
    const arrY = bldgTopY + 0.7;
    const arrX = 28.0;
    for (let lx = arrX - arrW / 2 + 0.4; lx <= arrX + arrW / 2; lx += 1.7) {
      roof.add(box(0.06, 0.45, 0.06, solarFrameMat, lx, arrY - 0.25, arrZ - arrL / 2 + 0.4));
      roof.add(box(0.06, 0.85, 0.06, solarFrameMat, lx, arrY - 0.05, arrZ + arrL / 2 - 0.4));
    }
    const eSolarMesh = new THREE.Mesh(new THREE.BoxGeometry(arrW, 0.06, arrL), solarPanelMat);
    eSolarMesh.position.set(arrX, arrY + 0.15, arrZ);
    eSolarMesh.rotation.x = 0.26;
    eSolarMesh.castShadow = true;
    roof.add(eSolarMesh);
  });

  // ── Prominent 12-Meter Steel Lattice Telecommunications Antenna Tower ───────
  // Situated on the roof deck near the North-East corner junction
  const towerBaseX = 22.0;
  const towerBaseZ = -58.5 + C5_SHIFT_Z;
  const towerBaseY = bldgTopY + 0.35; // 19.35m
  const towerH = 12.0; // rises to 31.35m
  const baseSpan = 3.2; // 3.2m base footprint
  const topSpan = 1.3; // tapered to 1.3m at top
  const halfBase = baseSpan / 2;
  const halfTop = topSpan / 2;

  // 4 Corner Leg Columns (Tapered from base to top)
  const legB0 = new THREE.Vector3(towerBaseX - halfBase, towerBaseY, towerBaseZ - halfBase);
  const legB1 = new THREE.Vector3(towerBaseX + halfBase, towerBaseY, towerBaseZ - halfBase);
  const legB2 = new THREE.Vector3(towerBaseX + halfBase, towerBaseY, towerBaseZ + halfBase);
  const legB3 = new THREE.Vector3(towerBaseX - halfBase, towerBaseY, towerBaseZ + halfBase);

  const legT0 = new THREE.Vector3(towerBaseX - halfTop, towerBaseY + towerH, towerBaseZ - halfTop);
  const legT1 = new THREE.Vector3(towerBaseX + halfTop, towerBaseY + towerH, towerBaseZ - halfTop);
  const legT2 = new THREE.Vector3(towerBaseX + halfTop, towerBaseY + towerH, towerBaseZ + halfTop);
  const legT3 = new THREE.Vector3(towerBaseX - halfTop, towerBaseY + towerH, towerBaseZ + halfTop);

  roof.add(rod(legB0, legT0, 0.08, latticeSteel));
  roof.add(rod(legB1, legT1, 0.08, latticeSteel));
  roof.add(rod(legB2, legT2, 0.08, latticeSteel));
  roof.add(rod(legB3, legT3, 0.08, latticeSteel));

  // 4 Horizontal Tiers with alternating Steel & Red Warning Bands and Cross-Bracing
  const tiers = 4;
  for (let ti = 1; ti <= tiers; ti++) {
    const tFracPrev = (ti - 1) / tiers;
    const tFrac = ti / tiers;
    const tierMat = ti % 2 === 0 ? latticeRed : latticeSteel;

    const p0 = legB0.clone().lerp(legT0, tFrac);
    const p1 = legB1.clone().lerp(legT1, tFrac);
    const p2 = legB2.clone().lerp(legT2, tFrac);
    const p3 = legB3.clone().lerp(legT3, tFrac);

    const prev0 = legB0.clone().lerp(legT0, tFracPrev);
    const prev1 = legB1.clone().lerp(legT1, tFracPrev);
    const prev2 = legB2.clone().lerp(legT2, tFracPrev);
    const prev3 = legB3.clone().lerp(legT3, tFracPrev);

    // Horizontal frame ring
    roof.add(rod(p0, p1, 0.05, tierMat));
    roof.add(rod(p1, p2, 0.05, tierMat));
    roof.add(rod(p2, p3, 0.05, tierMat));
    roof.add(rod(p3, p0, 0.05, tierMat));

    // Diagonal X-Cross Bracing on all 4 faces
    roof.add(rod(prev0, p1, 0.035, latticeSteel));
    roof.add(rod(prev1, p0, 0.035, latticeSteel));
    roof.add(rod(prev1, p2, 0.035, latticeSteel));
    roof.add(rod(prev2, p1, 0.035, latticeSteel));
    roof.add(rod(prev2, p3, 0.035, latticeSteel));
    roof.add(rod(prev3, p2, 0.035, latticeSteel));
    roof.add(rod(prev3, p0, 0.035, latticeSteel));
    roof.add(rod(prev0, p3, 0.035, latticeSteel));
  }

  // Central Top Antenna Mast rising above the lattice tower
  const mastBase = new THREE.Vector3(towerBaseX, towerBaseY + towerH, towerBaseZ);
  const mastTip = new THREE.Vector3(towerBaseX, towerBaseY + towerH + 3.6, towerBaseZ);
  roof.add(rod(mastBase, mastTip, 0.06, mats.metalSilver));

  // Horizontal dipole and folded antenna elements
  [towerBaseY + towerH + 1.2, towerBaseY + towerH + 2.2].forEach((dy) => {
    roof.add(box(1.2, 0.04, 0.04, mats.metalSilver, towerBaseX, dy, towerBaseZ));
    roof.add(box(0.04, 0.5, 0.04, mats.metalSilver, towerBaseX + 0.6, dy, towerBaseZ));
    roof.add(box(0.04, 0.5, 0.04, mats.metalSilver, towerBaseX - 0.6, dy, towerBaseZ));
  });

  // Flashing Red Aircraft Warning Beacon at the summit
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xff1100,
    emissive: 0xff0000,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), beaconMat);
  beacon.position.copy(mastTip);
  roof.add(beacon);

  floorGroups.push(roof);
  root.add(roof);

  return {
    root,
    floorGroups,
    defaultCameraPos: new THREE.Vector3(34, 28, 52),
    targetLookAt: new THREE.Vector3(-4.0, 7.0, -22.0),
    explodeSpacing: 4.5,
  };
}
