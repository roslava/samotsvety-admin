import { z } from 'zod';

// ScientificSchema — все языконезависимые данные минерала: числа, формула и
// закрытые перечисления. Перечисления живут здесь, а не в I18nContentSchema,
// потому что это один и тот же факт независимо от языка интерфейса (как
// rarity) — дублировать его текстом в ru/en означало бы поддерживать один
// физический факт в двух местах без гарантии, что они не разойдутся.
//
// hardness_note и composition — тоже здесь, но это свободный текст, а не
// enum: composition для минерала обычно дублировал бы chemical_formula, но
// для породы это содержательное петрографическое описание («преимущественно
// кварц и полевые шпаты с примесью биотита»), которое не сводится к
// перечислению. Поле одно на весь минерал (не переводится).
export const CRYSTAL_SYSTEM_VALUES = [
  'monoclinic', 'orthorhombic', 'hexagonal', 'isometric',
  'triclinic', 'tetragonal', 'amorphous',
] as const;

export const STREAK_VALUES = [
  'black', 'white_or_colourless', 'grey', 'green', 'blue',
  'brown', 'pink_to_red', 'yellow_to_orange',
] as const;

export const FRACTURE_VALUES = [
  'conchoidal', 'uneven', 'splintery', 'hackly', 'earthy', 'fibrous',
] as const;

export const CLEAVAGE_DEGREE_VALUES = ['none', 'very_poor', 'poor', 'good', 'perfect'] as const;
export const CLEAVAGE_DIRECTION_VALUES = ['1', '2', '3', '4'] as const;
export const CLEAVAGE_TYPE_VALUES = [
  'basal', 'prismatic', 'pinacoidal', 'rhombohedral', 'cubic', 'octahedral', 'dodecahedral',
] as const;

export const TRANSPARENCY_VALUES = ['transparent', 'translucent', 'opaque'] as const;

// Атомарные термины по Dana/Klein — без составных значений вроде "ковкий и
// тягучий": образец кодируется набором атомов (золото = malleable+ductile),
// а не отдельным составным кодом, иначе один и тот же факт можно закодировать
// двумя разными способами.
export const LUSTER_VALUES = [
  'vitreous', 'adamantine', 'metallic', 'submetallic', 'pearly',
  'silky', 'resinous', 'greasy', 'waxy', 'dull', 'earthy',
] as const;

export const TENACITY_VALUES = [
  'brittle', 'malleable', 'ductile', 'sectile', 'flexible', 'elastic',
] as const;

// Именно статус минерального вида по IMA — trade name сюда не входит,
// это другое измерение (коммерческое обозначение, не научный статус).
export const IMA_STATUS_VALUES = ['approved', 'grandfathered', 'questionable', 'discredited'] as const;

export const ROCK_TYPE_VALUES = ['igneous', 'sedimentary', 'metamorphic'] as const;

// Иридесценция и «переливчатость» — один и тот же эффект, один код.
// Лабрадоресценция — частный случай шиллер-эффекта у лабрадорита, отдельным
// шиллер-эффектом не дублируется.
export const PHENOMENON_VALUES = [
  'asterism', 'iridescence', 'aventurescence', 'adularescence',
  'labradorescence', 'chatoyancy', 'opalescence', 'color_change',
] as const;

// Химический класс по Дана/Штрунцу — научная ось классификации.
export const MINERAL_CLASS_VALUES = [
  'native_elements', 'sulfides_sulfosalts', 'halides', 'oxides_hydroxides',
  'carbonates_nitrates', 'borates', 'sulfates_chromates_molybdates_tungstates',
  'phosphates_arsenates_vanadates', 'silicates', 'organic',
] as const;

// Подкласс силикатов — показывается в UI только когда mineral_class === 'silicates'.
export const SILICATE_SUBCLASS_VALUES = [
  'nesosilicates', 'sorosilicates', 'cyclosilicates',
  'inosilicates', 'phyllosilicates', 'tectosilicates',
] as const;

// Коллекционная группа/семейство — вторая, независимая ось классификации:
// то, чем реально пользуется коллекционер при поиске («покажи все гранаты»),
// в отличие от научного класса выше. Стартовый список, расширяемый.
export const MINERAL_FAMILY_VALUES = [
  'garnet_group', 'feldspar_group', 'quartz_group', 'tourmaline_group',
  'mica_group', 'pyroxene_group', 'amphibole_group', 'zeolite_group',
  'beryl_group', 'spinel_group', 'corundum_group', 'calcite_group',
] as const;

// Габитус кристаллов — почти всегда комбинация нескольких форм одновременно
// («призматический, волокнистый, радиально-лучистый»), поэтому массив, а не
// одиночный select. Формы отдельных кристаллов и агрегатов пока в одном
// списке — разделение на habit/aggregate habit можно ввести позже.
export const CRYSTAL_HABIT_VALUES = [
  'prismatic', 'acicular', 'tabular', 'platy', 'foliated', 'fibrous',
  'granular', 'massive', 'druzy', 'radiating', 'globular', 'reniform',
  'botryoidal', 'columnar', 'cubic', 'rhombohedral', 'dendritic', 'earthy',
] as const;

