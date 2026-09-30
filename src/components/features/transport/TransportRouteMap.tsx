// ─────────────────────────────────────────────────────────────────────────────
// TransportRouteMap.tsx – Leaflet map showing e-jeepney routes and stops
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip } from 'react-leaflet';
import { motion } from 'motion/react';
import { MapPin, Navigation } from 'lucide-react';
import { TRANSPORT_ROUTES, Route } from '../../../data/transportData';
import 'leaflet/dist/leaflet.css';

// Approximate campus center
const CAMPUS_CENTER: [number, number] = [16.0435, 120.3382];

export default function TransportRouteMap() {
  const [activeRoute, setActiveRoute] = useState<string>(TRANSPORT_ROUTES[0].id);

  const selected = TRANSPORT_ROUTES.find(r => r.id === activeRoute) ?? TRANSPORT_ROUTES[0];

  const polylinePositions: [number, number][] = selected.stops.map(s => [s.lat, s.lng]);

  return (
    <div className="flex flex-col gap-4">
      {/* Route selector */}
      <div className="flex gap-3">
        {TRANSPORT_ROUTES.map(route => (
          <button
            key={route.id}
            onClick={() => setActiveRoute(route.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all duration-200 ${
              activeRoute === route.id
                ? 'text-white shadow-lg scale-[1.02]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
            style={
              activeRoute === route.id
                ? { backgroundColor: route.color, borderColor: route.color, boxShadow: `0 8px 20px ${route.color}40` }
                : {}
            }
          >
            <Navigation className="w-4 h-4" />
            {route.shortName}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeRoute === route.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {route.totalStops} stops
            </span>
          </button>
        ))}
      </div>

      {/* Route info banner */}
      <motion.div
        key={activeRoute}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border border-slate-100 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm"
      >
        <div>
          <p className="font-black text-slate-800 text-sm">{selected.name}</p>
          <p className="text-slate-500 text-xs font-medium mt-0.5">{selected.description}</p>
        </div>
        <div className="flex gap-4 text-center shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Duration</p>
            <p className="font-black text-slate-700 text-sm">{selected.duration}</p>
          </div>
          <div className="w-px bg-slate-100" />
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fare</p>
            <p className="font-black text-sm" style={{ color: selected.color }}>{selected.fare}</p>
          </div>
        </div>
      </motion.div>

      {/* Map */}
      <div className="w-full h-[460px] rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
        <MapContainer
          center={CAMPUS_CENTER}
          zoom={16}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route polyline */}
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: selected.color,
              weight: 5,
              opacity: 0.85,
              dashArray: '10, 6',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />

          {/* Stop markers */}
          {selected.stops.map((stop, idx) => (
            <CircleMarker
              key={`${stop.name}-${idx}`}
              center={[stop.lat, stop.lng]}
              radius={stop.isTerminal ? 11 : 7}
              pathOptions={{
                color: 'white',
                weight: 3,
                fillColor: stop.isTerminal ? selected.color : selected.accentColor,
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                <div className="font-bold text-xs text-slate-800">{stop.name}</div>
                {stop.landmark && <div className="text-slate-500 text-[10px]">{stop.landmark}</div>}
              </Tooltip>
              <Popup>
                <div className="font-bold text-slate-800">{stop.name}</div>
                {stop.landmark && <div className="text-slate-500 text-xs mt-0.5">{stop.landmark}</div>}
                {stop.isTerminal && (
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white inline-block"
                    style={{ backgroundColor: selected.color }}>
                    Terminal Stop
                  </div>
                )}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Stop list */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Route Stops
        </h4>
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-[19px] top-5 bottom-5 w-0.5"
            style={{ backgroundColor: selected.color + '30' }}
          />
          <div className="flex flex-col gap-3">
            {selected.stops.map((stop, idx) => (
              <motion.div
                key={`stop-list-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-4 relative"
              >
                {/* Step dot */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 z-10"
                  style={{
                    backgroundColor: stop.isTerminal ? selected.color : 'white',
                    border: `3px solid ${selected.color}`,
                    color: stop.isTerminal ? 'white' : selected.color,
                  }}
                >
                  {stop.isTerminal ? '★' : idx + 1}
                </div>
                <div className="pt-1">
                  <p className="font-bold text-slate-800 text-sm leading-tight">{stop.name}</p>
                  {stop.landmark && (
                    <p className="text-slate-400 text-xs font-medium mt-0.5">{stop.landmark}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
