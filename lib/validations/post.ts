import { z } from 'zod';

export const PostSchema = z.object({
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефис'),
  type: z.enum(['blog', 'guide', 'history', 'esoteric', 'review']),
  
  title_ru: z.string().min(1, 'Заголовок на русском обязателен'),
  title_en: z.string().min(1, 'Заголовок на английском обязателен'),
  
  excerpt_ru: z.string().optional(),
  excerpt_en: z.string().optional(),
  
  content_ru: z.string().min(10, 'Содержимое на русском слишком короткое'),
  content_en: z.string().min(10, 'Содержимое на английском слишком короткое'),
  
  cover_image: z.string().optional(),
  gem_slugs: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  is_published: z.boolean().default(false),
  author: z.string().optional(),
});

export type PostFormData = z.infer<typeof PostSchema>;