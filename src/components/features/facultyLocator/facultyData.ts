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
  { id: 'sit',   name: 'School of Information Technology',              icon: 'computer',          description: 'View faculty members and organizational structure.' },
  { id: 'soe',   name: 'School of Engineering',                        icon: 'architecture',      description: 'View faculty members and organizational structure.' },
  { id: 'ste',   name: 'School of Teacher Education',                  icon: 'menu_book',         description: 'View faculty members and organizational structure.' },
  { id: 'sba',   name: 'School of Business and Accountancy',           icon: 'account_balance',   description: 'View faculty members and organizational structure.' },
  { id: 'sihm',  name: 'School of International Hospitality Management', icon: 'restaurant',      description: 'View faculty members and organizational structure.' },
  { id: 'sh',    name: 'School of Humanities',                         icon: 'history_edu',       description: 'View faculty members and organizational structure.' },
  { id: 'shs',   name: 'School of Health and Sciences',                icon: 'medical_services',  description: 'View faculty members and organizational structure.' },
  { id: 'sc',    name: 'School of Criminology',                        icon: 'local_police',      description: 'View faculty members and organizational structure.' },
  { id: 'sps',   name: 'School of Professional Studies',               icon: 'work',              description: 'View faculty members and organizational structure.' },
];

// ─── Reusable Presentation Schedule Templates ─────────────────────────────────

const SCHEDULE_TEMPLATE_A: { [day: string]: FacultyDaySchedule } = {
  'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · 1:00 PM – 3:00 PM', consultation: '10:00 AM – 12:00 PM' },
  'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '9:00 AM – 12:00 PM (Eng\'g Lab 1)',       consultation: '2:00 PM – 4:00 PM' },
  'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM · 1:00 PM – 3:00 PM', consultation: '10:00 AM – 12:00 PM' },
  'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '9:00 AM – 12:00 PM (Eng\'g Lab 1)',       consultation: '2:00 PM – 4:00 PM' },
  'Friday':    { office: '8:00 AM – 4:00 PM', classSchedule: '8:00 AM – 11:00 AM',                     consultation: '1:00 PM – 3:00 PM' },
};

const SCHEDULE_TEMPLATE_B: { [day: string]: FacultyDaySchedule } = {
  'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '10:00 AM – 12:00 PM · 2:00 PM – 5:00 PM', consultation: '8:30 AM – 10:00 AM' },
  'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM (Lecture Room 302)',   consultation: '1:00 PM – 3:00 PM' },
  'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '10:00 AM – 12:00 PM · 2:00 PM – 5:00 PM', consultation: '8:30 AM – 10:00 AM' },
  'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM (Lecture Room 302)',   consultation: '1:00 PM – 3:00 PM' },
  'Friday':    { office: '8:00 AM – 3:00 PM', classSchedule: '9:00 AM – 12:00 PM',                      consultation: '1:00 PM – 2:30 PM' },
};

const SCHEDULE_TEMPLATE_C: { [day: string]: FacultyDaySchedule } = {
  'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM (Drafting / CAD Lab)', consultation: '1:00 PM – 3:00 PM' },
  'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '10:00 AM – 12:00 PM · 2:00 PM – 4:00 PM', consultation: '8:00 AM – 10:00 AM' },
  'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 11:00 AM (Drafting / CAD Lab)', consultation: '1:00 PM – 3:00 PM' },
  'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '10:00 AM – 12:00 PM · 2:00 PM – 4:00 PM', consultation: '8:00 AM – 10:00 AM' },
  'Friday':    { office: '8:00 AM – 4:00 PM', classSchedule: '1:00 PM – 4:00 PM',                       consultation: '9:00 AM – 11:30 AM' },
};

// ─── Faculty Data ─────────────────────────────────────────────────────────────
// Hierarchy is expressed via supervisorId (points to the ID of the direct
// supervisor) and children (array of subordinate IDs).

