import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Helper to handle dynamic import failures (stale chunk caching)
const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Failed to load chunk, forcing reload to get new version...", error);
      window.location.reload();
      return { default: () => null };
    }
  });
};

// Lazy load pages with retry logic
const StartPage = lazyWithRetry(() => import('./pages/StartPage'));
const StudentHome = lazyWithRetry(() => import('./pages/StudentHome'));
const AdminHome = lazyWithRetry(() => import('./pages/AdminHome'));
const FeaturePage = lazyWithRetry(() => import('./pages/FeaturePage'));
const OwlChatPage = lazyWithRetry(() => import('./pages/OwlChatPage'));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Start / Splash page — guest mode, no login */}
          <Route path="/" element={<StartPage />} />

          {/* Main student dashboard */}
          <Route path="/home" element={<StudentHome />} />

          {/* Feature sub-pages */}
          <Route path="/feature/:id/*" element={<FeaturePage />} />

          {/* OWL AI Chat */}
          <Route path="/owl-chat" element={<OwlChatPage />} />

          {/* Admin panel */}
          <Route path="/admin" element={<AdminHome />} />

          {/* Catch-all → start page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
