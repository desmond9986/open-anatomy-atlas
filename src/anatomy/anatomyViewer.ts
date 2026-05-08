import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadAnatomyAtlas } from './atlasSource';
import type { LoadedAnatomyModel } from './anatomyModel';
import { createStructureVisibility } from './structureVisibility';
import { systemLabel } from './structureMetadata';
import type { AnatomyStructure, AnatomySystem, AnatomySystemOption, AnatomyVisibilityStructure } from './types';
import { logViewerError, logViewerEvent } from '../telemetry';
import {
  isDetailsPanelCollapsed,
  isSystemsPanelCollapsed,
  mountAnatomyShell,
  renderSystemFilters,
  setDetailsPanelCollapsed,
  setSystemsPanelCollapsed,
  showEmptySelection,
  showSelectedStructure,
  updateSourceStatus,
  updateStructureActions,
  updateVisibleStructureCount
} from './ui';

const FLOOR_Y = -2.26;
const TARGET_BODY_HEIGHT = 6.75;
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 3.0, 10.8);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 1.45, 0);

export type AnatomyViewer = {
  dispose: () => void;
};

function materialList(material: THREE.Material | THREE.Material[]) {
  return Array.isArray(material) ? material : [material];
}

function materialColor(material: THREE.Material) {
  const maybeColor = material as THREE.Material & { color?: THREE.Color };
  return maybeColor.color;
}

