// ─────────────────────────────────────────────────────────────────────────────
// proceduralModels.ts – Procedural 3D Architectural Models for UDD
//
// Accurately reflects the architectural features from the reference photos:
// 1. UDD Main Campus Tower: Cantilevered floor slabs, blue perimeter bands,
//    vertical UDD signage tower, covered entrance canopy, balconies, and AC units.
// 2. UDD Main Campus Front Building: Asymmetrical blue framed facades, large
//    curtain-wall glass bays, central vertical fins with UDD circular emblem,
//    and ground sports court concourse.
//
// Supports Exploded View: Each floor/level is grouped in `floorGroups` and
// can be elevated smoothly along the Y-axis.
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';

export interface Building3DResult {
  root: THREE.Group;
  floorGroups: THREE.Group[];
  defaultCameraPos: THREE.Vector3;
  targetLookAt: THREE.Vector3;
}

// ── Shared Materials ────────────────────────────────────────────────────────
function getMaterials() {
  const whiteWall = new THREE.MeshStandardMaterial({
    color: 0xedf2f7,
    roughness: 0.45,
    metalness: 0.05,
  });

  const uddBlue = new THREE.MeshStandardMaterial({
    color: 0x005bbb,
    roughness: 0.35,
    metalness: 0.15,
  });

  const darkNavy = new THREE.MeshStandardMaterial({
    color: 0x0a2540,
    roughness: 0.4,
    metalness: 0.2,
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x90caf9,
    transparent: true,
    opacity: 0.65,
    roughness: 0.1,
    metalness: 0.8,
    transmission: 0.4,
    ior: 1.5,
  });

  const metalDark = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.8,
  });

  const metalSilver = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    roughness: 0.25,
    metalness: 0.85,
  });

  const concreteGround = new THREE.MeshStandardMaterial({
    color: 0xdbe2e8,
    roughness: 0.85,
    metalness: 0.05,
  });

  const courtBlue = new THREE.MeshStandardMaterial({
    color: 0x1d68b8,
    roughness: 0.8,
    metalness: 0.05,
  });

  return {
    whiteWall,
    uddBlue,
    darkNavy,
    glass,
    metalDark,
    metalSilver,
    concreteGround,
    courtBlue,
  };
}

// ── Dynamic Canvas Texture: UDD Emblem ──────────────────────────────────────
function createEmblemTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Outer circle navy
    ctx.fillStyle = '#004085';
    ctx.beginPath();
    ctx.arc(256, 256, 240, 0, Math.PI * 2);
    ctx.fill();

    // Gold/white inner border
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Inner white circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(256, 256, 190, 0, Math.PI * 2);
    ctx.fill();

    // Blue shield/globe center
    ctx.fillStyle = '#0066cc';
    ctx.beginPath();
    ctx.arc(256, 256, 120, 0, Math.PI * 2);
    ctx.fill();

    // Curved text on top: UNIVERSIDAD DE DAGUPAN
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('UNIVERSIDAD DE DAGUPAN', 256, 46);

    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('1984', 256, 470);
    ctx.fillText('UDD', 256, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

// ── Dynamic Canvas Texture: Vertical "UDD" Tower Sign ───────────────────────
function createVerticalSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 1024);

    // Cyan/UDD blue matching the university branding & reference photo
    ctx.fillStyle = '#0084d6';
    ctx.font = '900 175px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Slightly tighter letter spacing for a balanced, cohesive sign lockup
    ctx.fillText('U', 128, 280);
    ctx.fillText('D', 128, 512);
    ctx.fillText('D', 128, 744);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDING 1: UDD Main Campus Tower
