import json
import pathlib
import re
import sys

import bpy


SYSTEM_TERMS = {
    "muscle": ["muscle", "musculus", "myology", "biceps", "triceps", "deltoid", "pectoralis"],
    "bone": ["bone", "skeleton", "skeletal", "osteology", "skull", "vertebra", "scapula", "femur", "humerus"],
    "connective": ["tendon", "ligament", "cartilage", "fascia", "aponeurosis", "meniscus"],
    "vascular": ["artery", "vein", "vascular", "vessel", "aorta", "cava", "carotid", "jugular"],
    "nervous": ["nerve", "nervous", "neural", "plexus", "brain", "spinal cord"],
    "digestive": ["stomach", "intestine", "colon", "liver", "pancreas", "esophagus", "spleen"],
    "respiratory": ["lung", "bronch", "trachea", "larynx", "pharynx", "pleura"],
    "urinary": ["kidney", "ureter", "bladder", "urethra", "renal"],
    "reproductive": ["uterus", "ovary", "testis", "prostate", "penis", "vagina"],
    "lymphatic": ["lymph", "thymus", "tonsil"],
    "organ": ["heart", "eye", "skin", "gland", "thyroid", "adrenal", "tongue", "ear"],
}

INCLUDE_COLLECTION_TERMS = [
    "skeletal system",
    "osteology",
    "muscular system",
    "cardiovascular system",
    "nervous system",
    "visceral system",
    "visceral systems",
    "digestive system",
    "respiratory system",
    "urinary system",
    "genital system",
    "lymph",
    "endocrine",
    "sense organs",
    "joints",
]

EXCLUDE_COLLECTION_NAMES = {
    "8:general",
    "bones.001",
    "collection",
    "collection.001",
    "default z-anatomy arm",
    "erasers",
    "explosion",
    "movements",
    "muscles",
    "muscles.001",
    "reference lines",
    "sagittal planes",
    "scene collection",
    "transverse planes",
}

EXCLUDE_COLLECTION_TERMS = [
    "region of",
    "regions of",
    " planes",
    "eraser",
]


def cli_args():
    if "--" not in sys.argv:
        raise SystemExit("Usage: blender -b Z-Anatomy.blend --python scripts/export-z-anatomy-gltf.py -- output.glb manifest.json")
    args = sys.argv[sys.argv.index("--") + 1 :]
    if not args:
        raise SystemExit("Missing output GLB path.")
    output = pathlib.Path(args[0]).resolve()
    manifest = pathlib.Path(args[1]).resolve() if len(args) > 1 else output.with_suffix(".manifest.json")
    return output, manifest


def clean_name(value):
    return re.sub(r"\s+", " ", value.replace("_", " ")).strip()


def collection_context(obj):
    names = [collection.name for collection in obj.users_collection]
    return " | ".join(clean_name(name) for name in names if name)


def infer_system(text):
    lowered = text.lower()
    for system, terms in SYSTEM_TERMS.items():
        if any(term in lowered for term in terms):
            return system
    return "other"


def should_export(obj, context, system):
    collection_names = [clean_name(collection.name).lower() for collection in obj.users_collection]
    lowered_context = context.lower()
    lowered_name = obj.name.lower()

    if any(name in EXCLUDE_COLLECTION_NAMES for name in collection_names):
        return False
    if any(term in lowered_context for term in EXCLUDE_COLLECTION_TERMS):
        return False
    if any(term in lowered_name for term in ["plane", "button", "eraser"]):
        return False
    if any(term in lowered_context for term in INCLUDE_COLLECTION_TERMS):
        return True

    return system != "other"


def export_kwargs(filepath):
    props = {prop.identifier for prop in bpy.ops.export_scene.gltf.get_rna_type().properties}
    requested = {
        "filepath": str(filepath),
        "export_format": "GLB",
        "export_apply": True,
        "export_materials": "EXPORT",
        "export_extras": True,
        "export_yup": True,
        "use_selection": False,
        "use_visible": False,
        "export_draco_mesh_compression_enable": True,
        "export_draco_mesh_compression_level": 6,
        "export_draco_position_quantization": 14,
        "export_draco_normal_quantization": 10,
        "export_draco_texcoord_quantization": 12,
    }
    return {key: value for key, value in requested.items() if key in props}


def main():
    output, manifest = cli_args()
    output.parent.mkdir(parents=True, exist_ok=True)
    manifest.parent.mkdir(parents=True, exist_ok=True)

    exported = []
    system_counts = {}

    for collection in bpy.data.collections:
        collection.hide_viewport = False
        collection.hide_render = False

    for obj in list(bpy.data.objects):
        obj.animation_data_clear()
        if obj.type != "MESH":
            bpy.data.objects.remove(obj, do_unlink=True)
            continue

        obj.hide_set(False)
        obj.hide_viewport = False
        obj.hide_render = False
        context = collection_context(obj)
        system = infer_system(f"{obj.name} {context}")
        if not should_export(obj, context, system):
            bpy.data.objects.remove(obj, do_unlink=True)
            continue

        obj["anatomy_collection_path"] = context
        obj["anatomy_system_hint"] = system
        exported.append({"name": obj.name, "system": system, "collections": context})
        system_counts[system] = system_counts.get(system, 0) + 1

    bpy.ops.export_scene.gltf(**export_kwargs(output))

    manifest.write_text(
        json.dumps(
            {
                "source": "Z-Anatomy Zenodo 10.5281/zenodo.4953712",
                "license": "Creative Commons Attribution 4.0 International",
                "objects": len(exported),
                "systems": system_counts,
            },
            indent=2,
            sort_keys=True,
        )
    )
    print(f"Exported {len(exported)} mesh objects to {output}")
    print(f"System counts: {system_counts}")


if __name__ == "__main__":
    main()
