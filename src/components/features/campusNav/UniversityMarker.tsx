import React, { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import soeLogo from '../../../assets/soe-logo.webp';

interface Props {
  position: [number, number];
  title: string;
  subtitle: string;
  description: string;
  isHighlighted?: boolean;
  onExplore?: () => void;
}

// Default marker icon
const uddIcon = L.divIcon({
  className: 'custom-udd-marker',
  html: `
    <div class="relative flex items-center justify-center w-12 h-12">
      <div class="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-30"></div>
      <div class="relative w-8 h-8 bg-blue-700 rounded-full border-[2.5px] border-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-white font-black text-[10px] tracking-wider">
        UDD
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

// Highlighted marker icon with glowing gold/blue ring and badge
const highlightedUddIcon = L.divIcon({
  className: 'custom-udd-marker-highlighted',
  html: `
    <div class="relative flex items-center justify-center w-20 h-20">
      <div class="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-60"></div>
      <div class="absolute inset-2 bg-blue-500 rounded-full animate-pulse opacity-40"></div>
      <div class="relative w-12 h-12 bg-gradient-to-br from-amber-500 to-blue-700 rounded-full border-[3px] border-white shadow-[0_0_24px_rgba(245,158,11,0.9)] flex items-center justify-center text-white font-black text-xs tracking-wider">
        UDD
      </div>
    </div>
  `,
  iconSize: [80, 80],
  iconAnchor: [40, 40],
  popupAnchor: [0, -36],
});

export default function UniversityMarker({
  position,
  title,
  subtitle,
  description,
  isHighlighted = false,
  onExplore,
}: Props) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (isHighlighted && markerRef.current) {
      const timer = setTimeout(() => {
        markerRef.current?.openPopup();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={isHighlighted ? highlightedUddIcon : uddIcon}
      zIndexOffset={isHighlighted ? 1000 : 0}
    >
      <Popup className="udd-popup" minWidth={260}>
        <div className="p-1">
          {isHighlighted && (
            <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest border border-amber-300">
              ★ Highlighted Campus
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden flex-shrink-0">
              <img src={soeLogo} alt="SOE Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-base leading-tight">{title}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">{subtitle}</p>
            </div>
          </div>

          <p className="text-slate-600 text-xs mb-4 leading-relaxed">
            {description}
          </p>

          {onExplore && (
            <button
              onClick={onExplore}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
            >
              Explore Campus
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
