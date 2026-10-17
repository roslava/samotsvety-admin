import { z } from 'zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Некорректный slug').max(255);
const postType = z.enum(['blog', 'guide', 'history', 'esoteric', 'review']);
const httpsURL = z.url().refine((value) => {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}, 'Требуется HTTPS URL');
const coverFrames = z.object({ default: z.array(httpsURL), ru: z.array(httpsURL), en: z.array(httpsURL) }).strict();

export const LocalizedTextSchema = z.object({ ru: z.string().optional(), en: z.string().optional() }).strict();
export const ArticleSlideSchema = z.object({
  id: z.uuid(),
  url: httpsURL,
  source: z.literal('cdn').optional(),
  caption: LocalizedTextSchema.optional(),
  alt: LocalizedTextSchema.optional(),
}).strict();

const languageDraft = z.object({
  title: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
}).strict();

const mediaWrite = z.object({
  slides: z.array(ArticleSlideSchema).optional(),
  author_avatar_url: z.union([httpsURL, z.literal('')]).optional(),
  cover_frames: coverFrames.optional(),
}).strict();

function publishedFields(value: {
  is_published?: boolean;
  author?: string;
  i18n: { ru: z.infer<typeof languageDraft>; en: z.infer<typeof languageDraft>; media?: z.infer<typeof mediaWrite> };
}, ctx: z.RefinementCtx) {
  if (!value.is_published) return;
  for (const lang of ['ru', 'en'] as const) {
    for (const field of ['title', 'excerpt', 'content'] as const) {
      if (!value.i18n[lang][field]?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['i18n', lang, field], message: 'Обязательно для публикации' });
      }
    }
  }
  if (!value.author?.trim()) ctx.addIssue({ code: 'custom', path: ['author'], message: 'Автор обязателен для публикации' });
  const slides = value.i18n.media?.slides || [];
  if (!slides.length) ctx.addIssue({ code: 'custom', path: ['i18n', 'media', 'slides'], message: 'Нужен хотя бы один слайд' });
  slides.forEach((slide, index) => {
    for (const lang of ['ru', 'en'] as const) {
      if (!slide.alt?.[lang]?.trim()) ctx.addIssue({ code: 'custom', path: ['i18n', 'media', 'slides', index, 'alt', lang], message: 'Alt обязателен для публикации' });
    }
  });
}

export const PostCreateSchema = z.object({
  slug,
  type: postType.optional(),
  i18n: z.object({ ru: languageDraft, en: languageDraft, media: mediaWrite.optional() }).strict(),
  author: z.string().optional(),
  gem_slugs: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1)).optional(),
  is_published: z.boolean().optional(),
}).strict().superRefine(publishedFields);

// PUT is a patch: the server validates the merged final article.
export const PostUpdateSchema = z.object({
  slug: slug.optional(),
  type: postType.optional(),
  i18n: z.object({
    ru: languageDraft.partial().optional(),
    en: languageDraft.partial().optional(),
    media: mediaWrite.partial().optional(),
  }).strict().optional(),
  author: z.string().optional(),
  gem_slugs: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1)).optional(),
  is_published: z.boolean().optional(),
}).strict();

export const PostSchema = z.object({
  slug,
  type: postType,
  i18n: z.object({
    ru: z.object({ title: z.string(), excerpt: z.string(), content: z.string() }).strict(),
    en: z.object({ title: z.string(), excerpt: z.string(), content: z.string() }).strict(),
    media: z.object({ slides: z.array(ArticleSlideSchema), author_avatar_url: z.string() }).strict(),
  }).strict(),
  author: z.string(),
  gem_slugs: z.array(z.string()),
  tags: z.array(z.string()),
  is_published: z.boolean(),
}).strict().superRefine(publishedFields);

export const PostResponseSchema = z.object({
  id: z.uuid(), slug, type: postType,
  i18n: z.object({
    ru: languageDraft.passthrough(),
    en: languageDraft.passthrough(),
    media: z.object({ schema_version: z.literal(2), slides: z.array(ArticleSlideSchema.passthrough()), author_avatar_url: z.string().optional(), cover_frames: coverFrames.optional() }).passthrough(),
  }).passthrough(),
  author: z.string().optional(),
  gem_slugs: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  is_published: z.boolean(),
  published_at: z.string().optional(),
  updated_at: z.string(),
}).passthrough();

export type ArticleV2FormData = z.infer<typeof PostSchema>;
