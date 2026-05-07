export type AnatomySystem =
  | 'muscle'
  | 'bone'
  | 'connective'
  | 'vascular'
  | 'nervous'
  | 'digestive'
  | 'respiratory'
  | 'urinary'
  | 'reproductive'
  | 'lymphatic'
  | 'organ'
  | 'other';

export type AnatomyStructure = {
  name: string;
  system: AnatomySystem;
  region: string;
  description: string;
  source: string;
};

export type AnatomySystemOption = {
  count: number;
  id: AnatomySystem;
};

export type Open3DModelAsset = {
  label: string;
  mirrorRightSide: boolean;
  path: string;
};
