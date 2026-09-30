/**
 * transportData.ts
 *
 * Static data for the SakayUDD Campus Transport feature.
 * Contains e-jeepney routes, stops, schedules, fares, and rider tips
 * for Universidad de Dagupan.
 */

export interface RouteStop {
  name: string;
  lat: number;
  lng: number;
  isTerminal?: boolean;
  landmark?: string;
}

export interface Route {
  id: string;
  name: string;
  shortName: string;
  color: string;
  accentColor: string;
  description: string;
  stops: RouteStop[];
  weekdaySchedule: string[];
  saturdaySchedule: string[];
  fare: string;
  duration: string;
  totalStops: number;
}

export const TRANSPORT_ROUTES: Route[] = [
  {
    id: 'route-a',
    name: 'UdD Campus Loop – Route A',
    shortName: 'Route A',
    color: '#f97316',
    accentColor: '#ea580c',
    description: 'Main campus circular route covering the gate, library, colleges, and canteen.',
    stops: [
      { name: 'Main Gate', lat: 16.04345, lng: 120.33739, isTerminal: true, landmark: 'University Main Entrance' },
      { name: 'Admin Building', lat: 16.04380, lng: 120.33760, landmark: 'Registrar & Finance' },
      { name: 'Library', lat: 16.04412, lng: 120.33790, landmark: '3rd Floor — Main Library' },
      { name: 'Engineering Bldg', lat: 16.04440, lng: 120.33820, landmark: 'College of Engineering' },
      { name: 'Canteen Area', lat: 16.04460, lng: 120.33840, landmark: 'Student Canteen' },
      { name: 'Student Affairs', lat: 16.04450, lng: 120.33870, landmark: 'Building F' },
      { name: 'IT / CS Department', lat: 16.04430, lng: 120.33900, landmark: 'BSCS / BSIT Building' },
      { name: 'Main Gate', lat: 16.04345, lng: 120.33739, isTerminal: true, landmark: 'Back to Entrance' },
    ],
    weekdaySchedule: [
      '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
      '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
      '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
      '4:30 PM', '5:00 PM', '5:30 PM',
    ],
    saturdaySchedule: [
      '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    ],
    fare: 'Free for UdD Students',
    duration: '~15 min',
    totalStops: 7,
  },
  {
    id: 'route-b',
    name: 'UdD to Dagupan Downtown – Route B',
    shortName: 'Route B',
    color: '#8b5cf6',
    accentColor: '#7c3aed',
    description: 'Extended route connecting the university to key downtown Dagupan areas.',
    stops: [
      { name: 'Main Gate', lat: 16.04345, lng: 120.33739, isTerminal: true, landmark: 'University Departure' },
      { name: 'Perez Blvd', lat: 16.04200, lng: 120.33600, landmark: 'Boulevard / SM Dagupan' },
      { name: 'Magsaysay Market', lat: 16.04050, lng: 120.33450, landmark: 'Public Market' },
      { name: 'Dagupan City Hall', lat: 16.03900, lng: 120.33300, landmark: 'City Government Center' },
      { name: 'Tapuac District', lat: 16.03750, lng: 120.33150, landmark: 'Commercial District' },
    ],
    weekdaySchedule: [
      '7:00 AM', '8:30 AM', '10:00 AM', '11:30 AM',
      '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM',
    ],
    saturdaySchedule: [
      '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM',
    ],
    fare: '₱10 per ride',
    duration: '~25 min',
    totalStops: 5,
  },
];

export const RIDER_TIPS = [
  { icon: '🪪', tip: 'Present your valid school ID when boarding.' },
  { icon: '📍', tip: 'Wait at designated stops only — do not flag down mid-road.' },
  { icon: '🧳', tip: 'Maximum 25 passengers per trip. Stand clear if full.' },
  { icon: '📵', tip: 'Keep your phone secured. Watch your belongings.' },
  { icon: '🤝', tip: 'Give priority seats to PWDs, pregnant, and elderly passengers.' },
  { icon: '⏰', tip: 'Last trip is at 5:30 PM on weekdays.' },
];

export const HOW_TO_RIDE_STEPS = [
  {
    step: 1,
    title: 'Check the Schedule',
    description: 'View the timetable in the Schedules tab or use the SakayUDD live tracker to see the next departure time from your stop.',
    icon: '📋',
  },
  {
    step: 2,
    title: 'Go to Your Stop',
    description: 'Head to your nearest designated stop. All stops are marked with blue signage. Wait inside the designated waiting area.',
    icon: '📍',
  },
  {
    step: 3,
    title: 'Board the E-Jeepney',
    description: 'Show your valid UdD student ID to the driver or conductor. Students ride for free on Route A. Route B costs ₱10.',
    icon: '🚌',
  },
  {
    step: 4,
    title: 'Track in Real-Time',
    description: 'Use the Live Tracker tab or download the SakayUDD app to see the e-jeep\'s live location and estimated arrival.',
    icon: '📡',
  },
  {
    step: 5,
    title: 'Alight at Your Stop',
    description: 'Signal the driver in advance by saying "Para po!" Alight only at designated stops for your safety.',
    icon: '✅',
  },
];

export const EMERGENCY_CONTACTS = [
  { label: 'Transport Office', number: '(075) 515-0822', icon: '🏫' },
  { label: 'Security / Guard', number: '0917-123-4567', icon: '🛡️' },
  { label: 'SakayUDD Hotline', number: '0918-000-1234', icon: '🚌' },
];

/**
 * Returns the next scheduled departure relative to now.
 */
export function getNextDeparture(route: Route): string | null {
  const now = new Date();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const schedule = isWeekday ? route.weekdaySchedule : route.saturdaySchedule;

  for (const time of schedule) {
    const [hourMin, ampm] = time.split(' ');
    let [h, m] = hourMin.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    const departure = new Date(now);
    departure.setHours(h, m, 0, 0);

    if (departure > now) return time;
  }
  return null; // No more trips today
}

/**
 * Returns how many minutes until the next departure.
 */
export function getMinutesUntilNext(route: Route): number | null {
  const nextStr = getNextDeparture(route);
  if (!nextStr) return null;

  const now = new Date();
  const [hourMin, ampm] = nextStr.split(' ');
  let [h, m] = hourMin.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  const departure = new Date(now);
  departure.setHours(h, m, 0, 0);

  return Math.round((departure.getTime() - now.getTime()) / 60000);
}
