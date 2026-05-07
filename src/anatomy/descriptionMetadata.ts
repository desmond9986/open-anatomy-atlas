import type { AnatomySystem } from './types';

type DescriptionInput = {
  context?: string;
  name: string;
  region: string;
  source: string;
  system: AnatomySystem;
};

type Rule = {
  terms: string[];
  text: string;
};

const MUSCLE_RULES: Rule[] = [
  {
    terms: ['rectus abdominis'],
    text: 'This paired front-of-core muscle helps flex the trunk and tense the abdominal wall.'
  },
  {
    terms: ['external abdominal oblique'],
    text: 'This outer abdominal wall muscle helps rotate and bend the trunk while supporting abdominal pressure.'
  },
  {
    terms: ['internal abdominal oblique'],
    text: 'This abdominal wall muscle works with the external oblique to rotate, bend, and brace the trunk.'
  },
  {
    terms: ['transversus abdominis'],
    text: 'This deep abdominal muscle wraps the core and helps stabilize the trunk by compressing the abdominal wall.'
  },
  {
    terms: ['pectoralis major'],
    text: 'This large chest muscle helps move the upper arm across the body, forward, and inward.'
  },
  {
    terms: ['deltoid'],
    text: 'This shoulder muscle forms the rounded shoulder contour and helps lift and rotate the arm.'
  },
  {
    terms: ['trapezius'],
    text: 'This broad upper-back and neck muscle helps move, rotate, and stabilize the shoulder blade.'
  },
  {
    terms: ['latissimus dorsi'],
    text: 'This broad back muscle helps pull the upper arm backward, inward, and toward the trunk.'
  },
  {
    terms: ['sternocleidomastoid'],
    text: 'This neck muscle helps rotate the head, bend the neck, and assist with forced breathing.'
  },
  {
    terms: ['biceps brachii'],
    text: 'This upper-arm muscle helps bend the elbow and rotate the forearm so the palm turns upward.'
  },
  {
    terms: ['triceps brachii'],
    text: 'This posterior upper-arm muscle straightens the elbow and helps extend the arm at the shoulder.'
  },
  {
    terms: ['brachialis'],
    text: 'This deep upper-arm muscle is a strong elbow flexor located beneath the biceps brachii.'
  },
  {
    terms: ['brachioradialis'],
    text: 'This forearm muscle helps bend the elbow, especially when the hand is in a neutral handshake position.'
  },
  {
    terms: ['gluteus maximus'],
    text: 'This large hip muscle powers hip extension, rising from sitting, climbing, and strong backward leg movement.'
  },
  {
    terms: ['gluteus medius', 'gluteus minimus'],
    text: 'This hip muscle helps move the thigh outward and stabilizes the pelvis during walking.'
  },
  {
    terms: ['sartorius'],
    text: 'This long strap-like thigh muscle helps flex, rotate, and position the hip and knee.'
  },
  {
    terms: ['rectus femoris'],
    text: 'This quadriceps muscle helps straighten the knee and also assists with lifting the thigh.'
  },
  {
    terms: ['vastus lateralis', 'vastus medialis', 'vastus intermedius'],
    text: 'This quadriceps muscle helps straighten the knee during standing, walking, and jumping.'
  },
  {
    terms: ['biceps femoris', 'semitendinosus', 'semimembranosus'],
    text: 'This hamstring muscle helps bend the knee and extend the hip during walking and running.'
  },
  {
    terms: ['gastrocnemius'],
    text: 'This calf muscle helps point the foot downward and contributes to knee flexion.'
  },
  {
    terms: ['soleus'],
    text: 'This deep calf muscle helps point the foot downward and is important for standing posture.'
  },
  {
    terms: ['tibialis anterior'],
    text: 'This shin muscle helps lift the front of the foot and supports controlled foot placement.'
  },
  {
    terms: ['flexor'],
    text: 'This muscle belongs to a flexor group, which generally bends a joint or curls a body segment.'
  },
  {
    terms: ['extensor'],
    text: 'This muscle belongs to an extensor group, which generally straightens a joint or opens a body segment.'
  },
  {
    terms: ['adductor'],
    text: 'This muscle belongs to an adductor group, which generally moves a limb toward the body midline.'
  }
];

