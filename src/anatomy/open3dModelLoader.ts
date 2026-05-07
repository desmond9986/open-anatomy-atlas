import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { fitGroupToBody, registerAnatomyMesh, type LoadedAnatomyModel, type LoadAnatomyModelOptions } from './anatomyModel';
import type { AnatomySystem, Open3DModelAsset } from './types';
import { makeLeftSideName } from './structureMetadata';

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

function registerMesh(
  mesh: THREE.Mesh,
  assetLabel: string,
  structures: THREE.Mesh[],
  systemCounts: Map<AnatomySystem, number>
) {
  registerAnatomyMesh(mesh, { structures, systemCounts }, {
    castShadow: true,
    context: assetLabel,
    fallbackName: 'Open3DModel structure',
    receiveShadow: true,
    regionHint: assetLabel,
    source: 'Open3DModel',
    sourceKey: 'open3d'
  });
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

export async function loadOpen3DModel(options: LoadAnatomyModelOptions): Promise<LoadedAnatomyModel> {
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
