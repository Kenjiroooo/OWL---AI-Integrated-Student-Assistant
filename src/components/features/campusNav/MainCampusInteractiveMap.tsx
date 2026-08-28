import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, X } from 'lucide-react';
import mainCampusImg from '../../../assets/maincampus.jpg';

// Coordinates traced for a 1024x576 image to exactly match the building layout
const hotspots = [
  {
    id: 'admin-building',
    title: 'Administration Building (A Building)',
    description: 'The central administration and academic building of the Main Campus.',
    points: '30,40 470,150 470,170 550,170 550,310 520,310 520,425 65,425 65,350 10,350 10,140'
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
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* SVG Overlay for Polygons */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1024 576"
            preserveAspectRatio="xMidYMid slice"
            style={{ zIndex: 10 }}
          >
            <defs>
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
                  <text
                    x={pos.cx}
                    y={pos.cy - 10}
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
                    Administration Building
                  </text>
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
                    (A Building)
                  </text>
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
    </div>
  );
}
