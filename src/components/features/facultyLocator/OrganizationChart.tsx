import React, { useRef, useState, useCallback, useEffect } from 'react';
import { getSchoolHierarchy, type FacultyNode } from './facultyData';
import FacultyCard from './FacultyCard';

interface Props {
  schoolName: string;
  onSelectFaculty: (id: string) => void;
}

export default function OrganizationChart({ schoolName, onSelectFaculty }: Props) {
  const hierarchy = getSchoolHierarchy(schoolName);

  // ── Drag-to-pan state ──────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
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
      el.scrollLeft = dragStart.current.scrollLeft - (x - dragStart.current.x) * 2;
      el.scrollTop = dragStart.current.scrollTop - (y - dragStart.current.y) * 2;
    },
    [isDragging],
  );

  const stopDrag = useCallback(() => setIsDragging(false), []);

  // ── Zoom state ─────────────────────────────────────────────────────────
  const [scale, setScale] = useState(1);
  const zoomIn = () => setScale((s) => Math.min(s + 0.15, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.4));
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

  // ── Render a sub-tree of leaf faculty (level 3 nodes) ──────────────────
  function renderLeafNodes(children: FacultyNode[]) {
    if (children.length === 0) return null;
    return (
      <div className="flex flex-col gap-4 relative">
        {children.map((child, idx) => (
          <div key={child.faculty.id} className="flex items-center gap-4 relative">
            {/* Horizontal connector from left bracket */}
            <div
              className="absolute"
              style={{
                left: -20,
                top: '50%',
                width: 20,
                height: 1,
                background: '#c3c6d1',
              }}
            />
            {/* Vertical bracket line */}
            <div
              className="absolute"
              style={{
                left: -20,
                top: idx === 0 ? -20 : -20,
                width: 1,
                height: idx === children.length - 1 ? 'calc(50% + 20px)' : 'calc(100% + 20px)',
                background: '#c3c6d1',
              }}
            />
            <FacultyCard
              faculty={child.faculty}
              onClick={onSelectFaculty}
              variant="org-leaf"
            />
          </div>
        ))}
      </div>
    );
  }

  // ── Build level-2 columns (Program Chairs) ─────────────────────────────
  const level2Nodes = hierarchy.children;

  return (
    <div className="flex-1 relative overflow-hidden" style={{ background: '#ffffff' }}>
      {/* ── Zoom Controls (Floating) ──────────────────────────────────── */}
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
          title="Center View"
          className="w-14 h-14 flex items-center justify-center hover:bg-[#e1e3e4] active:bg-[#dfe0e0] active:scale-95 transition-all"
          style={{ color: '#191c1d' }}
        >
          <span className="material-symbols-outlined">center_focus_strong</span>
        </button>
      </div>

      {/* ── Scrollable + pannable canvas ──────────────────────────────── */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-auto p-10 flex flex-col items-center"
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
          className="min-w-max pb-32 flex flex-col items-center relative pt-8"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}
        >
          {/* ── Level 1: Dean ──────────────────────────────────────────── */}
          <FacultyCard
            faculty={hierarchy.faculty}
            onClick={onSelectFaculty}
            variant="org-head"
          />

          {/* ── Connectors Level 1 → 2 ────────────────────────────────── */}
          {level2Nodes.length > 0 && (
            <>
              {/* Vertical line from dean */}
              <div style={{ width: 1, height: 32, background: '#c3c6d1' }} />

              {/* Horizontal spread bar */}
              {level2Nodes.length > 1 && (
                <div className="relative" style={{ width: Math.max(level2Nodes.length * 340 - 80, 400), height: 1, background: '#c3c6d1' }}>
                  {/* Vertical drops to each child */}
                  {level2Nodes.map((_, idx) => {
                    const count = level2Nodes.length;
                    let leftPercent: string;
                    if (count === 1) {
                      leftPercent = '50%';
                    } else {
                      leftPercent = `${(idx / (count - 1)) * 100}%`;
                    }
                    return (
                      <div
                        key={idx}
                        className="absolute"
                        style={{
                          left: leftPercent,
                          top: 0,
                          width: 1,
                          height: 32,
                          background: '#c3c6d1',
                          transform: 'translateX(-50%)',
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* ── Level 2: Program Heads ──────────────────────────────── */}
              <div className="flex gap-20 mt-8 relative z-10 justify-center">
                {level2Nodes.map((programHead) => (
                  <div key={programHead.faculty.id} className="flex flex-col items-center">
                    <FacultyCard
                      faculty={programHead.faculty}
                      onClick={onSelectFaculty}
                      variant="org-head"
                    />

                    {/* ── Connector Level 2 → 3 ──────────────────────── */}
                    {programHead.children.length > 0 && (
                      <>
                        <div style={{ width: 1, height: 32, background: '#c3c6d1' }} />
                        {/* ── Level 3: Faculty ───────────────────────── */}
                        {renderLeafNodes(programHead.children)}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
