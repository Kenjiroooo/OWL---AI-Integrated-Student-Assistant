import React from 'react';

interface Props {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function FacultySearch({ query, onChange, onClear, placeholder }: Props) {
  return (
    <section className="w-full max-w-4xl mx-auto">
      <div
        className="relative w-full rounded-xl border focus-within:ring-2 transition-all"
        style={{
          background: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,30,64,0.12)',
          borderColor: query ? '#001e40' : '#c3c6d1',
        }}
      >
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 32, color: '#43474f', fontVariationSettings: "'FILL' 1" }}
          >
            search
          </span>
        </div>

        {/* Input */}
        <input
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Search faculty name, department, position...'}
          className="block w-full h-[80px] pl-20 pr-16 bg-transparent border-none text-[24px] font-semibold rounded-xl focus:ring-0 focus:outline-none"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#191c1d',
            lineHeight: '32px',
          }}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={onClear}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 flex items-center pr-6 active:scale-95 transition-transform"
            style={{ color: '#43474f' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
              close
            </span>
          </button>
        )}
      </div>

      <p
        className="text-center mt-4"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          lineHeight: '20px',
          fontWeight: 500,
          color: '#43474f',
        }}
      >
        Try searching by name (e.g., "Juan Dela Cruz"), position (e.g., "Dean"), or department.
      </p>
    </section>
  );
}
