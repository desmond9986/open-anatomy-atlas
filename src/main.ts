import { createAnatomyViewer } from './anatomy/anatomyViewer';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app mount point');
}

createAnatomyViewer(app);
