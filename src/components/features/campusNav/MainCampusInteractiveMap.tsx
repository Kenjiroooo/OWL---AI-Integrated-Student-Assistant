import React, { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy-load the architectural showcase
const CampusArchitectureShowcase = lazy(() => import('./architecture/CampusArchitectureShowcase'));

/** Keeps the campus map usable if the showcase chunk fails to load/render */
class ShowcaseBoundary extends React.Component<
  { onClose: () => void; children: React.ReactNode },
  { failed: boolean }
> {
  declare props: { onClose: () => void; children: React.ReactNode };
  declare setState: (s: { failed: boolean }) => void;
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/90 p-6">
        <div className="bg-white rounded-2xl p-6 max-w-sm text-center shadow-2xl">
          <p className="font-bold text-slate-800 mb-1">Showcase unavailable</p>
          <p className="text-sm text-slate-500 mb-4">
            The building showcase could not be loaded. The campus map is still available.
          </p>
          <button
            onClick={() => {
              this.setState({ failed: false });
              this.props.onClose();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold transition-transform active:scale-95"
          >
            Back to map
          </button>
        </div>
      </div>
    );
  }
}

export default function MainCampusInteractiveMap() {
  const navigate = useNavigate();

  return (
    <ShowcaseBoundary onClose={() => navigate('..')}>
      <Suspense
        fallback={
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#050b18] text-white/70">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        }
      >
        <CampusArchitectureShowcase onClose={() => navigate('..')} />
      </Suspense>
    </ShowcaseBoundary>
  );
}