export const ScientificSchema = z.object({
  chemical_formula: z.string().optional(),
  hardness: z.object({
    min: z.number().min(1).max(10),
    max: z.number().min(1).max(10),
  }),
  specific_gravity: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
  }),
  rarity: z.enum(['common', 'uncommon', 'rare', 'very_rare']),

  crystal_system: z.enum(CRYSTAL_SYSTEM_VALUES).optional(),
  streak: z.enum(STREAK_VALUES).optional(),
  fracture: z.enum(FRACTURE_VALUES).optional(),
  // cleavage_direction/cleavage_type осмысленны только при cleavage_degree !== 'none' —
  // это условие в UI (ScientificSection), схема этого не форсирует.
  cleavage_degree: z.enum(CLEAVAGE_DEGREE_VALUES).optional(),
  cleavage_direction: z.enum(CLEAVAGE_DIRECTION_VALUES).optional(),
  cleavage_type: z.enum(CLEAVAGE_TYPE_VALUES).optional(),

  transparency: z.enum(TRANSPARENCY_VALUES).optional(),
  luster: z.array(z.enum(LUSTER_VALUES)).optional(),
  tenacity: z.array(z.enum(TENACITY_VALUES)).optional(),
  hardness_note: z.string().optional(),
  composition: z.string().optional(),

  ima_status: z.enum(IMA_STATUS_VALUES).optional(),
  // rock_type осмыслен в основном для type: 'rock', но схема этого не форсирует —
  // в БД лучше null/undefined, чем искусственное значение "не определено".
  rock_type: z.enum(ROCK_TYPE_VALUES).optional(),

  phenomena: z.array(z.enum(PHENOMENON_VALUES)).optional(),

  mineral_class: z.enum(MINERAL_CLASS_VALUES).optional(),
  // silicate_subclass осмыслен только при mineral_class === 'silicates'.
  silicate_subclass: z.enum(SILICATE_SUBCLASS_VALUES).optional(),
  mineral_family: z.enum(MINERAL_FAMILY_VALUES).optional(),

  crystal_habit: z.array(z.enum(CRYSTAL_HABIT_VALUES)).optional(),
});

export const EsotericSchema = z.object({
  metaphysical_properties: z.array(z.string()).min(1),
  chakras: z.array(z.string()),
  zodiac: z.array(z.string()),
  healing_interpretation: z.string().min(10),
  energy_notes: z.string().min(10),
  ritual_uses: z.string().optional(),
});

// I18nContentSchema — только по-настоящему переводимый контент минерала на
// одном языке. Все закрытые минералогические перечисления (mineral_class/
// family, crystal_habit, luster, transparency, tenacity, ima_status,
// rock_type, phenomena) и связанный с ними свободный текст (hardness_note,
// composition) переехали в ScientificSchema — см. комментарий там.
export const I18nContentSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  synonyms: z.array(z.string()).optional(),
  color: z.array(z.string()).min(1),
  color_description: z.string().min(1),
  lore: z.string().min(20, 'Lore должен быть достаточно подробным'),
  esoteric: EsotericSchema.optional(),

  identification_tips: z.string().optional(),
  safety_notes: z.string().optional(),
});

export const I18nContentRuSchema = I18nContentSchema;

export const LocalitySchema = z.object({
  country_ru: z.string().min(1, 'Страна (RU) обязательна'),
  country_en: z.string().optional(),
  region_ru: z.string().optional(),
  region_en: z.string().optional(),
  locality_ru: z.string().optional(),
  locality_en: z.string().optional(),
  is_russian: z.boolean().default(false),
  famous: z.boolean().default(false).optional(),
  description_ru: z.string().optional(),
  description_en: z.string().optional(),
});

export const GalleryImageSchema = z.object({
  url: z.string().url('Некорректный URL'),
  type: z.enum(['specimen', 'polished', 'jewelry', 'micro']).optional(),
  description_ru: z.string().optional(),
  description_en: z.string().optional(),
});

export const MineralSchema = z.object({
  slug: z.string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефис'),

  type: z.enum(['mineral', 'rock', 'gem_variety', 'organic']).default('mineral'),

  scientific: ScientificSchema,

  i18n: z.object({
    ru: I18nContentRuSchema,
    en: I18nContentSchema,
  }),

  localities: z.array(LocalitySchema).min(1, 'Добавьте хотя бы одно месторождение'),
  main_image_url: z.string().url('Главное изображение обязательно'),
  thumbnail_url: z.string().url().optional(),
  gallery: z.array(GalleryImageSchema),

  related_minerals: z.array(z.string()).optional(),
});

export type MineralFormData = z.infer<typeof MineralSchema>;
