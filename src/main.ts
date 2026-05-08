import { createAnatomyViewer } from './anatomy/anatomyViewer';
import './styles.css';
import { initializeTelemetry } from './telemetry';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app mount point');
}

initializeTelemetry();
createAnatomyViewer(app);
