import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface Props {
  onLocate: () => void;
}

export default function SearchBar({ onLocate }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.toLowerCase();
    if (q.includes('udd') || q.includes('universidad') || q.includes('dagupan') || q.includes('university')) {
      onLocate();
    }
  };

  return (
    <div className="bg-white p-4 border-b border-slate-100 z-10 shadow-sm relative flex-shrink-0">
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search for Universidad de Dagupan..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-32 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          Locate
        </button>
      </form>
    </div>
  );
}
