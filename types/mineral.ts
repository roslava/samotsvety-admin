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
// mineral_group/crystal_system/streak/luster/... раньше жили в Scientific —
// это были языкозависимые текстовые описания без английской версии вообще.
export interface I18nContent {
  name: string;
  synonyms?: string[];
  color: string[];
  color_description: string;
  lore: string;
  esoteric?: Esoteric;

  mineral_group: string;
  crystal_system?: string;
  crystal_habit?: string;
  hardness_note?: string;
  streak: string;
  luster: string;
  transparency: string;
  cleavage?: string;
  fracture?: string;
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
