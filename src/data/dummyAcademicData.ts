/**
 * dummyAcademicData.ts
 *
 * Self-contained dummy data for the Academic Hub feature.
 * Used in lieu of real student database access.
 * All data is fictional and for demonstration purposes only.
 */

export interface SubjectGrade {
  code: string;
  name: string;
  units: number;
  midterm: number | null;
  final: number | null;
  status: 'passed' | 'at-risk' | 'failed' | 'ongoing';
}

export interface AcademicData {
  studentName: string;
  studentId: string;
  program: string;
  yearLevel: string;
  semester: string;
  academicYear: string;
  gwa: number;
  honorStatus: string;
  completedUnits: number;
  totalUnits: number;
  enrollmentStatus: string;
  enrolledSince?: string;
  grades: SubjectGrade[];
  missingRequirements: string[];
  balance: number;
}

export const DUMMY_ACADEMIC_DATA: AcademicData = {
  studentName: 'Juan Dela Cruz',
  studentId: '23-7687-740',
  program: 'Bachelor of Science in Computer Science',
  yearLevel: '3rd Year',
  semester: '2nd Semester',
  academicYear: 'A.Y. 2025–2026',
  gwa: 1.45,
  honorStatus: "Dean's List — On track for Cum Laude",
  completedUnits: 98,
  totalUnits: 150,
  enrollmentStatus: 'Enrolled',
  enrolledSince: 'June 2022',
  grades: [
    {
      code: 'CS301',
      name: 'Software Engineering',
      units: 3,
      midterm: 1.25,
      final: null,
      status: 'ongoing',
    },
    {
      code: 'CS302',
      name: 'Algorithm Design & Analysis',
      units: 3,
      midterm: 1.5,
      final: null,
      status: 'ongoing',
    },
    {
      code: 'IT303',
      name: 'Database Management Systems',
      units: 3,
      midterm: 1.75,
      final: null,
      status: 'ongoing',
    },
    {
      code: 'CS304',
      name: 'Computer Networks',
      units: 3,
      midterm: 2.75,
      final: null,
      status: 'at-risk',
    },
    {
      code: 'GE101',
      name: 'Ethics & Social Responsibility',
      units: 3,
      midterm: 1.5,
      final: null,
      status: 'ongoing',
    },
  ],
  missingRequirements: ['Good Moral Certificate'],
  balance: 0,
};

/**
 * Returns a color class based on the grade value.
 * UdD uses a 1.0–5.0 scale where 1.0 is the highest.
 */
export function getGradeColorClass(grade: number | null): string {
  if (grade === null) return 'text-slate-400';
  if (grade <= 1.5) return 'text-emerald-600';
  if (grade <= 2.0) return 'text-blue-600';
  if (grade <= 2.5) return 'text-amber-600';
  return 'text-red-600';
}

export function getGradeBadgeClass(grade: number | null): string {
  if (grade === null) return 'bg-slate-100 text-slate-500';
  if (grade <= 1.5) return 'bg-emerald-100 text-emerald-700';
  if (grade <= 2.0) return 'bg-blue-100 text-blue-700';
  if (grade <= 2.5) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

export function getStatusBadge(status: SubjectGrade['status']): { label: string; class: string } {
  switch (status) {
    case 'passed':
      return { label: 'Passed', class: 'bg-emerald-100 text-emerald-700' };
    case 'at-risk':
      return { label: 'At Risk', class: 'bg-red-100 text-red-700' };
    case 'failed':
      return { label: 'Failed', class: 'bg-red-200 text-red-800' };
    case 'ongoing':
    default:
      return { label: 'In Progress', class: 'bg-blue-100 text-blue-700' };
  }
}
