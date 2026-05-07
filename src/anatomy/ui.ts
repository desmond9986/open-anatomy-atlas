import type { AnatomySystem, AnatomySystemOption } from './types';
import { systemLabel } from './structureMetadata';

export type AnatomyShell = {
  canvas: HTMLCanvasElement;
  clearButton: HTMLButtonElement;
  descriptionEl: HTMLElement;
  detailsPanel: HTMLElement;
  detailsToggleButton: HTMLButtonElement;
  hideAllButton: HTMLButtonElement;
  hideSelectedButton: HTMLButtonElement;
  nameEl: HTMLElement;
  restoreHiddenButton: HTMLButtonElement;
  systemsPanel: HTMLElement;
  systemsToggleButton: HTMLButtonElement;
  regionEl: HTMLElement;
  resetButton: HTMLButtonElement;
  showAllButton: HTMLButtonElement;
  sourceEl: HTMLElement;
  systemFiltersEl: HTMLElement;
  visibleCountEl: HTMLElement;
};

export function mountAnatomyShell(root: HTMLDivElement): AnatomyShell {
  root.innerHTML = `
    <canvas class="viewer" aria-label="3D anatomy viewer"></canvas>
    <header class="topbar">
      <div>
        <p class="eyebrow">Interactive 3D Study Model</p>
        <h1>Open Anatomy Atlas</h1>
      </div>
      <div class="toolbar" aria-label="Viewer tools">
        <button type="button" id="reset-view">Reset view</button>
        <button type="button" id="clear-selection">Clear</button>
      </div>
    </header>
    <aside class="systems-panel" id="systems-panel" aria-label="Anatomy system controls">
      <div class="systems-heading panel-titlebar">
        <div>
          <p class="panel-label">Systems</p>
          <p id="visible-count">Loading anatomy systems...</p>
        </div>
        <div class="mini-actions">
          <button type="button" id="show-all" class="layer-action">All</button>
          <button type="button" id="hide-all" class="layer-action">None</button>
          <button type="button" id="restore-hidden" class="layer-action" disabled>Show hidden</button>
          <button type="button" id="toggle-systems-panel" class="panel-toggle" aria-controls="systems-body" aria-expanded="true">Minimize</button>
        </div>
      </div>
      <div class="collapsible-body" id="systems-body">
        <div class="system-filters" id="system-filters" aria-label="Anatomy system filters"></div>
      </div>
    </aside>
    <aside class="panel" id="details-panel" aria-label="Selected anatomy details">
      <div class="panel-titlebar">
        <p class="panel-label">Selected structure</p>
        <button type="button" id="toggle-details-panel" class="panel-toggle" aria-controls="details-body" aria-expanded="true">Minimize</button>
      </div>
      <div class="collapsible-body" id="details-body">
        <h2 id="part-name">Click any structure</h2>
        <p id="part-region">Rotate, zoom, then select a highlighted structure.</p>
        <p id="part-description">This viewer uses open anatomy assets for educational orientation, not diagnosis.</p>
        <div class="structure-actions">
          <button type="button" id="hide-selected" class="structure-action" disabled>Hide selected</button>
        </div>
        <p class="source" id="source-status">Loading Z-Anatomy atlas...</p>
      </div>
    </aside>
    <div class="hint">Drag to rotate. Scroll over a region to zoom there. Hide selected parts from Details.</div>
  `;

  const canvas = root.querySelector<HTMLCanvasElement>('.viewer');
  const clearButton = root.querySelector<HTMLButtonElement>('#clear-selection');
  const detailsPanel = root.querySelector<HTMLElement>('#details-panel');
  const detailsToggleButton = root.querySelector<HTMLButtonElement>('#toggle-details-panel');
  const hideAllButton = root.querySelector<HTMLButtonElement>('#hide-all');
  const hideSelectedButton = root.querySelector<HTMLButtonElement>('#hide-selected');
  const nameEl = root.querySelector<HTMLElement>('#part-name');
  const regionEl = root.querySelector<HTMLElement>('#part-region');
  const descriptionEl = root.querySelector<HTMLElement>('#part-description');
  const resetButton = root.querySelector<HTMLButtonElement>('#reset-view');
  const restoreHiddenButton = root.querySelector<HTMLButtonElement>('#restore-hidden');
  const showAllButton = root.querySelector<HTMLButtonElement>('#show-all');
  const sourceEl = root.querySelector<HTMLElement>('#source-status');
  const systemsPanel = root.querySelector<HTMLElement>('#systems-panel');
  const systemsToggleButton = root.querySelector<HTMLButtonElement>('#toggle-systems-panel');
  const systemFiltersEl = root.querySelector<HTMLElement>('#system-filters');
  const visibleCountEl = root.querySelector<HTMLElement>('#visible-count');

  if (
    !canvas ||
    !clearButton ||
    !detailsPanel ||
    !detailsToggleButton ||
    !hideAllButton ||
    !hideSelectedButton ||
    !nameEl ||
    !regionEl ||
    !descriptionEl ||
    !resetButton ||
    !restoreHiddenButton ||
    !showAllButton ||
    !sourceEl ||
    !systemsPanel ||
    !systemsToggleButton ||
    !systemFiltersEl ||
    !visibleCountEl
  ) {
    throw new Error('Anatomy shell failed to mount required elements.');
  }

  return {
    canvas,
    clearButton,
    descriptionEl,
    detailsPanel,
    detailsToggleButton,
    hideAllButton,
    hideSelectedButton,
    nameEl,
    restoreHiddenButton,
    systemsPanel,
    systemsToggleButton,
    regionEl,
    resetButton,
    showAllButton,
    sourceEl,
    systemFiltersEl,
    visibleCountEl
  };
}

export function renderSystemFilters(
  container: HTMLElement,
  options: AnatomySystemOption[],
  enabledSystems: ReadonlySet<AnatomySystem>,
  onToggle: (system: AnatomySystem, enabled: boolean) => void
) {
  container.innerHTML = '';

  for (const option of options) {
    const label = document.createElement('label');
    label.className = 'system-toggle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = enabledSystems.has(option.id);
    checkbox.dataset.system = option.id;
    checkbox.addEventListener('change', () => onToggle(option.id, checkbox.checked));

    const name = document.createElement('span');
    name.textContent = systemLabel(option.id);

    const count = document.createElement('strong');
    count.textContent = String(option.count);

    label.append(checkbox, name, count);
    container.append(label);
  }
}
