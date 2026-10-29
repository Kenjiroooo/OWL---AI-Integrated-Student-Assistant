// ─────────────────────────────────────────────────────────────────────────────
// buildings.ts – Centralized, typed records for the Campus Architecture Showcase
//
// Each building keeps its own reference photo, copy, camera poses and (future)
// 3D model path. Reference photos are PHOTOGRAPHS, not 3D models. `modelPath`
// stays null until a verified GLB/glTF of the building exists; features that
// require real geometry (exploded view, floor selection) are disabled while it
// is null.
// ─────────────────────────────────────────────────────────────────────────────

export type CampusBuildingId =
  | 'udd-main'
  | 'udd-main-tower'
  | 'udd-main-admin'
  | 'udd-main-v'
  | 'udd-main-front'
  | 'udd-fame';

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
      'The unified campus complex of Universidad de Dagupan: featuring the 6-storey academic block with perforated mesh chevron facade, the iconic Main Tower facade with horizontal blue floor bands, balconies and vertical "UDD" sign, circular university seal, modern chapel with monumental cross, grand entrance portal, outdoor collegiate basketball court, the Student Services Hall, the 2-storey Innovation & Research Wing, the 4th floor garden terrace hallway portal, the 2nd and 3rd floor multi-level open-air pedestrian skybridges connecting the Main Tower 2F and 3F outdoor balconies directly to the 5-Storey Building 2F and 3F corridor south entrance portals (featuring straight 1.5m-wide balcony extensions along Z = -23.25 from X = 2.0 to 19.5, transitioning into streamlined turning ramps that connect directly into the corridors through open walk-through portals between corner column P4 [23.0, -30.5] and classroom wall [25.13, -31.04] with walls removed for seamless walk-through pedestrian access), and the 5-Storey Courtyard Building constructed to the exact 9-point pinpointed boundary (734.2m² footprint), featuring signature blue zigzag balcony spandrels, multi-storey corner clear glass atrium tower, 5F louvered academic hall with UDD crest seal, flat solar panel roof decks, and 12-meter telecommunications lattice antenna tower.',
    visibleFeatures: [
      'Perforated mesh facade with chevron arrows',
      'Main Tower facade with blue floor bands & balconies',
      'Vertical tower core with "UDD" sign',
      'Classroom balconies with AC condenser units',
      '2nd & 3rd floor multi-level open-air pedestrian skybridges connecting Main Tower balconies to 5-Storey Building corridor south portals (streamlined bridge shape, walls removed for open walk-through)',
      'Panoramic glass balustrades with silver handrails & royal blue fascia beams on footbridges',
      'Seamless streamlined turning ramps connecting open-air skybridges into corridors with panoramic tinted glass balustrades',
      'Ground-level reinforced concrete support piers & vertical structural tier columns between bridge levels with royal blue collars',
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
    name: 'L Building (Tower Building)',
    shortName: 'L Building',
    campus: 'Main Campus • Dagupan City',
    description:
      'The iconic L Building (Tower Building) of Universidad de Dagupan Main Campus, featuring the vertical UDD lettered signage tower, covered entrance canopy, multi-pane classroom ribbon windows, and direct connecting skybridge access to the V Building.',
    visibleFeatures: [
      'Tower with vertical "UDD" lettering',
      'Covered entrance canopy with arched steel trusses',
      'Horizontal blue floor bands & classroom balconies',
      'Multi-pane square grid windows & AC condenser units',
      'Direct connecting skybridge footbridges to V Building',
      'Notice boards & flag pole terrace',
    ],
    referenceImage: '/campus-buildings/udd-main-tower.JPG',
    referenceImageAlt:
      'Photograph of the L Building (Tower Building) at UDD Main Campus: a tall white building with blue horizontal floor bands and a tower bearing vertical UDD lettering.',
    modelPath: 'procedural-3d',
    floors: [
      { level: 0, label: 'Ground Concourse, Entrance Canopy & Flagpole Terrace' },
      { level: 1, label: '2nd Floor Lecture Rooms & Skybridge Portal' },
      { level: 2, label: '3rd Floor Academic Laboratories & Skybridge Portal' },
      { level: 3, label: '4th Floor Classrooms & Balconies' },
      { level: 4, label: '5th Floor Senior Department & AC Ledges' },
      { level: 5, label: 'Main Tower Rooftop & Vertical UDD Signage Core' },
    ],
    defaultPose: { scale: 1.06, x: 0, y: 2, rotateX: 0, rotateY: 0 },
    establishingPose: { scale: 0.62, x: 0, y: 10, rotateX: 14, rotateY: 0 },
    orbitPose: { scale: 1.0, x: -5, y: 3, rotateX: 4, rotateY: 14 },
    theme: { skyTop: '#0b1f3f', skyBottom: '#1e4b8f', accent: '#60a5fa' },
  },
  {
    id: 'udd-main-admin',
    name: 'Administration Building',
    shortName: 'Admin Building',
    campus: 'Main Campus • Dagupan City',
    description:
      'The Student Services & Administration Building, featuring the 2-storey administrative hall, executive office suites, vertical architectural louvers with Universidad de Dagupan seal, and the modern 2-Storey Innovation & Research Wing.',
    visibleFeatures: [
      'Administrative & Student Services Hall',
      '2-storey blue portal box & executive offices',
      'Vertical architectural louvers with UDD crest',
      '2-Storey Innovation & Research Wing on terrace',
      'Covered entrance colonnade facing courtyard concourse',
      'Rooftop solar pergola & HVAC chillers',
    ],
    referenceImage: '/campus-buildings/udd-main-front.JPG',
    referenceImageAlt:
      'Photograph of the Administration Building at UDD Main Campus: a blue-and-white facade with the Universidad de Dagupan emblem, large glass windows and covered entrance.',
    modelPath: 'procedural-3d',
    floors: [
      { level: 0, label: 'Ground Floor Administrative Hall & Covered Colonnade' },
      { level: 1, label: '2nd Floor Student Services, Registrar & Accounting' },
      { level: 2, label: '3rd Floor Executive Suites & University Boardroom' },
      { level: 3, label: '4th Floor Innovation Wing 1F & Garden Promenade' },
      { level: 4, label: '5th Floor Innovation Research Lab & Balcony' },
      { level: 5, label: 'Rooftop Solar Pergola & Mechanical Plant' },
    ],
    defaultPose: { scale: 1.14, x: 0, y: 6, rotateX: 0, rotateY: 0 },
    establishingPose: { scale: 0.62, x: 0, y: 10, rotateX: 14, rotateY: 0 },
    orbitPose: { scale: 1.02, x: 5, y: 4, rotateX: 4, rotateY: -14 },
    theme: { skyTop: '#0a2540', skyBottom: '#0e5a8a', accent: '#38bdf8' },
  },
  {
    id: 'udd-main-v',
    name: 'V Building (5-Storey Building)',
    shortName: 'V Building',
    campus: 'Main Campus • Dagupan City',
    description:
      'The 5-Storey Courtyard V Building, constructed to the exact 9-point pinpointed boundary, featuring signature blue zigzag balcony spandrels, multi-storey corner clear glass atrium tower, 5F louvered academic hall with UDD crest seal, solar panel roof decks, and 12-meter telecommunications lattice antenna tower.',
    visibleFeatures: [
      '5-Storey building with exact 9-point boundary (734.2m² footprint)',
      'Signature sky-blue zigzag balcony spandrels',
      'Multi-storey corner clear glass atrium tower',
      '45° angled Universidad de Dagupan crest seal',
      '2nd & 3rd floor open-air pedestrian skybridges to L Building',
      'Flat roof decks with solar arrays & 12m lattice tower',
    ],
    referenceImage: '/campus-buildings/udd-main.jpg',
    referenceImageAlt:
      'Photograph of the V Building (5-Storey Building) at UDD Main Campus: courtyard facade with blue zigzag spandrels and corner glass atrium.',
    modelPath: 'procedural-3d',
    floors: [
      { level: 0, label: 'Ground Concourse, Parking Row & Structural Piers' },
      { level: 1, label: '2nd Floor Lecture Rooms & Skybridge Portal' },
      { level: 2, label: '3rd Floor Academic Labs & Skybridge Portal' },
      { level: 3, label: '4th Floor Open Corridors & Zigzag Balconies' },
      { level: 4, label: '5th Floor Ribbon Louvers & UDD Crest Seal' },
      { level: 5, label: 'Rooftop Solar Arrays & 12m Telecommunications Tower' },
    ],
    defaultPose: { scale: 1.05, x: 0, y: 2, rotateX: 0, rotateY: 0 },
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
  main: ['udd-main-tower', 'udd-main-admin', 'udd-main-v'],
  fame: ['udd-fame'],
} as const satisfies Record<string, readonly CampusBuildingId[]>;

export type CampusGroupId = keyof typeof CAMPUS_GROUPS;

export function getCampusBuildings(group: CampusGroupId): CampusBuilding[] {
  return CAMPUS_GROUPS[group].map((id) => getBuilding(id));
}

export const DEFAULT_BUILDING_ID: CampusBuildingId = 'udd-main-tower';

export function getBuilding(id: CampusBuildingId): CampusBuilding {
  const b = CAMPUS_BUILDINGS.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown campus building: ${id}`);
  return b;
}

export function hasVerifiedModel(b: CampusBuilding): boolean {
  return Boolean(b.modelPath);
}
