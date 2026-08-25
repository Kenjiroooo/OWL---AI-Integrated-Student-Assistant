import React, { useState } from 'react';
import { getSchoolDean, getFacultyBySchool, SCHOOLS } from './facultyData';
import OrganizationChart from './OrganizationChart';
import FacultyDirectory from './FacultyDirectory';

interface Props {
  schoolName: string;
  onBack: () => void;
  onSelectFaculty: (id: string) => void;
}

export default function SchoolFacultyPage({ schoolName, onBack, onSelectFaculty }: Props) {
  const [viewMode, setViewMode] = useState<'organization' | 'directory'>('organization');
  const [directorySearch, setDirectorySearch] = useState('');

  const dean = getSchoolDean(schoolName);
  const facultyCount = getFacultyBySchool(schoolName).length;
  const school = SCHOOLS.find((s) => s.name === schoolName);

  return (
    <div className="flex flex-col h-full" style={{ background: '#f8f9fa' }}>
      {/* ── Header Section ───────────────────────────────────────────── */}
      <section
        className="px-10 py-8 flex flex-col gap-4 relative z-10"
        style={{
          background: '#f8f9fa',
          borderBottom: '1px solid #c3c6d1',
        }}
      >
        {/* Back + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-12 h-12 rounded-full active:scale-95 transition-all"
            style={{ color: '#43474f', background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#edeeef'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col gap-1">
            <h1
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 48,
                lineHeight: '56px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#191c1d',
              }}
            >
              {schoolName}
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 20,
                lineHeight: '30px',
                fontWeight: 400,
                color: '#43474f',
              }}
            >
              Providing excellence in education and research.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-2">
          {dean && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: '#f3f4f5', border: '1px solid #c3c6d1' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#001e40' }}>school</span>
              <div className="flex flex-col">
                <span style={{ fontSize: 16, fontWeight: 500, color: '#43474f' }}>Dean / School Head</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#191c1d' }}>{dean.name}</span>
              </div>
            </div>
          )}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: '#f3f4f5', border: '1px solid #c3c6d1' }}
          >
            <span className="material-symbols-outlined" style={{ color: '#001e40' }}>groups</span>
            <div className="flex flex-col">
              <span style={{ fontSize: 16, fontWeight: 500, color: '#43474f' }}>Faculty Count</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#191c1d' }}>{facultyCount} Members</span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div
          className="flex rounded-lg p-1 w-fit mt-4"
          style={{ background: '#f3f4f5', border: '1px solid #c3c6d1' }}
        >
          <button
            onClick={() => setViewMode('organization')}
            className="px-8 py-3 rounded-md flex items-center gap-2 active:scale-[0.98] transition-all"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 18,
              lineHeight: '24px',
              fontWeight: 600,
              background: viewMode === 'organization' ? '#003366' : 'transparent',
              color: viewMode === 'organization' ? '#799dd6' : '#43474f',
              boxShadow: viewMode === 'organization' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>account_tree</span>
            Organization Chart
          </button>
          <button
            onClick={() => setViewMode('directory')}
            className="px-8 py-3 rounded-md flex items-center gap-2 active:scale-[0.98] transition-all"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 18,
              lineHeight: '24px',
              fontWeight: 600,
              background: viewMode === 'directory' ? '#003366' : 'transparent',
              color: viewMode === 'directory' ? '#799dd6' : '#43474f',
              boxShadow: viewMode === 'directory' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_search</span>
            Faculty Directory
          </button>
        </div>

        {/* Directory search (only shown in directory mode) */}
        {viewMode === 'directory' && (
          <div className="mt-2 max-w-md">
            <div
              className="relative rounded-lg border transition-all"
              style={{ background: '#ffffff', borderColor: '#c3c6d1' }}
            >
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#43474f' }}>search</span>
              </div>
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Filter faculty..."
                className="w-full h-10 pl-10 pr-4 bg-transparent border-none text-sm font-medium rounded-lg focus:ring-0 focus:outline-none"
                style={{ color: '#191c1d' }}
              />
              {directorySearch && (
                <button
                  onClick={() => setDirectorySearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  style={{ color: '#43474f' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Content Area ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'organization' ? (
          <OrganizationChart
            schoolName={schoolName}
            onSelectFaculty={onSelectFaculty}
          />
        ) : (
          <FacultyDirectory
            schoolName={schoolName}
            searchQuery={directorySearch}
            onSelectFaculty={onSelectFaculty}
          />
        )}
      </div>
    </div>
  );
}
