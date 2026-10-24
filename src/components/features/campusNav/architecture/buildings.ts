// ─────────────────────────────────────────────────────────────────────────────
// buildings.ts – Centralized, typed records for the Campus Architecture Showcase
//
// Each building keeps its own reference photo, copy, camera poses and (future)
// 3D model path. Reference photos are PHOTOGRAPHS, not 3D models. `modelPath`
// stays null until a verified GLB/glTF of the building exists; features that
// require real geometry (exploded view, floor selection) are disabled while it
// is null.
// ─────────────────────────────────────────────────────────────────────────────

export type CampusBuildingId = 'udd-main' | 'udd-main-tower' | 'udd-main-front' | 'udd-fame';

/** Virtual "camera" pose applied to the photo panel (percent / degrees). */
export interface CameraPose {
  scale: number;
  /** Horizontal offset in % of the panel width. */
  x: number;
  /** Vertical offset in % of the panel height. */
  y: number;
  rotateX: number;
  rotateY: number;
}

export interface FloorMetadata {
  level: number;
  label: string;
}

export interface CampusBuilding {
  id: CampusBuildingId;
  name: string;
  shortName: string;
  campus: string;
  description: string;
  /** Visual features observable in the reference photograph only. */
  visibleFeatures: string[];
  /** Path served from /public. Loaded only when the showcase is open. */
  referenceImage: string;
  referenceImageAlt: string;
  /** Verified GLB/glTF model. null = photo-only mode. */
  modelPath: string | null;
  /** Only populated when reliable floor data exists for the model. */
  floors: FloorMetadata[] | null;
  /** Resting camera pose after the intro / transition settles. */
  defaultPose: CameraPose;
  /** Wide, slightly elevated pose used at the start of the intro. */
  establishingPose: CameraPose;
  /** Three-quarter "orbit" pose swept through during the intro. */
  orbitPose: CameraPose;
  theme: {
    /** Scene background gradient stops. */
    skyTop: string;
    skyBottom: string;
    accent: string;
  };
}

