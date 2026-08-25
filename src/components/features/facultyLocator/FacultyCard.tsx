import React from 'react';
import type { Faculty } from './facultyData';
import { getInitials } from './facultyData';

interface Props {
  faculty: Faculty;
  onClick: (id: string) => void;
  /** Visual variant: 'org-head' for dean/program chair nodes, 'org-leaf' for subordinates, 'directory' for list view */
  variant?: 'org-head' | 'org-leaf' | 'directory';
}

export default function FacultyCard({ faculty, onClick, variant = 'directory' }: Props) {
  // ── Org-chart HEAD node (Dean / Program Chair) ────────────────────────────
  if (variant === 'org-head') {
    const isTopLevel = faculty.supervisorId === null; // Dean
    return (
      <div
        onClick={() => onClick(faculty.id)}
        className="relative z-10 border rounded-xl shadow-md flex flex-col items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform hover:shadow-lg"
        style={{
          background: '#f8f9fa',
          borderColor: '#c3c6d1',
          padding: isTopLevel ? '1rem' : '1rem',
          width: isTopLevel ? 288 : 256,
        }}
      >
        {/* Photo or initials */}
        {faculty.photo ? (
          <img
            src={faculty.photo}
            alt={faculty.name}
            className="rounded-full object-cover border-solid"
            style={{
              width: isTopLevel ? 96 : 80,
              height: isTopLevel ? 96 : 80,
              borderWidth: isTopLevel ? 4 : 2,
              borderColor: isTopLevel ? '#f8f9fa' : '#c3c6d1',
              boxShadow: isTopLevel ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center font-semibold"
            style={{
              width: isTopLevel ? 96 : 80,
              height: isTopLevel ? 96 : 80,
              background: '#dfe0e0',
              color: '#43474f',
              fontSize: isTopLevel ? 24 : 20,
              lineHeight: isTopLevel ? '32px' : '28px',
              borderWidth: 2,
              borderColor: '#c3c6d1',
              borderStyle: 'solid',
            }}
          >
            {getInitials(faculty.name)}
          </div>
        )}

        {/* Text */}
        <div className="text-center">
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: isTopLevel ? 24 : 18,
              lineHeight: isTopLevel ? '32px' : '24px',
              fontWeight: 600,
              color: '#191c1d',
            }}
          >
            {faculty.name}
          </h3>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: isTopLevel ? 18 : 16,
              lineHeight: isTopLevel ? '24px' : '20px',
              fontWeight: 600,
              color: '#001e40',
              marginTop: 2,
            }}
          >
            {faculty.position}{faculty.school && !faculty.program ? `, ${faculty.school}` : ''}
          </p>
          {faculty.program && (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                lineHeight: '20px',
                fontWeight: 500,
                color: '#5d5f5f',
                marginTop: 4,
              }}
            >
              {faculty.program}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Org-chart LEAF node (subordinate faculty) ─────────────────────────────
  if (variant === 'org-leaf') {
    return (
      <div
        onClick={() => onClick(faculty.id)}
        className="border rounded-lg p-3 w-64 flex items-center gap-3 cursor-pointer hover:shadow-sm active:scale-[0.98] transition-all"
        style={{
          background: '#f8f9fa',
          borderColor: '#c3c6d1',
        }}
      >
        {/* Avatar */}
        {faculty.photo ? (
          <img
            src={faculty.photo}
            alt={faculty.name}
            className="w-12 h-12 rounded-full object-cover"
            style={{ borderWidth: 1, borderColor: '#c3c6d1', borderStyle: 'solid' }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: '#dfe0e0',
              color: '#43474f',
              fontFamily: 'Inter, sans-serif',
              fontSize: 18,
              lineHeight: '24px',
              fontWeight: 600,
            }}
          >
            {getInitials(faculty.name)}
          </div>
        )}

        <div className="flex flex-col">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 18,
              lineHeight: '24px',
              fontWeight: 600,
              color: '#191c1d',
            }}
          >
            {faculty.name}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              lineHeight: '20px',
              fontWeight: 500,
              color: '#43474f',
            }}
          >
            {faculty.position}
          </span>
        </div>
      </div>
    );
  }

  // ── Directory card (default) ──────────────────────────────────────────────
  return (
    <div
      onClick={() => onClick(faculty.id)}
      className="border rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all group"
      style={{
        background: '#ffffff',
        borderColor: '#c3c6d1',
        boxShadow: '0 2px 8px rgba(0,30,64,0.06)',
      }}
    >
      {/* Avatar */}
      {faculty.photo ? (
        <img
          src={faculty.photo}
          alt={faculty.name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          style={{ borderWidth: 2, borderColor: '#c3c6d1', borderStyle: 'solid' }}
        />
      ) : (
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: '#d5e3ff',
            color: '#001e40',
            fontFamily: 'Inter, sans-serif',
            fontSize: 18,
            lineHeight: '24px',
            fontWeight: 600,
          }}
        >
          {getInitials(faculty.name)}
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3
          className="truncate"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 18,
            lineHeight: '24px',
            fontWeight: 600,
            color: '#191c1d',
          }}
        >
          {faculty.name}
        </h3>
        <p
          className="truncate"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            lineHeight: '20px',
            fontWeight: 500,
            color: '#001e40',
          }}
        >
          {faculty.position}
        </p>
        {faculty.program && (
          <p
            className="truncate"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              lineHeight: '18px',
              fontWeight: 500,
              color: '#5d5f5f',
              marginTop: 2,
            }}
          >
            {faculty.program}
          </p>
        )}
      </div>

      {/* Chevron */}
      <span className="material-symbols-outlined flex-shrink-0" style={{ color: '#001e40', fontSize: 20 }}>
        arrow_forward
      </span>
    </div>
  );
}
