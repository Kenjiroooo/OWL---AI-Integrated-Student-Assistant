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

/** Recessed classroom wall along open corridors: ivory wall, dark timber doors & ribbon transom windows. */
function createCourtyardCorridorTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  // Warm ivory/cream wall background
  ctx.fillStyle = '#ded6be';
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
  ctx.fillStyle = '#a89f88';
  ctx.fillRect(0, H - 8, W, 8);

  return toTexture(canvas);
}

/** 5F Continuous Ribbon Glass texture: dark tinted architectural glass with white mullions and ochre top band. */
function createRibbonWindow5FTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);

  // Dark tinted reflective glass
  ctx.fillStyle = '#132233';
  ctx.fillRect(0, 0, W, H);

  // Sky reflection
  const ref = ctx.createLinearGradient(0, 0, W, H);
  ref.addColorStop(0, 'rgba(130, 190, 255, 0.32)');
  ref.addColorStop(0.5, 'rgba(75, 135, 195, 0.10)');
  ref.addColorStop(1, 'rgba(15, 30, 50, 0.45)');
  ctx.fillStyle = ref;
  ctx.fillRect(0, 0, W, H);

  // Top ochre/sand header band (from photo)
  ctx.fillStyle = '#c89a3c';
  ctx.fillRect(0, 0, W, 28);

  // White frame
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 28, W - 6, H - 31);

  // Vertical white mullions (8 bays)
  const bays = 8;
  const bayW = W / bays;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  for (let i = 1; i < bays; i++) {
    const x = i * bayW;
    ctx.beginPath();
    ctx.moveTo(x, 28);
    ctx.lineTo(x, H - 3);
    ctx.stroke();
  }

  // Horizontal transom bar
  ctx.beginPath();
  ctx.moveTo(3, 28 + (H - 28) * 0.35);
  ctx.lineTo(W - 3, 28 + (H - 28) * 0.35);
  ctx.stroke();

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
  const stoneMat = new THREE.MeshStandardMaterial({ map: createStoneWallTexture(), roughness: 0.8 });
  const billboardMat = new THREE.MeshStandardMaterial({ map: createBillboardTexture(), roughness: 0.3 });
  const portalSignMat = new THREE.MeshStandardMaterial({ map: createPortalSignTexture(), roughness: 0.35 });
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
  const admW = 26.5; // spans from z = -20.0 to z = -46.5 where it meets the 6-storey North Wing
  const admCz = -33.25;

  // New 2-Storey Wing Footprint (Reduced 30% from the front, expanding the front terrace promenade)
  const wingFrontX = -23.44; // Was -20.2 (stepped back 3.24m / 30% of 10.8m depth)
  const wingBackX = admBackX; // -31.0m
  const wingD = wingFrontX - wingBackX; // 7.56m (was 10.8m)
  const wingCx = (wingFrontX + wingBackX) / 2; // -27.22m
  const wingZ0 = -20.0;
  const wingZ1 = -46.0;
  const wingW = wingZ0 - wingZ1; // 26.0m
  const wingCz = (wingZ0 + wingZ1) / 2; // -33.0m

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

  // ── 5-STOREY L-SHAPED COURTYARD BUILDING (North Wing & East Wing) ──
  // A. North Wing (long wing along the north/far side of basketball court, expanded westward behind Student Services to x = -31.0):
  // Inner corridor edge at z = -46.5 (facing +Z into the court)
  // Outer back wall at z = -54.0 (facing -Z)
  const nWingZFront = -46.5;
  const nWingZBack = -54.0;
  const nWingD = Math.abs(nWingZBack - nWingZFront); // 7.5m
  const nWingCz = (nWingZFront + nWingZBack) / 2; // -50.25m
  const nWingX0 = -31.0; // west end (expanded westward to align with Student Services back wall)
  const nWingX1 = 26.0; // east end (meets East Wing back wall at corner)
  const nWingW = Math.abs(nWingX1 - nWingX0); // 57.0m
  const nWingCx = (nWingX0 + nWingX1) / 2; // -2.5m

  // B. East Wing (short wing on the opposite/east side of basketball court):
  // Inner corridor edge at x = 18.5 (facing -X into the court)
  // Outer back wall at x = 26.0 (facing +X)
  const eWingXFront = 18.5;
  const eWingXBack = 26.0;
  const eWingW = Math.abs(eWingXBack - eWingXFront); // 7.5m
  const eWingCx = (eWingXFront + eWingXBack) / 2; // 22.25m
  const eWingZ0 = -22.0; // south end
  const eWingZ1 = -54.0; // north end (meets North Wing back wall at corner)
  const eWingL = Math.abs(eWingZ1 - eWingZ0); // 32.0m
  const eWingCz = (eWingZ0 + eWingZ1) / 2; // -38.0m

  // Materials for 5-Storey Building
  const creamWall = new THREE.MeshStandardMaterial({ color: 0xded6be, roughness: 0.65 });
  const ochreWall = new THREE.MeshStandardMaterial({ color: 0xc89a3c, roughness: 0.7 });
  const corridorWallMat = new THREE.MeshStandardMaterial({
    map: createCourtyardCorridorTexture(),
    roughness: 0.5,
  });
  const ribbon5FMat = new THREE.MeshStandardMaterial({
    map: createRibbonWindow5FTexture(),
    roughness: 0.2,
    metalness: 0.5,
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
  const colZs = [-22.0, -28.0, -34.0, -40.0, -45.5];
  colZs.forEach((cz) => {
    ground.add(box(0.65, FH, 0.65, whiteMat, admFrontX, FH / 2, cz));
  });

  // Green landscape planter boxes along the concourse
  [-24.0, -33.0, -42.0].forEach((pz) => {
    ground.add(box(0.8, 0.5, 4.5, planterMat, admFrontX + 1.2, 0.25, pz));
    ground.add(box(0.6, 0.35, 4.3, shrubDark, admFrontX + 1.2, 0.6, pz));
  });

  // Parked cars in the courtyard plaza (as seen in SZD render)
  ground.add(createCar(-22.0, -26.0, carWhite));
  ground.add(createCar(-14.0, -36.0, carBlue));
  ground.add(createCar(-14.0, -44.0, carDark));

  // ── 8. 5-Storey L-Shaped Courtyard Building (Level 0 / 1F: North Wing & East Wing) ──
  // A. North Wing 1F (Long wing along X on north of basketball court)
  ground.add(box(nWingW, 0.3, nWingD, concrete, nWingCx, 0.15, nWingCz, false));
  ground.add(box(nWingW, FH, 0.4, creamWall, nWingCx, FH / 2, nWingZBack)); // back wall (-Z)
  ground.add(box(0.4, FH, nWingD, creamWall, nWingX0, FH / 2, nWingCz)); // west end wall (-X)
  ground.add(box(33.0, FH - 0.4, 0.15, [creamWall, creamWall, creamWall, creamWall, officeGlassMat, darkGlass], 1.25, FH / 2, nWingZFront - 2.2));
  // Colonnade along corridor line (facing court, +Z)
  [-14.0, -8.0, -2.0, 4.0, 10.0, 16.0].forEach((cx) => {
    ground.add(box(0.6, FH, 0.6, creamWall, cx, FH / 2, nWingZFront));
  });
  // Corrugated entrance canopy along North Wing front
  ground.add(box(14.0, 0.15, 1.8, mats.metalDark, 3.0, 3.2, nWingZFront + 0.9));

  // B. East Wing 1F (Short wing along Z on opposite/east of basketball court)
  ground.add(box(eWingW, 0.3, eWingL, concrete, eWingCx, 0.15, eWingCz, false));
  ground.add(box(0.4, FH, eWingL, creamWall, eWingXBack, FH / 2, eWingCz)); // back wall (+X)
  ground.add(box(eWingW, FH, 0.4, creamWall, eWingCx, FH / 2, eWingZ0)); // south end wall (+Z)
  // Ground floor glass storefronts (facing -X into court)
  ground.add(box(0.15, FH - 0.4, 22.0, [darkGlass, officeGlassMat, creamWall, creamWall, creamWall, creamWall], eWingXFront + 2.2, FH / 2, -34.25));
  // Colonnade along corridor line (facing court, -X)
  [-24.0, -29.0, -34.0, -39.0, -44.0].forEach((cz) => {
    ground.add(box(0.6, FH, 0.6, creamWall, eWingXFront, FH / 2, cz));
  });

  // C. External Concrete Staircase with Blue Handrails (in courtyard along East corridor)
  const stairZ0 = -38.0;
  const stairX = eWingXFront - 1.2; // in courtyard
  for (let s = 0; s <= 12; s++) {
    const stepT = s / 12;
    const sz = stairZ0 + stepT * 6.0; // rises towards z = -32.0
    const sy = stepT * FH;
    ground.add(box(1.4, 0.22, 0.55, concrete, stairX, sy + 0.11, sz));
    if (s % 3 === 0) {
      ground.add(box(0.04, 0.9, 0.04, blueWall, stairX - 0.65, sy + 0.55, sz));
      ground.add(box(0.04, 0.9, 0.04, blueWall, stairX + 0.65, sy + 0.55, sz));
    }
  }
  ground.add(rod(new THREE.Vector3(stairX - 0.65, 0.9, stairZ0), new THREE.Vector3(stairX - 0.65, FH + 0.9, stairZ0 + 6.0), 0.025, blueWall));
  ground.add(rod(new THREE.Vector3(stairX + 0.65, 0.9, stairZ0), new THREE.Vector3(stairX + 0.65, FH + 0.9, stairZ0 + 6.0), 0.025, blueWall));

  // Courtyard corner garden planter (from reference photo)
  ground.add(box(2.2, 0.4, 3.2, planterMat, eWingXFront - 2.0, 0.2, -26.0));
  ground.add(box(2.0, 0.25, 3.0, grassMat, eWingXFront - 2.0, 0.45, -26.0));
  const gardenTree = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), shrubLight);
  gardenTree.position.set(eWingXFront - 2.0, 1.3, -26.0);
  gardenTree.castShadow = true;
  ground.add(gardenTree);

  // D. Parked Courtyard Vehicles (White van & cars from reference photo)
  const van = new THREE.Group();
  van.add(box(4.8, 2.0, 2.2, mats.whiteWall, 0, 1.1, 0));
  van.add(box(1.8, 0.85, 2.22, darkGlass, 1.2, 1.35, 0));
  van.add(box(2.4, 0.75, 2.22, darkGlass, -0.9, 1.35, 0));
  van.position.set(eWingXFront - 4.0, 0.1, -28.0);
  ground.add(van);
  ground.add(createCar(eWingXFront - 4.0, -34.0, carDark));
  ground.add(createCar(eWingXFront - 4.0, -40.0, carWhite));

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
    g.add(box(0.15, 0.85, balcD, whiteMat, classX1 - 0.1, baseY + 1.05, balcZ));

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

      // Right Dynamic Blue Frame (2F portion)
      g.add(box(0.3, 1.2, 9.5, whiteMat, admFrontX, baseY + 0.6, -41.75));
      g.add(box(0.08, 2.3, 9.1, darkGlass, admFrontX + 0.05, baseY + 2.35, -41.75));
      g.add(box(0.5, FH, 0.6, blueWall, admFrontX, cy, -46.2));
    } else if (f === 2) {
      // 3F Level:
      // Floor slab & perimeter walls
      g.add(box(admD, 0.28, admW, roofMat, admCx, baseY + 0.14, admCz));
      g.add(box(0.4, FH, admW, whiteMat, admBackX, cy, admCz));
      g.add(box(admD, FH, 0.4, whiteMat, admCx, cy, -20.0));

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

      // Right Dynamic Blue Frame (3F portion)
      g.add(box(1.2, 0.7, 9.5, blueWall, admFrontX + 0.4, baseY + FH - 0.35, -41.75));
      g.add(box(1.2, FH, 0.7, blueWall, admFrontX + 0.4, cy, -46.2));
      g.add(box(0.08, 2.5, 9.1, darkGlass, admFrontX + 0.05, baseY + 1.6, -41.75));
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
      [-24, -30, -36, -42].forEach((rz) => {
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
      // (North end at z = -46.5 opens seamlessly into the 6-storey North Wing corridor via the hall portal)

      // Paver walkway floor on terrace
      g.add(box(terrL, 0.04, wingW - 0.2, mats.metalDark, terrMidX, baseY + 0.32, wingCz));

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
      for (let sz = -37.5; sz >= -44.5; sz -= 0.8) {
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
      g.add(box(0.35, FH, 0.6, blueWall, wingFrontX + 0.12, cy, -42.5));

      // Architectural vertical sun louvers flanking the balcony
      [-25.5, -27.0, -28.5, -37.5, -39.0, -40.5].forEach((sz) => {
        g.add(box(0.45, FH - 0.4, 0.1, finMat, wingFrontX + 0.12, cy, sz));
      });

      // Royal Blue top header band
      g.add(box(0.38, 0.5, wingW, blueWall, wingFrontX + 0.08, baseY + FH - 0.25, wingCz));

      // Official Signage Plaque mounted prominently above the balcony
      g.add(box(0.14, 1.1, 9.5, [newWingSignMat, mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark, mats.metalDark], wingFrontX + 0.18, baseY + 3.1, -33.0));
    }

    // ── 5-Storey L-Shaped Courtyard Building (Floors 2 to 5: North Wing & East Wing) ──
    if (f >= 1 && f <= 3) {
      // Levels 1, 2, 3: Open-Air Corridors with Warm Cream Balustrades (2F, 3F, 4F)
      // A. North Wing Open Corridor & Classrooms (Long wing along X, facing +Z towards court)
      g.add(box(nWingW, 0.28, nWingD, concrete, nWingCx, baseY + 0.14, nWingCz, false));
      // North Wing rear wall (facing -Z)
      g.add(box(nWingW, FH, 0.4, creamWall, nWingCx, cy, nWingZBack));
      // North Wing rear windows
      [-26.0, -20.0, -14.0, -8.0, -2.0, 4.0, 10.0, 16.0].forEach((wx) => {
        g.add(box(3.2, 1.4, 0.08, darkGlass, wx, cy + 0.2, nWingZBack - 0.05, false));
        g.add(box(3.4, 0.08, 0.12, creamWall, wx, cy - 0.6, nWingZBack - 0.06, false));
      });
      // West end wall
      g.add(box(0.4, FH, nWingD, creamWall, nWingX0, cy, nWingCz));

      // West extension partition wall meeting Student Services & Hallway Portal
      if (f === 3) {
        // 4F Level: Grand Architectural Royal Blue Hall Opening Portal connecting Garden Terrace to North Wing
        // Left solid wall section (behind Innovation Wing)
        g.add(box(8.63, FH, 0.4, creamWall, -26.685, cy, nWingZFront));
        // Right solid wall section
        g.add(box(3.07, FH, 0.4, creamWall, -17.535, cy, nWingZFront));
        // Overhead lintel wall above the hall portal
        g.add(box(3.3, FH - 2.7, 0.4, creamWall, -20.72, baseY + 2.7 + (FH - 2.7) / 2, nWingZFront));

        // Architectural Royal Blue Hall Opening Portal Frame (from user sketch)
        g.add(box(0.35, 2.75, 0.5, blueWall, -22.37, baseY + 0.3 + 1.375, nWingZFront + 0.05));
        g.add(box(0.35, 2.75, 0.5, blueWall, -19.07, baseY + 0.3 + 1.375, nWingZFront + 0.05));
        g.add(box(3.65, 0.45, 0.55, blueWall, -20.72, baseY + 2.85, nWingZFront + 0.06));

        // Cantilevered silver eyebrow sunshade / canopy above portal
        g.add(box(4.0, 0.12, 0.85, mats.metalSilver, -20.72, baseY + 3.12, nWingZFront + 0.42));
        g.add(box(4.04, 0.06, 0.88, blueWall, -20.72, baseY + 3.06, nWingZFront + 0.43));

        // Commercial glass entrance double doors propped open into the corridor
        g.add(box(0.06, 2.4, 1.35, [officeGlassMat, darkGlass, mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver], -21.4, baseY + 0.3 + 1.2, nWingZFront - 0.25));
        g.add(box(0.06, 2.4, 1.35, [officeGlassMat, darkGlass, mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver], -20.04, baseY + 0.3 + 1.2, nWingZFront - 0.25));
        g.add(box(0.08, 0.6, 0.04, mats.metalSilver, -21.4, baseY + 1.5, nWingZFront - 0.2));
        g.add(box(0.08, 0.6, 0.04, mats.metalSilver, -20.04, baseY + 1.5, nWingZFront - 0.2));

        // Walkway paver floor continuing through the portal into corridor
        g.add(box(3.1, 0.04, 2.6, mats.metalDark, -20.72, baseY + 0.32, nWingZFront - 1.1));

        // Interior warm illumination inside the hall portal
        const hallLight = new THREE.PointLight(0xffeedd, 1.6, 10);
        hallLight.position.set(-20.72, baseY + 2.6, nWingZFront - 1.1);
        g.add(hallLight);
        g.add(box(2.2, 0.05, 1.2, mats.lightWarm, -20.72, baseY + FH - 0.1, nWingZFront - 1.1));
      } else {
        // 2F & 3F: West extension partition wall meeting Student Services with connecting interior doorway
        g.add(box(8.63, FH, 0.4, creamWall, -26.685, cy, nWingZFront));
        g.add(box(3.07, FH, 0.4, creamWall, -17.535, cy, nWingZFront));
        g.add(box(3.3, FH - 2.5, 0.4, creamWall, -20.72, baseY + 2.5 + (FH - 2.5) / 2, nWingZFront));
        // Connecting doorway frame
        g.add(box(0.15, 2.5, 0.45, blueWall, -22.25, baseY + 1.25, nWingZFront));
        g.add(box(0.15, 2.5, 0.45, blueWall, -19.19, baseY + 1.25, nWingZFront));
        g.add(box(3.2, 0.15, 0.45, blueWall, -20.72, baseY + 2.45, nWingZFront));
        g.add(box(0.06, 2.3, 2.8, officeGlassMat, -20.72, baseY + 1.2, nWingZFront));
      }

      // Recessed classroom wall facing open courtyard corridor (at z = -48.7, facing +Z)
      const nRecessW = 34.5;
      const nRecessCx = 1.25;
      g.add(box(nRecessW, FH, 0.2, [creamWall, creamWall, creamWall, creamWall, corridorWallMat, creamWall], nRecessCx, cy, -48.7));
      // Open corridor ceiling soffit
      g.add(box(nRecessW, 0.15, 2.2, creamWall, nRecessCx, baseY + FH - 0.08, -47.6));
      // Solid cream balustrade along corridor front edge (z = nWingZFront = -46.5)
      g.add(box(nRecessW, 1.05, 0.25, creamWall, nRecessCx, baseY + 0.525, nWingZFront));
      g.add(box(nRecessW + 0.1, 0.08, 0.32, creamWall, nRecessCx, baseY + 1.09, nWingZFront)); // coping
      // Concrete lintel beam along front ceiling
      g.add(box(nRecessW, 0.5, 0.3, creamWall, nRecessCx, baseY + FH - 0.25, nWingZFront));
      // Colonnade columns along corridor front edge
      [-14.0, -8.0, -2.0, 4.0, 10.0, 16.0].forEach((cx) => {
        g.add(box(0.6, FH, 0.6, creamWall, cx, cy, nWingZFront));
      });

      // B. East Wing Open Corridor & Classrooms (Short wing along Z on opposite side, facing -X towards court)
      g.add(box(eWingW, 0.28, eWingL, concrete, eWingCx, baseY + 0.14, eWingCz, false));
      // East Wing rear wall (facing +X)
      g.add(box(0.4, FH, eWingL, creamWall, eWingXBack, cy, eWingCz));
      // East Wing rear windows
      [-26.0, -32.0, -38.0, -44.0].forEach((wz) => {
        g.add(box(0.08, 1.4, 3.2, darkGlass, eWingXBack + 0.05, cy + 0.2, wz, false));
        g.add(box(0.12, 0.08, 3.4, creamWall, eWingXBack + 0.06, cy - 0.6, wz, false));
      });
      // South end wall
      g.add(box(eWingW, FH, 0.4, creamWall, eWingCx, cy, eWingZ0));

      // Recessed classroom wall facing open courtyard corridor (at x = 20.7, facing -X)
      const eRecessL = 24.5;
      const eRecessCz = -34.25;
      g.add(box(0.2, FH, eRecessL, [creamWall, corridorWallMat, creamWall, creamWall, creamWall, creamWall], 20.7, cy, eRecessCz));
      // Open corridor ceiling soffit
      g.add(box(2.2, 0.15, eRecessL, creamWall, 19.6, baseY + FH - 0.08, eRecessCz));
      // Solid cream balustrade along corridor front edge (x = eWingXFront = 18.5)
      g.add(box(0.25, 1.05, eRecessL, creamWall, eWingXFront, baseY + 0.525, eRecessCz));
      g.add(box(0.32, 0.08, eRecessL + 0.1, creamWall, eWingXFront, baseY + 1.09, eRecessCz)); // coping
      // Concrete lintel beam along front ceiling
      g.add(box(0.3, 0.5, eRecessL, creamWall, eWingXFront, baseY + FH - 0.25, eRecessCz));
      // Colonnade columns along corridor line
      [-24.0, -29.0, -34.0, -39.0, -44.0].forEach((cz) => {
        g.add(box(0.6, FH, 0.6, creamWall, eWingXFront, cy, cz));
      });

      // Air Conditioner Outdoor Compressor Units mounted on balustrades (from reference photo)
      [-6.0, 6.0, 14.0].forEach((acX) => {
        const acY = baseY + 1.35;
        g.add(box(0.85, 0.62, 0.38, [mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver, acUnitMat, mats.metalSilver], acX, acY, nWingZFront + 0.22));
        g.add(box(0.04, 0.45, 0.42, mats.metalDark, acX - 0.28, acY - 0.35, nWingZFront + 0.22));
        g.add(box(0.04, 0.45, 0.42, mats.metalDark, acX + 0.28, acY - 0.35, nWingZFront + 0.22));
      });
      [-28.0, -38.0].forEach((acZ) => {
        const acY = baseY + 1.35;
        g.add(box(0.38, 0.62, 0.85, [mats.metalSilver, acUnitMat, mats.metalSilver, mats.metalSilver, mats.metalSilver, mats.metalSilver], eWingXFront - 0.22, acY, acZ));
        g.add(box(0.42, 0.45, 0.04, mats.metalDark, eWingXFront - 0.22, acY - 0.35, acZ - 0.28));
        g.add(box(0.42, 0.45, 0.04, mats.metalDark, eWingXFront - 0.22, acY - 0.35, acZ + 0.28));
      });
    } else if (f === 4) {
      // Level 4: 5th Floor Enclosed Floor with Continuous Ribbon Glass & Ochre Header Band
      // A. North Wing 5F (Long wing)
      g.add(box(nWingW, 0.28, nWingD, concrete, nWingCx, baseY + 0.14, nWingCz, false));
      g.add(box(nWingW, FH, 0.4, creamWall, nWingCx, cy, nWingZBack));
      g.add(box(0.4, FH, nWingD, creamWall, nWingX0, cy, nWingCz));
      [-26.0, -20.0, -14.0, -8.0, -2.0, 4.0, 10.0, 16.0].forEach((wx) => {
        g.add(box(3.2, 1.4, 0.08, darkGlass, wx, cy + 0.2, nWingZBack - 0.05, false));
      });
      const nExtW = Math.abs(-16.0 - nWingX0); // 15.0m
      const nExtCx = (nWingX0 + -16.0) / 2; // -23.5m
      g.add(box(nExtW, FH, 0.4, creamWall, nExtCx, cy, nWingZFront));
      const nRecessW = 34.5;
      const nRecessCx = 1.25;
      g.add(box(nRecessW, FH - 0.8, 0.2, [creamWall, creamWall, creamWall, creamWall, ribbon5FMat, creamWall], nRecessCx, cy - 0.1, nWingZFront));
      g.add(box(nRecessW, 0.7, 0.35, ochreWall, nRecessCx, baseY + FH - 0.35, nWingZFront));
      g.add(box(nRecessW, 0.4, 0.3, creamWall, nRecessCx, baseY + 0.2, nWingZFront));

      // B. East Wing 5F (Short wing on opposite side)
      g.add(box(eWingW, 0.28, eWingL, concrete, eWingCx, baseY + 0.14, eWingCz, false));
      g.add(box(0.4, FH, eWingL, creamWall, eWingXBack, cy, eWingCz));
      g.add(box(eWingW, FH, 0.4, creamWall, eWingCx, cy, eWingZ0));
      [-26.0, -32.0, -38.0, -44.0].forEach((wz) => {
        g.add(box(0.08, 1.4, 3.2, darkGlass, eWingXBack + 0.05, cy + 0.2, wz, false));
      });
      const eRecessL = 24.5;
      const eRecessCz = -34.25;
      g.add(box(0.2, FH - 0.8, eRecessL, [creamWall, ribbon5FMat, creamWall, creamWall, creamWall, creamWall], eWingXFront, cy - 0.1, eRecessCz));
      g.add(box(0.35, 0.7, eRecessL, ochreWall, eWingXFront, baseY + FH - 0.35, eRecessCz));
      g.add(box(0.3, 0.4, eRecessL, creamWall, eWingXFront, baseY + 0.2, eRecessCz));

      // C. Circular Universidad de Dagupan Seal Medallion at 90° Inner Corner
      // Positioned right at the inner corner junction (x = 18.1, z = -46.1), angled at 45° facing into the court (-X, +Z)!
      const cornerSealX = 18.1;
      const cornerSealZ = -46.1;
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

  // Solar Photovoltaic (PV) Panels Array (2 rows of 3 panels)
  [-26.5, -29.0].forEach((pvX) => {
    [-38.0, -40.5, -43.0].forEach((pvZ) => {
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

  // ── 7. 5-Storey Courtyard Building Rooftop (North & East Wings with 12m Tower) ───────
  const bldgTopY = roofBaseY; // 19.0m (top of Floor 5 / roof deck)

  // Rooftop Slabs (at bldgTopY = 19.0m)
  roof.add(box(eWingW + 0.4, 0.35, eWingL + 0.4, concrete, eWingCx, bldgTopY + 0.175, eWingCz));
  roof.add(box(nWingW + 0.4, 0.35, nWingD + 0.4, concrete, nWingCx, bldgTopY + 0.175, nWingCz));

  const eRecessL5 = 24.5;
  const eRecessCz5 = -34.25;
  const nRecessW5 = 34.5;
  const nRecessCx5 = 1.25;
  const nExtW5 = Math.abs(-16.0 - nWingX0); // 15.0m
  const nExtCx5 = (nWingX0 + -16.0) / 2; // -23.5m

  // Rooftop Parapets (1.1m high)
  // Courtyard-facing parapet (ochre finish as seen in photo)
  roof.add(box(0.35, 1.1, eRecessL5 + 0.4, ochreWall, eWingXFront, bldgTopY + 0.55, eRecessCz5));
  roof.add(box(nRecessW5 + 0.4, 1.1, 0.35, ochreWall, nRecessCx5, bldgTopY + 0.55, nWingZFront));
  roof.add(box(0.42, 0.12, eRecessL5 + 0.5, creamWall, eWingXFront, bldgTopY + 1.15, eRecessCz5));
  roof.add(box(nRecessW5 + 0.5, 0.12, 0.42, creamWall, nRecessCx5, bldgTopY + 1.15, nWingZFront));

  // Extended south rooftop parapet above Innovation Wing
  roof.add(box(nExtW5, 1.1, 0.35, ochreWall, nExtCx5, bldgTopY + 0.55, nWingZFront));
  roof.add(box(nExtW5 + 0.1, 0.12, 0.42, creamWall, nExtCx5, bldgTopY + 1.15, nWingZFront));

  // Outer boundary parapets
  roof.add(box(0.35, 1.1, eWingL + 0.4, creamWall, eWingXBack, bldgTopY + 0.55, eWingCz));
  roof.add(box(eWingW + 0.4, 1.1, 0.35, creamWall, eWingCx, bldgTopY + 0.55, eWingZ0));
  roof.add(box(nWingW + 0.4, 1.1, 0.35, creamWall, nWingCx, bldgTopY + 0.55, nWingZBack));
  roof.add(box(0.35, 1.1, nWingD + 0.4, creamWall, nWingX0, bldgTopY + 0.55, nWingCz));

  // Rooftop Stair & Service Penthouse (North Wing)
  const spW = 5.2;
  const spD = 4.0;
  const spH = 2.6;
  const spX = 6.0;
  const spZ = nWingCz;
  roof.add(box(spW, spH, spD, creamWall, spX, bldgTopY + spH / 2, spZ));
  roof.add(box(spW + 0.3, 0.2, spD + 0.3, ochreWall, spX, bldgTopY + spH + 0.1, spZ));
  roof.add(box(0.9, 2.0, 0.08, mats.metalDark, spX, bldgTopY + 1.0, spZ + spD / 2 + 0.05)); // door

  // Rooftop HVAC units on North Wing roof
  [-22.0, -4.0, 12.0].forEach((hx) => {
    roof.add(box(2.8, 1.3, 1.8, mats.metalSilver, hx, bldgTopY + 0.85, nWingCz));
    roof.add(box(3.0, 0.15, 2.0, mats.metalDark, hx, bldgTopY + 1.55, nWingCz));
  });

  // ── Prominent 12-Meter Steel Lattice Telecommunications Antenna Tower ───────
  // Situated on the roof directly above the North-East (corner junction)
  const towerBaseX = eWingCx; // 22.25
  const towerBaseZ = nWingCz; // -50.25
  const towerBaseY = bldgTopY + 0.35; // 19.35m
  const towerH = 12.0; // rises to 35.15m
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
