/**
 * dummyExamData.ts
 *
 * Fallback exam schedule data shown when no real Firestore exam data
 * is available for the current student profile.
 * All data is fictional and for demonstration purposes only.
 */

export interface DummyExam {
  id: string;
  subject: string;
  date: { seconds: number }; // Mimic Firestore Timestamp shape
  room: string;
  proctor: string;
  building: string;
}

// Helper to get a future date's unix timestamp (seconds)
function futureDate(daysFromNow: number, hour: number, minute: number): { seconds: number } {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return { seconds: Math.floor(d.getTime() / 1000) };
}

export const DUMMY_EXAMS: DummyExam[] = [
  {
    id: 'exam-dummy-1',
    subject: 'CS301 — Software Engineering',
    date: futureDate(3, 8, 0),
    room: 'Room 302',
    proctor: 'Prof. Maria Santos',
    building: 'Main Building',
  },
  {
    id: 'exam-dummy-2',
    subject: 'CS302 — Algorithm Design & Analysis',
    date: futureDate(5, 10, 0),
    room: 'Room 105',
    proctor: 'Prof. Eduardo Reyes',
    building: 'Engineering Building',
  },
  {
    id: 'exam-dummy-3',
    subject: 'IT303 — Database Management Systems',
    date: futureDate(7, 13, 0),
    room: 'Computer Lab 2',
    proctor: 'Prof. Lourdes Bautista',
    building: 'IT Building',
  },
  {
    id: 'exam-dummy-4',
    subject: 'CS304 — Computer Networks',
    date: futureDate(9, 8, 0),
    room: 'Room 204',
    proctor: 'Prof. Ramon Garcia',
    building: 'Main Building',
  },
  {
    id: 'exam-dummy-5',
    subject: 'GE101 — Ethics & Social Responsibility',
    date: futureDate(11, 15, 0),
    room: 'Lecture Hall A',
    proctor: 'Prof. Ana Villanueva',
    building: 'Social Sciences Building',
  },
];
