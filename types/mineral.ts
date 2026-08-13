// Scientific — все языконезависимые данные минерала: числа, формула и
// закрытые перечисления (crystal_system/streak/fracture/cleavage_*,
// transparency/luster/tenacity, ima_status/rock_type, phenomena,
// mineral_class/silicate_subclass/mineral_family, crystal_habit).
// Перечисления живут здесь, а не в I18nContent — как rarity: один и тот же
// физический факт не должен дублироваться текстом в двух языках.
export interface Scientific {
  chemical_formula?: string;           // опционально для пород
  hardness: {
    min: number;
    max: number;
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

  transparency?: 'transparent' | 'translucent' | 'opaque';
  // Атомарные термины (как в Dana/Klein) — образец кодируется набором,
  // а не составным значением: золото = ['malleable','ductile'].
  luster?: Array<
    | 'vitreous' | 'adamantine' | 'metallic' | 'submetallic' | 'pearly'
    | 'silky' | 'resinous' | 'greasy' | 'waxy' | 'dull' | 'earthy'
  >;
  tenacity?: Array<'brittle' | 'malleable' | 'ductile' | 'sectile' | 'flexible' | 'elastic'>;
  hardness_note?: string;               // свободный текст, одно значение на минерал
  composition?: string;                 // петрографическое описание (для пород), свободный текст

  // Именно статус вида по IMA — trade name сюда не входит, это другое измерение.
  ima_status?: 'approved' | 'grandfathered' | 'questionable' | 'discredited';
  rock_type?: 'igneous' | 'sedimentary' | 'metamorphic';

  // Иридесценция = «переливчатость» — один код. Лабрадоресценция — частный
  // случай шиллер-эффекта у лабрадорита, отдельно не дублируется.
  phenomena?: Array<
    | 'asterism' | 'iridescence' | 'aventurescence' | 'adularescence'
    | 'labradorescence' | 'chatoyancy' | 'opalescence' | 'color_change'
  >;

  // Химический класс (Дана/Штрунц) — научная ось классификации.
  mineral_class?:
    | 'native_elements' | 'sulfides_sulfosalts' | 'halides' | 'oxides_hydroxides'
    | 'carbonates_nitrates' | 'borates' | 'sulfates_chromates_molybdates_tungstates'
    | 'phosphates_arsenates_vanadates' | 'silicates' | 'organic';
  // Осмыслен только при mineral_class === 'silicates'.
  silicate_subclass?:
    | 'nesosilicates' | 'sorosilicates' | 'cyclosilicates'
    | 'inosilicates' | 'phyllosilicates' | 'tectosilicates';
  // Коллекционная группа/семейство — независимая ось, для витрины/фильтров сайта.
  mineral_family?:
    | 'garnet_group' | 'feldspar_group' | 'quartz_group' | 'tourmaline_group'
    | 'mica_group' | 'pyroxene_group' | 'amphibole_group' | 'zeolite_group'
    | 'beryl_group' | 'spinel_group' | 'corundum_group' | 'calcite_group';

  crystal_habit?: Array<
    | 'prismatic' | 'acicular' | 'tabular' | 'platy' | 'foliated' | 'fibrous'
    | 'granular' | 'massive' | 'druzy' | 'radiating' | 'globular' | 'reniform'
    | 'botryoidal' | 'columnar' | 'cubic' | 'rhombohedral' | 'dendritic' | 'earthy'
  >;
}

export interface Esoteric {
  metaphysical_properties: string[];
  chakras: string[];
  zodiac: string[];
  healing_interpretation: string;
  energy_notes: string;
  ritual_uses?: string;
}

// I18nContent — только по-настоящему переводимый контент минерала на одном
// языке. Все закрытые перечисления и связанный с ними свободный текст
// переехали в Scientific — см. комментарий там.
export interface I18nContent {
  name: string;
  synonyms?: string[];
  color: string[];
  color_description: string;
  lore: string;
  esoteric?: Esoteric;

  identification_tips?: string;
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
