import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, X } from 'lucide-react';
import mainCampusImg from '../../../assets/maincampus.webp';

// Coordinates traced for a 1024x576 image to exactly match the building layout
const hotspots = [
  {
    id: 'admin-building',
    title: 'Administration Building (A Building)',
    description: 'The central administration and academic building of the Main Campus.',
    points: '471,128 34,42 26,74 0,87 16,170 0,269 11,405 48,435 169,432 202,381 221,428 339,428 360,386 384,384 403,424 514,422 516,350 555,339 553,175 505,169 468,138'
  },
  {
    id: 'v-building',
    title: 'V Building',
    description: 'A multi-floor academic building at Universidad de Dagupan that houses classrooms, laboratories, and facilities used for academic instruction and student activities. The building serves various university programs and provides spaces for lectures, laboratory work, and other educational activities.',
    points: '423,118 522,27 426,120 471,127 470,151 520,158 561,189 548,254 558,344 514,364 528,423 670,426 829,333 940,333 945,301 981,261 1010,34 698,15 531,21'
  }
];

/** Parse polygon points string into {x,y}[] for centroid calculation */
function parsePoints(pts: string) {
  return pts.split(/\s+/).map((p) => {
    const [x, y] = p.split(',').map(Number);
    return { x, y };
  });
}

/** Simple polygon centroid */
function centroid(pts: { x: number; y: number }[]) {
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return { cx, cy };
}

