import * as THREE from 'three';

/**
 * Shared Geometry & Material Cache
 *
 * Prevents hundreds of identical BoxGeometry, CylinderGeometry, and
 * MeshStandardMaterial allocations across procedural building factories.
 */

const boxGeometryCache = new Map<string, THREE.BoxGeometry>();
const cylinderGeometryCache = new Map<string, THREE.CylinderGeometry>();
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

/**
 * Returns a cached BoxGeometry with the given dimensions (rounded to 3 decimals).
 */
export function getCachedBoxGeometry(w: number, h: number, d: number): THREE.BoxGeometry {
  const key = `${w.toFixed(3)}_${h.toFixed(3)}_${d.toFixed(3)}`;
  let geo = boxGeometryCache.get(key);
  if (!geo) {
    geo = new THREE.BoxGeometry(w, h, d);
    geo.userData.cached = true;
    boxGeometryCache.set(key, geo);
  }
  return geo;
}

/**
 * Returns a cached CylinderGeometry with the given parameters.
 */
export function getCachedCylinderGeometry(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments = 12
): THREE.CylinderGeometry {
  const key = `${radiusTop.toFixed(3)}_${radiusBottom.toFixed(3)}_${height.toFixed(3)}_${radialSegments}`;
  let geo = cylinderGeometryCache.get(key);
  if (!geo) {
    geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    geo.userData.cached = true;
    cylinderGeometryCache.set(key, geo);
  }
  return geo;
}

/**
 * Returns a cached MeshStandardMaterial for a given key.
 */
export function getCachedStandardMaterial(
  key: string,
  params: THREE.MeshStandardMaterialParameters
): THREE.MeshStandardMaterial {
  let mat = materialCache.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial(params);
    materialCache.set(key, mat);
  }
  return mat;
}
