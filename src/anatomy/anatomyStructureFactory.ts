import * as THREE from 'three';
import { generateStructureDescription } from './descriptionMetadata';
import type { AnatomyStructure } from './types';
import { cleanStructureName, inferRegion, inferSystem, materialNames, objectContext } from './structureMetadata';

type CreateMeshStructureOptions = {
  context?: string;
  fallbackName: string;
  id: string;
  regionHint: string;
  source: string;
};

export function createMeshStructure(mesh: THREE.Mesh, options: CreateMeshStructureOptions): AnatomyStructure {
  const context = options.context ?? objectContext(mesh);
  const structureName = cleanStructureName(mesh.name || mesh.parent?.name || options.fallbackName);
  const system = inferSystem(
    structureName,
    materialNames(mesh.material as THREE.Material | THREE.Material[]),
    context
  );
  const region = inferRegion(`${structureName} ${context}`, options.regionHint);

  return {
    description: generateStructureDescription({
      context,
      name: structureName,
      region,
      source: options.source,
      system
    }),
    id: options.id,
    name: structureName,
    region,
    source: options.source,
    system
  };
}
