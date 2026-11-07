import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Building3DResult } from './proceduralModels';

interface MergeBucket {
  material: THREE.Material;
  buildingId?: string;
  castShadow: boolean;
  receiveShadow: boolean;
  meshes: THREE.Mesh[];
}

const tempBox = new THREE.Box3();
const tempSize = new THREE.Vector3();

/**
 * Optimizes a procedural Building3DResult for Raspberry Pi 5 / WebGL without visual degradation:
 * 1. Disables shadow casting on small detail parts (AC units, window mullions, balusters)
 *    while preserving shadow receiving and full structural shadows.
 * 2. Merges static meshes sharing the same material, shadow flags, and buildingId within each
 *    floorGroup so Exploded View and building click/raycast selection continue to work identically.
 * 3. Freezes static world matrices (`matrixAutoUpdate = false`) on merged meshes.
 */
export function optimizeBuildingScene(building: Building3DResult, isEmbeddedOrPi = true): Building3DResult {
  const { root, floorGroups } = building;
  root.updateMatrixWorld(true);

  const floorGroupSet = new Set<THREE.Object3D>(floorGroups);

  // Optimize each floorGroup independently and stamp floorLevel on all its meshes
  for (let floorIndex = 0; floorIndex < floorGroups.length; floorIndex++) {
    optimizeContainerMeshes(floorGroups[floorIndex], isEmbeddedOrPi, floorIndex);
  }

  // Also optimize any non-floor top-level groups
  for (const child of root.children) {
    if (!floorGroupSet.has(child)) {
      optimizeContainerMeshes(child, isEmbeddedOrPi, undefined);
    }
  }

  return building;
}

function optimizeContainerMeshes(
  container: THREE.Object3D,
  isEmbeddedOrPi: boolean,
  floorLevel?: number
): void {
  container.updateMatrixWorld(true);
  const containerInverse = container.matrixWorld.clone().invert();

  const buckets = new Map<string, MergeBucket>();

  container.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;

    if (floorLevel !== undefined) {
      mesh.userData.floorLevel = floorLevel;
    }

    if (!mesh.visible || !mesh.geometry) return;

    // Tune texture sampling for embedded GPUs
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      const stdMat = mat as THREE.MeshStandardMaterial;
      if (stdMat && stdMat.map) {
        stdMat.map.anisotropy = isEmbeddedOrPi ? 2 : 4;
      }
    }

    // Only merge single-material meshes
    if (Array.isArray(mesh.material) || !mesh.material) return;

    // 1. Smart shadow budget: small architectural details (AC boxes, mullions, railings)
    // do not need to cast 2048px shadows — they still receive shadows from the building.
    if (mesh.castShadow) {
      tempBox.setFromObject(mesh);
      tempBox.getSize(tempSize);
      const volume = tempSize.x * tempSize.y * tempSize.z;
      const maxDim = Math.max(tempSize.x, tempSize.y, tempSize.z);
      if (volume < 1.35 && maxDim < 4.2) {
        mesh.castShadow = false;
      }
    }

    const geo = mesh.geometry;
    const attrSig = Object.keys(geo.attributes).sort().join(',');
    if (!attrSig.includes('position')) return;

    const buildingId = mesh.userData?.buildingId as string | undefined;
    const key = [
      mesh.material.uuid,
      buildingId ?? '',
      mesh.castShadow ? '1' : '0',
      mesh.receiveShadow ? '1' : '0',
      attrSig,
    ].join('|');

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        material: mesh.material,
        buildingId,
        castShadow: mesh.castShadow,
        receiveShadow: mesh.receiveShadow,
        meshes: [],
      };
      buckets.set(key, bucket);
    }
    bucket.meshes.push(mesh);
  });

  // 2. Merge each bucket with 2+ meshes into a single BufferGeometry per floor/container
  const relMatrix = new THREE.Matrix4();

  for (const bucket of buckets.values()) {
    if (bucket.meshes.length < 2) {
      const single = bucket.meshes[0];
      if (single && single.parent === container) {
        single.updateMatrix();
        single.matrixAutoUpdate = false;
      }
      continue;
    }

    const transformedGeos: THREE.BufferGeometry[] = [];
    let canMerge = true;

    for (const mesh of bucket.meshes) {
      try {
        const nonIndexed = mesh.geometry.index
          ? mesh.geometry.toNonIndexed()
          : mesh.geometry.clone();

        relMatrix.multiplyMatrices(containerInverse, mesh.matrixWorld);
        nonIndexed.applyMatrix4(relMatrix);
        transformedGeos.push(nonIndexed);
      } catch {
        canMerge = false;
        break;
      }
    }

    if (!canMerge || transformedGeos.length !== bucket.meshes.length) {
      transformedGeos.forEach((g) => g.dispose());
      continue;
    }

    const mergedGeo = mergeGeometries(transformedGeos, false);
    transformedGeos.forEach((g) => g.dispose());

    if (!mergedGeo) continue;

    const mergedMesh = new THREE.Mesh(mergedGeo, bucket.material);
    mergedMesh.castShadow = bucket.castShadow;
    mergedMesh.receiveShadow = bucket.receiveShadow;
    if (bucket.buildingId) {
      mergedMesh.userData.buildingId = bucket.buildingId;
    }
    if (floorLevel !== undefined) {
      mergedMesh.userData.floorLevel = floorLevel;
    }
    mergedMesh.matrixAutoUpdate = false;
    mergedMesh.updateMatrix();

    // Remove individual source meshes and dispose unshared geometries
    for (const mesh of bucket.meshes) {
      mesh.parent?.remove(mesh);
      if (!mesh.geometry.userData?.cached) {
        mesh.geometry.dispose();
      }
    }

    container.add(mergedMesh);
  }
}
