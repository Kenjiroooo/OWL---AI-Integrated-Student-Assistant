import React from 'react';
import {
  getInitials,
  getFacultyStatusMeta,
  type Faculty,
} from './facultyData';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  faculty: Faculty;
  onClick: (id: string) => void;
  /** Visual variant: 'org-head' for dean/program head nodes, 'org-leaf' for subordinates, 'directory' for list view */
  variant?: 'org-head' | 'org-leaf' | 'directory';
  /** Expand/collapse controls for tree nodes with children */
  isExpanded?: boolean;
  onToggleExpand?: (e: React.MouseEvent) => void;
  childCount?: number;
  /** Highlight state when matching search query */
  isHighlighted?: boolean;
}

export default function FacultyCard({
  faculty,
  onClick,
  variant = 'directory',
  isExpanded,
  onToggleExpand,
  childCount = 0,
  isHighlighted = false,
}: Props) {
  const statusMeta = getFacultyStatusMeta(faculty.status);

  // ── Org-chart HEAD node (Dean / Program Head) ─────────────────────────────
  if (variant === 'org-head') {
    const isTopLevel = faculty.supervisorId === null || faculty.hierarchyLevel === 1;

    return (
      <div
        onClick={() => onClick(faculty.id)}
        className="relative z-10 rounded-2xl flex flex-col items-center gap-3 cursor-pointer active:scale-[0.98] transition-all hover:shadow-xl select-none"
        style={{
          background: isTopLevel
            ? 'linear-gradient(180deg, #001e40 0%, #002d5c 100%)'
            : '#ffffff',
          border: isHighlighted
            ? '3px solid #f59e0b'
            : isTopLevel
            ? '2px solid #003366'
            : '2px solid #003366',
          boxShadow: isHighlighted
            ? '0 0 0 4px rgba(245, 158, 11, 0.25), 0 8px 24px rgba(0, 30, 64, 0.18)'
            : isTopLevel
            ? '0 10px 28px rgba(0, 30, 64, 0.22)'
            : '0 6px 20px rgba(0, 30, 64, 0.12)',
          padding: isTopLevel ? '1.35rem 1.5rem 1.2rem' : '1.25rem 1.35rem 1.1rem',
          width: isTopLevel ? 320 : 300,
        }}
      >
        {/* Live Status Pill Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            background: statusMeta.bgColor,
            border: `1px solid ${statusMeta.borderColor}`,
            color: statusMeta.textColor,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: statusMeta.dotColor,
              boxShadow: `0 0 0 3px ${statusMeta.pulseColor}`,
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              lineHeight: '16px',
            }}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* Photo or Initials Avatar with Corner Status Dot */}
        <div className="relative">
          {faculty.photo ? (
            <img
              src={faculty.photo}
              alt={faculty.name}
              className="rounded-full object-cover border-solid"
              style={{
                width: isTopLevel ? 84 : 74,
                height: isTopLevel ? 84 : 74,
                borderWidth: 3,
                borderColor: isTopLevel ? '#799dd6' : '#003366',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              }}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center font-bold"
              style={{
                width: isTopLevel ? 84 : 74,
                height: isTopLevel ? 84 : 74,
                background: isTopLevel ? '#d5e3ff' : '#e6efff',
                color: '#001e40',
                fontSize: isTopLevel ? 25 : 21,
                lineHeight: '30px',
                borderWidth: 3,
                borderColor: isTopLevel ? '#799dd6' : '#003366',
                borderStyle: 'solid',
              }}
            >
              {getInitials(faculty.name)}
            </div>
          )}
          {/* Avatar Status Ring Dot */}
          <span
            title={statusMeta.label}
            className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full"
            style={{
              background: statusMeta.dotColor,
              border: isTopLevel ? '2.5px solid #00254d' : '2.5px solid #ffffff',
            }}
          />
        </div>

        {/* Name & Role Badge */}
        <div className="text-center flex flex-col items-center gap-1.5 w-full">
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: isTopLevel ? 21 : 19,
              lineHeight: '28px',
              fontWeight: 700,
              color: isTopLevel ? '#ffffff' : '#191c1d',
            }}
          >
            {faculty.name}
          </h3>

          <span
            className="inline-flex items-center gap-1.5 px-4 py-1 rounded-lg"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              lineHeight: '20px',
              fontWeight: 700,
              background: isTopLevel ? '#f59e0b' : '#003366',
              color: isTopLevel ? '#001e40' : '#ffffff',
            }}
          >
            {faculty.position}
          </span>

          {faculty.program && (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                lineHeight: '18px',
                fontWeight: 500,
                color: isTopLevel ? '#d5e3ff' : '#5d5f5f',
                marginTop: 2,
              }}
            >
              {faculty.program}
            </p>
          )}
        </div>

        {/* Expand / Collapse Trigger for Touchscreens */}
        {onToggleExpand && childCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(e);
            }}
            className="mt-1 w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm active:scale-95 transition-all"
            style={{
              background: isTopLevel ? 'rgba(255, 255, 255, 0.12)' : '#f3f4f5',
              color: isTopLevel ? '#e2e8f0' : '#001e40',
              border: isTopLevel
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid #c3c6d1',
              minHeight: 42,
            }}
          >
            <span>
              {isExpanded ? 'Hide' : 'Show'} Sub-branch ({childCount})
            </span>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>
    );
  }

  // ── Org-chart LEAF node (Faculty Member) ──────────────────────────────────
  if (variant === 'org-leaf') {
    return (
      <div
        onClick={() => onClick(faculty.id)}
        className="rounded-xl p-3.5 w-full min-w-[250px] max-w-[300px] flex items-center gap-3.5 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all select-none"
        style={{
          background: isHighlighted ? '#fffbeb' : '#ffffff',
          border: isHighlighted ? '2px solid #f59e0b' : '1px solid #c3c6d1',
          boxShadow: isHighlighted
            ? '0 0 0 3px rgba(245, 158, 11, 0.2)'
            : '0 2px 6px rgba(0, 30, 64, 0.06)',
          minHeight: 78,
        }}
      >
        {/* Avatar with Status Dot */}
        <div className="relative flex-shrink-0">
          {faculty.photo ? (
            <img
              src={faculty.photo}
              alt={faculty.name}
              className="w-12 h-12 rounded-full object-cover"
              style={{ borderWidth: 2, borderColor: '#003366', borderStyle: 'solid' }}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: '#d5e3ff',
                color: '#001e40',
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                lineHeight: '20px',
                fontWeight: 700,
                border: '1px solid #b8d1ff',
              }}
            >
              {getInitials(faculty.name)}
            </div>
          )}
          <span
            title={statusMeta.label}
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
            style={{
              background: statusMeta.dotColor,
              border: '2px solid #ffffff',
              boxShadow: `0 0 0 2px ${statusMeta.pulseColor}`,
            }}
          />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="leading-snug"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              lineHeight: '20px',
              fontWeight: 600,
              color: '#191c1d',
            }}
          >
            {faculty.name}
          </span>
          <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                lineHeight: '16px',
                fontWeight: 600,
                color: '#43474f',
              }}
            >
              {faculty.position}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{
                background: statusMeta.bgColor,
                border: `1px solid ${statusMeta.borderColor}`,
                color: statusMeta.textColor,
                fontSize: 11,
                fontWeight: 700,
                lineHeight: '14px',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: statusMeta.dotColor }}
              />
              {statusMeta.shortLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Directory card (default) ──────────────────────────────────────────────
  const isLeader =
    faculty.supervisorId === null ||
    faculty.hierarchyLevel === 1 ||
    faculty.hierarchyLevel === 2 ||
    faculty.position.toLowerCase().includes('dean') ||
    faculty.position.toLowerCase().includes('head') ||
    faculty.position.toLowerCase().includes('chair');

  return (
    <div
      onClick={() => onClick(faculty.id)}
      className="border rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all group"
      style={{
        background: '#ffffff',
        borderColor: isLeader ? '#003366' : '#c3c6d1',
        borderWidth: isLeader ? 2 : 1,
        boxShadow: '0 2px 8px rgba(0,30,64,0.06)',
      }}
    >
      {/* Avatar with Status Dot */}
      <div className="relative flex-shrink-0">
        {faculty.photo ? (
          <img
            src={faculty.photo}
            alt={faculty.name}
            className="w-14 h-14 rounded-full object-cover"
            style={{ borderWidth: 2, borderColor: '#c3c6d1', borderStyle: 'solid' }}
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: isLeader ? '#001e40' : '#d5e3ff',
              color: isLeader ? '#ffffff' : '#001e40',
              fontFamily: 'Inter, sans-serif',
              fontSize: 18,
              lineHeight: '24px',
              fontWeight: 700,
            }}
          >
            {getInitials(faculty.name)}
          </div>
        )}
        <span
          title={statusMeta.label}
          className="absolute bottom-0 right-0 w-4 h-4 rounded-full"
          style={{
            background: statusMeta.dotColor,
            border: '2.5px solid #ffffff',
            boxShadow: `0 0 0 2px ${statusMeta.pulseColor}`,
          }}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
            style={{
              background: statusMeta.bgColor,
              border: `1px solid ${statusMeta.borderColor}`,
              color: statusMeta.textColor,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: statusMeta.dotColor }}
            />
            {statusMeta.label}
          </span>
        </div>
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
            fontSize: 15,
            lineHeight: '20px',
            fontWeight: 600,
            color: '#001e40',
          }}
        >
          {faculty.position}
        </p>
        {faculty.statusNote && (
          <p
            className="truncate"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              lineHeight: '18px',
              fontWeight: 500,
              color: '#5d5f5f',
              marginTop: 2,
            }}
          >
            {faculty.statusNote}
          </p>
        )}
      </div>

      {/* Chevron */}
      <ArrowRight className="flex-shrink-0" size={20} color="#001e40" />
    </div>
  );
}
