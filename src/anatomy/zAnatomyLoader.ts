import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { fitGroupToBody, registerAnatomyMesh, type LoadedAnatomyModel, type LoadAnatomyModelOptions } from './anatomyModel';
import type { AnatomySystem } from './types';

const Z_ANATOMY_PATH = '/models/z-anatomy/z-anatomy.glb';

function registerMesh(mesh: THREE.Mesh, structures: THREE.Mesh[], systemCounts: Map<AnatomySystem, number>) {
  registerAnatomyMesh(mesh, { structures, systemCounts }, {
    castShadow: false,
    fallbackName: 'Z-Anatomy structure',
    receiveShadow: false,
    regionHint: 'Z-Anatomy',
    source: 'Z-Anatomy',
    sourceKey: 'z-anatomy'
  });
}

export async function loadZAnatomyModel(options: LoadAnatomyModelOptions): Promise<LoadedAnatomyModel> {
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
