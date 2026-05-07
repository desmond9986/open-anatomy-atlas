import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { AnatomyStructure, AnatomySystem } from './types';
import { generateStructureDescription } from './descriptionMetadata';
import { cleanStructureName, inferRegion, inferSystem, materialNames, objectContext } from './structureMetadata';

const Z_ANATOMY_PATH = '/models/z-anatomy/z-anatomy.glb';

export type LoadedAnatomyModel = {
  group: THREE.Group;
  sourceText: string;
  structures: THREE.Mesh[];
  structureCount: number;
  systemCounts: Map<AnatomySystem, number>;
};

type LoadZAnatomyOptions = {
  dracoDecoderPath: string;
  floorY: number;
  targetHeight: number;
};

function cloneMaterial(material: THREE.Material | THREE.Material[]) {
  const cloneOne = (item: THREE.Material) => {
    const cloned = item.clone();
    cloned.side = THREE.DoubleSide;
    return cloned;
  };
  return Array.isArray(material) ? material.map(cloneOne) : cloneOne(material);
}

function countSystem(systemCounts: Map<AnatomySystem, number>, system: AnatomySystem) {
  systemCounts.set(system, (systemCounts.get(system) ?? 0) + 1);
}

function createStructure(mesh: THREE.Mesh): AnatomyStructure {
  const context = objectContext(mesh);
  const structureName = cleanStructureName(mesh.name || mesh.parent?.name || 'Z-Anatomy structure');
  const system = inferSystem(
    structureName,
    materialNames(mesh.material as THREE.Material | THREE.Material[]),
    context
  );

  const region = inferRegion(`${structureName} ${context}`, 'Z-Anatomy');
  return {
    description: generateStructureDescription({
      context,
      name: structureName,
      region,
      source: 'Z-Anatomy',
      system
    }),
    name: structureName,
    region,
    source: 'Z-Anatomy',
    system
  };
}

function registerMesh(mesh: THREE.Mesh, structures: THREE.Mesh[], systemCounts: Map<AnatomySystem, number>) {
  mesh.material = cloneMaterial(mesh.material as THREE.Material | THREE.Material[]);
  mesh.castShadow = false;
  mesh.receiveShadow = false;

  const structure = createStructure(mesh);
  mesh.userData.system = structure.system;
  mesh.userData.part = structure;
  mesh.userData.source = 'z-anatomy';
  countSystem(systemCounts, structure.system);
  structures.push(mesh);
}

function fitGroupToBody(group: THREE.Group, targetHeight: number, floorY: number) {
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  if (size.y <= 0) return;
  const scale = targetHeight / size.y;
  group.scale.setScalar(scale);
  group.position.set(-center.x * scale, floorY - box.min.y * scale, -center.z * scale);
}

export async function loadZAnatomyModel(options: LoadZAnatomyOptions): Promise<LoadedAnatomyModel> {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(options.dracoDecoderPath);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  try {
    const gltf = await loader.loadAsync(Z_ANATOMY_PATH);
    const group = gltf.scene;
    group.name = 'Z-Anatomy full atlas';

    const structures: THREE.Mesh[] = [];
    const systemCounts = new Map<AnatomySystem, number>();
    group.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) registerMesh(mesh, structures, systemCounts);
    });

    fitGroupToBody(group, options.targetHeight, options.floorY);

    return {
      group,
      sourceText: `Loaded ${structures.length} Z-Anatomy structures converted to GLB. Source: Z-Anatomy / BodyParts3D, CC BY-SA.`,
      structureCount: structures.length,
      structures,
      systemCounts
    };
  } finally {
    dracoLoader.dispose();
  }
}
