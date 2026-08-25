import React from 'react';
import { getFacultyBySchool, type Faculty } from './facultyData';
import FacultyCard from './FacultyCard';

interface Props {
  schoolName: string;
  searchQuery: string;
  onSelectFaculty: (id: string) => void;
}

export default function FacultyDirectory({ schoolName, searchQuery, onSelectFaculty }: Props) {
  const allFaculty = getFacultyBySchool(schoolName);

  // Filter within the school if there's a search query
  const filtered = searchQuery.trim()
    ? allFaculty.filter((f) => {
        const q = searchQuery.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.position.toLowerCase().includes(q) ||
          (f.program?.toLowerCase().includes(q)) ||
          (f.specialization?.some((s) => s.toLowerCase().includes(q))) ||
          (f.email?.toLowerCase().includes(q))
        );
      })
    : allFaculty;

  // Sort: Dean first, then Program Chairs, then others
  const sorted = [...filtered].sort((a, b) => {
    const rank = (f: Faculty) => {
      if (f.supervisorId === null) return 0; // Dean
      if (f.position.toLowerCase().includes('chair') || f.position.toLowerCase().includes('head')) return 1;
      return 2;
    };
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#c3c6d1' }}>
            person_search
          </span>
          <p style={{ fontSize: 20, fontWeight: 600, color: '#191c1d', marginTop: 16 }}>
            No faculty members found
          </p>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#43474f', marginTop: 4 }}>
            Try another name, position, or specialization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' as any }}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
        {sorted.map((faculty) => (
          <div key={faculty.id}>
            <FacultyCard
              faculty={faculty}
              onClick={onSelectFaculty}
              variant="directory"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
