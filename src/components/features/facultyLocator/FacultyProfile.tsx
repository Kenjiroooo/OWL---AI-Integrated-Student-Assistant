import React from 'react';
import {
  getFacultyById,
  getInitials,
  getFacultyStatusMeta,
} from './facultyData';

interface Props {
  facultyId: string;
  onBack: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function FacultyProfile({ facultyId, onBack }: Props) {
  const faculty = getFacultyById(facultyId);
  const supervisor = faculty?.supervisorId ? getFacultyById(faculty.supervisorId) : undefined;

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

  const statusMeta = getFacultyStatusMeta(faculty.status);

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
          {/* Photo with Live Status Indicator Dot */}
          <div className="relative flex-shrink-0">
            {faculty.photo ? (
              <img
                src={faculty.photo}
                alt={faculty.name}
                className="w-36 h-36 rounded-2xl object-cover"
                style={{ border: '4px solid #d5e3ff', boxShadow: '0 4px 12px rgba(0,30,64,0.1)' }}
              />
            ) : (
              <div
                className="w-36 h-36 rounded-2xl flex items-center justify-center"
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
            <span
              title={statusMeta.label}
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full"
              style={{
                background: statusMeta.dotColor,
                border: '3px solid #ffffff',
                boxShadow: `0 0 0 4px ${statusMeta.pulseColor}`,
              }}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 flex-1 min-w-0 text-center sm:text-left">
            <div>
              {/* Live Availability Pill + Role Category */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: statusMeta.bgColor,
                    color: statusMeta.textColor,
                    border: `1.5px solid ${statusMeta.borderColor}`,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: statusMeta.dotColor,
                      boxShadow: `0 0 0 3px ${statusMeta.pulseColor}`,
                    }}
                  />
                  {statusMeta.label}
                </span>

                {faculty.roleCategory && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      background: '#edf3ff',
                      color: '#003366',
                      border: '1px solid #b8d1ff',
                    }}
                  >
                    {faculty.roleCategory}
                  </span>
                )}
              </div>

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

              {faculty.statusNote && (
                <p
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: statusMeta.dotColor }}>
                    info
                  </span>
                  {faculty.statusNote}
                </p>
              )}
            </div>

            {/* Quick info chips */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-1">
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

        {/* ── Organizational Placement ────────────────────────────────── */}
        <div
          className="rounded-xl p-6"
          style={{
            background: '#ffffff',
            border: '1px solid #c3c6d1',
            boxShadow: '0 2px 8px rgba(0,30,64,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#001e40' }}>account_tree</span>
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 24,
                lineHeight: '32px',
                fontWeight: 600,
                color: '#191c1d',
              }}
            >
              Organizational Hierarchy
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#5d5f5f' }}>Academic Unit</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: '#191c1d' }}>{faculty.school}</p>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#5d5f5f' }}>Role / Position</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: '#191c1d' }}>{faculty.position}</p>
            </div>
            {supervisor && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#5d5f5f' }}>Reports To</p>
                <p style={{ fontSize: 17, fontWeight: 600, color: '#191c1d' }}>
                  {supervisor.name} ({supervisor.position})
                </p>
              </div>
            )}
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

        {/* ── Schedule Table (Class, Office & Consultation Hours) ────── */}
        {faculty.schedule && Object.keys(faculty.schedule).length > 0 && (
          <div
            className="rounded-xl p-6"
            style={{
              background: '#ffffff',
              border: '1px solid #c3c6d1',
              boxShadow: '0 2px 8px rgba(0,30,64,0.06)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
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
                  Class Schedule, Office &amp; Consultation Hours
                </h2>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: '#edf3ff',
                  color: '#003366',
                  border: '1px solid #b8d1ff',
                }}
              >
                Sample Schedule · Presentation Preview
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #c3c6d1' }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: '#f3f4f5' }}>
                    <th className="px-4 py-3" style={{ fontSize: 15, fontWeight: 700, color: '#191c1d', borderBottom: '1px solid #c3c6d1' }}>
                      Day
                    </th>
                    <th className="px-4 py-3" style={{ fontSize: 15, fontWeight: 700, color: '#191c1d', borderBottom: '1px solid #c3c6d1' }}>
                      Office Hours
                    </th>
                    <th className="px-4 py-3" style={{ fontSize: 15, fontWeight: 700, color: '#191c1d', borderBottom: '1px solid #c3c6d1' }}>
                      Class Schedule
                    </th>
                    <th className="px-4 py-3" style={{ fontSize: 15, fontWeight: 700, color: '#191c1d', borderBottom: '1px solid #c3c6d1' }}>
                      Consultation Hours
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => {
                    const daySchedule = faculty.schedule?.[day];
                    return (
                      <tr key={day} style={{ borderBottom: '1px solid #e7e8e9' }}>
                        <td className="px-4 py-3.5" style={{ fontSize: 15, fontWeight: 600, color: '#191c1d' }}>
                          {day}
                        </td>
                        <td className="px-4 py-3.5" style={{ fontSize: 15, fontWeight: 400, color: daySchedule?.office ? '#191c1d' : '#c3c6d1' }}>
                          {daySchedule?.office || '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          {daySchedule?.classSchedule ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg"
                              style={{ background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa', fontSize: 13, fontWeight: 600 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>co_present</span>
                              {daySchedule.classSchedule}
                            </span>
                          ) : (
                            <span style={{ color: '#c3c6d1', fontSize: 15 }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {daySchedule?.consultation ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                              style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: 13, fontWeight: 600 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>schedule</span>
                              {daySchedule.consultation}
                            </span>
                          ) : (
                            <span style={{ color: '#c3c6d1', fontSize: 15 }}>—</span>
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
