// ─── Faculty Locator Data Layer ───────────────────────────────────────────────
// Single source of truth for all faculty information, school metadata,
// availability status, and hierarchy relationships used across every view.

// ─── Types ────────────────────────────────────────────────────────────────────

export type FacultyStatus = 'available' | 'in-class' | 'on-leave';

export interface FacultyDaySchedule {
  office?: string;
  classSchedule?: string;
  consultation?: string;
}

export interface Faculty {
  id: string;
  name: string;
  photo?: string;
  school: string;
  position: string;
  /** Leadership / organizational tier label for tree display */
  roleCategory?: 'School Leadership' | 'Program Leadership' | 'Faculty Members';
  /** Hierarchy level (1 = School Leadership, 2 = Program Leadership, 3 = Faculty Members) */
  hierarchyLevel?: 1 | 2 | 3;
  /** Live status indicator: Green ('available'), Orange ('in-class'), Red ('on-leave') */
  status?: FacultyStatus;
  /** Optional short context for current status (e.g., room or consultation note) */
  statusNote?: string;
  program?: string;
  specialization?: string[];
  office?: {
    building?: string;
    room?: string;
  };
  schedule?: {
    [day: string]: FacultyDaySchedule;
  };
  email?: string;
  contactNumber?: string;
  supervisorId?: string | null;
  children?: string[];
}

export interface StatusMeta {
  key: FacultyStatus;
  label: string;
  shortLabel: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  pulseColor: string;
}

export const STATUS_META: Record<FacultyStatus, StatusMeta> = {
  'available': {
    key: 'available',
    label: 'Online / Available',
    shortLabel: 'Available',
    dotColor: '#16a34a',
    bgColor: '#dcfce7',
    textColor: '#15803d',
    borderColor: '#86efac',
    pulseColor: 'rgba(22, 163, 74, 0.35)',
  },
  'in-class': {
    key: 'in-class',
    label: 'In Class',
    shortLabel: 'In Class',
    dotColor: '#f97316',
    bgColor: '#ffedd5',
    textColor: '#c2410c',
    borderColor: '#fdba74',
    pulseColor: 'rgba(249, 115, 22, 0.3)',
  },
  'on-leave': {
    key: 'on-leave',
    label: 'On Leave / Absent',
    shortLabel: 'On Leave / Absent',
    dotColor: '#ef4444',
    bgColor: '#fee2e2',
    textColor: '#b91c1c',
    borderColor: '#fca5a5',
    pulseColor: 'rgba(239, 68, 68, 0.25)',
  },
};

export function getFacultyStatusMeta(status?: FacultyStatus): StatusMeta {
  return STATUS_META[status || 'available'];
}

export interface School {
  id: string;
  name: string;
  icon: string; // Material Symbols icon name
  description: string;
}

// ─── Schools ──────────────────────────────────────────────────────────────────

export const SCHOOLS: School[] = [
  { id: 'soe',   name: 'School of Engineering',                        icon: 'architecture',      description: 'View faculty members and organizational structure.' },
  { id: 'sit',   name: 'School of Information Technology',              icon: 'computer',          description: 'View faculty members and organizational structure.' },
  { id: 'ste',   name: 'School of Teacher Education',                  icon: 'menu_book',         description: 'View faculty members and organizational structure.' },
  { id: 'sba',   name: 'School of Business and Accountancy',           icon: 'account_balance',   description: 'View faculty members and organizational structure.' },
  { id: 'sihm',  name: 'School of International Hospitality Management', icon: 'restaurant',      description: 'View faculty members and organizational structure.' },
  { id: 'sh',    name: 'School of Humanities',                         icon: 'history_edu',       description: 'View faculty members and organizational structure.' },
  { id: 'shs',   name: 'School of Health and Sciences',                icon: 'medical_services',  description: 'View faculty members and organizational structure.' },
  { id: 'sc',    name: 'School of Criminology',                        icon: 'local_police',      description: 'View faculty members and organizational structure.' },
  { id: 'sps',   name: 'School of Professional Studies',               icon: 'work',              description: 'View faculty members and organizational structure.' },
];

// ─── Faculty Data (Authorized Consent List — 18 Members) ─────────────────────
// Hierarchy is expressed via supervisorId (points to the ID of the direct
// supervisor) and children (array of subordinate IDs).

