// ─── Faculty Locator Data Layer ───────────────────────────────────────────────
// Single source of truth for all faculty information, school metadata,
// and hierarchy relationships used across every Faculty Locator view.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Faculty {
  id: string;
  name: string;
  photo?: string;
  school: string;
  position: string;
  program?: string;
  specialization?: string[];
  office?: {
    building?: string;
    room?: string;
  };
  schedule?: {
    [day: string]: {
      office?: string;
      consultation?: string;
    };
  };
  email?: string;
  contactNumber?: string;
  supervisorId?: string | null;
  children?: string[];
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
  { id: 'sbe',   name: 'School of Basic Education',                    icon: 'school',            description: 'View faculty members and organizational structure.' },
  { id: 'sc',    name: 'School of Criminology',                        icon: 'local_police',      description: 'View faculty members and organizational structure.' },
  { id: 'sps',   name: 'School of Professional Studies',               icon: 'work',              description: 'View faculty members and organizational structure.' },
];

// ─── Faculty Data ─────────────────────────────────────────────────────────────
// Hierarchy is expressed via supervisorId (points to the ID of the direct
// supervisor) and children (array of subordinate IDs).

export const FACULTY_DATA: Faculty[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // School of Engineering
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'soe-dean',
    name: 'Dr. Juan Dela Cruz',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-SVKVkRjQIL7cPWwqiYOJdgo3g37SC4IXQ1D3u5Cx-97nQZ1VYbPCj9zF5-DjxeBjAAZWNx2K8gafyajaRFIkxsM6mL-420m-jKoHh2Buib1sGgklXoM3lpTu_pluc4DetLzazzClj5GnNwum7pULIEwU4WRujx05dLSRHgITOgLmuppqum84s2bqDE4qgclQmdFw-5OLCylSTFEY3LY6sbiSsh9OkOjiHa9otWXXy3O0n4JTU8LU',
    school: 'School of Engineering',
    position: 'Dean',
    specialization: ['Structural Engineering', 'Construction Management', 'Civil Engineering Research'],
    office: { building: 'Engineering Building', room: 'Room 301' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', consultation: '2:00 PM – 4:00 PM' },
      'Wednesday': { office: '8:00 AM – 12:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Friday':    { office: '8:00 AM – 3:00 PM', consultation: '1:00 PM – 3:00 PM' },
    },
    email: 'j.delacruz@udd.edu.ph',
    contactNumber: '(075) 123-4567',
    supervisorId: null,
    children: ['soe-ce-chair', 'soe-cpe-chair', 'soe-ee-chair'],
  },
  // ── Civil Engineering ──
  {
    id: 'soe-ce-chair',
    name: 'Engr. Maria Santos',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrfBKnWhWQrDa9WXun0cNpIGnZ5OCjgn1nbLr6TL98l-SlgzrNGSM0n7Kuw8eIPYpvOZ-krjmV4Nv5pMOz2XfpZ26ghbye1tFH77ITMRvA_UP_I68pjA0xFudduz0Zjk6vVMNQ5gIXiipeNsNdsf1qJSnXQ3D6SvPG_NBnMSg6xUDu7ImBmyWCY1Dofj8XpWO11f84Op7kRDiY64HI1sF2syPYqCjrnqyCANd8zQdUsxjAiq7CpT70',
    school: 'School of Engineering',
    position: 'Program Chair',
    program: 'Civil Engineering',
    specialization: ['Geotechnical Engineering', 'Soil Mechanics'],
    office: { building: 'Engineering Building', room: 'Room 205' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 11:00 AM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', consultation: '1:00 PM – 3:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 3:00 PM' },
    },
    email: 'm.santos@udd.edu.ph',
    supervisorId: 'soe-dean',
    children: ['soe-ce-f1', 'soe-ce-f2'],
  },
  {
    id: 'soe-ce-f1',
    name: 'Arch. Alex Bautista',
    school: 'School of Engineering',
    position: 'Instructor I',
    program: 'Civil Engineering',
    specialization: ['Architectural Design'],
    office: { building: 'Engineering Building', room: 'Room 210' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', consultation: '3:00 PM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '3:00 PM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 12:00 PM' },
    },
    email: 'a.bautista@udd.edu.ph',
    supervisorId: 'soe-ce-chair',
  },
  {
    id: 'soe-ce-f2',
    name: 'Engr. Carlo Dizon',
    school: 'School of Engineering',
    position: 'Instructor II',
    program: 'Civil Engineering',
    specialization: ['Hydraulics', 'Water Resources'],
    office: { building: 'Engineering Building', room: 'Room 211' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 12:00 PM' },
    },
    email: 'c.dizon@udd.edu.ph',
    supervisorId: 'soe-ce-chair',
  },
  // ── Computer Engineering ──
  {
    id: 'soe-cpe-chair',
    name: 'Engr. Robert Lim',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoJIa_Pffr1eeBKZclCZQi5-y7LHWn811jRyHdxhmrfS93yNZbcnPG5nR52lT5enAx_dCmXQCnuRrAtVF1_j8kOVvKE_HFXyf0eq8tfJ-0JIN1cc0YJ1GOMrVUSNDHb5Eh6hKdIFgcte3piihx_dY5fD_fCO663lH5KykqFXhLapqQD8H4w6ojV-DfabN-8TsswQg6rvzLpaST8p7vW-8z2dqeacosFM5PQ7_JY8xSwoMSxsNuH2tT',
    school: 'School of Engineering',
    position: 'Program Chair',
    program: 'Computer Engineering',
    specialization: ['Embedded Systems', 'IoT'],
    office: { building: 'Engineering Building', room: 'Room 206' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', consultation: '2:00 PM – 4:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '2:00 PM – 4:00 PM' },
      'Friday':    { office: '8:00 AM – 3:00 PM' },
    },
    email: 'r.lim@udd.edu.ph',
    supervisorId: 'soe-dean',
    children: ['soe-cpe-f1'],
  },
  {
    id: 'soe-cpe-f1',
    name: 'Engr. Diana Reyes',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDifquq7ipGud7U0cgEKM774sRGPZ2v5jtcxn-qh-BmZoCY4zrUi1sBeT8ornxakcqLdhraVMdXn0RFRDUsRofMCDy1ZYGHq3kvLbEFXqP-9r5SJUAqdB_DnrTRuESJXIfjovs3einK6sLVtpzDybxkbsFHRC-y01C3M4yLm_Ck4E4s_0weClgoe3qGCmrrxYPdCl69l0SgeOCadOJfGZwM0rgbtTWMShJViqmL3SuO_VGkbyb7dwVB',
    school: 'School of Engineering',
    position: 'Asst. Professor',
    program: 'Computer Engineering',
    specialization: ['Digital Systems', 'VLSI Design'],
    office: { building: 'Engineering Building', room: 'Room 212' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 11:00 AM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 11:00 AM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 12:00 PM' },
    },
    email: 'd.reyes@udd.edu.ph',
    supervisorId: 'soe-cpe-chair',
  },
  // ── Electrical Engineering ──
  {
    id: 'soe-ee-chair',
    name: 'Engr. Eduardo Garcia',
    school: 'School of Engineering',
    position: 'Program Chair',
    program: 'Electrical Engineering',
    specialization: ['Power Systems', 'Renewable Energy'],
    office: { building: 'Engineering Building', room: 'Room 207' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '1:00 PM – 3:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', consultation: '1:00 PM – 3:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 3:00 PM' },
    },
    email: 'e.garcia@udd.edu.ph',
    supervisorId: 'soe-dean',
    children: ['soe-ee-f1'],
  },
  {
    id: 'soe-ee-f1',
    name: 'Engr. Fred Manalo',
    school: 'School of Engineering',
    position: 'Instructor I',
    program: 'Electrical Engineering',
    specialization: ['Circuit Design', 'Electronics'],
    office: { building: 'Engineering Building', room: 'Room 213' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Friday':    { office: '8:00 AM – 12:00 PM' },
    },
    email: 'f.manalo@udd.edu.ph',
    supervisorId: 'soe-ee-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Information Technology
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'sit-dean',
    name: 'Dr. Patricia Villanueva',
    school: 'School of Information Technology',
    position: 'Dean',
    specialization: ['Software Engineering', 'Data Science'],
    office: { building: 'Main Building', room: 'Room 401' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', consultation: '2:00 PM – 4:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 3:00 PM' },
    },
    email: 'p.villanueva@udd.edu.ph',
    supervisorId: null,
    children: ['sit-cs-chair', 'sit-it-chair'],
  },
  {
    id: 'sit-cs-chair',
    name: 'Prof. Angelo Cruz',
    school: 'School of Information Technology',
    position: 'Program Chair',
    program: 'Computer Science',
    specialization: ['Algorithms', 'Machine Learning'],
    office: { building: 'Main Building', room: 'Room 402' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 11:00 AM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 11:00 AM' },
      'Friday':    { office: '8:00 AM – 12:00 PM' },
    },
    email: 'a.cruz@udd.edu.ph',
    supervisorId: 'sit-dean',
    children: ['sit-cs-f1', 'sit-cs-f2'],
  },
  {
    id: 'sit-cs-f1',
    name: 'Mr. Kevin Ramos',
    school: 'School of Information Technology',
    position: 'Instructor I',
    program: 'Computer Science',
    specialization: ['Web Development', 'Database Systems'],
    office: { building: 'Main Building', room: 'Room 410' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', consultation: '3:00 PM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '3:00 PM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 12:00 PM' },
    },
    email: 'k.ramos@udd.edu.ph',
    supervisorId: 'sit-cs-chair',
  },
  {
    id: 'sit-cs-f2',
    name: 'Ms. Rachel Fernandez',
    school: 'School of Information Technology',
    position: 'Instructor II',
    program: 'Computer Science',
    specialization: ['Cybersecurity', 'Network Administration'],
    office: { building: 'Main Building', room: 'Room 411' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '1:00 PM – 3:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', consultation: '1:00 PM – 3:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 12:00 PM' },
    },
    email: 'r.fernandez@udd.edu.ph',
    supervisorId: 'sit-cs-chair',
  },
  {
    id: 'sit-it-chair',
    name: 'Prof. Sandra Mendoza',
    school: 'School of Information Technology',
    position: 'Program Chair',
    program: 'Information Technology',
    specialization: ['Systems Analysis', 'IT Management'],
    office: { building: 'Main Building', room: 'Room 403' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Friday':    { office: '8:00 AM – 3:00 PM' },
    },
    email: 's.mendoza@udd.edu.ph',
    supervisorId: 'sit-dean',
    children: ['sit-it-f1'],
  },
  {
    id: 'sit-it-f1',
    name: 'Mr. James Tan',
    school: 'School of Information Technology',
    position: 'Instructor I',
    program: 'Information Technology',
    specialization: ['Cloud Computing', 'DevOps'],
    office: { building: 'Main Building', room: 'Room 412' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '2:00 PM – 4:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', consultation: '2:00 PM – 4:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 12:00 PM' },
    },
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
    specialization: ['Curriculum Development', 'Educational Psychology'],
    office: { building: 'Main Building', room: 'Room 301' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '10:00 AM – 12:00 PM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM', consultation: '2:00 PM – 4:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM' },
      'Friday':    { office: '8:00 AM – 3:00 PM' },
    },
    email: 'r.aquino@udd.edu.ph',
    supervisorId: null,
    children: ['ste-elem-chair', 'ste-sec-chair'],
  },
  {
    id: 'ste-elem-chair',
    name: 'Prof. Linda Basco',
    school: 'School of Teacher Education',
    position: 'Program Chair',
    program: 'Elementary Education',
    specialization: ['Early Childhood Education'],
    office: { building: 'Main Building', room: 'Room 302' },
    schedule: {
      'Monday':    { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 11:00 AM' },
      'Tuesday':   { office: '8:00 AM – 5:00 PM' },
      'Wednesday': { office: '8:00 AM – 5:00 PM' },
      'Thursday':  { office: '8:00 AM – 5:00 PM', consultation: '9:00 AM – 11:00 AM' },
      'Friday':    { office: '8:00 AM – 12:00 PM' },
    },
    email: 'l.basco@udd.edu.ph',
    supervisorId: 'ste-dean',
    children: ['ste-elem-f1'],
  },
  {
    id: 'ste-elem-f1',
    name: 'Ms. Grace Navarro',
    school: 'School of Teacher Education',
    position: 'Instructor I',
    program: 'Elementary Education',
    specialization: ['Inclusive Education'],
    office: { building: 'Main Building', room: 'Room 310' },
    email: 'g.navarro@udd.edu.ph',
    supervisorId: 'ste-elem-chair',
  },
  {
    id: 'ste-sec-chair',
    name: 'Prof. Ramon Estrada',
    school: 'School of Teacher Education',
    position: 'Program Chair',
    program: 'Secondary Education',
    specialization: ['Science Education', 'Assessment'],
    office: { building: 'Main Building', room: 'Room 303' },
    email: 'r.estrada@udd.edu.ph',
    supervisorId: 'ste-dean',
    children: ['ste-sec-f1'],
  },
  {
    id: 'ste-sec-f1',
    name: 'Mr. Philip Torres',
    school: 'School of Teacher Education',
    position: 'Instructor II',
    program: 'Secondary Education',
    specialization: ['Mathematics Education'],
    office: { building: 'Main Building', room: 'Room 311' },
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
    specialization: ['Financial Management', 'Corporate Governance'],
    office: { building: 'Main Building', room: 'Room 501' },
    email: 'c.lim@udd.edu.ph',
    supervisorId: null,
    children: ['sba-acct-chair', 'sba-ba-chair'],
  },
  {
    id: 'sba-acct-chair',
    name: 'CPA Michelle Reyes',
    school: 'School of Business and Accountancy',
    position: 'Program Chair',
    program: 'Accountancy',
    specialization: ['Auditing', 'Taxation'],
    office: { building: 'Main Building', room: 'Room 502' },
    email: 'm.reyes@udd.edu.ph',
    supervisorId: 'sba-dean',
    children: ['sba-acct-f1'],
  },
  {
    id: 'sba-acct-f1',
    name: 'CPA Andrea Flores',
    school: 'School of Business and Accountancy',
    position: 'Instructor I',
    program: 'Accountancy',
    specialization: ['Financial Accounting'],
    office: { building: 'Main Building', room: 'Room 510' },
    email: 'a.flores@udd.edu.ph',
    supervisorId: 'sba-acct-chair',
  },
  {
    id: 'sba-ba-chair',
    name: 'Prof. Daniel Gutierrez',
    school: 'School of Business and Accountancy',
    position: 'Program Chair',
    program: 'Business Administration',
    specialization: ['Marketing', 'Strategic Management'],
    office: { building: 'Main Building', room: 'Room 503' },
    email: 'd.gutierrez@udd.edu.ph',
    supervisorId: 'sba-dean',
    children: ['sba-ba-f1'],
  },
  {
    id: 'sba-ba-f1',
    name: 'Ms. Isabel Santos',
    school: 'School of Business and Accountancy',
    position: 'Instructor I',
    program: 'Business Administration',
    specialization: ['Human Resource Management'],
    office: { building: 'Main Building', room: 'Room 511' },
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
    specialization: ['Hospitality Operations', 'Tourism Management'],
    office: { building: 'Fame Building', room: 'Room 201' },
    email: 'f.aguilar@udd.edu.ph',
    supervisorId: null,
    children: ['sihm-hm-chair', 'sihm-tm-chair'],
  },
  {
    id: 'sihm-hm-chair',
    name: 'Chef Ricardo Pascual',
    school: 'School of International Hospitality Management',
    position: 'Program Chair',
    program: 'Hotel & Restaurant Management',
    specialization: ['Culinary Arts', 'Food Science'],
    office: { building: 'Fame Building', room: 'Room 202' },
    email: 'r.pascual@udd.edu.ph',
    supervisorId: 'sihm-dean',
    children: ['sihm-hm-f1'],
  },
  {
    id: 'sihm-hm-f1',
    name: 'Ms. Victoria Dela Rosa',
    school: 'School of International Hospitality Management',
    position: 'Instructor I',
    program: 'Hotel & Restaurant Management',
    specialization: ['Front Office Management'],
    office: { building: 'Fame Building', room: 'Room 210' },
    email: 'v.delarosa@udd.edu.ph',
    supervisorId: 'sihm-hm-chair',
  },
  {
    id: 'sihm-tm-chair',
    name: 'Prof. Carmen Velasco',
    school: 'School of International Hospitality Management',
    position: 'Program Chair',
    program: 'Tourism Management',
    specialization: ['Sustainable Tourism', 'Events Management'],
    office: { building: 'Fame Building', room: 'Room 203' },
    email: 'c.velasco@udd.edu.ph',
    supervisorId: 'sihm-dean',
    children: ['sihm-tm-f1'],
  },
  {
    id: 'sihm-tm-f1',
    name: 'Mr. Marco Ignacio',
    school: 'School of International Hospitality Management',
    position: 'Instructor I',
    program: 'Tourism Management',
    specialization: ['Tour Planning', 'Heritage Tourism'],
    office: { building: 'Fame Building', room: 'Room 211' },
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
    specialization: ['Philippine Literature', 'Cultural Studies'],
    office: { building: 'Main Building', room: 'Room 601' },
    email: 'a.soriano@udd.edu.ph',
    supervisorId: null,
    children: ['sh-comm-chair'],
  },
  {
    id: 'sh-comm-chair',
    name: 'Prof. Benjamin Tan',
    school: 'School of Humanities',
    position: 'Program Chair',
    program: 'Communication',
    specialization: ['Mass Media', 'Journalism'],
    office: { building: 'Main Building', room: 'Room 602' },
    email: 'b.tan@udd.edu.ph',
    supervisorId: 'sh-dean',
    children: ['sh-comm-f1'],
  },
  {
    id: 'sh-comm-f1',
    name: 'Ms. Denise Ocampo',
    school: 'School of Humanities',
    position: 'Instructor I',
    program: 'Communication',
    specialization: ['Public Relations', 'Broadcasting'],
    office: { building: 'Main Building', room: 'Room 610' },
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
    specialization: ['Public Health', 'Epidemiology'],
    office: { building: 'Health Sciences Building', room: 'Room 101' },
    email: 'b.navarro@udd.edu.ph',
    supervisorId: null,
    children: ['shs-nursing-chair', 'shs-medtech-chair'],
  },
  {
    id: 'shs-nursing-chair',
    name: 'Prof. Elena Santiago',
    school: 'School of Health and Sciences',
    position: 'Program Chair',
    program: 'Nursing',
    specialization: ['Medical-Surgical Nursing', 'Community Health'],
    office: { building: 'Health Sciences Building', room: 'Room 102' },
    email: 'e.santiago@udd.edu.ph',
    supervisorId: 'shs-dean',
    children: ['shs-nursing-f1'],
  },
  {
    id: 'shs-nursing-f1',
    name: 'Ms. Joy Mercado',
    school: 'School of Health and Sciences',
    position: 'Instructor I',
    program: 'Nursing',
    specialization: ['Pediatric Nursing'],
    office: { building: 'Health Sciences Building', room: 'Room 110' },
    email: 'j.mercado@udd.edu.ph',
    supervisorId: 'shs-nursing-chair',
  },
  {
    id: 'shs-medtech-chair',
    name: 'Prof. Gabriel Reyes',
    school: 'School of Health and Sciences',
    position: 'Program Chair',
    program: 'Medical Technology',
    specialization: ['Clinical Chemistry', 'Hematology'],
    office: { building: 'Health Sciences Building', room: 'Room 103' },
    email: 'g.reyes@udd.edu.ph',
    supervisorId: 'shs-dean',
    children: ['shs-medtech-f1'],
  },
  {
    id: 'shs-medtech-f1',
    name: 'Mr. Leo Castillo',
    school: 'School of Health and Sciences',
    position: 'Instructor I',
    program: 'Medical Technology',
    specialization: ['Microbiology', 'Parasitology'],
    office: { building: 'Health Sciences Building', room: 'Room 111' },
    email: 'l.castillo@udd.edu.ph',
    supervisorId: 'shs-medtech-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Basic Education
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'sbe-dean',
    name: 'Dr. Nora Villareal',
    school: 'School of Basic Education',
    position: 'Dean',
    specialization: ['K-12 Curriculum', 'Child Development'],
    office: { building: 'Basic Education Building', room: 'Room 101' },
    email: 'n.villareal@udd.edu.ph',
    supervisorId: null,
    children: ['sbe-elem-chair', 'sbe-jhs-chair'],
  },
  {
    id: 'sbe-elem-chair',
    name: 'Mrs. Teresa Dimaculangan',
    school: 'School of Basic Education',
    position: 'Department Head',
    program: 'Elementary Department',
    specialization: ['Primary Education'],
    office: { building: 'Basic Education Building', room: 'Room 102' },
    email: 't.dimaculangan@udd.edu.ph',
    supervisorId: 'sbe-dean',
    children: ['sbe-elem-f1'],
  },
  {
    id: 'sbe-elem-f1',
    name: 'Ms. Anna Magbanua',
    school: 'School of Basic Education',
    position: 'Teacher III',
    program: 'Elementary Department',
    specialization: ['English & Filipino'],
    office: { building: 'Basic Education Building', room: 'Faculty Room A' },
    email: 'a.magbanua@udd.edu.ph',
    supervisorId: 'sbe-elem-chair',
  },
  {
    id: 'sbe-jhs-chair',
    name: 'Mr. Roberto Enriquez',
    school: 'School of Basic Education',
    position: 'Department Head',
    program: 'Junior High School',
    specialization: ['Science & Math Education'],
    office: { building: 'Basic Education Building', room: 'Room 103' },
    email: 'r.enriquez@udd.edu.ph',
    supervisorId: 'sbe-dean',
    children: ['sbe-jhs-f1'],
  },
  {
    id: 'sbe-jhs-f1',
    name: 'Ms. Christine Alvarez',
    school: 'School of Basic Education',
    position: 'Teacher II',
    program: 'Junior High School',
    specialization: ['Social Studies'],
    office: { building: 'Basic Education Building', room: 'Faculty Room B' },
    email: 'c.alvarez@udd.edu.ph',
    supervisorId: 'sbe-jhs-chair',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // School of Criminology
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'sc-dean',
    name: 'Dr. Ricardo Manansala',
    school: 'School of Criminology',
    position: 'Dean',
    specialization: ['Criminal Justice', 'Forensic Science'],
    office: { building: 'Criminology Building', room: 'Room 101' },
    email: 'r.manansala@udd.edu.ph',
    supervisorId: null,
    children: ['sc-crim-chair'],
  },
  {
    id: 'sc-crim-chair',
    name: 'Prof. Antonio Bautista',
    school: 'School of Criminology',
    position: 'Program Chair',
    program: 'Criminology',
    specialization: ['Law Enforcement Administration', 'Crime Detection'],
    office: { building: 'Criminology Building', room: 'Room 102' },
    email: 'a.bautista.crim@udd.edu.ph',
    supervisorId: 'sc-dean',
    children: ['sc-crim-f1'],
  },
  {
    id: 'sc-crim-f1',
    name: 'Mr. Nelson Pagdanganan',
    school: 'School of Criminology',
    position: 'Instructor I',
    program: 'Criminology',
    specialization: ['Criminal Law', 'Corrections'],
    office: { building: 'Criminology Building', room: 'Room 110' },
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
    specialization: ['Public Administration', 'Organizational Development'],
    office: { building: 'Main Building', room: 'Room 701' },
    email: 'l.magtanggol@udd.edu.ph',
    supervisorId: null,
    children: ['sps-pa-chair'],
  },
  {
    id: 'sps-pa-chair',
    name: 'Prof. Josephine del Rosario',
    school: 'School of Professional Studies',
    position: 'Program Chair',
    program: 'Public Administration',
    specialization: ['Governance', 'Policy Analysis'],
    office: { building: 'Main Building', room: 'Room 702' },
    email: 'j.delrosario@udd.edu.ph',
    supervisorId: 'sps-dean',
    children: ['sps-pa-f1'],
  },
  {
    id: 'sps-pa-f1',
    name: 'Mr. Oscar Villanueva',
    school: 'School of Professional Studies',
    position: 'Instructor I',
    program: 'Public Administration',
    specialization: ['Local Government', 'Administrative Law'],
    office: { building: 'Main Building', room: 'Room 710' },
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
 * Returns the dean node with nested children resolved from the flat array.
 */
export interface FacultyNode {
  faculty: Faculty;
  children: FacultyNode[];
}

export function getSchoolHierarchy(schoolName: string): FacultyNode | null {
  const dean = getSchoolDean(schoolName);
  if (!dean) return null;

  function buildNode(facultyMember: Faculty): FacultyNode {
    const childIds = facultyMember.children || [];
    const childNodes = childIds
      .map(id => FACULTY_DATA.find(f => f.id === id))
      .filter((f): f is Faculty => f !== undefined)
      .map(child => buildNode(child));

    return { faculty: facultyMember, children: childNodes };
  }

  return buildNode(dean);
}

/** Search faculty across all fields */
export function searchFaculty(query: string): Faculty[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return FACULTY_DATA.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.position.toLowerCase().includes(q) ||
    f.school.toLowerCase().includes(q) ||
    (f.program?.toLowerCase().includes(q)) ||
    (f.specialization?.some(s => s.toLowerCase().includes(q))) ||
    (f.email?.toLowerCase().includes(q))
  );
}

/** Get faculty initials (for avatar fallback) */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(part => !['Dr.', 'Engr.', 'Prof.', 'Arch.', 'Mr.', 'Ms.', 'Mrs.', 'CPA', 'Chef', 'Atty.'].includes(part))
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
