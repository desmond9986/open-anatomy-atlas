# Open Anatomy Atlas

Open Anatomy Atlas is an interactive Three.js anatomy viewer for exploring a full-body educational model in the browser. It loads the Z-Anatomy atlas first, with Open3DModel assets kept as a fallback.

Live app: https://open-anatomy-atlas.vercel.app

## Features

- Full-body 3D anatomy model with muscles, bones, vessels, organs, nerves, and supporting structures.
- Click any Anatomy Structure to view its name, region, system, source, and a short educational description.
- Toggle Anatomy Systems on or off from the Systems panel.
- Hide a selected structure temporarily, then restore hidden structures.
- Cursor-centered zoom with standard drag-to-rotate OrbitControls behavior.
- Collapsible panels for smaller screens.

## Tech Stack

- Vite
- TypeScript
- Three.js
- Vercel

## Run Locally

```bash
npm install
npm run dev
```

Then open http://127.0.0.1:5173.

## Build

```bash
npm run build
```

## Anatomy Assets

The viewer uses open anatomy assets for educational orientation only. It is not diagnostic medical software.

- Primary model: Z-Anatomy / BodyParts3D, converted to GLB for this viewer.
- Fallback assets: AnatomyTOOL Open3DModel selection models.
- App code is MIT licensed. Model attribution and asset license details are in [ASSET_LICENSES.md](ASSET_LICENSES.md).

## License

- Application code: [MIT](LICENSE)
- Anatomy model assets: see [ASSET_LICENSES.md](ASSET_LICENSES.md)

## Project Structure

```text
src/anatomy/
  anatomyViewer.ts          Three.js scene, camera, picking, and UI wiring
  structureVisibility.ts    System Filter and hidden-structure visibility rules
  zAnatomyLoader.ts         Z-Anatomy GLB loader
  open3dModelLoader.ts      Open3DModel fallback loader
  structureMetadata.ts      System/region/name inference helpers
  descriptionMetadata.ts    Educational description rules
  ui.ts                     DOM shell and System Filter rendering
```

## Deploy

This project is configured for Vercel.

```bash
npm run build
vercel deploy --prod
```
