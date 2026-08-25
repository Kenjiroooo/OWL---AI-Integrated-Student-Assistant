import React from 'react';
import FacultyLocatorMain from './facultyLocator/FacultyLocatorMain';

/**
 * FacultyLocator wrapper — preserves the existing import path used by FeaturePage.tsx.
 * All logic lives in facultyLocator/FacultyLocatorMain.tsx.
 */
export default function FacultyLocator() {
  return <FacultyLocatorMain />;
}
