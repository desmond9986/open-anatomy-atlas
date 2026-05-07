import * as THREE from 'three';
import type { AnatomySystem } from './types';

export const SYSTEM_LABELS: Record<AnatomySystem, string> = {
  bone: 'Bones',
  connective: 'Tendons/Ligaments',
  digestive: 'Digestive',
  lymphatic: 'Lymphatic',
  muscle: 'Muscles',
  nervous: 'Nervous',
  organ: 'Organs',
  other: 'Other',
  reproductive: 'Reproductive',
  respiratory: 'Respiratory',
  urinary: 'Urinary',
  vascular: 'Vessels'
};

export function systemLabel(system: AnatomySystem) {
  return SYSTEM_LABELS[system] ?? 'Other';
}

export function inferSystem(name: string, materialName = '', hint = ''): AnatomySystem {
  const text = `${name} ${materialName}`.toLowerCase();
  const hintedText = `${hint} ${text}`.toLowerCase();
  const muscleTerms = [
    'muscle',
    'musculus',
    'myology',
    'biceps',
    'triceps',
    'brachialis',
    'deltoid',
    'pectoralis',
    'supinator',
    'pronator',
    'flexor',
    'extensor',
    'lumbrical',
    'interosseous',
    'quadriceps',
    'glute',
    'iliacus',
    'psoas',
    'adductor',
    'gracilis',
    'sartorius',
    'gastrocnemius',
    'soleus',
    'tibialis',
    'peroneus',
    'fibularis',
    'plantaris',
    'obturator',
    'piriformis',
    'gemellus',
    'popliteus',
    'rectus',
    'vastus',
    'semitendinosus',
    'semimembranosus'
  ];
  const boneTerms = [
    'bone',
    'skeleton',
    'skeletal',
    'osteology',
    'vertebra',
    'vertebrae',
    'humerus',
    'femur',
    'tibia',
    'fibula',
    'radius',
    'ulna',
    'scapula',
    'clavicle',
    'sacrum',
    'coccyx',
    'sternum',
    'rib',
    'pelvis',
    'patella',
    'metacarpal',
    'metatarsal',
    'phalan',
    'calcaneus',
    'talus',
    'carpal',
    'tarsal',
    'skull',
    'mandible',
    'frontal',
    'parietal',
    'occipital',
    'temporal',
    'sphenoid',
    'ethmoid',
    'maxilla',
    'zygomatic',
    'lacrimal',
    'nasal',
    'vomer',
    'palatine',
    'ilium',
    'ischium',
    'pubis',
    'tooth',
    'teeth',
    'molar',
    'premolar',
    'canine',
    'incisor'
  ];
  const connectiveTerms = [
    'tendon',
    'ligament',
    'cartilage',
    'fascia',
    'aponeurosis',
    'linea alba',
    'meniscus',
    'disc',
    'capsule',
    'retinaculum'
  ];
  const vascularTerms = [
    'artery',
    'arteria',
    'vein',
    'vena',
    'venous',
    'vascular',
    'vessel',
    'aorta',
    'cava',
    'carotid',
    'jugular',
    'portal',
    'pulmonary trunk',
    'capillary'
  ];
  const nervousTerms = [
    'nerve',
    'nervus',
    'neural',
    'nervous',
    'plexus',
    'brain',
    'cerebrum',
    'cerebellum',
    'spinal cord',
    'medulla',
    'pons',
    'thalamus'
  ];
  const digestiveTerms = [
    'digestive',
    'stomach',
    'intestine',
    'colon',
    'rectum',
    'liver',
    'gallbladder',
    'pancreas',
    'esophagus',
    'oesophagus',
    'appendix',
    'duodenum',
    'jejunum',
    'ileum',
    'spleen'
  ];
  const respiratoryTerms = [
    'respiratory',
    'lung',
    'bronch',
    'trachea',
    'larynx',
    'pharynx',
    'pleura',
    'diaphragm'
  ];
  const urinaryTerms = ['urinary', 'kidney', 'ureter', 'bladder', 'urethra', 'renal'];
  const reproductiveTerms = [
    'reproductive',
    'uterus',
    'ovary',
    'ovarian',
    'testis',
    'testicle',
    'prostate',
    'penis',
    'vagina',
    'fallopian',
    'seminal'
  ];
  const lymphaticTerms = ['lymph', 'lymphatic', 'thymus', 'tonsil'];
  const organTerms = [
    'organ',
    'heart',
    'eye',
    'skin',
    'gland',
    'thyroid',
    'adrenal',
    'pituitary',
    'pineal',
    'tongue',
    'ear'
  ];

  if (connectiveTerms.some((term) => text.includes(term))) return 'connective';
  if (vascularTerms.some((term) => text.includes(term))) return 'vascular';
  if (nervousTerms.some((term) => text.includes(term))) return 'nervous';
  if (digestiveTerms.some((term) => text.includes(term))) return 'digestive';
  if (respiratoryTerms.some((term) => text.includes(term))) return 'respiratory';
  if (urinaryTerms.some((term) => text.includes(term))) return 'urinary';
  if (reproductiveTerms.some((term) => text.includes(term))) return 'reproductive';
  if (lymphaticTerms.some((term) => text.includes(term))) return 'lymphatic';
  if (organTerms.some((term) => text.includes(term))) return 'organ';
  if (muscleTerms.some((term) => text.includes(term))) return 'muscle';
  if (boneTerms.some((term) => text.includes(term))) return 'bone';

  if (muscleTerms.some((term) => hintedText.includes(term))) return 'muscle';
  if (boneTerms.some((term) => hintedText.includes(term))) return 'bone';
  if (connectiveTerms.some((term) => hintedText.includes(term))) return 'connective';
  if (vascularTerms.some((term) => hintedText.includes(term))) return 'vascular';
  if (nervousTerms.some((term) => hintedText.includes(term))) return 'nervous';
  if (digestiveTerms.some((term) => hintedText.includes(term))) return 'digestive';
  if (respiratoryTerms.some((term) => hintedText.includes(term))) return 'respiratory';
  if (urinaryTerms.some((term) => hintedText.includes(term))) return 'urinary';
  if (reproductiveTerms.some((term) => hintedText.includes(term))) return 'reproductive';
  if (lymphaticTerms.some((term) => hintedText.includes(term))) return 'lymphatic';
  if (organTerms.some((term) => hintedText.includes(term))) return 'organ';
  return 'other';
}

