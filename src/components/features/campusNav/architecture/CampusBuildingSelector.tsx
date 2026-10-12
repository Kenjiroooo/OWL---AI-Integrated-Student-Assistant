// ─────────────────────────────────────────────────────────────────────────────
// CampusBuildingSelector.tsx – Accessible two-building selector (radiogroup)
// Arrow keys move between options; Enter/Space or click selects.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef } from 'react';
import { Building2 } from 'lucide-react';
import type { CampusBuilding, CampusBuildingId } from './buildings';

interface Props {
  buildings: readonly CampusBuilding[];
  activeId: CampusBuildingId;
  onSelect: (id: CampusBuildingId) => void;
}

export default function CampusBuildingSelector({ buildings, activeId, onSelect }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % buildings.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + buildings.length) % buildings.length;
    if (next >= 0) {
      e.preventDefault();
      refs.current[next]?.focus();
      onSelect(buildings[next].id);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select campus building"
      className="flex gap-2 p-1.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15"
    >
      {buildings.map((b, i) => {
        const active = b.id === activeId;
        return (
          <button
            key={b.id}
            id={`building-select-${b.id}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(b.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl text-left transition-all duration-300 min-w-[150px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:scale-[0.97] ${
              active
                ? 'bg-white text-blue-700 shadow-lg shadow-blue-900/30'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span
              className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-black ${
                active ? 'bg-blue-600 text-white' : 'bg-white/10'
              }`}
            >
              {i + 1}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 opacity-70" />
                {b.shortName}
              </span>
              <span className={`text-[11px] ${active ? 'text-blue-500' : 'text-white/50'}`}>Building {i + 1}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