export function createAnatomyViewer(root: HTMLDivElement): AnatomyViewer {
  const shell = mountAnatomyShell(root);
  const renderer = new THREE.WebGLRenderer({ canvas: shell.canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1117);
  scene.fog = new THREE.Fog(0x0d1117, 10, 24);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.03, 80);
  camera.position.copy(DEFAULT_CAMERA_POSITION);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.copy(DEFAULT_CAMERA_TARGET);
  controls.cursor.copy(DEFAULT_CAMERA_TARGET);
  controls.minDistance = 0.8;
  controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI * 0.9;
  controls.panSpeed = 0.9;
  controls.zoomSpeed = 0.8;
  controls.zoomToCursor = true;

  scene.add(new THREE.HemisphereLight(0xb9d4ff, 0x1c2331, 1.6));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
  keyLight.position.set(4, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x5ee7ff, 1.4);
  rimLight.position.set(-5, 4, -4);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.8, 80),
    new THREE.MeshStandardMaterial({ color: 0x151b24, roughness: 0.82, metalness: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y - 0.1;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(9, 18, 0x2a3442, 0x1b2430);
  grid.position.y = FLOOR_Y - 0.08;
  scene.add(grid);

  const body = new THREE.Group();
  scene.add(body);

  let anatomyMeshes: THREE.Mesh[] = [];
  let availableSystems: AnatomySystemOption[] = [];
  let hovered: THREE.Mesh | null = null;
  let selected: THREE.Mesh | null = null;
  let animationFrame = 0;
  let lastHoverPickAt = 0;
  let pointerDownPosition = new THREE.Vector2();
  const visibility = createStructureVisibility();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const baseColors = new WeakMap<THREE.Material, THREE.Color>();
  const clock = new THREE.Clock();
  const compactPanelsQuery = window.matchMedia('(max-width: 760px)');

  function applyPanelDefaultsForViewport() {
    const shouldCollapse = compactPanelsQuery.matches;
    setSystemsPanelCollapsed(shell, shouldCollapse);
    setDetailsPanelCollapsed(shell, shouldCollapse);
  }

  function setEmphasis(mesh: THREE.Mesh | null, active: boolean) {
    if (!mesh) return;
    for (const material of materialList(mesh.material as THREE.Material | THREE.Material[])) {
      const color = materialColor(material);
      if (!color) continue;
      if (!baseColors.has(material)) baseColors.set(material, color.clone());
      color.copy(baseColors.get(material)!);
      if (active) color.lerp(new THREE.Color(0x5ee7ff), 0.45);
    }
  }

  function setPointerFromClientPosition(clientX: number, clientY: number) {
    const rect = shell.canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
  }

  function intersectVisibleAnatomy() {
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(
      anatomyMeshes.filter((mesh) => mesh.visible),
      false
    )[0];
  }

  function refreshStructureActions() {
    updateStructureActions(shell, !!selected, visibility.hiddenCount);
  }

  function structureForMesh(mesh: THREE.Mesh | null) {
    return mesh?.userData.part as AnatomyStructure | undefined;
  }

  function visibilityStructureForMesh(mesh: THREE.Mesh): AnatomyVisibilityStructure | null {
    const structure = structureForMesh(mesh);
    return structure ? { id: structure.id, system: structure.system } : null;
  }

  function setSelection(mesh: THREE.Mesh | null) {
    if (selected && selected !== hovered) setEmphasis(selected, false);
    selected = mesh;
    setEmphasis(selected, true);
    const structure = structureForMesh(selected);
    if (!structure) {
      showEmptySelection(shell, compactPanelsQuery.matches);
      refreshStructureActions();
      return;
    }
    showSelectedStructure(shell, structure, compactPanelsQuery.matches);
    logViewerEvent('Structure Selected', {
      name: structure.name,
      region: structure.region,
      source: structure.source,
      system: structure.system
    });
    refreshStructureActions();
  }

  function updateVisibility() {
    const visibilityStructures = anatomyMeshes
      .map(visibilityStructureForMesh)
      .filter((structure): structure is AnatomyVisibilityStructure => !!structure);
    const visibilityResult = visibility.resolve(visibilityStructures);

    for (const mesh of anatomyMeshes) {
      const structure = structureForMesh(mesh);
      mesh.visible = !!structure && visibilityResult.visibleStructureIds.has(structure.id);
    }

    updateVisibleStructureCount(shell, visibilityResult.visibleCount);
    if (selected && !selected.visible) setSelection(null);
    refreshStructureActions();
  }

  function pick(event: PointerEvent, commit: boolean) {
    const now = performance.now();
    if (!commit && now - lastHoverPickAt < 45) return;
    lastHoverPickAt = now;

    setPointerFromClientPosition(event.clientX, event.clientY);
    const hit = intersectVisibleAnatomy();
    const hitMesh = hit?.object as THREE.Mesh | undefined;

    if (hovered && hovered !== selected) setEmphasis(hovered, false);
    hovered = hitMesh ?? null;
    if (hovered) setEmphasis(hovered, true);
    shell.canvas.style.cursor = hovered ? 'pointer' : 'grab';
    if (commit && hovered) setSelection(hovered);
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function resetCamera() {
    camera.position.copy(DEFAULT_CAMERA_POSITION);
    controls.target.copy(DEFAULT_CAMERA_TARGET);
    controls.cursor.copy(DEFAULT_CAMERA_TARGET);
    controls.update();
    logViewerEvent('Camera Reset');
  }

  function setSystemEnabled(system: AnatomySystem, enabled: boolean) {
    visibility.setSystemEnabled(system, enabled);
    updateVisibility();
    renderSystemFilters(shell.systemFiltersEl, availableSystems, visibility.enabledSystems, setSystemEnabled);
    refreshStructureActions();
    logViewerEvent('System Filter Changed', {
      enabled,
      system
    });
  }

  function setAllSystems(enabled: boolean) {
    visibility.setAllSystems(availableSystems, enabled);
    updateVisibility();
    renderSystemFilters(shell.systemFiltersEl, availableSystems, visibility.enabledSystems, setSystemEnabled);
    refreshStructureActions();
    logViewerEvent('All Systems Changed', {
      enabled,
      systems: availableSystems.length
    });
  }

  function hideSelectedStructure() {
    const structure = structureForMesh(selected);
    if (!structure) return;
    visibility.hideStructure({ id: structure.id, system: structure.system });
    logViewerEvent('Structure Hidden', {
      name: structure.name,
      source: structure.source,
      system: structure.system
    });
    setEmphasis(selected, false);
    setSelection(null);
    updateVisibility();
  }

  function restoreHiddenStructures() {
    const restoredCount = visibility.hiddenCount;
    visibility.restoreHidden();
    updateVisibility();
    logViewerEvent('Hidden Structures Restored', {
      count: restoredCount
    });
  }

  function applyLoadedModel(model: LoadedAnatomyModel) {
    anatomyMeshes = model.structures;
    availableSystems = Array.from(model.systemCounts.entries())
      .map(([id, count]) => ({ count, id }))
      .sort((a, b) => systemLabel(a.id).localeCompare(systemLabel(b.id)));
    visibility.enableAll(availableSystems);
    body.add(model.group);
    updateSourceStatus(shell, model.sourceText);
    renderSystemFilters(shell.systemFiltersEl, availableSystems, visibility.enabledSystems, setSystemEnabled);
    updateVisibility();
    refreshStructureActions();
    logViewerEvent('Atlas Loaded', {
      source: model.sourceText,
      structures: anatomyMeshes.length,
      systems: availableSystems.length
    });
  }

  function toggleSystemsPanel() {
    const collapsed = !isSystemsPanelCollapsed(shell);
    setSystemsPanelCollapsed(shell, collapsed);
    logViewerEvent('Systems Panel Toggled', { collapsed });
  }

  function toggleDetailsPanel() {
    const collapsed = !isDetailsPanelCollapsed(shell);
    setDetailsPanelCollapsed(shell, collapsed);
    logViewerEvent('Details Panel Toggled', { collapsed });
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    animationFrame = requestAnimationFrame(animate);
    if (!selected) body.rotation.y = Math.sin(elapsed * 0.2) * 0.08;
    controls.update();
    renderer.render(scene, camera);
  }

  shell.canvas.addEventListener('pointermove', (event) => pick(event, false));
  shell.canvas.addEventListener('pointerdown', (event) => {
    pointerDownPosition.set(event.clientX, event.clientY);
    shell.canvas.style.cursor = 'grabbing';
  });
  shell.canvas.addEventListener('pointerup', (event) => {
    const pointerUpPosition = new THREE.Vector2(event.clientX, event.clientY);
    const isTapOrClick = pointerUpPosition.distanceTo(pointerDownPosition) < 8;
    if (isTapOrClick) pick(event, true);
    else shell.canvas.style.cursor = hovered ? 'pointer' : 'grab';
  });
  shell.resetButton.addEventListener('click', resetCamera);
  shell.clearButton.addEventListener('click', () => setSelection(null));
  shell.hideSelectedButton.addEventListener('click', hideSelectedStructure);
  shell.restoreHiddenButton.addEventListener('click', restoreHiddenStructures);
  shell.showAllButton.addEventListener('click', () => setAllSystems(true));
  shell.hideAllButton.addEventListener('click', () => setAllSystems(false));
  shell.systemsToggleButton.addEventListener('click', toggleSystemsPanel);
  shell.detailsToggleButton.addEventListener('click', toggleDetailsPanel);

  window.addEventListener('resize', resize);
  compactPanelsQuery.addEventListener('change', applyPanelDefaultsForViewport);
  applyPanelDefaultsForViewport();
  resize();
  animate();

  logViewerEvent('Atlas Load Started');
  void loadAnatomyAtlas({
    dracoDecoderPath: '/draco/gltf/',
    floorY: FLOOR_Y,
    targetHeight: TARGET_BODY_HEIGHT
  })
    .then(applyLoadedModel)
    .catch((error) => {
      logViewerError('Atlas Load Failed', error);
      updateSourceStatus(shell, 'Detailed anatomy assets could not be loaded.');
    });

  return {
    dispose() {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      compactPanelsQuery.removeEventListener('change', applyPanelDefaultsForViewport);
      controls.dispose();
      renderer.dispose();
    }
  };
}
