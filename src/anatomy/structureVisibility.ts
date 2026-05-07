import type { AnatomySystem, AnatomySystemOption } from './types';

type VisibleAnatomyStructure = {
  userData: {
    system?: AnatomySystem;
  };
  visible: boolean;
};

export function createStructureVisibility() {
  let enabledSystems = new Set<AnatomySystem>();
  const hiddenStructures = new Set<VisibleAnatomyStructure>();

  function removeHiddenStructuresForSystem(system: AnatomySystem) {
    for (const structure of hiddenStructures) {
      if (structure.userData.system === system) hiddenStructures.delete(structure);
    }
  }

  return {
    get enabledSystems() {
      return new Set(enabledSystems);
    },
    get hiddenCount() {
      return hiddenStructures.size;
    },
    applyTo(structures: VisibleAnatomyStructure[]) {
      let visibleCount = 0;
      for (const structure of structures) {
        const system = structure.userData.system;
        structure.visible = !!system && enabledSystems.has(system) && !hiddenStructures.has(structure);
        if (structure.visible) visibleCount += 1;
      }
      return visibleCount;
    },
    enableAll(systems: AnatomySystemOption[]) {
      enabledSystems = new Set(systems.map((system) => system.id));
      hiddenStructures.clear();
    },
    hideStructure(structure: VisibleAnatomyStructure) {
      hiddenStructures.add(structure);
    },
    restoreHidden() {
      hiddenStructures.clear();
    },
    setAllSystems(systems: AnatomySystemOption[], enabled: boolean) {
      enabledSystems = enabled ? new Set(systems.map((system) => system.id)) : new Set();
      if (enabled) hiddenStructures.clear();
    },
    setSystemEnabled(system: AnatomySystem, enabled: boolean) {
      if (enabled) {
        enabledSystems.add(system);
        removeHiddenStructuresForSystem(system);
      } else {
        enabledSystems.delete(system);
      }
    }
  };
}
