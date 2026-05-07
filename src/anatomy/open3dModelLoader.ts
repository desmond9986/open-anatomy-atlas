import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { AnatomyStructure, AnatomySystem, Open3DModelAsset } from './types';
import { generateStructureDescription } from './descriptionMetadata';
import { cleanStructureName, inferRegion, inferSystem, makeLeftSideName, materialNames } from './structureMetadata';

const OPEN_3D_MODEL_ASSETS: Open3DModelAsset[] = [
  {
    label: 'Full skeleton',
    mirrorRightSide: false,
    path: '/models/open3dmodel/overview-skeleton/overview-skeleton.glb'
  },
  {
    label: 'Upper limb selection model',
    mirrorRightSide: true,
    path: '/models/open3dmodel/upper-limb/upper-limb.glb'
  },
  {
    label: 'Lower limb selection model',
    mirrorRightSide: true,
    path: '/models/open3dmodel/lower-limb/lower-limb.glb'
  },
  {
    label: 'Pelvic floor and perineum',
    mirrorRightSide: false,
    path: '/models/open3dmodel/pelvicfloor/pelvicfloor.glb'
  },
  {
    label: 'Inguinal canal',
    mirrorRightSide: false,
    path: '/models/open3dmodel/inguinal-canal/inguinal-canal.glb'
  }
];

export type LoadedAnatomyModel = {
  group: THREE.Group;
  sourceText: string;
  structures: THREE.Mesh[];
  structureCount: number;
  systemCounts: Map<AnatomySystem, number>;
};

type LoadOpen3DModelOptions = {
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

function createStructure(mesh: THREE.Mesh, assetLabel: string): AnatomyStructure {
  const structureName = cleanStructureName(mesh.name || mesh.parent?.name || 'Open3DModel structure');
  const system = inferSystem(structureName, materialNames(mesh.material as THREE.Material | THREE.Material[]));
  const region = inferRegion(structureName, assetLabel);
  return {
    description: generateStructureDescription({
      context: assetLabel,
      name: structureName,
      region,
      source: 'Open3DModel',
      system
    }),
    name: structureName,
    region,
    source: 'Open3DModel',
    system
  };
}

function countSystem(systemCounts: Map<AnatomySystem, number>, system: AnatomySystem) {
  systemCounts.set(system, (systemCounts.get(system) ?? 0) + 1);
}

function registerMesh(
  mesh: THREE.Mesh,
  assetLabel: string,
  structures: THREE.Mesh[],
  systemCounts: Map<AnatomySystem, number>
) {
  mesh.material = cloneMaterial(mesh.material as THREE.Material | THREE.Material[]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const structure = createStructure(mesh, assetLabel);
  mesh.userData.system = structure.system;
  mesh.userData.part = structure;
  mesh.userData.source = 'open3d';
  countSystem(systemCounts, structure.system);
  structures.push(mesh);
}

function createMirroredScene(
  loadedScene: THREE.Group,
  assetLabel: string,
  structures: THREE.Mesh[],
  systemCounts: Map<AnatomySystem, number>
) {
  const mirroredScene = loadedScene.clone(true);
  mirroredScene.name = `${assetLabel} mirrored left side`;
  mirroredScene.scale.x = -1;
  mirroredScene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.name = makeLeftSideName(mesh.name || mesh.parent?.name || 'Open3DModel mirrored structure');
    registerMesh(mesh, assetLabel, structures, systemCounts);
  });
  return mirroredScene;
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

export async function loadOpen3DModel(options: LoadOpen3DModelOptions): Promise<LoadedAnatomyModel> {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(options.dracoDecoderPath);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  try {
    const structures: THREE.Mesh[] = [];
    const systemCounts = new Map<AnatomySystem, number>();
    const group = new THREE.Group();
    group.name = 'Open3DModel anatomy';

    const results = await Promise.all(
      OPEN_3D_MODEL_ASSETS.map(async (asset) => ({
        asset,
        scene: (await loader.loadAsync(asset.path)).scene
      }))
    );

    for (const { asset, scene } of results) {
      scene.name = asset.label;
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) registerMesh(mesh, asset.label, structures, systemCounts);
      });
      group.add(scene);
      if (asset.mirrorRightSide) {
        group.add(createMirroredScene(scene, asset.label, structures, systemCounts));
      }
    }

    fitGroupToBody(group, options.targetHeight, options.floorY);

    return {
      group,
      sourceText: `Loaded ${structures.length} Open3DModel structures from official AnatomyTOOL selection models: skeleton, upper limb, lower limb, pelvic floor, and inguinal canal. Source: AnatomyTOOL/Open3DModel, CC BY-SA.`,
      structureCount: structures.length,
      systemCounts,
      structures
    };
  } finally {
    dracoLoader.dispose();
  }
}
