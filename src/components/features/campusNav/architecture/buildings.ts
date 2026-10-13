// ─────────────────────────────────────────────────────────────────────────────
// buildings.ts – Centralized, typed records for the Campus Architecture Showcase
//
// Each building keeps its own reference photo, copy, camera poses and (future)
// 3D model path. Reference photos are PHOTOGRAPHS, not 3D models. `modelPath`
// stays null until a verified GLB/glTF of the building exists; features that
// require real geometry (exploded view, floor selection) are disabled while it
// is null.
// ─────────────────────────────────────────────────────────────────────────────

export type CampusBuildingId = 'udd-main-tower' | 'udd-main-front' | 'udd-fame';

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
  main: ['udd-main-tower', 'udd-main-front'],
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