export const CAMPUS_BUILDINGS: readonly CampusBuilding[] = [
  {
    id: 'udd-main',
    name: 'UDD Main Campus',
    shortName: 'Main Campus',
    campus: 'Main Campus • Dagupan City',
    description:
      'The unified campus complex of Universidad de Dagupan: featuring the 6-storey academic block with perforated mesh chevron facade, the iconic Main Tower facade with horizontal blue floor bands, balconies and vertical "UDD" sign, circular university seal, modern chapel with monumental cross, grand entrance portal, outdoor collegiate basketball court, the Student Services Hall, the 2-storey Innovation & Research Wing, the 4th floor garden terrace hallway portal, the 2nd-floor open-air pedestrian skybridge connecting the Main Tower 2F outdoor balcony directly to the 5-Storey Building 2F front outdoor balcony (featuring a straight 1.5m-wide balcony extension along Z = -23.25 from X = 2.0 to 20.5, smoothly transitioning into the chamfered turning bridge deck with panoramic tinted glass balustrades and observation elbow terrace, connecting flush and directly into the 5-Storey Building 2F front outdoor zigzag balcony between columns at [22.41, -32.8] and [22.82, -31.2]), and the 5-Storey Courtyard Building constructed to the exact 9-point pinpointed boundary (734.2m² footprint), featuring signature blue zigzag balcony spandrels, multi-storey corner clear glass atrium tower, 5F louvered academic hall with UDD crest seal, flat solar panel roof decks, and 12-meter telecommunications lattice antenna tower.',
    visibleFeatures: [
      'Perforated mesh facade with chevron arrows',
      'Main Tower facade with blue floor bands & balconies',
      'Vertical tower core with "UDD" sign',
      'Classroom balconies with AC condenser units',
      '2nd-floor open-air pedestrian skybridge connecting Main Tower balcony to 5-Storey Building 2F front balcony (smooth chamfered turn connected flush into 2F front balcony)',
      'Panoramic glass balustrades with silver handrails & royal blue fascia beams on footbridge',
      'Open-air observation elbow terrace at Point 2 with courtyard viewing deck & student resting benches',
      'Ground-level reinforced concrete support piers with royal blue capital collars',
      'Circular Universidad de Dagupan seal',
      'Modern A-frame chapel with monumental cross',
      'Collegiate outdoor basketball court',
      '5-Storey building with exact 9-point boundary (734.2m² footprint)',
      'Flat roof decks with monocrystalline solar arrays & perimeter parapet',
      'Multi-storey corner clear glass atrium tower with silver grid',
      'White facade with signature blue zigzag balcony spandrels',
      'Blue corridor soffits & corbel brackets on every floor',
      '5th floor louvered window bays with blue sill band',
      '45° angled Universidad de Dagupan crest seal at inner corner',
      '12-meter rooftop telecommunications lattice tower with beacon',
      'Student Services Hall with 2-storey blue portal box',
      'Vertical architectural louvers with CDD/UDD seal',
      'Rooftop garden terrace with "UNIVERSIDAD DE DAGUPAN" signage',
      '2-Storey Innovation & Research Wing on terrace',
      'Observation viewing balcony & panoramic glazing',
      'Rooftop solar pergola & dual HVAC chillers',
      'Grand blue entrance portal with "UNIVERSIDAD DE DAGUPAN" header beam & arched truss',
      'Covered pedestrian people path on left with security turnstiles, guard checkpoint, "NO I.D. NO ENTRY" pillar sign & "ENTRANCE ➔" guide barrier',
      'Arched-top dark blue steel security gate moved to right side with vertical pickets & lock box',
      'White perimeter wall on right with giant 3D royal blue "UDD" block letters & overflowing tropical landscaping',
      'Inner courtyard driveway motorcycle parking row with stall markings',
      'North & East courtyard wings framing basketball court',
      'Roadside digital billboard & rooftop signage',
    ],
    referenceImage: '/campus-buildings/udd-main.jpg',
    referenceImageAlt:
      'Architectural rendering of the unified UDD Main Campus: perforated mesh facade with chevron motifs, main tower facade with blue floor bands, top seal, A-frame chapel with cross, entrance portal, basketball court, student services building with 2-storey innovation wing, and 5-storey courtyard building with exact 9-point boundary, solar roof decks, and telecommunications tower.',
    modelPath: 'procedural-3d',
    floors: [
      { level: 0, label: 'Ground Concourse, Chapel, Basketball Court, Courtyard Parking & Colonnade' },
      { level: 1, label: '2nd Floor Lecture Rooms, Connecting Skybridge Footbridge, Student Services 2F & Courtyard Open Corridor 2F' },
      { level: 2, label: '3rd Floor Academic Labs, University Seal & Courtyard Open Corridor 3F' },
      { level: 3, label: '4th Floor Classrooms, Innovation Wing 1F & Courtyard Open Corridor 4F' },
      { level: 4, label: '5th Floor Senior Dept, Innovation Balcony & Courtyard 5F Ribbon Glass with Crest Seal' },
      { level: 5, label: 'Main Tower Penthouse, Rooftop Solar Pavilion & 12m Telecommunications Lattice Tower' },
    ],
    defaultPose: { scale: 1.05, x: 0, y: 2, rotateX: 0, rotateY: 0 },
    establishingPose: { scale: 0.62, x: 0, y: 10, rotateX: 14, rotateY: 0 },
    orbitPose: { scale: 1.0, x: -5, y: 3, rotateX: 4, rotateY: 14 },
    theme: { skyTop: '#0b1f3f', skyBottom: '#1e4b8f', accent: '#60a5fa' },
  },
  {
    id: 'udd-main-tower',
    name: 'UDD Main Campus Tower',
    shortName: 'Main Tower',
    campus: 'Main Campus • Dagupan City',
    description:
      'The tall white building of the Universidad de Dagupan Main Campus, recognizable by its blue horizontal floor bands, balconies, and the vertical UDD lettering on its tower.',
    visibleFeatures: [
      'White facade with blue floor bands',
      'Balconies and window rows',
      'Tower with vertical "UDD" lettering',
      'Covered entrance canopy',
    ],
    referenceImage: '/campus-buildings/udd-main-tower.JPG',
    referenceImageAlt:
      'Photograph of the UDD Main Campus Tower: a tall white building with blue horizontal floor bands and a tower bearing vertical UDD lettering.',
    modelPath: 'procedural-3d',
    floors: [
      { level: 0, label: 'Ground Concourse & Entrance Canopy' },
      { level: 1, label: '2nd Floor Lecture Rooms' },
      { level: 2, label: '3rd Floor Academic Laboratories' },
      { level: 3, label: '4th Floor Classrooms & Balcony' },
      { level: 4, label: '5th Floor Senior Department' },
      { level: 5, label: 'UDD Tower & Roof Core' },
    ],
    defaultPose: { scale: 1.06, x: 0, y: 2, rotateX: 0, rotateY: 0 },
    establishingPose: { scale: 0.62, x: 0, y: 10, rotateX: 14, rotateY: 0 },
    orbitPose: { scale: 1.0, x: -5, y: 3, rotateX: 4, rotateY: 14 },
    theme: { skyTop: '#0b1f3f', skyBottom: '#1e4b8f', accent: '#60a5fa' },
  },
  {
    id: 'udd-main-front',
    name: 'UDD Main Campus Front Building',
    shortName: 'Front Building',
    campus: 'Main Campus • Dagupan City',
    description:
      'The blue-and-white front building of the Main Campus, featuring the Universidad de Dagupan emblem at its center, large glass windows, and a covered ground-level entrance.',
    visibleFeatures: [
      'Blue facade panels',
      'Central Universidad de Dagupan emblem',
      'Large glass window bays',
      'Covered ground-level entrance',
    ],
    referenceImage: '/campus-buildings/udd-main-front.JPG',
    referenceImageAlt:
      'Photograph of the UDD Main Campus Front Building: a blue-and-white facade with the Universidad de Dagupan emblem, large glass windows and a covered entrance.',
    modelPath: 'procedural-3d',
    floors: [
      { level: 0, label: 'Courtyard & Covered Entrance Colonnade' },
      { level: 1, label: 'Level 2 Glass Gallery & Academic Hall' },
      { level: 2, label: 'Level 3 Central Emblem & Upper Bay' },
      { level: 3, label: 'Right Wing Staircase & Chevron Cladding' },
    ],
    // Pushed in and shifted down slightly so the emblem sits near frame center.
    defaultPose: { scale: 1.14, x: 0, y: 6, rotateX: 0, rotateY: 0 },
    establishingPose: { scale: 0.62, x: 0, y: 10, rotateX: 14, rotateY: 0 },
    orbitPose: { scale: 1.02, x: 5, y: 4, rotateX: 4, rotateY: -14 },
    theme: { skyTop: '#0a2540', skyBottom: '#0e5a8a', accent: '#38bdf8' },
  },
  {
    id: 'udd-fame',
    name: 'UDD FAME Building',
    shortName: 'FAME Building',
    campus: 'FAME Building Campus • Dagupan City',
    description:
      'The FAME Building of Universidad de Dagupan, recognizable by its perforated silver mesh facade with blue arrow motifs, the cantilevered top box bearing a large blue diamond, and the beige stair block carrying the university seal.',
    visibleFeatures: [
      'Perforated silver mesh facade',
      'Blue arrow / wedge motifs',
      'Cantilevered top box with blue diamond',
      'University seal on beige stair block',
      'Covered entrance with blue-railed stairs',
    ],
    referenceImage: '/campus-buildings/fame%20building.png',
    referenceImageAlt:
      'Photograph of the UDD FAME Building: a silver mesh-clad building with blue arrow motifs, a cantilevered top box with a blue diamond, a beige block with the university seal and a covered entrance.',
    modelPath: 'procedural-3d',
    floors: [
      { level: 0, label: 'Ground Floor, Entrance Canopy & Stairs' },
      { level: 1, label: '2nd Floor Classrooms' },
      { level: 2, label: '3rd Floor & University Seal' },
      { level: 3, label: '4th Floor Classrooms' },
      { level: 4, label: '5th Floor Cantilevered Top Box' },
    ],
    defaultPose: { scale: 1.06, x: 0, y: 3, rotateX: 0, rotateY: 0 },
    establishingPose: { scale: 0.62, x: 0, y: 10, rotateX: 14, rotateY: 0 },
    orbitPose: { scale: 1.0, x: -5, y: 3, rotateX: 4, rotateY: 14 },
    theme: { skyTop: '#0b1f3f', skyBottom: '#3b6ea8', accent: '#60a5fa' },
  },
] as const;

/** Buildings grouped per campus showcase. */
export const CAMPUS_GROUPS = {
  main: ['udd-main'],
  fame: ['udd-fame'],
} as const satisfies Record<string, readonly CampusBuildingId[]>;

export type CampusGroupId = keyof typeof CAMPUS_GROUPS;

export function getCampusBuildings(group: CampusGroupId): CampusBuilding[] {
  return CAMPUS_GROUPS[group].map((id) => getBuilding(id));
}

export const DEFAULT_BUILDING_ID: CampusBuildingId = 'udd-main';

export function getBuilding(id: CampusBuildingId): CampusBuilding {
  const b = CAMPUS_BUILDINGS.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown campus building: ${id}`);
  return b;
}

export function hasVerifiedModel(b: CampusBuilding): boolean {
  return Boolean(b.modelPath);
}
