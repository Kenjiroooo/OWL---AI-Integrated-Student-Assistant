import React, { useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { Map as LeafletMap, LatLngBoundsExpression } from 'leaflet';
import UniversityMarker from './UniversityMarker';
import MapControls from './MapControls';
import SearchBar from './SearchBar';

const DAGUPAN_CENTER: [number, number] = [16.050778, 120.340806];
const UDD_MAIN_LOCATION: [number, number] = [16.050778, 120.340806];
const UDD_FAME_LOCATION: [number, number] = [16.052167, 120.341167];
const LCR_ARZADON_LOCATION: [number, number] = [16.095139, 120.374528];
const UDD_SHS_LOCATION: [number, number] = [16.044194, 120.342194];
const UDD_ENG_LOCATION: [number, number] = [16.051528, 120.340528];

// Restrict map to Dagupan City and immediate surroundings
const DAGUPAN_BOUNDS: LatLngBoundsExpression = [
  [15.95, 120.25], // South-West
  [16.20, 120.45], // North-East (Extended to San Fabian)
];

export default function DagupanMap() {
  const mapRef = useRef<LeafletMap>(null);

  const handleLocateUDD = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(UDD_MAIN_LOCATION, 17, { duration: 1.5 });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
      {/* ── Search Header ──────────────────────────────────────────────── */}
      <SearchBar onLocate={handleLocateUDD} />
      
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
          <UniversityMarker 
            position={UDD_MAIN_LOCATION}
            title="Universidad de Dagupan"
            subtitle="Main Campus • Dagupan City"
            description="Formerly known as Colegio de Dagupan. A premier institution of higher learning in North Luzon, providing quality education and modern facilities."
          />
          <UniversityMarker 
            position={UDD_FAME_LOCATION}
            title="Universidad de Dagupan"
            subtitle="Fame Building • Dagupan City"
            description="The Fame Building campus of Universidad de Dagupan."
          />
          <UniversityMarker 
            position={LCR_ARZADON_LOCATION}
            title="LCR Arzadon Gymnasium"
            subtitle="Indoor Facility • Universidad de Dagupan"
            description="A major indoor university facility at Universidad de Dagupan used for large-scale academic, athletic, ceremonial, and student activities, including presentations, institutional events, and commencement-related programs."
          />
          <UniversityMarker 
            position={UDD_SHS_LOCATION}
            title="UdD School of Health Sciences"
            subtitle="Health Sciences • Universidad de Dagupan"
            description="The School of Health Sciences of Universidad de Dagupan is dedicated to developing competent, compassionate, and skilled healthcare professionals. It provides students with quality education, practical training, and hands-on learning experiences that prepare them for careers in the healthcare industry. The school emphasizes professional excellence, patient-centered care, ethics, and service to the community."
          />
          <UniversityMarker 
            position={UDD_ENG_LOCATION}
            title="UdD Engineering Building (E-Building)"
            subtitle="Engineering • Universidad de Dagupan"
            description="The Engineering Building of Universidad de Dagupan serves as a dedicated academic facility for engineering students, providing classrooms, laboratories, and learning spaces that support technical education, hands-on activities, and engineering-related programs. It is an important part of the university's engineering and technology learning environment."
          />
        </MapContainer>

        {/* ── Floating Controls ────────────────────────────────────────── */}
        <MapControls mapRef={mapRef} onLocate={handleLocateUDD} />
      </div>
    </div>
  );
}
