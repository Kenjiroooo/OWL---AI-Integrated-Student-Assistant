import React, { useState } from 'react';
import {
  getSchoolDean,
  getFacultyBySchool,
  STATUS_META,
  type FacultyStatus,
} from './facultyData';
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
  const [statusFilter, setStatusFilter] = useState<FacultyStatus | 'all'>('all');

  const schoolFaculty = getFacultyBySchool(schoolName);
  const dean = getSchoolDean(schoolName);
  const programHeads = schoolFaculty.filter(
    (f) => f.hierarchyLevel === 2 || (f.supervisorId === dean?.id && f.children && f.children.length > 0),
  );
  const facultyCount = schoolFaculty.length;

  const availableCount = schoolFaculty.filter((f) => (f.status || 'available') === 'available').length;
  const inClassCount = schoolFaculty.filter((f) => f.status === 'in-class').length;
  const onLeaveCount = schoolFaculty.filter((f) => f.status === 'on-leave').length;

  return (
    <div className="flex flex-col h-full" style={{ background: '#f8f9fa' }}>
      {/* ── Header Section ───────────────────────────────────────────── */}
      <section
        className="px-6 md:px-10 py-6 flex flex-col gap-4 relative z-10"
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
                fontSize: 40,
                lineHeight: '48px',
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
                fontSize: 18,
                lineHeight: '26px',
                fontWeight: 400,
                color: '#43474f',
              }}
            >
              Verified faculty organizational hierarchy, live availability, and schedules.
            </p>
          </div>
        </div>

        {/* Stats + Live Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
          <div className="flex flex-wrap gap-3">
            {dean && (
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-lg"
                style={{ background: '#f3f4f5', border: '1px solid #c3c6d1' }}
              >
                <span className="material-symbols-outlined" style={{ color: '#001e40' }}>school</span>
                <div className="flex flex-col">
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#43474f' }}>Dean</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#191c1d' }}>{dean.name}</span>
                </div>
              </div>
            )}
            {programHeads.length === 1 && (
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-lg"
                style={{ background: '#f3f4f5', border: '1px solid #c3c6d1' }}
              >
                <span className="material-symbols-outlined" style={{ color: '#001e40' }}>badge</span>
                <div className="flex flex-col">
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#43474f' }}>
                    {programHeads[0].position}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#191c1d' }}>
                    {programHeads[0].name}
                  </span>
                </div>
              </div>
            )}
            <div
              className="flex items-center gap-2.5 px-4 py-2 rounded-lg"
              style={{ background: '#f3f4f5', border: '1px solid #c3c6d1' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#001e40' }}>groups</span>
              <div className="flex flex-col">
                <span style={{ fontSize: 12, fontWeight: 600, color: '#43474f' }}>Total Faculty</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#191c1d' }}>{facultyCount} Members</span>
              </div>
            </div>
          </div>

          {/* Live Availability Indicator Legend & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
              style={{
                background: statusFilter === 'all' ? '#001e40' : '#ffffff',
                color: statusFilter === 'all' ? '#ffffff' : '#43474f',
                border: statusFilter === 'all' ? '1.5px solid #001e40' : '1px solid #c3c6d1',
              }}
            >
              All Status ({facultyCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
              style={{
                background: statusFilter === 'available' ? STATUS_META['available'].bgColor : '#ffffff',
                color: STATUS_META['available'].textColor,
                border:
                  statusFilter === 'available'
                    ? `2px solid ${STATUS_META['available'].dotColor}`
                    : `1px solid ${STATUS_META['available'].borderColor}`,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: STATUS_META['available'].dotColor,
                  boxShadow: `0 0 0 3px ${STATUS_META['available'].pulseColor}`,
                }}
              />
              Online / Available ({availableCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'in-class' ? 'all' : 'in-class')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
              style={{
                background: statusFilter === 'in-class' ? STATUS_META['in-class'].bgColor : '#ffffff',
                color: STATUS_META['in-class'].textColor,
                border:
                  statusFilter === 'in-class'
                    ? `2px solid ${STATUS_META['in-class'].dotColor}`
                    : `1px solid ${STATUS_META['in-class'].borderColor}`,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: STATUS_META['in-class'].dotColor }}
              />
              In Class ({inClassCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'on-leave' ? 'all' : 'on-leave')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
              style={{
                background: statusFilter === 'on-leave' ? STATUS_META['on-leave'].bgColor : '#ffffff',
                color: STATUS_META['on-leave'].textColor,
                border:
                  statusFilter === 'on-leave'
                    ? `2px solid ${STATUS_META['on-leave'].dotColor}`
                    : `1px solid ${STATUS_META['on-leave'].borderColor}`,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: STATUS_META['on-leave'].dotColor }}
              />
              On Leave / Absent ({onLeaveCount})
            </button>
          </div>
        </div>

        {/* View Toggle + Search Bar Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
          <div
            className="flex rounded-lg p-1 w-fit"
            style={{ background: '#f3f4f5', border: '1px solid #c3c6d1' }}
          >
            <button
              onClick={() => setViewMode('organization')}
              className="px-6 py-2.5 rounded-md flex items-center gap-2 active:scale-[0.98] transition-all"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                lineHeight: '22px',
                fontWeight: 600,
                background: viewMode === 'organization' ? '#003366' : 'transparent',
                color: viewMode === 'organization' ? '#ffffff' : '#43474f',
                boxShadow: viewMode === 'organization' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>account_tree</span>
              Organization Chart
            </button>
            <button
              onClick={() => setViewMode('directory')}
              className="px-6 py-2.5 rounded-md flex items-center gap-2 active:scale-[0.98] transition-all"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                lineHeight: '22px',
                fontWeight: 600,
                background: viewMode === 'directory' ? '#003366' : 'transparent',
                color: viewMode === 'directory' ? '#ffffff' : '#43474f',
                boxShadow: viewMode === 'directory' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_search</span>
              Faculty Directory
            </button>
          </div>

          {/* Search input available in both Organization Chart & Directory modes */}
          <div className="w-full sm:w-80 md:w-96">
            <div
              className="relative rounded-xl border transition-all"
              style={{ background: '#ffffff', borderColor: directorySearch ? '#001e40' : '#c3c6d1' }}
            >
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#43474f' }}>
                  search
                </span>
              </div>
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search faculty name, role, or status..."
                className="w-full h-11 pl-11 pr-10 bg-transparent border-none text-sm font-medium rounded-xl focus:ring-0 focus:outline-none"
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
        </div>
      </section>

      {/* ── Content Area ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'organization' ? (
          <OrganizationChart
            schoolName={schoolName}
            searchQuery={directorySearch}
            statusFilter={statusFilter}
            onSelectFaculty={onSelectFaculty}
          />
        ) : (
          <FacultyDirectory
            schoolName={schoolName}
            searchQuery={directorySearch}
            statusFilter={statusFilter}
            onSelectFaculty={onSelectFaculty}
          />
        )}
      </div>
    </div>
  );
}