const BONE_RULES: Rule[] = [
  { terms: ['femur'], text: 'This thigh bone is the longest bone in the body and transmits load between hip and knee.' },
  { terms: ['tibia'], text: 'This shin bone bears much of the body weight between the knee and ankle.' },
  { terms: ['fibula'], text: 'This slender lower-leg bone supports ankle stability and muscle attachment.' },
  { terms: ['humerus'], text: 'This upper-arm bone connects the shoulder to the elbow and anchors many arm muscles.' },
  { terms: ['radius'], text: 'This forearm bone sits on the thumb side and helps the forearm rotate.' },
  { terms: ['ulna'], text: 'This forearm bone sits on the little-finger side and forms a major part of the elbow hinge.' },
  { terms: ['scapula'], text: 'This shoulder blade anchors shoulder muscles and helps position the arm for movement.' },
  { terms: ['clavicle'], text: 'This collarbone holds the shoulder away from the chest and transfers force to the trunk.' },
  { terms: ['sternum'], text: 'This breastbone sits at the front of the chest and connects with the ribs through cartilage.' },
  { terms: ['rib'], text: 'This curved thoracic bone helps protect the chest organs and supports breathing movement.' },
  { terms: ['vertebra'], text: 'This spinal bone protects the spinal canal and helps support posture and trunk movement.' },
  { terms: ['sacrum'], text: 'This fused pelvic spine bone transfers body weight from the spine into the pelvis.' },
  { terms: ['mandible'], text: 'This lower jaw bone supports the lower teeth and moves during chewing and speaking.' },
  { terms: ['maxilla'], text: 'This upper jaw bone supports upper teeth and contributes to the face, nose, and orbit.' },
  { terms: ['skull', 'frontal', 'parietal', 'occipital', 'temporal'], text: 'This skull bone helps protect the brain and shape the head.' },
  { terms: ['ilium', 'ischium', 'pubis', 'pelvis'], text: 'This pelvic bone supports body weight, protects pelvic organs, and anchors hip muscles.' },
  { terms: ['patella'], text: 'This kneecap improves leverage for knee extension and protects the front of the knee joint.' },
  { terms: ['metacarpal'], text: 'This hand bone links the wrist to the fingers and helps form the palm.' },
  { terms: ['metatarsal'], text: 'This foot bone links the ankle region to the toes and helps support body weight.' },
  { terms: ['phalan'], text: 'This digit bone forms part of a finger or toe and supports fine movement.' },
  { terms: ['molar', 'premolar', 'canine', 'incisor', 'tooth'], text: 'This tooth structure helps cut, tear, or grind food depending on its position.' }
];

