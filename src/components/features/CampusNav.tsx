// ─────────────────────────────────────────────────────────────────────────────
// CampusNav.tsx – Entry point for the Campus Navigation feature
//
// Phase 1 Foundation: Renders the Dagupan City map using Leaflet and OpenStreetMap.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import DagupanMap from './campusNav/DagupanMap';

// Leaflet CSS is required for the map to render correctly
import 'leaflet/dist/leaflet.css';
import './campusNav/leaflet-custom.css'; // Custom styles for popups/markers

export default function CampusNav() {
  return (
    <div className="h-[calc(100vh-160px)] min-h-[600px] w-full">
      <DagupanMap />
    </div>
  );
}
