import { loadOpen3DModel } from './open3dModelLoader';
import type { LoadedAnatomyModel, LoadAnatomyModelOptions } from './anatomyModel';
import { loadZAnatomyModel } from './zAnatomyLoader';
import { logViewerWarning } from '../telemetry';

type AnatomySourceAdapter = {
  load: (options: LoadAnatomyModelOptions) => Promise<LoadedAnatomyModel>;
  name: string;
};

const ANATOMY_SOURCE_ADAPTERS: AnatomySourceAdapter[] = [
  { load: loadZAnatomyModel, name: 'Z-Anatomy Atlas' },
  { load: loadOpen3DModel, name: 'Open3DModel Asset fallback' }
];

export async function loadAnatomyAtlas(options: LoadAnatomyModelOptions) {
  let lastError: unknown;

  for (const adapter of ANATOMY_SOURCE_ADAPTERS) {
    try {
      return await adapter.load(options);
    } catch (error) {
      logViewerWarning('Anatomy Source Failed', {
        error: error instanceof Error ? error.message : String(error),
        source: adapter.name
      });
      lastError = error;
    }
  }

  throw lastError ?? new Error('No anatomy source adapter could load the atlas.');
}