export default function MainCampusInteractiveMap() {
  const navigate = useNavigate();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<typeof hotspots[0] | null>(null);

  // --- DEV TOOL STATE ---
  const [devPoints, setDevPoints] = useState<{x: number, y: number}[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const addPoint = (e: React.PointerEvent | React.MouseEvent) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    if (cursorPt) {
      setDevPoints(prev => {
        const newPt = { x: Math.round(cursorPt.x), y: Math.round(cursorPt.y) };
        const last = prev[prev.length - 1];
        // Throttle points slightly to avoid thousands of coordinates
        if (last && Math.abs(last.x - newPt.x) < 8 && Math.abs(last.y - newPt.y) < 8) {
          return prev;
        }
        return [...prev, newPt];
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!e.shiftKey) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    addPoint(e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    addPoint(e);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Pre-compute label positions
  const labelPositions = useMemo(
    () =>
      hotspots.reduce<Record<string, { cx: number; cy: number }>>((acc, z) => {
        acc[z.id] = centroid(parsePoints(z.points));
        return acc;
      }, {}),
    []
  );

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4">
        <button
          onClick={() => navigate('..')}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white drop-shadow-md">Main Campus Map</h2>
          <p className="text-white/80 text-xs">Hover over buildings to interact</p>
        </div>
      </div>

      {/* Interactive Map Area */}
      <div className="relative flex-1 w-full h-full bg-[#1a2332] flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={mainCampusImg}
            alt="Main Campus Map"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-700 ease-in-out"
            style={{
              filter: selectedZone ? 'grayscale(100%) brightness(0.4) contrast(1.2)' : 'grayscale(0%) brightness(1) contrast(1)',
            }}
          />

          {/* SVG Overlay for Polygons */}
          <svg
            ref={svgRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            viewBox="0 0 1024 576"
            preserveAspectRatio="xMidYMid slice"
            style={{ zIndex: 10 }}
          >
            <defs>
              {/* ── Clip Path for the selected building ── */}
              {selectedZone && (
                <clipPath id="selected-zone-clip">
                  <polygon points={selectedZone.points} />
                </clipPath>
              )}

              {/* ── Soft fading glow filter (no hard stroke) ── */}
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                {/* Outer wide glow – very soft, large radius */}
                <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blurWide" />
                {/* Mid glow layer */}
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blurMid" />
                {/* Inner tight glow */}
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blurTight" />
                <feMerge>
                  <feMergeNode in="blurWide" />
                  <feMergeNode in="blurMid" />
                  <feMergeNode in="blurTight" />
                </feMerge>
              </filter>

              {/* ── Label text shadow ── */}
              <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* ── Render colored image ONLY inside the selected building ── */}
            {selectedZone && (
              <image
                href={mainCampusImg}
                x="0"
                y="0"
                width="1024"
                height="576"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#selected-zone-clip)"
                style={{
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* DEV TOOL: Render currently drawn points */}
            {devPoints.length > 0 && (
              <>
                <polygon
                  points={devPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  style={{
                    fill: 'rgba(239, 68, 68, 0.4)',
                    stroke: 'rgb(239, 68, 68)',
                    strokeWidth: 2,
                    pointerEvents: 'none'
                  }}
                />
                {devPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={4} fill="red" pointerEvents="none" />
                ))}
              </>
            )}

            {hotspots.map((zone) => {
              const isActive = hoveredZone === zone.id || selectedZone?.id === zone.id;
              const pos = labelPositions[zone.id];

              return (
                <g key={zone.id}>
                  {/* ── Glow layer: rendered behind, follows building shape exactly ── */}
                  {isActive && (
                    <polygon
                      points={zone.points}
                      style={{
                        fill: 'rgba(59, 130, 246, 0.25)',
                        stroke: 'rgba(59, 130, 246, 0.8)',
                        strokeWidth: 2,
                        filter: 'url(#softGlow)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* ── Subtle inner fill on the building when active ── */}
                  <polygon
                    points={zone.points}
                    className="cursor-pointer"
                    style={{
                      fill: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                      stroke: 'transparent',
                      strokeWidth: 0,
                      transition: 'fill 0.4s ease',
                    }}
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onClick={() => setSelectedZone(zone)}
                  />

                  {/* ── Building label ── */}
                  {(() => {
                    const hasSub = zone.title.includes(' (');
                    const [mainTitle, sub] = hasSub ? zone.title.split(' (') : [zone.title, null];
                    const subTitle = hasSub ? `(${sub}` : null;

                    return (
                      <>
                        <text
                          x={pos.cx}
                          y={hasSub ? pos.cy - 10 : pos.cy}
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fill: '#ffffff',
                            fontSize: '16px',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            filter: 'url(#textShadow)',
                            pointerEvents: 'none',
                            opacity: selectedZone?.id === zone.id ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                          }}
                        >
                          {mainTitle}
                        </text>
                        {hasSub && (
                          <text
                            x={pos.cx}
                            y={pos.cy + 12}
                            textAnchor="middle"
                            dominantBaseline="central"
                            style={{
                              fill: 'rgba(255,255,255,0.7)',
                              fontSize: '12px',
                              fontWeight: 600,
                              filter: 'url(#textShadow)',
                              pointerEvents: 'none',
                              opacity: selectedZone?.id === zone.id ? 1 : 0,
                              transition: 'opacity 0.3s ease',
                            }}
                          >
                            {subTitle}
                          </text>
                        )}
                      </>
                    );
                  })()}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Info Panel overlay */}
      {selectedZone && (
        <div className="absolute bottom-6 left-6 right-6 z-30 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 flex gap-6 items-start relative max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedZone(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl flex-shrink-0">
              <Info className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">{selectedZone.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {selectedZone.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dev Tool Panel */}
      {devPoints.length > 0 && (
        <div className="absolute top-20 right-4 z-50 bg-slate-800 text-white p-4 rounded-xl shadow-2xl max-w-sm border border-slate-700">
          <h3 className="font-bold mb-2 flex items-center justify-between">
            Coordinate Mapper 
            <button 
              onClick={() => setDevPoints([])}
              className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition-colors"
            >
              Clear
            </button>
          </h3>
          <p className="text-xs text-slate-400 mb-2">
            Hold SHIFT and DRAG the mouse to trace the building.
          </p>
          <div className="bg-slate-900 p-2 rounded-lg break-all text-xs font-mono mb-3 h-24 overflow-y-auto">
            {devPoints.map(p => `${p.x},${p.y}`).join(' ')}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(devPoints.map(p => `${p.x},${p.y}`).join(' '));
              alert('Copied to clipboard!');
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            Copy Points
          </button>
        </div>
      )}
    </div>
  );
}
