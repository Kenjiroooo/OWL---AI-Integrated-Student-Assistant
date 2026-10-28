import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  getSchoolHierarchy,
  getFacultyBySchool,
  getFacultyStatusMeta,
  SCHOOLS,
  type FacultyNode,
  type FacultyStatus,
  type Faculty,
} from './facultyData';
import FacultyCard from './FacultyCard';
import { ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, Users } from 'lucide-react';

// School logos for the root node
import sitLogo from '../../../assets/site-logo.webp';
import soeLogo from '../../../assets/soe-logo.webp';
import steLogo from '../../../assets/sote-logo.webp';
import sbaLogo from '../../../assets/soba-logo.webp';
import sihmLogo from '../../../assets/hospitality-logo.webp';
import shLogo from '../../../assets/soh-logo.webp';
import shsLogo from '../../../assets/sohs-logo.webp';
import scLogo from '../../../assets/crim-logo.webp';
import spsLogo from '../../../assets/sops-logo.webp';

const SCHOOL_LOGOS: Record<string, string> = {
  sit: sitLogo,
  soe: soeLogo,
  ste: steLogo,
  sba: sbaLogo,
  sihm: sihmLogo,
  sh: shLogo,
  shs: shsLogo,
  sc: scLogo,
  sps: spsLogo,
};

interface Props {
  schoolName: string;
  searchQuery?: string;
  statusFilter?: FacultyStatus | 'all';
  onSelectFaculty: (id: string) => void;
}