export function inferRegion(name: string, assetLabel = '') {
  const text = `${name} ${assetLabel}`.toLowerCase();
  if (
    text.includes('skull') ||
    text.includes('mandible') ||
    text.includes('frontal') ||
    text.includes('parietal') ||
    text.includes('brain') ||
    text.includes('cerebr') ||
    text.includes('eye') ||
    text.includes('ear') ||
    text.includes('tongue')
  )
    return 'Head';
  if (text.includes('cervical') || text.includes('neck')) return 'Neck';
  if (
    text.includes('heart') ||
    text.includes('lung') ||
    text.includes('trachea') ||
    text.includes('bronch') ||
    text.includes('aorta')
  )
    return 'Thorax';
  if (text.includes('rib') || text.includes('sternum') || text.includes('thoracic')) return 'Thorax';
  if (text.includes('lumbar') || text.includes('sacrum') || text.includes('coccyx')) return 'Spine and pelvis';
  if (text.includes('pelvis') || text.includes('ilium') || text.includes('ischium') || text.includes('pubis')) return 'Pelvis';
  if (
    text.includes('testis') ||
    text.includes('testicle') ||
    text.includes('prostate') ||
    text.includes('penis') ||
    text.includes('uterus') ||
    text.includes('ovary') ||
    text.includes('vagina') ||
    text.includes('bladder') ||
    text.includes('ureter')
  )
    return 'Pelvis';
  if (
    text.includes('stomach') ||
    text.includes('intestine') ||
    text.includes('colon') ||
    text.includes('liver') ||
    text.includes('pancreas') ||
    text.includes('gallbladder') ||
    text.includes('kidney') ||
    text.includes('renal') ||
    text.includes('duodenum') ||
    text.includes('oesophagus') ||
    text.includes('esophagus')
  )
    return 'Abdomen';
  if (text.includes('abdomen') || text.includes('abdominal') || text.includes('rectus abdominis')) return 'Core';
  if (text.includes('back') || text.includes('trapezius') || text.includes('latissimus')) return 'Back';
  if (text.includes('thorax') || text.includes('chest') || text.includes('pectoralis')) return 'Thorax';
  if (text.includes('hand') || text.includes('carpal') || text.includes('finger')) return 'Hand';
  if (text.includes('humerus') || text.includes('arm') || text.includes('biceps') || text.includes('triceps')) return 'Upper arm';
  if (text.includes('forearm') || text.includes('radius') || text.includes('ulna')) return 'Forearm';
  if (text.includes('foot') || text.includes('tarsal') || text.includes('metatarsal') || text.includes('calcaneus')) return 'Foot';
  if (text.includes('femur') || text.includes('quadriceps') || text.includes('thigh')) return 'Thigh';
  if (text.includes('tibia') || text.includes('fibula') || text.includes('gastrocnemius') || text.includes('leg')) return 'Lower leg';
  if (assetLabel) return assetLabel;
  return 'Anatomical structure';
}

export function cleanStructureName(name: string) {
  return name
    .replace(/\.\d+$/i, '')
    .replace(/\.(r|l)$/i, '')
    .replace(/([._\s-])(r|l)$/i, '')
    .replace(/testicler$/i, 'Testicle')
    .replace(/testiclel$/i, 'Testicle')
    .replace(/kidneyr$/i, 'Kidney')
    .replace(/kidneyl$/i, 'Kidney')
    .replace(/boner$/i, 'bone')
    .replace(/bonel$/i, 'bone')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function makeLeftSideName(name: string) {
  return name
    .replace(/\.r$/i, '.l')
    .replace(/([_\s-])r$/i, '$1l')
    .replace(/\bright\b/i, 'left');
}

export function materialNames(material: THREE.Material | THREE.Material[]) {
  const list = Array.isArray(material) ? material : [material];
  return list.map((item) => item.name).filter(Boolean).join(' ');
}

export function objectContext(object: THREE.Object3D) {
  const names: string[] = [];
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.name) names.push(current.name);
    current = current.parent;
  }
  const extras = object.userData as { anatomy_collection_path?: string; anatomy_system_hint?: string };
  if (extras.anatomy_collection_path) names.push(extras.anatomy_collection_path);
  if (extras.anatomy_system_hint) names.push(extras.anatomy_system_hint);
  return names.join(' ');
}
