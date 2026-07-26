import { z } from 'zod';

export const PostLangDataSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Содержимое слишком короткое'),
});

// Английская версия менее строгая — можно сохранить черновик, пока перевод не готов
export const PostLangDataEnSchema = z.object({
  title: z.string().optional().default(''),
  excerpt: z.string().optional(),
  content: z.string().optional().default(''),
});

export const PostSchema = z.object({
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефис'),
  type: z.enum(['blog', 'guide', 'history', 'esoteric', 'review']),

  i18n: z.object({
    ru: PostLangDataSchema,
    en: PostLangDataEnSchema,
  }),

  cover_image: z.string().optional(),
  gem_slugs: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  is_published: z.boolean().default(false),
  author: z.string().optional(),
});

export type PostFormData = z.infer<typeof PostSchema>;
