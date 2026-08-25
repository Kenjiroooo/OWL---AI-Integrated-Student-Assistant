import React from 'react';
import { Plus, Minus, MapPin } from 'lucide-react';
import type { Map as LeafletMap } from 'leaflet';

interface Props {
  mapRef: React.RefObject<LeafletMap | null>;
  onLocate: () => void;
}

const Btn = ({ onClick, children, label }: { onClick: () => void, children: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className="w-11 h-11 bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-slate-100 last:border-0 active:bg-slate-100"
  >
    {children}
  </button>
);

export default function MapControls({ mapRef, onLocate }: Props) {
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-3">
      {/* Zoom controls */}
      <div className="flex flex-col rounded-xl shadow-lg border border-slate-200/60 overflow-hidden">
        <Btn onClick={handleZoomIn} label="Zoom In"><Plus className="w-5 h-5" /></Btn>
        <Btn onClick={handleZoomOut} label="Zoom Out"><Minus className="w-5 h-5" /></Btn>
      </div>

      {/* Locate control */}
      <div className="flex flex-col rounded-xl shadow-lg border border-slate-200/60 overflow-hidden">
        <Btn onClick={onLocate} label="Locate Universidad de Dagupan"><MapPin className="w-5 h-5" /></Btn>
      </div>
    </div>
  );
}
