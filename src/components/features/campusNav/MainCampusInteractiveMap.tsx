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
    points: '471,128 462,126 454,125 445,123 436,120 427,118 419,117 411,116 402,114 394,114 386,112 378,109 370,108 362,107 354,106 346,105 338,102 330,101 322,99 312,98 304,97 296,95 288,93 278,92 270,92 262,91 254,91 245,89 237,85 229,82 221,80 213,79 204,78 196,76 188,73 179,70 171,68 163,68 153,68 145,68 136,68 126,68 117,68 109,66 100,62 91,60 83,57 75,55 67,53 58,48 50,45 42,43 34,42 26,50 24,58 25,66 26,74 18,80 10,80 2,79 0,87 0,95 0,104 1,112 1,120 2,128 5,136 10,144 13,152 15,160 16,170 15,178 15,186 15,194 14,202 11,210 10,218 7,226 5,234 4,242 3,251 1,260 0,269 0,277 1,287 1,295 1,304 3,312 3,321 3,329 3,338 3,346 3,354 4,362 5,370 6,378 9,386 10,397 11,405 16,413 22,421 32,428 40,431 48,435 56,435 64,433 72,433 80,433 89,433 98,433 106,433 114,433 123,434 133,435 141,435 149,434 157,432 169,432 177,429 182,421 182,413 184,405 185,397 186,389 194,383 202,381 210,384 213,392 213,400 210,408 210,417 213,425 221,428 229,430 239,430 247,430 255,429 264,428 272,424 280,424 288,424 296,421 306,421 314,421 322,423 330,426 339,428 347,427 348,419 348,410 349,402 353,394 360,386 368,385 376,385 384,384 392,387 394,395 394,404 395,412 394,420 403,424 412,424 420,424 429,424 438,424 447,424 455,424 464,424 472,424 480,423 488,423 496,423 505,423 514,422 515,414 513,406 510,398 510,390 512,382 513,374 512,366 513,358 516,350 524,349 532,349 540,348 548,347 555,339 554,331 553,323 553,314 553,305 553,297 554,289 554,281 554,273 554,265 554,257 554,248 554,240 552,232 552,223 552,215 552,207 553,199 553,191 552,183 553,175 545,173 537,173 529,173 521,172 513,171 505,169 498,161 489,159 481,158 473,155 467,146 468,138'
  },
  {
    id: 'v-building',
    title: 'V Building',
    description: 'A multi-floor academic building at Universidad de Dagupan that houses classrooms, laboratories, and facilities used for academic instruction and student activities. The building serves various university programs and provides spaces for lectures, laboratory work, and other educational activities.',
    points: '423,118 430,110 438,104 444,96 452,90 460,83 469,78 478,72 486,66 494,57 501,49 508,41 516,35 522,27 426,120 438,122 446,122 455,124 463,124 471,127 473,135 471,143 470,151 479,156 487,156 495,156 503,156 511,156 520,158 523,166 532,171 540,173 548,173 558,181 561,189 557,197 553,205 553,213 552,222 551,230 550,238 549,246 548,254 550,263 552,272 554,280 554,288 555,296 557,304 558,312 558,320 558,328 558,336 558,344 554,352 545,353 537,353 529,353 521,355 514,364 513,373 512,382 515,390 516,399 518,407 518,415 528,423 537,424 545,426 553,427 561,428 569,430 577,430 586,429 594,426 602,424 612,425 620,427 628,427 637,426 645,426 654,426 662,426 670,426 678,422 685,414 693,408 701,405 709,400 717,395 726,390 734,385 742,379 750,372 758,365 768,360 776,356 784,351 796,348 804,347 813,343 821,339 829,333 837,332 846,331 854,328 865,328 873,328 881,329 889,335 897,339 905,340 916,340 924,340 932,340 940,333 942,325 942,317 941,309 945,301 952,292 960,288 969,285 976,277 979,269 981,261 981,253 981,245 981,236 982,225 983,217 984,208 985,199 986,191 987,183 988,175 989,165 989,156 991,148 992,139 993,131 994,123 996,115 998,107 999,99 1000,91 1001,83 1004,75 1005,67 1007,58 1008,50 1009,42 1010,34 1002,29 994,29 986,29 978,29 969,29 960,29 951,29 942,29 934,29 926,29 918,29 909,28 901,26 890,24 881,23 872,21 864,21 855,20 846,20 838,20 829,20 820,20 811,20 803,20 793,20 784,20 776,20 767,20 758,20 750,20 742,20 734,19 725,18 716,17 707,16 698,15 690,15 678,15 669,15 661,15 652,15 643,15 635,15 627,15 618,15 609,15 599,15 591,14 583,14 574,14 566,14 555,15 547,16 539,18 531,21'
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
