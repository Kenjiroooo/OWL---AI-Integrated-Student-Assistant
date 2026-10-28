import React from 'react';
import {
  getFacultyBySchool,
  getFacultyStatusMeta,
  type Faculty,
  type FacultyStatus,
} from './facultyData';
import FacultyCard from './FacultyCard';

interface Props {
  schoolName: string;
  searchQuery: string;
  statusFilter?: FacultyStatus | 'all';
  onSelectFaculty: (id: string) => void;
}

export default function FacultyDirectory({
  schoolName,
  searchQuery,
  statusFilter = 'all',
  onSelectFaculty,
}: Props) {
  const allFaculty = getFacultyBySchool(schoolName);

  // Filter within the school by status and search query
  const filtered = allFaculty.filter((f) => {
    const statusMatch =
      statusFilter === 'all' || (f.status || 'available') === statusFilter;
    if (!statusMatch) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const statusLabel = getFacultyStatusMeta(f.status).label.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.position.toLowerCase().includes(q) ||
      statusLabel.includes(q) ||
      (f.roleCategory?.toLowerCase().includes(q)) ||
      (f.program?.toLowerCase().includes(q)) ||
      (f.specialization?.some((s) => s.toLowerCase().includes(q))) ||
      (f.email?.toLowerCase().includes(q))
    );
  });

  // Sort: Dean first, then Program Head / Chairs, then Faculty Members in verified order
  const sorted = [...filtered].sort((a, b) => {
    const rank = (f: Faculty) => {
      if (f.hierarchyLevel) return f.hierarchyLevel;
      if (f.supervisorId === null) return 1;
      if (f.position.toLowerCase().includes('chair') || f.position.toLowerCase().includes('head')) return 2;
      return 3;
    };
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return allFaculty.indexOf(a) - allFaculty.indexOf(b);
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
            Try another name, position, or status filter.
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
