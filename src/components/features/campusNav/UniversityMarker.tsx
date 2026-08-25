import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import universityLogo from '../../../assets/university-logo.png';

interface Props {
  position: [number, number];
  title: string;
  subtitle: string;
  description: string;
}

// Custom icon using L.divIcon to allow custom HTML/Tailwind styling
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
  popupAnchor: [0, -24]
});

export default function UniversityMarker({ position, title, subtitle, description }: Props) {
  return (
    <Marker position={position} icon={uddIcon}>
      <Popup className="udd-popup" minWidth={240}>
        <div className="p-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
              <img src={universityLogo} alt="University Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-base leading-tight">{title}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">{subtitle}</p>
            </div>
          </div>
          
          <p className="text-slate-600 text-xs mb-4 leading-relaxed">
            {description}
          </p>
          
          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-95">
            Explore Campus
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
