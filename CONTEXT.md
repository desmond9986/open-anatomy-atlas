# Context

## Product Name

- **Open Anatomy Atlas**: The public app name. It should not imply that this project is the official Z-Anatomy product.

## Domain Vocabulary

- **Anatomy Structure**: A named mesh in the viewer representing a body structure such as a muscle, bone, tendon, vessel, nerve, organ, or supporting anatomical feature.
- **Anatomy System**: The study category used to show or hide Anatomy Structures. Current systems include muscles, bones, tendons/ligaments, vessels, nerves, organs, and other source-provided systems.
- **Z-Anatomy Atlas**: The preferred full-body `.blend` anatomy source from Z-Anatomy/BodyParts3D. It is converted to GLB before the browser loads it.
- **Open3DModel Asset**: A downloaded GLB model from AnatomyTOOL/Open3DModel used as the detailed anatomy source.
- **System Filter**: A user-controlled toggle that independently shows or hides Anatomy Structures by Anatomy System.
- **Structure Description**: Educational copy generated from the source mesh name, Anatomy System, region, and known anatomy terms. It is not diagnostic medical guidance.
- **Selection Panel**: The information area that displays the selected Anatomy Structure name, region, system, source, and Structure Description.

## Product Notes

- The viewer is educational. It must not present itself as diagnostic medical software.
- Prefer the converted Z-Anatomy Atlas when `public/models/z-anatomy/z-anatomy.glb` exists.
- Open3DModel remains a fallback for development if the Z-Anatomy conversion is missing.
- Do not reintroduce procedural or fake muscle overlays; the user wants real source-provided anatomy.
- Anatomy sources must preserve attribution in the UI.
- Descriptions should stay educational and conservative; source-provided mesh names are authoritative, while generated explanatory text is helper context.
