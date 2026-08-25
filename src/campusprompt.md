# Phase 1 — Dagupan City Interactive Map (Foundation Only)

You are a Senior React, TypeScript, and GIS/Web Mapping Engineer.

Your task is to implement **only Phase 1** of the Campus Navigation module for the OWL (AI Student Assistant) project.

## IMPORTANT

This task is **only** about creating the foundation map.

Do NOT implement any campus navigation features.

Do NOT create building navigation.

Do NOT add route calculations.

Do NOT implement pathfinding (A*, Dijkstra, BFS).

Do NOT create an indoor campus map.

Do NOT redesign unrelated pages.

Preserve all existing project functionality and architecture.

Only modify the Campus Navigation page and create reusable components when necessary.

---

# Objective

Create a professional interactive map of **Dagupan City** using **Leaflet** and **OpenStreetMap**.

The map should feel similar to Google Maps with smooth interactions, but it should focus only on displaying the city map and highlighting Universidad de Dagupan.

---

# Functional Requirements

## Display a real map

Use:

* Leaflet
* OpenStreetMap tiles

The map must support:

* Zoom in
* Zoom out
* Mouse wheel zoom
* Drag/Pan
* Double-click zoom
* Touch gestures
* Responsive resizing

The interaction should feel smooth and professional.

---

# Highlight Universidad de Dagupan

Display a single custom marker for **Universidad de Dagupan**.

The marker should:

* Be visually distinct.
* Use a custom icon or branded color.
* Animate subtly on hover or load.
* Be easy to identify.

No other university markers should be displayed.

---

# Marker Popup

When the user clicks the Universidad de Dagupan marker, open a professional popup containing:

* University name
* Complete address
* Short description
* Optional university logo placeholder
* "More Information" button (placeholder only)

Do not navigate anywhere yet.

---

# Search

Include a search bar above the map.

For Phase 1, the search only needs to:

* Locate Universidad de Dagupan.
* Focus the map on the UDD marker.
* Open its popup.

No building search is required.

---

# Floating Map Controls

Provide modern floating controls:

* Zoom In
* Zoom Out
* Reset View
* Locate Universidad de Dagupan

Controls should be positioned similarly to Google Maps.

---

# User Interface

Design a modern interface using the existing project design system.

Style:

* Professional
* Clean
* Blue and white theme
* Rounded corners
* Soft shadows
* Smooth animations
* Touchscreen-friendly

The page should look suitable for a university kiosk.

---

# Performance

The implementation must:

* Load quickly
* Be responsive
* Work well on desktop and touchscreen devices
* Avoid unnecessary re-renders
* Keep components modular and reusable

---

# Code Structure

Organize the implementation into reusable components.

Example:

* CampusNavigationPage
* DagupanMap
* UniversityMarker
* MapControls
* SearchBar

Use React functional components and TypeScript.

---

# Future Compatibility

Design the architecture so future phases can be added without major refactoring.

Future phases will include:

* Campus overlay
* Campus building markers
* Building search
* Indoor navigation
* Route animation
* Pathfinding
* AI-guided navigation

Do NOT implement these features now.

Simply prepare a clean architecture that can support them later.

---

# Deliverables

Implement only:

✅ Interactive Dagupan City map

✅ OpenStreetMap integration

✅ Leaflet integration

✅ Responsive layout

✅ Universidad de Dagupan marker

✅ Marker popup

✅ Search focused on UDD

✅ Floating map controls

❌ No campus buildings

❌ No navigation

❌ No routing

❌ No pathfinding

❌ No indoor map

---

# Final Goal

Produce a polished, production-ready Phase 1 implementation that establishes the mapping foundation for the OWL Campus Navigation module. The result should resemble the interaction quality of Google Maps while remaining clean, maintainable, and ready for future expansion into campus-level navigation.