const SYSTEM_RULES: Record<AnatomySystem, Rule[]> = {
  bone: BONE_RULES,
  connective: [
    { terms: ['tendon'], text: 'This tendon-like structure transfers muscle force to bone or another attachment site.' },
    { terms: ['ligament'], text: 'This ligament-like structure helps connect bones and stabilize a joint.' },
    { terms: ['cartilage'], text: 'This cartilage structure provides a smooth, resilient surface or support tissue around a joint.' },
    { terms: ['fascia'], text: 'This fascial structure is connective tissue that wraps, separates, or supports muscles and organs.' },
    { terms: ['linea alba'], text: 'This midline fibrous band links abdominal wall aponeuroses and helps anchor the abdominal muscles.' },
    { terms: ['meniscus'], text: 'This fibrocartilage structure helps cushion and stabilize the joint surface.' },
    { terms: ['disc'], text: 'This disc-like structure helps absorb force and separate adjacent skeletal parts.' }
  ],
  digestive: [
    { terms: ['stomach'], text: 'This digestive organ stores and mechanically mixes food before it moves into the small intestine.' },
    { terms: ['small intestine', 'duodenum', 'jejunum', 'ileum'], text: 'This part of the small intestine is involved in digestion and nutrient absorption.' },
    { terms: ['colon', 'caecum', 'cecum', 'rectum'], text: 'This large-intestine structure helps absorb water and move waste toward elimination.' },
    { terms: ['oesophagus', 'esophagus'], text: 'This muscular tube carries swallowed food and liquid from the throat toward the stomach.' },
    { terms: ['liver'], text: 'This abdominal organ processes nutrients, produces bile, and supports many metabolic functions.' },
    { terms: ['gallbladder'], text: 'This small organ stores and concentrates bile before release into the digestive tract.' },
    { terms: ['pancreas'], text: 'This gland supports digestion and blood-sugar regulation through digestive enzymes and hormones.' }
  ],
  lymphatic: [
    { terms: ['lymph node'], text: 'This lymphatic structure filters lymph and supports immune surveillance.' },
    { terms: ['lymphatic vessel', 'lymph vessel'], text: 'This vessel carries lymph fluid back toward the bloodstream.' },
    { terms: ['thymus'], text: 'This lymphoid organ supports immune cell development, especially earlier in life.' },
    { terms: ['tonsil'], text: 'This lymphoid tissue helps monitor material entering through the mouth or nose.' }
  ],
  muscle: MUSCLE_RULES,
  nervous: [
    { terms: ['brain', 'cerebrum', 'cerebellum'], text: 'This nervous-system structure processes information and helps coordinate body functions.' },
    { terms: ['spinal cord'], text: 'This central nervous-system structure carries signals between brain and body.' },
    { terms: ['plexus'], text: 'This nerve network redistributes nerve fibers to supply a body region.' },
    { terms: ['nerve'], text: 'This nerve carries sensory, motor, or autonomic signals between the nervous system and body tissues.' }
  ],
  organ: [
    { terms: ['heart'], text: 'This organ pumps blood through the pulmonary and systemic circulation.' },
    { terms: ['eye'], text: 'This sensory organ detects light and supports vision.' },
    { terms: ['ear'], text: 'This sensory structure supports hearing, balance, or both depending on the part selected.' },
    { terms: ['thyroid'], text: 'This endocrine gland produces hormones that help regulate metabolism.' },
    { terms: ['adrenal'], text: 'This endocrine gland produces hormones involved in stress response, salt balance, and metabolism.' },
    { terms: ['tongue'], text: 'This muscular organ helps with taste, speech, chewing, and swallowing.' }
  ],
  other: [],
  reproductive: [
    { terms: ['testis', 'testicle'], text: 'This male reproductive organ produces sperm cells and hormones.' },
    { terms: ['prostate'], text: 'This gland contributes fluid to semen and surrounds part of the urethra.' },
    { terms: ['penis'], text: 'This external reproductive and urinary organ contains erectile tissue and the urethral passage.' },
    { terms: ['uterus'], text: 'This female reproductive organ supports pregnancy and participates in the menstrual cycle.' },
    { terms: ['ovary'], text: 'This female reproductive organ produces oocytes and hormones.' },
    { terms: ['vagina'], text: 'This muscular canal connects the external genital region with the uterus.' },
    { terms: ['fallopian', 'uterine tube'], text: 'This tube carries the oocyte toward the uterus and is a common site of fertilization.' }
  ],
  respiratory: [
    { terms: ['lung'], text: 'This respiratory organ exchanges oxygen and carbon dioxide with the blood.' },
    { terms: ['bronch'], text: 'This airway branch carries air between the trachea and lung tissue.' },
    { terms: ['trachea'], text: 'This windpipe carries air from the larynx toward the bronchi.' },
    { terms: ['larynx'], text: 'This airway structure protects the lower airway and contains the vocal folds.' },
    { terms: ['pharynx'], text: 'This shared throat passage conducts air, food, and liquid through different routes.' },
    { terms: ['pleura'], text: 'This membrane lines the lungs or chest wall and supports smooth breathing movement.' },
    { terms: ['diaphragm'], text: 'This dome-shaped muscle is the main driver of quiet breathing.' }
  ],
  urinary: [
    { terms: ['kidney', 'renal'], text: 'This urinary organ filters blood and helps regulate fluid, electrolyte, and waste balance.' },
    { terms: ['ureter'], text: 'This tube carries urine from the kidney toward the urinary bladder.' },
    { terms: ['bladder'], text: 'This hollow organ stores urine before urination.' },
    { terms: ['urethra'], text: 'This passage carries urine from the bladder to the outside of the body.' }
  ],
  vascular: [
    { terms: ['artery', 'aorta'], text: 'This blood vessel carries blood away from the heart toward body tissues.' },
    { terms: ['vein', 'vena'], text: 'This blood vessel returns blood from body tissues toward the heart.' },
    { terms: ['pulmonary trunk'], text: 'This large vessel carries blood from the right side of the heart toward the lungs.' },
    { terms: ['capillary'], text: 'This tiny vessel type supports exchange between blood and surrounding tissues.' }
  ]
};