export const FACULTY_DATA: Faculty[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // School of Engineering (Official 1st Semester S.Y. 2026–2027 Schedules)
  // ════════════════════════════════════════════════════════════════════════════

  // ── School Leadership (Dean) ──
  {
    id: 'soe-dean',
    name: 'Dr. Jose Jay De Vera',
    school: 'School of Engineering',
    position: 'Dean',
    roleCategory: 'School Leadership',
    hierarchyLevel: 1,
    status: 'available',
    statusNote: 'Available at Dean\'s Office · Consultation Open',
    program: 'Civil & Computer Engineering',
    office: { building: 'Engineering Building', room: 'Dean\'s Office (Room E-101)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 9:00 AM · In Class', consultation: '9:30 AM – 11:30 AM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class', consultation: '2:00 PM – 4:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '11:00 AM – 5:00 PM · In Class', consultation: '8:30 AM – 10:30 AM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 12:00 PM · In Class', consultation: '2:00 PM – 4:00 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM (Dean\'s Office & Thesis Consultation)' },
    },
    email: 'jj.devera@udd.edu.ph',
    contactNumber: '(075) 522-8295 loc. 201',
    supervisorId: null,
    children: ['soe-program-head'],
  },

  // ── Program Leadership (Program Head) ──
  {
    id: 'soe-program-head',
    name: 'Engr. Roderick Cabaña',
    school: 'School of Engineering',
    position: 'Program Head',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'available',
    statusNote: 'Available at Program Head\'s Office · Advising Open',
    program: 'Electronics & Electrical Engineering',
    office: { building: 'Engineering Building', room: 'Faculty & Program Office (Room E-102)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM · Program Advising' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM · Program Advising' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM · Program Advising' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '2:00 PM – 5:00 PM · In Class', consultation: '9:00 AM – 12:00 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
    },
    email: 'r.cabana@udd.edu.ph',
    contactNumber: '(075) 522-8295 loc. 202',
    supervisorId: 'soe-dean',
    children: [
      'soe-f1',
      'soe-f2',
      'soe-f3',
      'soe-f4',
      'soe-f5',
      'soe-f6',
      'soe-f7',
      'soe-f8',
      'soe-f9',
      'soe-f10',
      'soe-f11',
      'soe-f12',
      'soe-f13',
      'soe-f14',
      'soe-f15',
      'soe-f16',
    ],
  },

  // ── Faculty Members ──
  {
    id: 'soe-f1',
    name: 'Engr. Romulo Roel Pinlac',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available at Engineering Faculty Room',
    program: 'Electronics & Civil Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-201)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class', consultation: '1:00 PM – 3:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '8:30 AM – 10:30 AM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM' },
    },
    email: 'rr.pinlac@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f2',
    name: 'Engr. Ronald Allan Bandong',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    statusNote: 'In Class',
    program: 'Civil, Electrical, Electronics & Computer Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-201)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '10:00 AM – 11:00 AM · In Class', consultation: '1:00 PM – 3:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '2:00 PM – 5:00 PM · In Class', consultation: '9:00 AM – 11:30 AM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 3:00 PM – 5:00 PM · In Class', consultation: '10:00 AM – 11:00 AM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 12:00 PM · In Class | 3:00 PM – 4:00 PM · In Class', consultation: '1:00 PM – 3:00 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM (Research & Thesis Advising)' },
    },
    email: 'ra.bandong@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f3',
    name: 'Engr. Jonathan Lim',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available for Student Consultation',
    program: 'Electronics & Computer Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-201)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '8:00 AM – 12:00 PM (Vacant / Consultation)' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:00 PM – 5:00 PM (Vacant / Consultation)' },
    },
    email: 'j.lim@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f4',
    name: 'Engr. Jin Benir Macaranas',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    statusNote: 'In Class',
    program: 'Electrical & Electronics Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-202)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
    },
    email: 'jb.macaranas@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f5',
    name: 'Engr. Raquel Almendares',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available at Faculty Office',
    program: 'Civil Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-202)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 3:00 PM – 5:00 PM · In Class', consultation: '2:00 PM – 3:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 10:00 AM – 12:00 PM · In Class', consultation: '1:30 PM – 4:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '8:00 AM – 5:00 PM (Vacant / Consultation)' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:00 PM – 5:00 PM (Vacant / Consultation)' },
    },
    email: 'r.almendares@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f6',
    name: 'Engr. Ezekiel Año',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    statusNote: 'In Class',
    program: 'Civil Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-202)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 4:00 PM · In Class', consultation: '4:00 PM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 1:00 PM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '1:00 PM – 2:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:00 PM – 4:30 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class', consultation: '1:00 PM – 4:00 PM' },
    },
    email: 'e.ano@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f7',
    name: 'Engr. Charmaine Rose Seda',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available for Consultation',
    program: 'Civil & Electrical Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-202)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 3:00 PM – 5:00 PM · In Class', consultation: '2:00 PM – 3:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '11:00 AM – 1:30 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 12:00 PM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
    },
    email: 'cr.seda@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f8',
    name: 'Engr. Renz Marc Valdez',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    statusNote: 'In Class',
    program: 'Electrical & Civil Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-203)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 3:00 PM – 5:00 PM · In Class', consultation: '2:00 PM – 3:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class', consultation: '1:00 PM – 4:00 PM' },
    },
    email: 'rm.valdez@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f9',
    name: 'Engr. Djhoana Lou Salve Tigno',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available at Engineering Faculty Room',
    program: 'Computer Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-203)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
    },
    email: 'dls.tigno@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f10',
    name: 'Engr. Jeric Manuel',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    statusNote: 'In Class',
    program: 'Electronics & Communications Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-203)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '8:30 AM – 10:30 AM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class', consultation: '1:00 PM – 4:00 PM' },
    },
    email: 'j.manuel@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f11',
    name: 'Engr. John Misa',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available for Advising & Chemistry Lab Consultation',
    program: 'General Engineering & Chemical Sciences',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-203)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '11:00 AM – 1:30 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '11:00 AM – 1:30 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM' },
    },
    email: 'jv.misa@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f12',
    name: 'Engr. Sean Gabriel Macapagal',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available · Thesis & Project Consultation Open',
    program: 'Computer Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-204)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '11:00 AM – 1:30 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '9:00 AM – 10:00 AM · In Class', consultation: '10:30 AM – 12:00 PM · 2:00 PM – 4:00 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class', consultation: '1:00 PM – 4:00 PM' },
    },
    email: 'sg.macapagal@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f13',
    name: 'Engr. Bryan Jumer Resuello',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    statusNote: 'In Class',
    program: 'Electrical Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-204)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '11:00 AM – 1:00 PM · In Class | 2:00 PM – 4:00 PM · In Class', consultation: '8:30 AM – 10:30 AM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 4:00 PM · In Class', consultation: '4:00 PM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 12:00 PM' },
    },
    email: 'bj.resuello@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f14',
    name: 'Engr. Rica Fe Orias',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available · Steel Design & Structural Consultation',
    program: 'Civil Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-204)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 1:00 PM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '1:00 PM – 2:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 12:00 PM · In Class | 12:00 PM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class', consultation: '1:00 PM – 4:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '10:00 AM – 11:00 AM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
    },
    email: 'rf.orias@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f15',
    name: 'Ar. Zerah Grace E. Resuello',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available at Design Studio / Faculty Office',
    program: 'Civil & Architectural Engineering',
    office: { building: 'Engineering Building', room: 'Architecture & Design Studio (E-205)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
    },
    email: 'zg.resuello@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
  {
    id: 'soe-f16',
    name: 'Engr. Jericho Balolong',
    school: 'School of Engineering',
    position: 'Faculty Member',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    statusNote: 'Available at Engineering Faculty Room',
    program: 'Electronics & Electrical Engineering',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-204)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '10:00 AM – 12:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '10:00 AM – 11:00 AM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · In Class | 11:00 AM – 2:00 PM · In Class | 2:00 PM – 5:00 PM · In Class', consultation: '10:00 AM – 11:00 AM' },
      'Friday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM · In Class | 11:00 AM – 2:00 PM · In Class', consultation: '2:30 PM – 4:30 PM' },
    },
    email: 'j.balolong@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },
];