export const FACULTY_DATA: Faculty[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // School of Engineering (Verified Organizational Hierarchy)
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
    office: { building: 'Engineering Building', room: 'Dean\'s Office (Room E-101)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '1:00 PM – 2:30 PM (Grad Seminar)', consultation: '9:30 AM – 11:30 AM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: 'Administrative & Academic Review',  consultation: '2:00 PM – 4:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '1:00 PM – 2:30 PM (Grad Seminar)', consultation: '9:30 AM – 11:30 AM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: 'Academic Council & Dept Meetings',  consultation: '2:00 PM – 4:00 PM' },
      'Friday':    { office: '8:00 AM – 4:00 PM', classSchedule: 'Research & Thesis Consultation',    consultation: '10:00 AM – 12:00 PM' },
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
    office: { building: 'Engineering Building', room: 'Faculty & Program Office (Room E-102)' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM (Room E-201)',  consultation: '10:00 AM – 12:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', classSchedule: '9:00 AM – 12:00 PM (Eng\'g Lab)',  consultation: '1:30 PM – 4:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', classSchedule: '8:00 AM – 10:00 AM (Room E-201)',  consultation: '10:00 AM – 12:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', classSchedule: '9:00 AM – 12:00 PM (Eng\'g Lab)',  consultation: '1:30 PM – 4:00 PM' },
      'Friday':    { office: '8:00 AM – 4:00 PM', classSchedule: 'Program Advising & Capstone Eval', consultation: '9:00 AM – 11:30 AM' },
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
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-201)' },
    schedule: SCHEDULE_TEMPLATE_A,
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
    statusNote: 'In Class · Lecture Room E-204 (until 12:00 PM)',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-201)' },
    schedule: SCHEDULE_TEMPLATE_B,
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
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-201)' },
    schedule: SCHEDULE_TEMPLATE_C,
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
    statusNote: 'In Class · Computer Engineering Lab 1',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-202)' },
    schedule: SCHEDULE_TEMPLATE_A,
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
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-202)' },
    schedule: SCHEDULE_TEMPLATE_B,
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
    status: 'on-leave',
    statusNote: 'On Official Seminar / Academic Leave Today',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-202)' },
    schedule: SCHEDULE_TEMPLATE_C,
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
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-202)' },
    schedule: SCHEDULE_TEMPLATE_A,
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
    statusNote: 'In Class · Electronics Lab (Room E-301)',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-203)' },
    schedule: SCHEDULE_TEMPLATE_B,
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
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-203)' },
    schedule: SCHEDULE_TEMPLATE_C,
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
    statusNote: 'In Class · Room E-206',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-203)' },
    schedule: SCHEDULE_TEMPLATE_A,
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
    statusNote: 'Available for Advising & Consultation',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-203)' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'j.misa@udd.edu.ph',
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
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-204)' },
    schedule: SCHEDULE_TEMPLATE_C,
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
    statusNote: 'In Class · Room E-303',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-204)' },
    schedule: SCHEDULE_TEMPLATE_A,
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
    status: 'on-leave',
    statusNote: 'On Leave / Off-Campus Field Assignment',
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-204)' },
    schedule: SCHEDULE_TEMPLATE_B,
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
    office: { building: 'Engineering Building', room: 'Architecture & Design Studio (E-205)' },
    schedule: SCHEDULE_TEMPLATE_C,
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
    office: { building: 'Engineering Building', room: 'Engineering Faculty Room (E-204)' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'j.balolong@udd.edu.ph',
    supervisorId: 'soe-program-head',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Information Technology
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'sit-dean',
    name: 'Dr. Patricia Villanueva',
    school: 'School of Information Technology',
    position: 'Dean',
    roleCategory: 'School Leadership',
    hierarchyLevel: 1,
    status: 'available',
    statusNote: 'Available at SIT Dean\'s Office',
    specialization: ['Software Engineering', 'Data Science'],
    office: { building: 'Main Building', room: 'Room 401' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'p.villanueva@udd.edu.ph',
    supervisorId: null,
    children: ['sit-cs-chair', 'sit-it-chair'],
  },
  {
    id: 'sit-cs-chair',
    name: 'Prof. Angelo Cruz',
    school: 'School of Information Technology',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'in-class',
    statusNote: 'In Class · Computer Lab 3',
    program: 'Computer Science',
    specialization: ['Algorithms', 'Machine Learning'],
    office: { building: 'Main Building', room: 'Room 402' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'a.cruz@udd.edu.ph',
    supervisorId: 'sit-dean',
    children: ['sit-cs-f1', 'sit-cs-f2'],
  },
  {
    id: 'sit-cs-f1',
    name: 'Mr. Kevin Ramos',
    school: 'School of Information Technology',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    program: 'Computer Science',
    specialization: ['Web Development', 'Database Systems'],
    office: { building: 'Main Building', room: 'Room 410' },
    schedule: SCHEDULE_TEMPLATE_C,
    email: 'k.ramos@udd.edu.ph',
    supervisorId: 'sit-cs-chair',
  },
  {
    id: 'sit-cs-f2',
    name: 'Ms. Rachel Fernandez',
    school: 'School of Information Technology',
    position: 'Instructor II',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'on-leave',
    program: 'Computer Science',
    specialization: ['Cybersecurity', 'Network Administration'],
    office: { building: 'Main Building', room: 'Room 411' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'r.fernandez@udd.edu.ph',
    supervisorId: 'sit-cs-chair',
  },
  {
    id: 'sit-it-chair',
    name: 'Prof. Sandra Mendoza',
    school: 'School of Information Technology',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'available',
    program: 'Information Technology',
    specialization: ['Systems Analysis', 'IT Management'],
    office: { building: 'Main Building', room: 'Room 403' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 's.mendoza@udd.edu.ph',
    supervisorId: 'sit-dean',
    children: ['sit-it-f1'],
  },
  {
    id: 'sit-it-f1',
    name: 'Mr. James Tan',
    school: 'School of Information Technology',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    program: 'Information Technology',
    specialization: ['Cloud Computing', 'DevOps'],
    office: { building: 'Main Building', room: 'Room 412' },
    schedule: SCHEDULE_TEMPLATE_C,
    email: 'j.tan@udd.edu.ph',
    supervisorId: 'sit-it-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Teacher Education
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'ste-dean',
    name: 'Dr. Rosalinda Aquino',
    school: 'School of Teacher Education',
    position: 'Dean',
    roleCategory: 'School Leadership',
    hierarchyLevel: 1,
    status: 'available',
    specialization: ['Curriculum Development', 'Educational Psychology'],
    office: { building: 'Main Building', room: 'Room 301' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'r.aquino@udd.edu.ph',
    supervisorId: null,
    children: ['ste-elem-chair', 'ste-sec-chair'],
  },
  {
    id: 'ste-elem-chair',
    name: 'Prof. Linda Basco',
    school: 'School of Teacher Education',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'available',
    program: 'Elementary Education',
    specialization: ['Early Childhood Education'],
    office: { building: 'Main Building', room: 'Room 302' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'l.basco@udd.edu.ph',
    supervisorId: 'ste-dean',
    children: ['ste-elem-f1'],
  },
  {
    id: 'ste-elem-f1',
    name: 'Ms. Grace Navarro',
    school: 'School of Teacher Education',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    program: 'Elementary Education',
    specialization: ['Inclusive Education'],
    office: { building: 'Main Building', room: 'Room 310' },
    schedule: SCHEDULE_TEMPLATE_C,
    email: 'g.navarro@udd.edu.ph',
    supervisorId: 'ste-elem-chair',
  },
  {
    id: 'ste-sec-chair',
    name: 'Prof. Ramon Estrada',
    school: 'School of Teacher Education',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'available',
    program: 'Secondary Education',
    specialization: ['Science Education', 'Assessment'],
    office: { building: 'Main Building', room: 'Room 303' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'r.estrada@udd.edu.ph',
    supervisorId: 'ste-dean',
    children: ['ste-sec-f1'],
  },
  {
    id: 'ste-sec-f1',
    name: 'Mr. Philip Torres',
    school: 'School of Teacher Education',
    position: 'Instructor II',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'on-leave',
    program: 'Secondary Education',
    specialization: ['Mathematics Education'],
    office: { building: 'Main Building', room: 'Room 311' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'p.torres@udd.edu.ph',
    supervisorId: 'ste-sec-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Business and Accountancy
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'sba-dean',
    name: 'Dr. Catherine Lim',
    school: 'School of Business and Accountancy',
    position: 'Dean',
    roleCategory: 'School Leadership',
    hierarchyLevel: 1,
    status: 'available',
    specialization: ['Financial Management', 'Corporate Governance'],
    office: { building: 'Main Building', room: 'Room 501' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'c.lim@udd.edu.ph',
    supervisorId: null,
    children: ['sba-acct-chair', 'sba-ba-chair'],
  },
  {
    id: 'sba-acct-chair',
    name: 'CPA Michelle Reyes',
    school: 'School of Business and Accountancy',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'in-class',
    program: 'Accountancy',
    specialization: ['Auditing', 'Taxation'],
    office: { building: 'Main Building', room: 'Room 502' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'm.reyes@udd.edu.ph',
    supervisorId: 'sba-dean',
    children: ['sba-acct-f1'],
  },
  {
    id: 'sba-acct-f1',
    name: 'CPA Andrea Flores',
    school: 'School of Business and Accountancy',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    program: 'Accountancy',
    specialization: ['Financial Accounting'],
    office: { building: 'Main Building', room: 'Room 510' },
    schedule: SCHEDULE_TEMPLATE_C,
    email: 'a.flores@udd.edu.ph',
    supervisorId: 'sba-acct-chair',
  },
  {
    id: 'sba-ba-chair',
    name: 'Prof. Daniel Gutierrez',
    school: 'School of Business and Accountancy',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'available',
    program: 'Business Administration',
    specialization: ['Marketing', 'Strategic Management'],
    office: { building: 'Main Building', room: 'Room 503' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'd.gutierrez@udd.edu.ph',
    supervisorId: 'sba-dean',
    children: ['sba-ba-f1'],
  },
  {
    id: 'sba-ba-f1',
    name: 'Ms. Isabel Santos',
    school: 'School of Business and Accountancy',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    program: 'Business Administration',
    specialization: ['Human Resource Management'],
    office: { building: 'Main Building', room: 'Room 511' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'i.santos@udd.edu.ph',
    supervisorId: 'sba-ba-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of International Hospitality Management
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'sihm-dean',
    name: 'Dr. Fernando Aguilar',
    school: 'School of International Hospitality Management',
    position: 'Dean',
    roleCategory: 'School Leadership',
    hierarchyLevel: 1,
    status: 'available',
    specialization: ['Hospitality Operations', 'Tourism Management'],
    office: { building: 'Fame Building', room: 'Room 201' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'f.aguilar@udd.edu.ph',
    supervisorId: null,
    children: ['sihm-hm-chair', 'sihm-tm-chair'],
  },
  {
    id: 'sihm-hm-chair',
    name: 'Chef Ricardo Pascual',
    school: 'School of International Hospitality Management',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'in-class',
    program: 'Hotel & Restaurant Management',
    specialization: ['Culinary Arts', 'Food Science'],
    office: { building: 'Fame Building', room: 'Room 202' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'r.pascual@udd.edu.ph',
    supervisorId: 'sihm-dean',
    children: ['sihm-hm-f1'],
  },
  {
    id: 'sihm-hm-f1',
    name: 'Ms. Victoria Dela Rosa',
    school: 'School of International Hospitality Management',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    program: 'Hotel & Restaurant Management',
    specialization: ['Front Office Management'],
    office: { building: 'Fame Building', room: 'Room 210' },
    schedule: SCHEDULE_TEMPLATE_C,
    email: 'v.delarosa@udd.edu.ph',
    supervisorId: 'sihm-hm-chair',
  },
  {
    id: 'sihm-tm-chair',
    name: 'Prof. Carmen Velasco',
    school: 'School of International Hospitality Management',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'available',
    program: 'Tourism Management',
    specialization: ['Sustainable Tourism', 'Events Management'],
    office: { building: 'Fame Building', room: 'Room 203' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'c.velasco@udd.edu.ph',
    supervisorId: 'sihm-dean',
    children: ['sihm-tm-f1'],
  },
  {
    id: 'sihm-tm-f1',
    name: 'Mr. Marco Ignacio',
    school: 'School of International Hospitality Management',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'on-leave',
    program: 'Tourism Management',
    specialization: ['Tour Planning', 'Heritage Tourism'],
    office: { building: 'Fame Building', room: 'Room 211' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'm.ignacio@udd.edu.ph',
    supervisorId: 'sihm-tm-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Humanities
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'sh-dean',
    name: 'Dr. Amelia Soriano',
    school: 'School of Humanities',
    position: 'Dean',
    roleCategory: 'School Leadership',
    hierarchyLevel: 1,
    status: 'available',
    specialization: ['Philippine Literature', 'Cultural Studies'],
    office: { building: 'Main Building', room: 'Room 601' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'a.soriano@udd.edu.ph',
    supervisorId: null,
    children: ['sh-comm-chair'],
  },
  {
    id: 'sh-comm-chair',
    name: 'Prof. Benjamin Tan',
    school: 'School of Humanities',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'in-class',
    program: 'Communication',
    specialization: ['Mass Media', 'Journalism'],
    office: { building: 'Main Building', room: 'Room 602' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'b.tan@udd.edu.ph',
    supervisorId: 'sh-dean',
    children: ['sh-comm-f1'],
  },
  {
    id: 'sh-comm-f1',
    name: 'Ms. Denise Ocampo',
    school: 'School of Humanities',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    program: 'Communication',
    specialization: ['Public Relations', 'Broadcasting'],
    office: { building: 'Main Building', room: 'Room 610' },
    schedule: SCHEDULE_TEMPLATE_C,
    email: 'd.ocampo@udd.edu.ph',
    supervisorId: 'sh-comm-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Health and Sciences
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'shs-dean',
    name: 'Dr. Beatrice Navarro',
    school: 'School of Health and Sciences',
    position: 'Dean',
    roleCategory: 'School Leadership',
    hierarchyLevel: 1,
    status: 'available',
    specialization: ['Public Health', 'Epidemiology'],
    office: { building: 'Health Sciences Building', room: 'Room 101' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'b.navarro@udd.edu.ph',
    supervisorId: null,
    children: ['shs-nursing-chair', 'shs-medtech-chair'],
  },
  {
    id: 'shs-nursing-chair',
    name: 'Prof. Elena Santiago',
    school: 'School of Health and Sciences',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'available',
    program: 'Nursing',
    specialization: ['Medical-Surgical Nursing', 'Community Health'],
    office: { building: 'Health Sciences Building', room: 'Room 102' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'e.santiago@udd.edu.ph',
    supervisorId: 'shs-dean',
    children: ['shs-nursing-f1'],
  },
  {
    id: 'shs-nursing-f1',
    name: 'Ms. Joy Mercado',
    school: 'School of Health and Sciences',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    program: 'Nursing',
    specialization: ['Pediatric Nursing'],
    office: { building: 'Health Sciences Building', room: 'Room 110' },
    schedule: SCHEDULE_TEMPLATE_C,
    email: 'j.mercado@udd.edu.ph',
    supervisorId: 'shs-nursing-chair',
  },
  {
    id: 'shs-medtech-chair',
    name: 'Prof. Gabriel Reyes',
    school: 'School of Health and Sciences',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'in-class',
    program: 'Medical Technology',
    specialization: ['Clinical Chemistry', 'Hematology'],
    office: { building: 'Health Sciences Building', room: 'Room 103' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'g.reyes@udd.edu.ph',
    supervisorId: 'shs-dean',
    children: ['shs-medtech-f1'],
  },
  {
    id: 'shs-medtech-f1',
    name: 'Mr. Leo Castillo',
    school: 'School of Health and Sciences',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'available',
    program: 'Medical Technology',
    specialization: ['Microbiology', 'Parasitology'],
    office: { building: 'Health Sciences Building', room: 'Room 111' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'l.castillo@udd.edu.ph',
    supervisorId: 'shs-medtech-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Criminology
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'sc-dean',
    name: 'Dr. Ricardo Manansala',
    school: 'School of Criminology',
    position: 'Dean',
    roleCategory: 'School Leadership',
    hierarchyLevel: 1,
    status: 'available',
    specialization: ['Criminal Justice', 'Forensic Science'],
    office: { building: 'Criminology Building', room: 'Room 101' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'r.manansala@udd.edu.ph',
    supervisorId: null,
    children: ['sc-crim-chair'],
  },
  {
    id: 'sc-crim-chair',
    name: 'Prof. Antonio Bautista',
    school: 'School of Criminology',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'available',
    program: 'Criminology',
    specialization: ['Law Enforcement Administration', 'Crime Detection'],
    office: { building: 'Criminology Building', room: 'Room 102' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'a.bautista.crim@udd.edu.ph',
    supervisorId: 'sc-dean',
    children: ['sc-crim-f1'],
  },
  {
    id: 'sc-crim-f1',
    name: 'Mr. Nelson Pagdanganan',
    school: 'School of Criminology',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'in-class',
    program: 'Criminology',
    specialization: ['Criminal Law', 'Corrections'],
    office: { building: 'Criminology Building', room: 'Room 110' },
    schedule: SCHEDULE_TEMPLATE_C,
    email: 'n.pagdanganan@udd.edu.ph',
    supervisorId: 'sc-crim-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Professional Studies
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'sps-dean',
    name: 'Dr. Lorenzo Magtanggol',
    school: 'School of Professional Studies',
    position: 'Dean',
    roleCategory: 'School Leadership',
    hierarchyLevel: 1,
    status: 'available',
    specialization: ['Public Administration', 'Organizational Development'],
    office: { building: 'Main Building', room: 'Room 701' },
    schedule: SCHEDULE_TEMPLATE_A,
    email: 'l.magtanggol@udd.edu.ph',
    supervisorId: null,
    children: ['sps-pa-chair'],
  },
  {
    id: 'sps-pa-chair',
    name: 'Prof. Josephine del Rosario',
    school: 'School of Professional Studies',
    position: 'Program Chair',
    roleCategory: 'Program Leadership',
    hierarchyLevel: 2,
    status: 'available',
    program: 'Public Administration',
    specialization: ['Governance', 'Policy Analysis'],
    office: { building: 'Main Building', room: 'Room 702' },
    schedule: SCHEDULE_TEMPLATE_B,
    email: 'j.delrosario@udd.edu.ph',
    supervisorId: 'sps-dean',
    children: ['sps-pa-f1'],
  },
  {
    id: 'sps-pa-f1',
    name: 'Mr. Oscar Villanueva',
    school: 'School of Professional Studies',
    position: 'Instructor I',
    roleCategory: 'Faculty Members',
    hierarchyLevel: 3,
    status: 'on-leave',
    program: 'Public Administration',
    specialization: ['Local Government', 'Administrative Law'],
    office: { building: 'Main Building', room: 'Room 710' },
    schedule: SCHEDULE_TEMPLATE_C,
    email: 'o.villanueva@udd.edu.ph',
    supervisorId: 'sps-pa-chair',
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

/** Get all faculty members belonging to a specific school */
export function getFacultyBySchool(schoolName: string): Faculty[] {
  return FACULTY_DATA.filter(f => f.school === schoolName);
}

/** Get a single faculty member by ID */
export function getFacultyById(id: string): Faculty | undefined {
  return FACULTY_DATA.find(f => f.id === id);
}

/** Get the computed faculty count for each school */
export function getSchoolFacultyCount(schoolName: string): number {
  return FACULTY_DATA.filter(f => f.school === schoolName).length;
}

/** Get the dean (top-level supervisor) of a school */
export function getSchoolDean(schoolName: string): Faculty | undefined {
  return FACULTY_DATA.find(f => f.school === schoolName && f.supervisorId === null);
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
  return FACULTY_DATA.filter(f => {
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
