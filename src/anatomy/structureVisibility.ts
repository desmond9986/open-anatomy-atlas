import type { AnatomyStructureId, AnatomySystem, AnatomySystemOption, AnatomyVisibilityStructure } from './types';

export type StructureVisibilityResult = {
  visibleCount: number;
  visibleStructureIds: ReadonlySet<AnatomyStructureId>;
};

export function createStructureVisibility() {
  let enabledSystems = new Set<AnatomySystem>();
  const hiddenStructures = new Map<AnatomyStructureId, AnatomySystem>();

  function removeHiddenStructuresForSystem(system: AnatomySystem) {
    for (const [structureId, hiddenSystem] of hiddenStructures) {
      if (hiddenSystem === system) hiddenStructures.delete(structureId);
    }
  }

  return {
    get enabledSystems() {
      return new Set(enabledSystems);
    },
    get hiddenCount() {
      return hiddenStructures.size;
    },
    resolve(structures: AnatomyVisibilityStructure[]): StructureVisibilityResult {
      const visibleStructureIds = new Set<AnatomyStructureId>();
      let visibleCount = 0;
      for (const structure of structures) {
        if (enabledSystems.has(structure.system) && !hiddenStructures.has(structure.id)) {
          visibleStructureIds.add(structure.id);
          visibleCount += 1;
        }
      }
      return { visibleCount, visibleStructureIds };
    },
    enableAll(systems: AnatomySystemOption[]) {
      enabledSystems = new Set(systems.map((system) => system.id));
      hiddenStructures.clear();
    },
    hideStructure(structure: AnatomyVisibilityStructure) {
      hiddenStructures.set(structure.id, structure.system);
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
