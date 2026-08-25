import React, { useState } from 'react';
import { getFacultyById } from './facultyData';
import SchoolSelector from './SchoolSelector';
import SchoolFacultyPage from './SchoolFacultyPage';
import FacultyProfile from './FacultyProfile';

/**
 * FacultyLocatorMain — top-level orchestrator for the Faculty Locator feature.
 *
 * Manages all shared state (selected school, selected faculty, search query)
 * and renders the correct sub-view based on state. All children read from the
 * same `facultyData.ts` data source; no data duplication occurs.
 *
 * Navigation flow:
 *   SchoolSelector → SchoolFacultyPage (Org Chart | Directory) → FacultyProfile
 */
export default function FacultyLocatorMain() {
  // ── Shared State ───────────────────────────────────────────────────────────
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** Select a school from the grid */
  const handleSelectSchool = (schoolName: string) => {
    setSelectedSchool(schoolName);
    setSearchQuery('');
  };

  /** Select a faculty from search results (also switches to their school) */
  const handleSelectFacultyFromSearch = (facultyId: string, schoolName: string) => {
    setSelectedSchool(schoolName);
    setSelectedFacultyId(facultyId);
    setSearchQuery('');
  };

  /** Select a faculty from within a school view (org chart or directory) */
  const handleSelectFaculty = (facultyId: string) => {
    setSelectedFacultyId(facultyId);
  };

  /** Go back from faculty profile → school page (preserves selected school) */
  const handleBackFromProfile = () => {
    setSelectedFacultyId(null);
  };

  /** Go back from school page → school selector */
  const handleBackFromSchool = () => {
    setSelectedSchool(null);
    setSelectedFacultyId(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // View 3: Faculty Profile (when a faculty member is selected)
  if (selectedFacultyId) {
    return (
      <FacultyProfile
        facultyId={selectedFacultyId}
        onBack={handleBackFromProfile}
      />
    );
  }

  // View 2: School Faculty Page (when a school is selected)
  if (selectedSchool) {
    return (
      <SchoolFacultyPage
        schoolName={selectedSchool}
        onBack={handleBackFromSchool}
        onSelectFaculty={handleSelectFaculty}
      />
    );
  }

  // View 1: School Selector (default)
  return (
    <SchoolSelector
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchClear={() => setSearchQuery('')}
      onSelectSchool={handleSelectSchool}
      onSelectFaculty={handleSelectFacultyFromSearch}
    />
  );
}
