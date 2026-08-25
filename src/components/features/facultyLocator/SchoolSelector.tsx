import React from 'react';
import { SCHOOLS, getSchoolFacultyCount, searchFaculty, type Faculty } from './facultyData';
import FacultySearch from './FacultySearch';

interface Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onSelectSchool: (schoolName: string) => void;
  onSelectFaculty: (id: string, schoolName: string) => void;
}

export default function SchoolSelector({
  searchQuery,
  onSearchChange,
  onSearchClear,
  onSelectSchool,
  onSelectFaculty,
}: Props) {
  const searchResults = searchFaculty(searchQuery);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
      {/* ── Header Section ───────────────────────────────────────────── */}
      <section className="text-center flex flex-col gap-2 mt-8">
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 48,
            lineHeight: '56px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#001e40',
          }}
        >
          Faculty Locator
        </h1>
        <p
          className="max-w-3xl mx-auto"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 20,
            lineHeight: '30px',
            fontWeight: 400,
            color: '#43474f',
          }}
        >
          Find faculty members, departments, offices, and schedules across Universidad de Dagupan.
        </p>
      </section>

      {/* ── Search Bar ───────────────────────────────────────────────── */}
      <section className="mt-4">
        <FacultySearch
          query={searchQuery}
          onChange={onSearchChange}
          onClear={onSearchClear}
        />
      </section>

      {/* ── Search Results ───────────────────────────────────────────── */}
      {searchQuery.trim() && (
        <section className="w-full max-w-4xl mx-auto">
          {searchResults.length > 0 ? (
            <div className="flex flex-col gap-3">
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 16,
                  fontWeight: 500,
                  color: '#5d5f5f',
                  marginBottom: 4,
                }}
              >
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </p>
              {searchResults.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onSelectFaculty(f.id, f.school)}
                  className="border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all"
                  style={{
                    background: '#ffffff',
                    borderColor: '#c3c6d1',
                    boxShadow: '0 2px 8px rgba(0,30,64,0.06)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#d5e3ff', color: '#001e40', fontWeight: 600, fontSize: 16 }}
                  >
                    {f.name.split(' ').filter(p => !['Dr.','Engr.','Prof.','Arch.','Mr.','Ms.','Mrs.','CPA','Chef','Atty.'].includes(p)).map(p => p[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate" style={{ fontSize: 18, fontWeight: 600, color: '#191c1d' }}>{f.name}</h3>
                    <p className="truncate" style={{ fontSize: 14, fontWeight: 500, color: '#001e40' }}>
                      {f.position} {f.program ? `· ${f.program}` : ''}
                    </p>
                    <p className="truncate" style={{ fontSize: 13, fontWeight: 500, color: '#5d5f5f' }}>{f.school}</p>
                  </div>
                  <span className="material-symbols-outlined flex-shrink-0" style={{ color: '#001e40', fontSize: 20 }}>
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#c3c6d1' }}>
                person_search
              </span>
              <p style={{ fontSize: 20, fontWeight: 600, color: '#191c1d', marginTop: 16 }}>
                No faculty members found
              </p>
              <p style={{ fontSize: 16, fontWeight: 400, color: '#43474f', marginTop: 4 }}>
                Try another name, school, or position.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── Schools Grid (hidden when searching) ─────────────────────── */}
      {!searchQuery.trim() && (
        <section className="w-full mt-4">
          <h2
            className="mb-4"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 24,
              lineHeight: '32px',
              fontWeight: 600,
              color: '#001e40',
            }}
          >
            Colleges &amp; Schools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
            {SCHOOLS.map((school) => {
              const count = getSchoolFacultyCount(school.name);
              return (
                <div
                  key={school.id}
                  onClick={() => onSelectSchool(school.name)}
                  className="rounded-xl p-6 flex flex-col gap-4 cursor-pointer group active:scale-[0.98] transition-all"
                  style={{
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,30,64,0.12)',
                    border: '1px solid #c3c6d1',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#001e40'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#c3c6d1'; }}
                >
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: '#d5e3ff', color: '#001e40' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                      {school.icon}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3
                      className="mb-2 leading-tight"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 24,
                        lineHeight: '32px',
                        fontWeight: 600,
                        color: '#191c1d',
                      }}
                    >
                      {school.name}
                    </h3>
                    <p
                      className="mb-4"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 18,
                        lineHeight: '28px',
                        fontWeight: 400,
                        color: '#43474f',
                      }}
                    >
                      {school.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between mt-auto pt-4"
                    style={{ borderTop: '1px solid #c3c6d1' }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 16,
                        lineHeight: '20px',
                        fontWeight: 500,
                        color: '#5d5f5f',
                      }}
                    >
                      {count} Faculty Member{count !== 1 ? 's' : ''}
                    </span>
                    <div
                      className="flex items-center gap-1"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 18,
                        lineHeight: '24px',
                        fontWeight: 600,
                        color: '#001e40',
                      }}
                    >
                      View Faculty{' '}
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
