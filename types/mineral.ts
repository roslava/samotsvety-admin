export interface Scientific {
  chemical_formula: string;
  mineral_group: string;
  crystal_system: string;
  crystal_habit?: string;
  hardness: {
    min: number;
    max: number;
    note?: string;
  };
  specific_gravity: {
    min: number;
    max: number;
  };
  streak: string;
  luster: string;
  transparency: string;
  cleavage?: string;
  fracture?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare';
  ima_status?: string;
  identification_tips?: string;
}

export interface Esoteric {
  metaphysical_properties: string[];
  chakras: string[];
  zodiac: string[];
  healing_interpretation: string;
  energy_notes: string;
  ritual_uses?: string;
}

export interface I18nContent {
  name: string;
  synonyms?: string[];
  color: string[];
  color_description: string;
  lore: string;
  esoteric?: Esoteric;
}

export interface Locality {
  country: string;
  region: string;
  locality: string;
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

export interface Mineral {
  slug: string;
  scientific: Scientific;
  i18n: {
    ru: I18nContent;
    en: I18nContent;
  };
  localities: Locality[];
  main_image_url: string;
  gallery: GalleryImage[];
  safety_notes?: string;
  related_minerals?: string[];
  created_at?: string;
  updated_at?: string;
}

export type ViewMode = 'normal' | 'esoteric';
export type Lang = 'ru' | 'en';
