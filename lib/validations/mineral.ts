import { z } from 'zod';

export const ScientificSchema = z.object({
  chemical_formula: z.string().min(1, 'Химическая формула обязательна'),
  mineral_group: z.string().min(1, 'Группа минерала обязательна'),
  crystal_system: z.string().min(1, 'Кристаллическая система обязательна'),
  crystal_habit: z.string().optional(),
  hardness: z.object({
    min: z.number().min(1).max(10),
    max: z.number().min(1).max(10),
    note: z.string().optional(),
  }),
  specific_gravity: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
  }),
  streak: z.string().min(1),
  luster: z.string().min(1),
  transparency: z.string().min(1),
  cleavage: z.string().optional(),
  fracture: z.string().optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'very_rare']),
  ima_status: z.string().optional(),
  identification_tips: z.string().optional(),
});

export const EsotericSchema = z.object({
  metaphysical_properties: z.array(z.string()).min(1),
  chakras: z.array(z.string()),
  zodiac: z.array(z.string()),
  healing_interpretation: z.string().min(10),
  energy_notes: z.string().min(10),
  ritual_uses: z.string().optional(),
});

export const I18nContentSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  synonyms: z.array(z.string()).optional(),
  color: z.array(z.string()).min(1),
  color_description: z.string().min(1),
  lore: z.string().min(20, 'Lore должен быть достаточно подробным'),
  esoteric: EsotericSchema.optional(),
});

export const LocalitySchema = z.object({
  country: z.string().min(1, 'Страна обязательна'),
  region: z.string().min(1, 'Регион / область обязателен'),
  locality: z.string().optional(),                    // ← стало опциональным
  is_russian: z.boolean().default(false),
  famous: z.boolean().default(false).optional(),
  description_ru: z.string().optional(),
  description_en: z.string().optional(),
});

export const GalleryImageSchema = z.object({
  url: z.string().url('Некорректный URL'),
  type: z.enum(['specimen', 'polished', 'jewelry', 'micro']).optional(),   // ← стало опциональным
  description_ru: z.string().optional(),
  description_en: z.string().optional(),
});

export const MineralSchema = z.object({
  slug: z.string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефис'),
  
  scientific: ScientificSchema,
  
  i18n: z.object({
    ru: I18nContentSchema,
    en: I18nContentSchema,
  }),
  
  localities: z.array(LocalitySchema).min(1, 'Добавьте хотя бы одно месторождение'),
  main_image_url: z.string().url('Главное изображение обязательно'),
  gallery: z.array(GalleryImageSchema),
  
  safety_notes: z.string().optional(),
  related_minerals: z.array(z.string()).optional(),
});

export type MineralFormData = z.infer<typeof MineralSchema>;