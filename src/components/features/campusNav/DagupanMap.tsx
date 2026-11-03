import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Map as LeafletMap, LatLngBoundsExpression } from 'leaflet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, X } from 'lucide-react';
import UniversityMarker from './UniversityMarker';
import MapControls from './MapControls';
import SearchBar from './SearchBar';
import { CAMPUS_HIGHLIGHT_LABELS, type CampusHighlightId } from '../../../lib/gemini';

const DAGUPAN_CENTER: [number, number] = [16.050778, 120.340806];
const UDD_MAIN_LOCATION: [number, number] = [16.050778, 120.340806];
const UDD_FAME_LOCATION: [number, number] = [16.052167, 120.341167];
const LCR_ARZADON_LOCATION: [number, number] = [16.095139, 120.374528];
const UDD_SHS_LOCATION: [number, number] = [16.044194, 120.342194];
const UDD_ENG_LOCATION: [number, number] = [16.051528, 120.340528];

const CAMPUS_COORDINATES: Record<CampusHighlightId, [number, number]> = {
  main: UDD_MAIN_LOCATION,
  fame: UDD_FAME_LOCATION,
  engineering: UDD_ENG_LOCATION,
  shs: UDD_SHS_LOCATION,
  gym: LCR_ARZADON_LOCATION,
};

// Restrict map to Dagupan City and immediate surroundings
const DAGUPAN_BOUNDS: LatLngBoundsExpression = [
  [15.95, 120.25], // South-West
  [16.20, 120.45], // North-East (Extended to San Fabian)
];

function MapFlyToController({ target }: { target: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(target, 18, { duration: 1.5 });
    }
  }, [map, target]);

  return null;
}

export default function DagupanMap() {
  const mapRef = useRef<LeafletMap>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightParam = searchParams.get('highlight') as CampusHighlightId | null;

  const [highlightedCampus, setHighlightedCampus] = useState<CampusHighlightId | null>(
    highlightParam && CAMPUS_COORDINATES[highlightParam] ? highlightParam : null
  );

  useEffect(() => {
    if (highlightParam && CAMPUS_COORDINATES[highlightParam]) {
      setHighlightedCampus(highlightParam);
    }
  }, [highlightParam]);

  const handleLocateUDD = (campusId: CampusHighlightId = 'main') => {
    setHighlightedCampus(campusId);
    const coords = CAMPUS_COORDINATES[campusId] || UDD_MAIN_LOCATION;
    if (mapRef.current) {
      mapRef.current.flyTo(coords, 18, { duration: 1.5 });
    }
  };

  const clearHighlight = () => {
    setHighlightedCampus(null);
    if (searchParams.has('highlight')) {
      searchParams.delete('highlight');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleExplore = (position: [number, number], route = 'maincampus') => {
    if (mapRef.current) {
      mapRef.current.flyTo(position, 18, { duration: 1.5 });
      setTimeout(() => {
        navigate(route);
      }, 1500);
    }
  };

  const targetCoordinates = highlightedCampus ? CAMPUS_COORDINATES[highlightedCampus] : null;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
      {/* ── Search Header ──────────────────────────────────────────────── */}
      <SearchBar onLocate={handleLocateUDD} />

      {/* ── Highlighted Campus Banner ──────────────────────────────────── */}
      {highlightedCampus && (
        <div className="bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600 text-white px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold z-10 shadow-md">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 animate-bounce" />
            <span>
              Highlighting: <strong>{CAMPUS_HIGHLIGHT_LABELS[highlightedCampus]}</strong>
            </span>
          </div>
          <button
            onClick={clearHighlight}
            className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1 text-xs"
            title="Clear highlight"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* ── Map Canvas ─────────────────────────────────────────────────── */}
      <div className="relative flex-1 z-0 bg-[#AAD3DF]">
        <MapContainer
          center={DAGUPAN_CENTER}
          zoom={14}
          minZoom={13}
          maxBounds={DAGUPAN_BOUNDS}
          maxBoundsViscosity={1.0}
          zoomControl={false} // Custom controls provided
          style={{ width: '100%', height: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapFlyToController target={targetCoordinates} />
          <UniversityMarker 
            position={UDD_MAIN_LOCATION}
            title="Universidad de Dagupan"
            subtitle="Main Campus • Dagupan City"
            description="Formerly known as Colegio de Dagupan. A premier institution of higher learning in North Luzon, providing quality education and modern facilities."
            isHighlighted={highlightedCampus === 'main'}
            onExplore={() => handleExplore(UDD_MAIN_LOCATION, 'maincampus')}
          />
          <UniversityMarker 
            position={UDD_FAME_LOCATION}
            title="Universidad de Dagupan"
            subtitle="Fame Building • Dagupan City"
            description="The Fame Building campus of Universidad de Dagupan. Location: Arellano Street, Pantal, Dagupan City, Pangasinan 2400."
            isHighlighted={highlightedCampus === 'fame'}
            onExplore={() => handleExplore(UDD_FAME_LOCATION, 'famecampus')}
          />
          <UniversityMarker 
            position={LCR_ARZADON_LOCATION}
            title="LCR Arzadon Gymnasium"
            subtitle="Indoor Facility • Bonuan Binloc, Dagupan City"
            description="A major indoor university facility at Universidad de Dagupan used for large-scale academic, athletic, ceremonial, and student activities, including presentations, institutional events, and commencement-related programs. Located in Bonuan Binloc, Dagupan City."
            isHighlighted={highlightedCampus === 'gym'}
          />
          <UniversityMarker 
            position={UDD_SHS_LOCATION}
            title="UdD School of Health Sciences"
            subtitle="Health Sciences • Universidad de Dagupan"
            description="The School of Health Sciences of Universidad de Dagupan is dedicated to developing competent, compassionate, and skilled healthcare professionals. It provides students with quality education, practical training, and hands-on learning experiences that prepare them for careers in the healthcare industry. The school emphasizes professional excellence, patient-centered care, ethics, and service to the community."
            isHighlighted={highlightedCampus === 'shs'}
          />
          <UniversityMarker 
            position={UDD_ENG_LOCATION}
            title="UdD Engineering Building (E-Building)"
            subtitle="Engineering • Universidad de Dagupan"
            description="The Engineering Building of Universidad de Dagupan serves as a dedicated academic facility for engineering students, providing classrooms, laboratories, and learning spaces that support technical education, hands-on activities, and engineering-related programs. It is an important part of the university's engineering and technology learning environment. Address: Arellano Street, Pantal, Dagupan City, Pangasinan 2400."
            isHighlighted={highlightedCampus === 'engineering'}
          />
        </MapContainer>

        {/* ── Floating Controls ────────────────────────────────────────── */}
        <MapControls mapRef={mapRef} onLocate={() => handleLocateUDD('main')} />
      </div>
    </div>
  );
}