function matchRule(name: string, rules: Rule[]) {
  const text = name.toLowerCase();
  return rules.find((rule) => rule.terms.some((term) => text.includes(term)))?.text;
}

function sidePhrase(text: string) {
  const lower = text.toLowerCase();
  if (/(^|[\s.|-])left($|[\s.|-])/.test(lower) || /(^|[\s.|-])l($|[\s.|-])/.test(lower)) return 'left-side ';
  if (/(^|[\s.|-])right($|[\s.|-])/.test(lower) || /(^|[\s.|-])r($|[\s.|-])/.test(lower)) return 'right-side ';
  return '';
}

function genericSystemDescription(system: AnatomySystem) {
  switch (system) {
    case 'bone':
      return 'This skeletal structure provides support, protection, leverage for movement, or an attachment area for soft tissue.';
    case 'connective':
      return 'This connective-tissue structure supports, links, stabilizes, or separates nearby anatomical parts.';
    case 'digestive':
      return 'This digestive-system structure helps process, transport, absorb, or prepare material within the digestive tract.';
    case 'lymphatic':
      return 'This lymphatic structure helps drain fluid, filter lymph, or support immune function.';
    case 'muscle':
      return 'This muscle structure contributes to movement, posture, joint control, or force transfer in its region.';
    case 'nervous':
      return 'This nervous-system structure helps carry, process, or coordinate body signals.';
    case 'organ':
      return 'This organ structure contributes to a specialized body function within its anatomical region.';
    case 'reproductive':
      return 'This reproductive-system structure supports reproduction, hormone function, or related anatomy.';
    case 'respiratory':
      return 'This respiratory-system structure helps move air, protect the airway, or support gas exchange.';
    case 'urinary':
      return 'This urinary-system structure helps filter, store, transport, or release urine.';
    case 'vascular':
      return 'This vascular structure carries blood and helps connect local tissues with the wider circulation.';
    default:
      return 'This source-provided anatomical structure gives spatial context for nearby systems.';
  }
}

function systemNoun(system: AnatomySystem) {
  switch (system) {
    case 'bone':
      return 'bone';
    case 'connective':
      return 'connective-tissue';
    case 'digestive':
      return 'digestive-system';
    case 'lymphatic':
      return 'lymphatic';
    case 'muscle':
      return 'muscle';
    case 'nervous':
      return 'nervous-system';
    case 'organ':
      return 'organ';
    case 'reproductive':
      return 'reproductive-system';
    case 'respiratory':
      return 'respiratory-system';
    case 'urinary':
      return 'urinary-system';
    case 'vascular':
      return 'vascular';
    default:
      return 'anatomical';
  }
}

export function generateStructureDescription(input: DescriptionInput) {
  const lookupText = `${input.name} ${input.context ?? ''}`;
  const lower = lookupText.toLowerCase();
  const side = sidePhrase(lookupText);

  if (lower.includes('insertion') || lower.includes('origin')) {
    return `This ${side}mesh marks a modeled attachment area for ${input.name.replace(/[- ]?(insertion|origin).*/i, '').trim()}. Attachment areas show where soft tissue transfers force to nearby skeletal structures.`;
  }

  const matched = matchRule(lookupText, SYSTEM_RULES[input.system] ?? []);
  const base = matched ?? genericSystemDescription(input.system);
  return `${base} It is cataloged as a ${side}${systemNoun(input.system)} structure in the ${input.region} region from ${input.source}.`;
}
