import { z } from 'zod';

export const PostLangDataSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  excerpt: z.string().optional(),
  content: z.string().optional(), // legacy markdown, теперь необязательное — основной контент в content_blocks
});

// Английская версия менее строгая — можно сохранить черновик, пока перевод не готов
export const PostLangDataEnSchema = z.object({
  title: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
});

export const BlockTypeSchema = z.enum(['heading', 'paragraph', 'image', 'image_pair', 'quote']);
export const ImageLayoutSchema = z.enum(['full', 'inset']);
export const HeadingLevelSchema = z.enum(['section', 'subheading']);

export const BlockLangDataSchema = z.object({
  text: z.string().optional(),
  attribution: z.string().optional(),
  caption: z.string().optional(),
  captions: z.array(z.string()).optional(),
  image_url: z.string().optional(),
  image_urls: z.array(z.string()).optional(),
});

export const ContentBlockSchema = z.object({
  id: z.string(),
  type: BlockTypeSchema,
  level: HeadingLevelSchema.optional(),
  layout: ImageLayoutSchema.optional(),
  image_url: z.string().optional(),
  image_urls: z.array(z.string()).optional(),
  i18n: z.object({
    ru: BlockLangDataSchema,
    en: BlockLangDataSchema,
  }),
});

export const PostSchema = z.object({
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефис'),
  type: z.enum(['blog', 'guide', 'history', 'esoteric', 'review']),

  i18n: z.object({
    ru: PostLangDataSchema,
    en: PostLangDataEnSchema,
  }),

  cover_image: z.string().optional(),
  content_blocks: z.array(ContentBlockSchema).optional(),
  gem_slugs: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  is_published: z.boolean().optional(),
  author: z.string().optional(),
});

// Реальные значения по умолчанию (пустые строки/массивы, is_published: false)
// подставляются не через zod .default(), а через completeDefaults в PostForm.tsx —
// так input- и output-типы схемы совпадают один-в-один, и zodResolver не ломает
// вывод типов у useForm (комбинация .optional().default() в паре с react-hook-form
// порождает несовместимые generic-типы — грабли, на которых уже стояла старая схема).
export type PostFormData = z.infer<typeof PostSchema>;
export type ContentBlockFormData = z.infer<typeof ContentBlockSchema>;