// ─── Helper Functions (Real-Time Schedule-Driven Availability) ───────────────

interface TimeInterval {
  startMinutes: number;
  endMinutes: number;
  startLabel: string;
  endLabel: string;
  rangeLabel: string;
}

function parseClockToMinutes(clockStr: string): number | null {
  const m = clockStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hours = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const period = m[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function extractTimeIntervals(scheduleText?: string): TimeInterval[] {
  if (!scheduleText) return [];
  const intervals: TimeInterval[] = [];
  const regex = /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(scheduleText)) !== null) {
    const startLabel = match[1].trim();
    const endLabel = match[2].trim();
    const startMinutes = parseClockToMinutes(startLabel);
    const endMinutes = parseClockToMinutes(endLabel);
    if (startMinutes !== null && endMinutes !== null) {
      intervals.push({
        startMinutes,
        endMinutes,
        startLabel,
        endLabel,
        rangeLabel: `${startLabel} – ${endLabel}`,
      });
    }
  }
  return intervals;
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Dynamically computes a faculty member's live availability (`status` and `statusNote`)
 * based on the current day and time compared against their `schedule`.
 */
export function resolveFacultyLiveStatus(faculty: Faculty, now: Date = new Date()): Faculty {
  // Preserve explicit on-leave status (e.g., 0-unit load / special assignment / official leave)
  if (faculty.status === 'on-leave') {
    return faculty;
  }

  if (!faculty.schedule) {
    return faculty;
  }

  const dayName = WEEKDAY_NAMES[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const daySchedule = faculty.schedule[dayName];

  if (!daySchedule) {
    // Weekend (Saturday / Sunday) or unscheduled day
    return {
      ...faculty,
      status: 'available',
      statusNote: 'No Scheduled Classes Today',
    };
  }

  if (daySchedule.office && /on leave/i.test(daySchedule.office)) {
    return {
      ...faculty,
      status: 'on-leave',
      statusNote: daySchedule.office,
    };
  }

  // 1. Check if currently in any scheduled class block today
  const classIntervals = extractTimeIntervals(daySchedule.classSchedule);
  const activeClass = classIntervals.find(
    (interval) => currentMinutes >= interval.startMinutes && currentMinutes < interval.endMinutes,
  );

  if (activeClass) {
    return {
      ...faculty,
      status: 'in-class',
      statusNote: `In Class (${activeClass.rangeLabel})`,
    };
  }

  // 2. Check if currently in consultation hours today
  const consultIntervals = extractTimeIntervals(daySchedule.consultation);
  const activeConsult = consultIntervals.find(
    (interval) => currentMinutes >= interval.startMinutes && currentMinutes < interval.endMinutes,
  );

  if (activeConsult) {
    return {
      ...faculty,
      status: 'available',
      statusNote: `Available for Consultation (${activeConsult.rangeLabel})`,
    };
  }

  // 3. Check if there is an upcoming class later today
  const upcomingClass = classIntervals.find((interval) => interval.startMinutes > currentMinutes);
  if (upcomingClass) {
    return {
      ...faculty,
      status: 'available',
      statusNote: `Available · Next Class at ${upcomingClass.startLabel}`,
    };
  }

  // 4. Otherwise available with no more classes today
  return {
    ...faculty,
    status: 'available',
    statusNote: 'Available · No Ongoing Class',
  };
}

/** Get all faculty members with real-time schedule-driven status */
export function getLiveFacultyData(now: Date = new Date()): Faculty[] {
  return FACULTY_DATA.map((f) => resolveFacultyLiveStatus(f, now));
}

/** Get all faculty members belonging to a specific school */
export function getFacultyBySchool(schoolName: string): Faculty[] {
  const now = new Date();
  return FACULTY_DATA.filter(f => f.school === schoolName).map(f => resolveFacultyLiveStatus(f, now));
}

/** Get a single faculty member by ID */
export function getFacultyById(id: string): Faculty | undefined {
  const found = FACULTY_DATA.find(f => f.id === id);
  return found ? resolveFacultyLiveStatus(found, new Date()) : undefined;
}

/** Get the computed faculty count for each school */
export function getSchoolFacultyCount(schoolName: string): number {
  return FACULTY_DATA.filter(f => f.school === schoolName).length;
}

/** Get the dean (top-level supervisor) of a school */
export function getSchoolDean(schoolName: string): Faculty | undefined {
  const found = FACULTY_DATA.find(f => f.school === schoolName && f.supervisorId === null);
  return found ? resolveFacultyLiveStatus(found, new Date()) : undefined;
}

/**
 * Build the hierarchy tree for a school.
 * Returns the dean node with nested children resolved from the flat array
 * (via explicit `children` IDs or `supervisorId` references).
 */
export interface FacultyNode {
  faculty: Faculty;
  children: FacultyNode[];
}

export function getSchoolHierarchy(schoolName: string): FacultyNode | null {
  const schoolFaculty = getFacultyBySchool(schoolName);
  const dean = schoolFaculty.find(f => f.supervisorId === null);
  if (!dean) return null;

  const visited = new Set<string>();

  function buildNode(facultyMember: Faculty): FacultyNode {
    visited.add(facultyMember.id);
    const explicitChildIds = facultyMember.children || [];
    const implicitChildren = schoolFaculty
      .filter(f => f.supervisorId === facultyMember.id && !explicitChildIds.includes(f.id))
      .map(f => f.id);
    const allChildIds = [...explicitChildIds, ...implicitChildren];

    const childNodes = allChildIds
      .map(id => schoolFaculty.find(f => f.id === id))
      .filter((f): f is Faculty => f !== undefined && !visited.has(f.id))
      .map(child => buildNode(child));

    return { faculty: facultyMember, children: childNodes };
  }

  return buildNode(dean);
}

/** Search faculty across all fields */
export function searchFaculty(query: string): Faculty[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const liveData = getLiveFacultyData();
  return liveData.filter(f => {
    const statusLabel = getFacultyStatusMeta(f.status).label.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.position.toLowerCase().includes(q) ||
      statusLabel.includes(q) ||
      (f.roleCategory?.toLowerCase().includes(q)) ||
      f.school.toLowerCase().includes(q) ||
      (f.program?.toLowerCase().includes(q)) ||
      (f.specialization?.some(s => s.toLowerCase().includes(q))) ||
      (f.email?.toLowerCase().includes(q))
    );
  });
}

/** Get faculty initials (for avatar fallback) */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(part => !['Dr.', 'Engr.', 'Prof.', 'Arch.', 'Ar.', 'Mr.', 'Ms.', 'Mrs.', 'CPA', 'Chef', 'Atty.'].includes(part))
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