// ─────────────────────────────────────────────────────────────────────────────
export function buildMainTower3D(): Building3DResult {
  const root = new THREE.Group();
  root.name = 'UDD_Main_Tower_Root';
  const mats = getMaterials();

  const floorGroups: THREE.Group[] = [];

  const buildingWidth = 24;
  const buildingDepth = 14;
  const floorHeight = 3.6;
  const totalFloors = 5;

  // 1. Ground Concourse & Plinth (Floor 0)
  const groundGroup = new THREE.Group();
  groundGroup.name = 'Floor_0_Ground_Concourse';

  // Base ground plinth
  const plinthGeo = new THREE.BoxGeometry(buildingWidth + 12, 0.8, buildingDepth + 14);
  const plinthMesh = new THREE.Mesh(plinthGeo, mats.concreteGround);
  plinthMesh.position.y = -0.4;
  plinthMesh.receiveShadow = true;
  groundGroup.add(plinthMesh);

  // Ground level enclosed lobby
  const lobbyGeo = new THREE.BoxGeometry(buildingWidth - 2, floorHeight, buildingDepth - 2);
  const lobbyMesh = new THREE.Mesh(lobbyGeo, mats.whiteWall);
  lobbyMesh.position.y = floorHeight / 2;
  lobbyMesh.castShadow = true;
  lobbyMesh.receiveShadow = true;
  groundGroup.add(lobbyMesh);

  // Ground lobby glass entrance
  const lobbyGlassGeo = new THREE.BoxGeometry(buildingWidth - 4, floorHeight * 0.75, 0.4);
  const lobbyGlass = new THREE.Mesh(lobbyGlassGeo, mats.glass);
  lobbyGlass.position.set(0, floorHeight * 0.45, buildingDepth / 2 - 0.9);
  groundGroup.add(lobbyGlass);

  // Large curved arched corrugated entrance canopy (from photo)
  const canopyWidth = buildingWidth * 0.9;
  const canopyDepth = 8;
  const canopyHeight = 4.5;
  const canopyGroup = new THREE.Group();

  // Canopy columns (arched/tapered steel supports)
  for (let x = -canopyWidth / 2 + 2; x <= canopyWidth / 2 - 2; x += 5.5) {
    const colGeo = new THREE.CylinderGeometry(0.2, 0.25, canopyHeight, 12);
    const colMesh = new THREE.Mesh(colGeo, mats.metalDark);
    colMesh.position.set(x, canopyHeight / 2, buildingDepth / 2 + canopyDepth * 0.6);
    colMesh.castShadow = true;
    canopyGroup.add(colMesh);
  }

  // Curved canopy roof
  const canopyRoofGeo = new THREE.BoxGeometry(canopyWidth + 2, 0.35, canopyDepth + 2);
  const canopyRoof = new THREE.Mesh(canopyRoofGeo, mats.metalDark);
  canopyRoof.position.set(0, canopyHeight, buildingDepth / 2 + canopyDepth * 0.5);
  canopyRoof.rotation.x = 0.08;
  canopyRoof.castShadow = true;
  canopyGroup.add(canopyRoof);
  groundGroup.add(canopyGroup);

  floorGroups.push(groundGroup);
  root.add(groundGroup);

  // 2. Typical Academic Floors (Floors 1 to 5)
  for (let f = 1; f <= totalFloors; f++) {
    const floorGroup = new THREE.Group();
    floorGroup.name = `Floor_${f}`;
    const baseY = f * floorHeight;

    // Floor slab with cantilevered overhang
    const slabGeo = new THREE.BoxGeometry(buildingWidth + 1.2, 0.5, buildingDepth + 1.2);
    const slabMesh = new THREE.Mesh(slabGeo, mats.whiteWall);
    slabMesh.position.y = baseY;
    slabMesh.castShadow = true;
    slabMesh.receiveShadow = true;
    floorGroup.add(slabMesh);

    // Blue horizontal accent band along the floor edge (prominent in photo)
    const bandGeo = new THREE.BoxGeometry(buildingWidth + 1.4, 0.35, buildingDepth + 1.4);
    const bandMesh = new THREE.Mesh(bandGeo, mats.uddBlue);
    bandMesh.position.y = baseY - 0.25;
    floorGroup.add(bandMesh);

    // Main floor wall core
    const coreGeo = new THREE.BoxGeometry(buildingWidth - 1, floorHeight - 0.6, buildingDepth - 1);
    const coreMesh = new THREE.Mesh(coreGeo, mats.whiteWall);
    coreMesh.position.y = baseY + floorHeight / 2;
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    floorGroup.add(coreMesh);

    // Continuous ribbon windows / balconies (front and side)
    const windowStripGeo = new THREE.BoxGeometry(buildingWidth - 3, 1.4, 0.2);
    const windowStrip = new THREE.Mesh(windowStripGeo, mats.glass);
    windowStrip.position.set(0, baseY + floorHeight * 0.55, buildingDepth / 2 - 0.4);
    floorGroup.add(windowStrip);

    // Balcony handrail & window mullions
    const balconyGeo = new THREE.BoxGeometry(buildingWidth - 2, 0.85, 0.3);
    const balcony = new THREE.Mesh(balconyGeo, mats.whiteWall);
    balcony.position.set(0, baseY + 0.55, buildingDepth / 2 + 0.2);
    floorGroup.add(balcony);

    // Air conditioner units on exterior (visible authentic detail from photo)
    [-6, 0, 6].forEach((acX) => {
      const acGeo = new THREE.BoxGeometry(1.0, 0.7, 0.5);
      const acMesh = new THREE.Mesh(acGeo, mats.metalSilver);
      acMesh.position.set(acX, baseY + 1.2, buildingDepth / 2 + 0.3);
      floorGroup.add(acMesh);
    });

    floorGroups.push(floorGroup);
    root.add(floorGroup);
  }

  // 3. Right-Side Vertical Tower with "UDD" lettering & Stair Core
  // Tower height decreased by 25% from 37.8 to 28.35 units
  const towerGroup = new THREE.Group();
  towerGroup.name = 'Vertical_UDD_Tower_Core';
  const towerHeight = (totalFloors + 2) * floorHeight * 1.5 * 0.75; // 28.35 units tall (-25%)
  const towerWidth = 5.5;
  const towerDepth = 6.5;

  const towerGeo = new THREE.BoxGeometry(towerWidth, towerHeight, towerDepth);
  const towerMesh = new THREE.Mesh(towerGeo, mats.whiteWall);
  towerMesh.position.set(
    buildingWidth / 2 - towerWidth / 2 + 0.8,
    towerHeight / 2,
    buildingDepth / 4
  );
  towerMesh.castShadow = true;
  towerMesh.receiveShadow = true;
  towerGroup.add(towerMesh);

  // Vertical "UDD" sign plane on the tower face, positioned above roofline
  const signMat = new THREE.MeshBasicMaterial({
    map: createVerticalSignTexture(),
    transparent: true,
  });
  const signHeight = 8.8;
  const signWidth = 2.4;
  const signGeo = new THREE.PlaneGeometry(signWidth, signHeight);
  const signMesh = new THREE.Mesh(signGeo, signMat);
  signMesh.position.set(
    buildingWidth / 2 - towerWidth / 2 + 0.8,
    towerHeight - signHeight / 2 - 0.9,
    buildingDepth / 4 + towerDepth / 2 + 0.05
  );
  towerGroup.add(signMesh);

  // Tower top maintenance roof structure & ladder
  const cageGeo = new THREE.BoxGeometry(2.8, 3.2, 2.8);
  const cageMesh = new THREE.Mesh(
    cageGeo,
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      wireframe: true,
    })
  );
  cageMesh.position.set(
    buildingWidth / 2 - towerWidth / 2 + 0.8,
    towerHeight + 1.6,
    buildingDepth / 4
  );
  towerGroup.add(cageMesh);

  floorGroups.push(towerGroup);
  root.add(towerGroup);

  return {
    root,
    floorGroups,
    defaultCameraPos: new THREE.Vector3(26, 23, 39),
    targetLookAt: new THREE.Vector3(0, 12, 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDING 2: UDD Main Campus Front Building
// ─────────────────────────────────────────────────────────────────────────────
export function buildFrontBuilding3D(): Building3DResult {
  const root = new THREE.Group();
  root.name = 'UDD_Front_Building_Root';
  const mats = getMaterials();

  const floorGroups: THREE.Group[] = [];

  const buildingWidth = 32;
  const buildingDepth = 16;
  const floorHeight = 4.2;

  // 1. Basketball Court / Courtyard Ground Level (Floor 0)
  const groundGroup = new THREE.Group();
  groundGroup.name = 'Level_0_Court_Concourse';

  // Ground court slab
  const courtGeo = new THREE.BoxGeometry(buildingWidth + 18, 0.6, buildingDepth + 24);
  const courtMesh = new THREE.Mesh(courtGeo, mats.courtBlue);
  courtMesh.position.set(0, -0.3, 8);
  courtMesh.receiveShadow = true;
  groundGroup.add(courtMesh);

  // Court line markings
  const centerCircleGeo = new THREE.RingGeometry(2.8, 3.0, 32);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const centerCircle = new THREE.Mesh(centerCircleGeo, lineMat);
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.set(0, 0.02, 14);
  groundGroup.add(centerCircle);

  // Basketball Hoop (from photo in front of central entrance)
  const hoopGroup = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 4.2, 12);
  const poleMesh = new THREE.Mesh(poleGeo, mats.uddBlue);
  poleMesh.position.set(-4, 2.1, 7.5);
  hoopGroup.add(poleMesh);

  const backboardGeo = new THREE.BoxGeometry(2.4, 1.6, 0.1);
  const backboard = new THREE.Mesh(backboardGeo, lineMat);
  backboard.position.set(-4, 3.8, 7.5);
  hoopGroup.add(backboard);
  groundGroup.add(hoopGroup);

  // Ground concourse entrance & security colonnade
  const colonnadeGeo = new THREE.BoxGeometry(buildingWidth - 2, floorHeight, 3);
  const colonnade = new THREE.Mesh(colonnadeGeo, mats.whiteWall);
  colonnade.position.set(0, floorHeight / 2, 0);
  groundGroup.add(colonnade);

  // Ground louvers / horizontal sunscreens
  for (let y = 1.2; y <= 3.6; y += 0.6) {
    const louverGeo = new THREE.BoxGeometry(buildingWidth - 6, 0.12, 0.4);
    const louver = new THREE.Mesh(louverGeo, mats.metalDark);
    louver.position.set(0, y, 1.6);
    groundGroup.add(louver);
  }

  floorGroups.push(groundGroup);
  root.add(groundGroup);

  // 2. Level 1 (Curtain Wall Glass Bay & Left Blue Portal)
  const level1Group = new THREE.Group();
  level1Group.name = 'Level_1_Academic_Hall';
  const l1Y = floorHeight;

  // Main glass curtain wall
  const glassBayGeo = new THREE.BoxGeometry(buildingWidth - 4, floorHeight, 0.3);
  const glassBay = new THREE.Mesh(glassBayGeo, mats.glass);
  glassBay.position.set(0, l1Y + floorHeight / 2, 0.8);
  level1Group.add(glassBay);

  // Interior structural columns visible through glass (from photo)
  [-9, -3, 3, 9].forEach((cx) => {
    const colGeo = new THREE.CylinderGeometry(0.35, 0.35, floorHeight, 16);
    const col = new THREE.Mesh(colGeo, mats.whiteWall);
    col.position.set(cx, l1Y + floorHeight / 2, -0.4);
    level1Group.add(col);
  });

  // Left prominent blue architectural portal hood (from photo)
  const leftHoodGeo = new THREE.BoxGeometry(10.5, floorHeight + 0.4, 2.8);
  const leftHood = new THREE.Mesh(leftHoodGeo, mats.uddBlue);
  leftHood.position.set(-9.2, l1Y + floorHeight / 2, 1.2);
  leftHood.castShadow = true;
  level1Group.add(leftHood);

  // Cutout aperture inside left blue hood for glass view
  const innerGlass = new THREE.Mesh(new THREE.BoxGeometry(9.2, floorHeight - 0.6, 0.2), mats.glass);
  innerGlass.position.set(-9.2, l1Y + floorHeight / 2, 2.4);
  level1Group.add(innerGlass);

  floorGroups.push(level1Group);
  root.add(level1Group);

  // 3. Level 2 (Upper Floor, Central Architectural Fins & Blue Panels)
  const level2Group = new THREE.Group();
  level2Group.name = 'Level_2_Emblem_And_Upper_Bay';
  const l2Y = floorHeight * 2;

  // Upper floor main wall
  const upperWallGeo = new THREE.BoxGeometry(buildingWidth - 2, floorHeight, buildingDepth * 0.8);
  const upperWall = new THREE.Mesh(upperWallGeo, mats.whiteWall);
  upperWall.position.set(0, l2Y + floorHeight / 2, -1);
  upperWall.castShadow = true;
  level2Group.add(upperWall);

  // Right-side offset cantilevered blue frame (from photo)
  const rightHoodGeo = new THREE.BoxGeometry(9.6, floorHeight * 0.9, 2.4);
  const rightHood = new THREE.Mesh(rightHoodGeo, mats.uddBlue);
  rightHood.position.set(7.5, l2Y + floorHeight * 0.45, 1.0);
  rightHood.castShadow = true;
  level2Group.add(rightHood);

  // Upper glass windows
  const upperGlassGeo = new THREE.BoxGeometry(buildingWidth - 6, floorHeight * 0.75, 0.2);
  const upperGlass = new THREE.Mesh(upperGlassGeo, mats.glass);
  upperGlass.position.set(0, l2Y + floorHeight * 0.5, 0.4);
  level2Group.add(upperGlass);

  // 4. Central Architectural Vertical Fins & Large Circular UDD Emblem
  const centerFinsGroup = new THREE.Group();
  centerFinsGroup.position.set(0, l2Y + floorHeight * 0.6, 1.4);

  // Vertical steel louvers/fins behind emblem
  for (let fx = -2.2; fx <= 2.2; fx += 0.4) {
    const finGeo = new THREE.BoxGeometry(0.08, 5.2, 0.6);
    const fin = new THREE.Mesh(finGeo, mats.metalSilver);
    fin.position.set(fx, 0, 0);
    centerFinsGroup.add(fin);
  }

  // Circular Universidad de Dagupan Emblem Disc
  const emblemMat = new THREE.MeshStandardMaterial({
    map: createEmblemTexture(),
    roughness: 0.2,
    metalness: 0.1,
  });
  const emblemGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.2, 32);
  const emblemMesh = new THREE.Mesh(emblemGeo, emblemMat);
  emblemMesh.rotation.x = Math.PI / 2;
  emblemMesh.position.set(0, 0.6, 0.4);
  emblemMesh.castShadow = true;
  centerFinsGroup.add(emblemMesh);

  level2Group.add(centerFinsGroup);
  floorGroups.push(level2Group);
  root.add(level2Group);

  // 4. Adjacent Right Wing (Chevron / Diagonal geometric paint pattern from photo)
  const rightWingGroup = new THREE.Group();
  rightWingGroup.name = 'Level_Right_Wing_Staircase';

  const wingGeo = new THREE.BoxGeometry(8, floorHeight * 2.8, 12);
  const wingMesh = new THREE.Mesh(wingGeo, mats.whiteWall);
  wingMesh.position.set(buildingWidth / 2 + 3.8, (floorHeight * 2.8) / 2, 0);
  wingMesh.castShadow = true;
  rightWingGroup.add(wingMesh);

  // Diagonal blue architectural cladding chevrons
  for (let cy = 2; cy <= 10; cy += 3.2) {
    const diagBandGeo = new THREE.BoxGeometry(8.2, 1.4, 0.2);
    const diagBand = new THREE.Mesh(diagBandGeo, mats.uddBlue);
    diagBand.position.set(buildingWidth / 2 + 3.8, cy, 6.1);
    diagBand.rotation.z = -0.22;
    rightWingGroup.add(diagBand);
  }

  floorGroups.push(rightWingGroup);
  root.add(rightWingGroup);

  return {
    root,
    floorGroups,
    defaultCameraPos: new THREE.Vector3(0, 14, 34),
    targetLookAt: new THREE.Vector3(0, 8, 2),
  };
}