export default function OrganizationChart({
  schoolName,
  searchQuery = '',
  statusFilter = 'all',
  onSelectFaculty,
}: Props) {
  const hierarchy = getSchoolHierarchy(schoolName);
  const allSchoolFaculty = getFacultyBySchool(schoolName);
  const schoolMeta = SCHOOLS.find((s) => s.name === schoolName);

  // ── Expand / Collapse State ────────────────────────────────────────────
  const [rootExpanded, setRootExpanded] = useState(true);
  const [deanExpanded, setDeanExpanded] = useState(true);
  const [expandedLevel2, setExpandedLevel2] = useState<Record<string, boolean>>({});
  const [facultyBranchExpanded, setFacultyBranchExpanded] = useState(true);

  // Initialize Level 2 nodes as expanded when school changes
  useEffect(() => {
    setRootExpanded(true);
    setDeanExpanded(true);
    setFacultyBranchExpanded(true);
    if (hierarchy) {
      const initial: Record<string, boolean> = {};
      hierarchy.children.forEach((node) => {
        initial[node.faculty.id] = true;
      });
      setExpandedLevel2(initial);
    }
  }, [schoolName, hierarchy?.faculty.id]);

  // Auto-expand all branches when searching or filtering
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasActiveFilter = Boolean(normalizedQuery) || statusFilter !== 'all';

  useEffect(() => {
    if (hasActiveFilter && hierarchy) {
      setRootExpanded(true);
      setDeanExpanded(true);
      setFacultyBranchExpanded(true);
      const allOpen: Record<string, boolean> = {};
      hierarchy.children.forEach((node) => {
        allOpen[node.faculty.id] = true;
      });
      setExpandedLevel2(allOpen);
    }
  }, [hasActiveFilter, hierarchy]);

  const matchesFaculty = useCallback(
    (f: Faculty) => {
      const statusMatch =
        statusFilter === 'all' || (f.status || 'available') === statusFilter;
      if (!statusMatch) return false;
      if (!normalizedQuery) return statusFilter !== 'all';
      const statusLabel = getFacultyStatusMeta(f.status).label.toLowerCase();
      return (
        f.name.toLowerCase().includes(normalizedQuery) ||
        f.position.toLowerCase().includes(normalizedQuery) ||
        statusLabel.includes(normalizedQuery) ||
        (f.roleCategory?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (f.program?.toLowerCase().includes(normalizedQuery) ?? false)
      );
    },
    [normalizedQuery, statusFilter],
  );

  const toggleLevel2 = (id: string) => {
    setExpandedLevel2((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const expandAll = () => {
    setRootExpanded(true);
    setDeanExpanded(true);
    setFacultyBranchExpanded(true);
    if (hierarchy) {
      const next: Record<string, boolean> = {};
      hierarchy.children.forEach((n) => {
        next[n.faculty.id] = true;
      });
      setExpandedLevel2(next);
    }
  };

  const collapseAll = () => {
    setFacultyBranchExpanded(false);
    if (hierarchy) {
      const next: Record<string, boolean> = {};
      hierarchy.children.forEach((n) => {
        next[n.faculty.id] = false;
      });
      setExpandedLevel2(next);
    }
    setDeanExpanded(false);
  };

  // ── Drag-to-pan state ──────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    const el = containerRef.current;
    if (!el) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.pageX - el.offsetLeft,
      y: e.pageY - el.offsetTop,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const el = containerRef.current;
      if (!el) return;
      const x = e.pageX - el.offsetLeft;
      const y = e.pageY - el.offsetTop;
      el.scrollLeft = dragStart.current.scrollLeft - (x - dragStart.current.x) * 1.5;
      el.scrollTop = dragStart.current.scrollTop - (y - dragStart.current.y) * 1.5;
    },
    [isDragging],
  );

  const stopDrag = useCallback(() => setIsDragging(false), []);

  // ── Zoom state ─────────────────────────────────────────────────────────
  const [scale, setScale] = useState(1);
  const zoomIn = () => setScale((s) => Math.min(s + 0.15, 1.75));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.5));
  const zoomReset = () => setScale(1);

  // ── Render nothing when data missing ───────────────────────────────────
  if (!hierarchy) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#c3c6d1' }}>
            account_tree
          </span>
          <p style={{ fontSize: 18, fontWeight: 500, color: '#43474f', marginTop: 16 }}>
            Organization chart data is currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  const level2Nodes = hierarchy.children;
  const isSingleProgramHeadLayout = level2Nodes.length === 1;

  // ── Render Faculty Members Branch for a given leader ──────────────────
  function renderLevel3FacultyBranch(children: FacultyNode[], parentId: string) {
    if (children.length === 0) return null;

    const visibleChildren = hasActiveFilter
      ? children.filter((c) => matchesFaculty(c.faculty))
      : children;

    const displayList =
      hasActiveFilter && visibleChildren.length > 0 ? visibleChildren : children;

    // Responsive multi-column grid when there are many faculty members (e.g., 16 in SOE)
    if (children.length > 4) {
      return (
        <div className="flex flex-col items-center w-full max-w-6xl">
          {/* Vertical line from Program Head to Faculty Members Branch Header */}
          <div style={{ width: 2, height: 28, background: '#94a3b8' }} />

          {/* Faculty Members Branch Header (Expandable) */}
          <button
            type="button"
            onClick={() => setFacultyBranchExpanded((prev) => !prev)}
            className="px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm active:scale-[0.98] transition-all cursor-pointer select-none"
            style={{
              background: '#f0f5ff',
              border: '2px solid #003366',
              color: '#001e40',
              minHeight: 52,
            }}
          >
            <Users size={20} color="#003366" />
            <div className="text-left">
              <span className="block text-base font-bold text-[#001e40]">
                {schoolName} Faculty Members ({displayList.length})
              </span>
            </div>
            <div
              className="ml-2 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#d5e3ff' }}
            >
              {facultyBranchExpanded ? (
                <ChevronUp size={18} color="#001e40" />
              ) : (
                <ChevronDown size={18} color="#001e40" />
              )}
            </div>
          </button>

          {/* Faculty Members Grid */}
          {facultyBranchExpanded && (
            <>
              <div style={{ width: 2, height: 24, background: '#94a3b8' }} />
              <div
                className="w-full rounded-2xl p-6"
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: 'inset 0 2px 6px rgba(0, 30, 64, 0.04)',
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
                  {displayList.map((child) => {
                    const highlighted = hasActiveFilter && matchesFaculty(child.faculty);
                    return (
                      <div key={child.faculty.id} className="w-full flex justify-center">
                        <FacultyCard
                          faculty={child.faculty}
                          onClick={onSelectFaculty}
                          variant="org-leaf"
                          isHighlighted={highlighted}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // Standard vertical branch for smaller multi-program columns
    return (
      <div key={parentId} className="flex flex-col gap-3 relative mt-1">
        {displayList.map((child, idx) => {
          const highlighted = hasActiveFilter && matchesFaculty(child.faculty);
          return (
            <div key={child.faculty.id} className="flex items-center gap-4 relative">
              <div
                className="absolute"
                style={{
                  left: -20,
                  top: '50%',
                  width: 20,
                  height: 2,
                  background: '#94a3b8',
                }}
              />
              <div
                className="absolute"
                style={{
                  left: -20,
                  top: -16,
                  width: 2,
                  height: idx === displayList.length - 1 ? 'calc(50% + 16px)' : 'calc(100% + 16px)',
                  background: '#94a3b8',
                }}
              />
              <FacultyCard
                faculty={child.faculty}
                onClick={onSelectFaculty}
                variant="org-leaf"
                isHighlighted={highlighted}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden h-full" style={{ background: '#ffffff' }}>
      {/* ── Top-Right Expand / Collapse Controls (Touchscreen Friendly) ── */}
      <div className="absolute top-4 right-6 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={expandAll}
          className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold active:scale-95 transition-all shadow-sm"
          style={{
            background: '#f8f9fa',
            border: '1px solid #c3c6d1',
            color: '#001e40',
            minHeight: 44,
          }}
        >
          <ChevronsUpDown size={16} />
          Expand All
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold active:scale-95 transition-all shadow-sm"
          style={{
            background: '#f8f9fa',
            border: '1px solid #c3c6d1',
            color: '#43474f',
            minHeight: 44,
          }}
        >
          <ChevronsDownUp size={16} />
          Collapse All
        </button>
      </div>

      {/* ── Zoom Controls (Floating Bottom-Right) ─────────────────────── */}
      <div
        className="absolute bottom-6 right-6 flex flex-col gap-0 z-30 rounded-xl overflow-hidden"
        style={{
          background: '#f8f9fa',
          boxShadow: '0 4px 12px rgba(0,30,64,0.15)',
          border: '1px solid #c3c6d1',
        }}
      >
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="w-14 h-14 flex items-center justify-center hover:bg-[#e1e3e4] active:bg-[#dfe0e0] active:scale-95 transition-all"
          style={{ color: '#191c1d' }}
        >
          <span className="material-symbols-outlined">add</span>
        </button>
        <div style={{ width: '100%', height: 1, background: '#c3c6d1' }} />
        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="w-14 h-14 flex items-center justify-center hover:bg-[#e1e3e4] active:bg-[#dfe0e0] active:scale-95 transition-all"
          style={{ color: '#191c1d' }}
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
        <div style={{ width: '100%', height: 1, background: '#c3c6d1' }} />
        <button
          onClick={zoomReset}
          title="Reset Zoom"
          className="w-14 h-14 flex items-center justify-center hover:bg-[#e1e3e4] active:bg-[#dfe0e0] active:scale-95 transition-all"
          style={{ color: '#191c1d' }}
        >
          <span className="material-symbols-outlined">center_focus_strong</span>
        </button>
      </div>

      {/* ── Scrollable + Pannable Tree Canvas ─────────────────────────── */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-auto px-6 md:px-10 py-8 flex flex-col items-center touch-pan-x touch-pan-y"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div
          className="w-full max-w-6xl pb-32 flex flex-col items-center relative pt-4"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
        >
          {/* ══════════════════════════════════════════════════════════════
              ROOT NODE: School (e.g. School of Engineering)
             ══════════════════════════════════════════════════════════════ */}
          <button
            type="button"
            onClick={() => setRootExpanded((prev) => !prev)}
            className="rounded-2xl px-6 py-4 flex items-center gap-4 shadow-md active:scale-[0.98] transition-all cursor-pointer select-none"
            style={{
              background: '#ffffff',
              border: '2px solid #001e40',
              boxShadow: '0 6px 18px rgba(0, 30, 64, 0.12)',
              minWidth: 320,
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ background: '#edf1f8', border: '1px solid #c3c6d1' }}
            >
              {schoolMeta && SCHOOL_LOGOS[schoolMeta.id] ? (
                <img
                  src={SCHOOL_LOGOS[schoolMeta.id]}
                  alt={schoolName}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#001e40' }}>
                  {schoolMeta?.icon || 'account_balance'}
                </span>
              )}
            </div>

            <div className="flex-1 text-left">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#003366]">
                Academic Unit
              </span>
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 22,
                  lineHeight: '28px',
                  fontWeight: 700,
                  color: '#001e40',
                }}
              >
                {schoolName}
              </h2>
              <span className="text-xs font-medium text-[#43474f]">
                {allSchoolFaculty.length} Confirmed Faculty Members
              </span>
            </div>

            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#edf3ff', color: '#001e40' }}
            >
              {rootExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {/* ══════════════════════════════════════════════════════════════
              School Leadership (Dean)
             ══════════════════════════════════════════════════════════════ */}
          {rootExpanded && (
            <>
              <div style={{ width: 2, height: 28, background: '#003366' }} />

              <FacultyCard
                faculty={hierarchy.faculty}
                onClick={onSelectFaculty}
                variant="org-head"
                isExpanded={deanExpanded}
                onToggleExpand={() => setDeanExpanded((prev) => !prev)}
                childCount={level2Nodes.length}
                isHighlighted={hasActiveFilter && matchesFaculty(hierarchy.faculty)}
              />

              {/* ══════════════════════════════════════════════════════════
                  Program Leadership (Program Head / Chairs)
                 ══════════════════════════════════════════════════════════ */}
              {deanExpanded && level2Nodes.length > 0 && (
                <>
                  <div style={{ width: 2, height: 28, background: '#003366' }} />

                  {/* Horizontal spread bar when multiple Program Heads exist */}
                  {level2Nodes.length > 1 && (
                    <div
                      className="relative"
                      style={{
                        width: Math.max(level2Nodes.length * 340 - 80, 400),
                        height: 2,
                        background: '#94a3b8',
                      }}
                    >
                      {level2Nodes.map((_, idx) => {
                        const count = level2Nodes.length;
                        const leftPercent =
                          count === 1 ? '50%' : `${(idx / (count - 1)) * 100}%`;
                        return (
                          <div
                            key={idx}
                            className="absolute"
                            style={{
                              left: leftPercent,
                              top: 0,
                              width: 2,
                              height: 28,
                              background: '#94a3b8',
                              transform: 'translateX(-50%)',
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Program Leadership Nodes Container */}
                  <div
                    className={`flex ${
                      isSingleProgramHeadLayout ? 'w-full justify-center' : 'gap-16 mt-7'
                    } relative z-10 justify-center`}
                  >
                    {level2Nodes.map((programHead) => {
                      const isL2Expanded = expandedLevel2[programHead.faculty.id] ?? true;
                      return (
                        <div
                          key={programHead.faculty.id}
                          className="flex flex-col items-center w-full"
                        >
                          <FacultyCard
                            faculty={programHead.faculty}
                            onClick={onSelectFaculty}
                            variant="org-head"
                            isExpanded={isL2Expanded}
                            onToggleExpand={() => toggleLevel2(programHead.faculty.id)}
                            childCount={programHead.children.length}
                            isHighlighted={hasActiveFilter && matchesFaculty(programHead.faculty)}
                          />

                          {/* ══════════════════════════════════════════════
                              Faculty Members
                             ══════════════════════════════════════════════ */}
                          {isL2Expanded &&
                            programHead.children.length > 0 &&
                            renderLevel3FacultyBranch(
                              programHead.children,
                              programHead.faculty.id,
                            )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
