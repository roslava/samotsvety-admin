// Scientific — языконезависимые данные. crystal_system/streak/fracture/
// cleavage_* — закрытые перечисления с фиксированными кодами (не текст на
// одном языке), поэтому живут здесь, а не в I18nContent — как rarity.
export interface Scientific {
  chemical_formula?: string;           // опционально для пород
  hardness: {
    min: number;
    max: number;
    // note переехал в i18n.<lang>.hardness_note — был языкозависимым текстом
  };
  specific_gravity: {
    min: number;
    max: number;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare';
  crystal_system?:
    | 'monoclinic' | 'orthorhombic' | 'hexagonal' | 'isometric'
    | 'triclinic' | 'tetragonal' | 'amorphous';
  streak?:
    | 'black' | 'white_or_colourless' | 'grey' | 'green' | 'blue'
    | 'brown' | 'pink_to_red' | 'yellow_to_orange';
  fracture?: 'conchoidal' | 'uneven' | 'splintery' | 'hackly' | 'earthy' | 'fibrous';
  // cleavage_direction/cleavage_type осмысленны только при cleavage_degree !== 'none'
  cleavage_degree?: 'none' | 'very_poor' | 'poor' | 'good' | 'perfect';
  cleavage_direction?: '1' | '2' | '3' | '4';
  cleavage_type?:
    | 'basal' | 'prismatic' | 'pinacoidal' | 'rhombohedral'
    | 'cubic' | 'octahedral' | 'dodecahedral';
}

export interface Esoteric {
  metaphysical_properties: string[];
  chakras: string[];
  zodiac: string[];
  healing_interpretation: string;
  energy_notes: string;
  ritual_uses?: string;
}

// I18nContent — весь переводимый контент минерала на одном языке.
// crystal_system/streak/fracture/cleavage_* сюда больше не входят — это
// закрытые перечисления с языконезависимыми кодами, теперь в Scientific.
// mineral_group/luster/... пока остаются текстом на каждом языке.
export interface I18nContent {
  name: string;
  synonyms?: string[];
  color: string[];
  color_description: string;
  lore: string;
  esoteric?: Esoteric;

  mineral_group: string;
  crystal_habit?: string;
  hardness_note?: string;
  luster: string;
  transparency: string;
  tenacity?: string;
  ima_status?: string;
  identification_tips?: string;
  composition?: string;
  rock_type?: string;
  phenomena?: string[];
  safety_notes?: string;
}

// Locality — country/region/locality были одноязычными полями, теперь у
// каждого есть _ru/_en, как и у description.
export interface Locality {
  country_ru: string;
  country_en?: string;
  region_ru?: string;
  region_en?: string;
  locality_ru?: string;
  locality_en?: string;
  is_russian: boolean;
  famous?: boolean;
  description_ru?: string;
  description_en?: string;
}

export interface GalleryImage {
  url: string;
  type: 'specimen' | 'polished' | 'jewelry' | 'micro';
  description_ru?: string;
  description_en?: string;
}

export type EntityType = 'mineral' | 'rock' | 'gem_variety' | 'organic';

export interface Mineral {
  slug: string;
  type: EntityType;
  scientific: Scientific;
  i18n: {
    ru: I18nContent;
    en: I18nContent;
  };
  localities: Locality[];
  main_image_url: string;
  thumbnail_url?: string;
  gallery: GalleryImage[];
  // safety_notes больше не тут — он внутри i18n.ru/en.safety_notes
  related_minerals?: string[];
  created_at?: string;
  updated_at?: string;
}

export type ViewMode = 'normal' | 'esoteric';
export type Lang = 'ru' | 'en';
