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

/** Side faces of the top box (stripe continues around the corner). */
function createTopBoxSideTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.silverTop);
  g.addColorStop(1, C.silverBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  panelLines(ctx, 0, 0, W, H, 10, 5, '#99a1aa');
  ctx.fillStyle = C.darkWedge;
  ctx.fillRect(0, 133, W, 36);
  ctx.fillStyle = '#4b5158';
  ctx.fillRect(0, H - 40, W, 40);
  return toTexture(canvas);
}

/** Generic light ACP panel grid for side / rear faces. */
function createPanelGridTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 256);
  ctx.fillStyle = '#d3d8dd';
  ctx.fillRect(0, 0, 512, 256);
  panelLines(ctx, 0, 0, 512, 256, 6, 2, '#a7aeb6');
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

/** Cylinder spanning two points (rails, struts). */
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
  const depth = 12;
  const frontZ = depth / 2; // 6

  const beigeX0 = 6;
  const beigeX1 = 13;
  const beigeW = beigeX1 - beigeX0;
  const beigeCx = (beigeX0 + beigeX1) / 2;
  const beigeFrontZ = 4.5;
  const beigeD = beigeFrontZ + depth / 2;
  const beigeCz = (beigeFrontZ - depth / 2) / 2;

  // Materials
  const panelMat = new THREE.MeshStandardMaterial({ map: createPanelGridTexture(), roughness: 0.4, metalness: 0.35 });
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

  // Face order for BoxGeometry: +x, -x, +y, -y, +z (front), -z (back)
  const mainFloorMats = (front: THREE.Material) => [panelMat, panelMat, roofMat, roofMat, front, panelMat];

  // ── Ground floor (site, entrance, stairs, canopy, fence) ──────────────────
  const ground = new THREE.Group();
  ground.name = 'FAME_Ground_Floor';

  // Site: lawn, sidewalk, road
  ground.add(box(40, 0.3, 26, concrete, 4, -0.15, 2, false));
  ground.add(box(20, 0.08, 5.6, lawn, -4, 0.04, 9.4, false));
  ground.add(box(9, 0.08, 5.6, lawn, 19.5, 0.04, 9.4, false));
  ground.add(box(40, 0.12, 3.4, concrete, 4, 0.06, 14, false));
  ground.add(box(40, 0.05, 8, asphalt, 4, 0.0, 19.8, false));
  for (let x = -14; x < 24; x += 4) ground.add(box(2, 0.02, 0.18, whiteLine, x, 0.04, 19.8, false));

  // Main mass ground floor
  ground.add(box(mainW, FH, depth, mainFloorMats(groundFrontMat), mainCx, FH / 2, 0));

  // Beige block ground floor with glass entrance doors
  ground.add(box(beigeW, FH, beigeD, beige, beigeCx, FH / 2, beigeCz));
  ground.add(box(2.6, 2.2, 0.08, darkGlass, 8.2, 1.4 + 1.1, beigeFrontZ + 0.05, false));
  ground.add(box(1.2, 1.4, 0.06, mats.whiteWall, 10.6, 2.5, beigeFrontZ + 0.05, false)); // notice board

  // Raised entrance landing
  ground.add(box(9.5, 1.4, 3.2, stairMat, 10.75, 0.7, beigeFrontZ + 1.6));

  // Wide concrete stairs (6 risers)
  const steps = 6;
  const rise = 1.4 / steps;
  const run = 0.6;
  const stairX0 = 7.4;
  const stairX1 = 14.4;
  const stairZ0 = beigeFrontZ + 3.2;
  for (let i = 0; i < steps; i++) {
    const top = 1.4 - i * rise;
    ground.add(
      box(stairX1 - stairX0, top, run, stairMat, (stairX0 + stairX1) / 2, top / 2, stairZ0 + i * run + run / 2)
    );
  }
  const stairZ1 = stairZ0 + steps * run;

  // Blue handrails (both sides + centre)
  [stairX0 + 0.15, (stairX0 + stairX1) / 2, stairX1 - 0.15].forEach((x) => {
    const a = new THREE.Vector3(x, 1.4 + 0.95, stairZ0 - 0.2);
    const b = new THREE.Vector3(x, 0.2 + 0.95, stairZ1);
    ground.add(rod(a, b, 0.05, fenceBlue));
    ground.add(rod(a.clone().setY(a.y - 0.45), b.clone().setY(b.y - 0.45), 0.035, fenceBlue));
    ground.add(rod(new THREE.Vector3(x, 1.4, stairZ0 - 0.2), a, 0.05, fenceBlue));
    ground.add(rod(new THREE.Vector3(x, 0.2, stairZ1), b, 0.05, fenceBlue));
  });

  // Entrance canopy: dark metal roof on steel columns
  const canopyY = 5.2;
  const canopy = box(12.5, 0.18, 7, canopyMat, 11.6, canopyY, 7.2);
  canopy.rotation.x = 0.04;
  ground.add(canopy);
  ground.add(box(12.6, 0.3, 0.12, canopyMat, 11.6, canopyY - 0.12, 10.72)); // fascia
  [7.2, 11.2, 15.2, 17.6].forEach((x) => {
    ground.add(rod(new THREE.Vector3(x, 0, 10.4), new THREE.Vector3(x, canopyY, 10.4), 0.11, mats.metalDark));
  });
  ground.add(rod(new THREE.Vector3(17.6, 0, 4.4), new THREE.Vector3(17.6, canopyY, 4.4), 0.11, mats.metalDark));

  // Blue steel perimeter fence (gap at the stairs)
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
  buildFence(-15, stairX0 - 0.4);
  buildFence(stairX1 + 0.4, 23);

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
  palm(16.4, 7.8, 6.4);
  palm(19.5, 5, 5.6);
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

  // ── Upper floors 2F – 4F (mesh facade + beige block) ──────────────────────
  for (let f = 1; f <= 3; f++) {
    const g = new THREE.Group();
    g.name = `FAME_Floor_${f + 1}`;
    const baseY = f * FH;
    const cy = baseY + FH / 2;

    g.add(box(mainW, FH, depth, mainFloorMats(meshFrontMat), mainCx, cy, 0));
    g.add(box(beigeW, FH, beigeD, beige, beigeCx, cy, beigeCz));

    const fz = beigeFrontZ + 0.05;
    if (f === 1) {
      // 2F – ribbon window
      g.add(box(5.4, 1.1, 0.08, darkGlass, beigeCx, baseY + 2.2, fz, false));
    } else if (f === 2) {
      // 3F – Universidad de Dagupan seal + small window
      const seal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.15, 0.12, 48),
        new THREE.MeshStandardMaterial({ map: createEmblemTexture(), roughness: 0.3 })
      );
      seal.rotation.x = Math.PI / 2;
      seal.position.set(8.4, baseY + 1.9, fz + 0.06);
      seal.castShadow = true;
      g.add(seal);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.09, 12, 48), fenceBlue);
      ring.position.set(8.4, baseY + 1.9, fz + 0.1);
      g.add(ring);
      g.add(box(2.4, 0.9, 0.08, darkGlass, 11.3, baseY + 2.1, fz, false));
    } else {
      // 4F – jalousie window strip under the cantilever
      g.add(box(5.2, 1.0, 0.08, jalousieMat, beigeCx, baseY + 2.4, fz, false));
    }
    // Side (+x) windows on the beige block
    g.add(box(0.08, 1.0, 4.5, darkGlass, beigeX1 + 0.05, baseY + 2.1, -1.5, false));

    floorGroups.push(g);
    root.add(g);
  }

  // ── Cantilevered top box (5F) ─────────────────────────────────────────────
  const top = new THREE.Group();
  top.name = 'FAME_Cantilevered_Top_Box';
  const topX0 = mainX0 - 0.3;
  const topX1 = beigeX1 + 1.2;
  const topH = 6.6;
  const topD = depth + 1.2;
  const topSide = new THREE.MeshStandardMaterial({ map: createTopBoxSideTexture(), roughness: 0.35, metalness: 0.4 });
  const topFront = new THREE.MeshStandardMaterial({ map: createTopBoxFrontTexture(), roughness: 0.35, metalness: 0.4 });
  const soffit = new THREE.MeshStandardMaterial({ color: 0x4b5158, roughness: 0.6 });
  top.add(
    box(
      topX1 - topX0,
      topH,
      topD,
      [topSide, topSide, roofMat, soffit, topFront, topSide],
      (topX0 + topX1) / 2,
      3 * FH + FH + topH / 2,
      0.5
    )
  );
  // Rooftop parapet cap
  top.add(box(topX1 - topX0 + 0.1, 0.2, topD + 0.1, mats.metalSilver, (topX0 + topX1) / 2, 4 * FH + topH + 0.1, 0.5));

  floorGroups.push(top);
  root.add(top);

  return {
    root,
    floorGroups,
    defaultCameraPos: new THREE.Vector3(14, 13, 44),
    targetLookAt: new THREE.Vector3(2, 9.5, 2),
    explodeSpacing: 4,
  };
}
