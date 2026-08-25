import React from 'react';
import { getFacultyById, getInitials, type Faculty } from './facultyData';

interface Props {
  facultyId: string;
  onBack: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function FacultyProfile({ facultyId, onBack }: Props) {
  const faculty = getFacultyById(facultyId);

  if (!faculty) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#c3c6d1' }}>
            person_off
          </span>
          <p style={{ fontSize: 20, fontWeight: 600, color: '#191c1d', marginTop: 16 }}>
            Faculty information is currently unavailable.
          </p>
          <button
            onClick={onBack}
            className="mt-6 px-6 py-3 rounded-lg active:scale-95 transition-all"
            style={{
              background: '#003366',
              color: '#799dd6',
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: '#f8f9fa', scrollbarWidth: 'none', msOverflowStyle: 'none' as any }}
    >
      <div className="max-w-4xl mx-auto px-10 py-8 pb-24 flex flex-col gap-8">
        {/* ── Back button ─────────────────────────────────────────────── */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 w-fit rounded-full px-4 py-2 active:scale-95 transition-all"
          style={{ color: '#43474f', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#edeeef'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Back</span>
        </button>

        {/* ── Profile Header ──────────────────────────────────────────── */}
        <div
          className="rounded-xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8"
          style={{
            background: '#ffffff',
            border: '1px solid #c3c6d1',
            boxShadow: '0 4px 12px rgba(0,30,64,0.12)',
          }}
        >
          {/* Photo */}
          {faculty.photo ? (
            <img
              src={faculty.photo}
              alt={faculty.name}
              className="w-36 h-36 rounded-2xl object-cover flex-shrink-0"
              style={{ border: '4px solid #d5e3ff', boxShadow: '0 4px 12px rgba(0,30,64,0.1)' }}
            />
          ) : (
            <div
              className="w-36 h-36 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: '#d5e3ff',
                color: '#001e40',
                fontSize: 36,
                fontWeight: 700,
                border: '4px solid #d5e3ff',
              }}
            >
              {getInitials(faculty.name)}
            </div>
          )}

          {/* Info */}
          <div className="flex flex-col gap-3 flex-1 min-w-0 text-center sm:text-left">
            <div>
              <h1
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 32,
                  lineHeight: '40px',
                  fontWeight: 600,
                  color: '#191c1d',
                }}
              >
                {faculty.name}
              </h1>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 18,
                  lineHeight: '24px',
                  fontWeight: 600,
                  color: '#001e40',
                  marginTop: 4,
                }}
              >
                {faculty.position}
                {faculty.program ? ` · ${faculty.program}` : ''}
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 16,
                  lineHeight: '20px',
                  fontWeight: 500,
                  color: '#5d5f5f',
                  marginTop: 2,
                }}
              >
                {faculty.school}
              </p>
            </div>

            {/* Quick info chips */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
              {faculty.email && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: '#f3f4f5', border: '1px solid #c3c6d1' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#001e40' }}>mail</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#191c1d' }}>{faculty.email}</span>
                </div>
              )}
              {faculty.contactNumber && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: '#f3f4f5', border: '1px solid #c3c6d1' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#001e40' }}>phone</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#191c1d' }}>{faculty.contactNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Office Location ─────────────────────────────────────────── */}
        {faculty.office && (
          <div
            className="rounded-xl p-6"
            style={{
              background: '#ffffff',
              border: '1px solid #c3c6d1',
              boxShadow: '0 2px 8px rgba(0,30,64,0.06)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#001e40' }}>location_on</span>
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 24,
                  lineHeight: '32px',
                  fontWeight: 600,
                  color: '#191c1d',
                }}
              >
                Office Location
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {faculty.office.building && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5d5f5f' }}>apartment</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#5d5f5f' }}>Building</p>
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#191c1d' }}>{faculty.office.building}</p>
                  </div>
                </div>
              )}
              {faculty.office.room && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#5d5f5f' }}>meeting_room</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#5d5f5f' }}>Room</p>
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#191c1d' }}>{faculty.office.room}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Specializations ─────────────────────────────────────────── */}
        {faculty.specialization && faculty.specialization.length > 0 && (
          <div
            className="rounded-xl p-6"
            style={{
              background: '#ffffff',
              border: '1px solid #c3c6d1',
              boxShadow: '0 2px 8px rgba(0,30,64,0.06)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#001e40' }}>auto_awesome</span>
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 24,
                  lineHeight: '32px',
                  fontWeight: 600,
                  color: '#191c1d',
                }}
              >
                Specializations
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {faculty.specialization.map((spec) => (
                <span
                  key={spec}
                  className="px-4 py-2 rounded-full"
                  style={{
                    background: '#d5e3ff',
                    color: '#001e40',
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Schedule Table ──────────────────────────────────────────── */}
        {faculty.schedule && Object.keys(faculty.schedule).length > 0 && (
          <div
            className="rounded-xl p-6"
            style={{
              background: '#ffffff',
              border: '1px solid #c3c6d1',
              boxShadow: '0 2px 8px rgba(0,30,64,0.06)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#001e40' }}>calendar_month</span>
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 24,
                  lineHeight: '32px',
                  fontWeight: 600,
                  color: '#191c1d',
                }}
              >
                Office Schedule &amp; Consultation Hours
              </h2>
            </div>

            <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #c3c6d1' }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: '#f3f4f5' }}>
                    <th className="px-4 py-3" style={{ fontSize: 16, fontWeight: 600, color: '#191c1d', borderBottom: '1px solid #c3c6d1' }}>
                      Day
                    </th>
                    <th className="px-4 py-3" style={{ fontSize: 16, fontWeight: 600, color: '#191c1d', borderBottom: '1px solid #c3c6d1' }}>
                      Office Hours
                    </th>
                    <th className="px-4 py-3" style={{ fontSize: 16, fontWeight: 600, color: '#191c1d', borderBottom: '1px solid #c3c6d1' }}>
                      Consultation Hours
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => {
                    const daySchedule = faculty.schedule?.[day];
                    return (
                      <tr key={day} style={{ borderBottom: '1px solid #e7e8e9' }}>
                        <td className="px-4 py-3" style={{ fontSize: 16, fontWeight: 600, color: '#191c1d' }}>
                          {day}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 16, fontWeight: 400, color: daySchedule?.office ? '#191c1d' : '#c3c6d1' }}>
                          {daySchedule?.office || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {daySchedule?.consultation ? (
                            <span
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
                              style={{ background: '#d5e3ff', color: '#001e40', fontSize: 14, fontWeight: 500 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                              {daySchedule.consultation}
                            </span>
                          ) : (
                            <span style={{ color: '#c3c6d1', fontSize: 16 }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
