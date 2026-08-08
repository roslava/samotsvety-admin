import { z } from 'zod';

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
});

export const EsotericSchema = z.object({
  metaphysical_properties: z.array(z.string()).min(1),
  chakras: z.array(z.string()),
  zodiac: z.array(z.string()),
  healing_interpretation: z.string().min(10),
  energy_notes: z.string().min(10),
  ritual_uses: z.string().optional(),
});

// I18nContentSchema — переводимый контент минерала на одном языке.
// mineral_group/streak/luster/... раньше были в ScientificSchema с
// обязательными полями; теперь required только для ru, чтобы можно было
// сохранить минерал, пока перевод на en ещё не готов.
export const I18nContentSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  synonyms: z.array(z.string()).optional(),
  color: z.array(z.string()).min(1),
  color_description: z.string().min(1),
  lore: z.string().min(20, 'Lore должен быть достаточно подробным'),
  esoteric: EsotericSchema.optional(),

  mineral_group: z.string(),
  crystal_system: z.string().optional(),
  crystal_habit: z.string().optional(),
  hardness_note: z.string().optional(),
  streak: z.string(),
  luster: z.string(),
  transparency: z.string(),
  cleavage: z.string().optional(),
  fracture: z.string().optional(),
  tenacity: z.string().optional(),
  ima_status: z.string().optional(),
  identification_tips: z.string().optional(),
  composition: z.string().optional(),
  rock_type: z.string().optional(),
  phenomena: z.array(z.string()).optional(),
  safety_notes: z.string().optional(),
});

// Для русской версии некоторые поля остаются обязательными (это основной язык сайта).
// streak/luster/transparency сделаны необязательными — не для всех минералов
// (напр. аморфных или без чёткой черты) есть смысл заполнять эти поля.
export const I18nContentRuSchema = I18nContentSchema.extend({
  mineral_group: z.string().min(1, 'Группа / тип обязательна (RU)'),
});

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
