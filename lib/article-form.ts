import type { ArticleV2FormValues, Post, UpdatePostPayload } from '../types/post';

export function articleFormDefaults(): ArticleV2FormValues {
  return {
    slug: '', type: 'guide',
    i18n: {
      ru: { title: '', excerpt: '', content: '' },
      en: { title: '', excerpt: '', content: '' },
      media: { slides: [], author_avatar_url: '' },
    },
    author: '', gem_slugs: [], tags: [], is_published: false,
  };
}

export function articleFormFromPost(post: Post): ArticleV2FormValues {
  const language = (value: Post['i18n']['ru']) => ({
    title: value.title || '', excerpt: value.excerpt || '', content: value.content || '',
  });
  return {
    slug: post.slug, type: post.type,
    i18n: {
      ru: language(post.i18n.ru),
      en: language(post.i18n.en),
      media: {
        slides: post.i18n.media.slides.map((slide) => ({
          id: slide.id, url: slide.url, ...(slide.source ? { source: slide.source } : {}),
          caption: { ru: slide.caption?.ru || '', en: slide.caption?.en || '' },
          alt: { ru: slide.alt?.ru || '', en: slide.alt?.en || '' },
        })),
        author_avatar_url: post.i18n.media.author_avatar_url || '',
      },
    },
    author: post.author || '', gem_slugs: post.gem_slugs || [], tags: post.tags || [],
    is_published: post.is_published,
  };
}

// PUT is a patch. In particular, omit slides unless the editor changed them:
// sending the array replaces it in full on the server.
export function articleUpdatePatch(post: Post, values: ArticleV2FormValues): UpdatePostPayload {
  const before = articleFormFromPost(post);
  const patch: UpdatePostPayload = {};
  if (values.slug !== before.slug) patch.slug = values.slug;
  if (values.type !== before.type) patch.type = values.type;
  if (values.author !== before.author) patch.author = values.author;
  if (values.is_published !== before.is_published) patch.is_published = values.is_published;
  if (JSON.stringify(values.gem_slugs) !== JSON.stringify(before.gem_slugs)) patch.gem_slugs = values.gem_slugs;
  if (JSON.stringify(values.tags) !== JSON.stringify(before.tags)) patch.tags = values.tags;
  for (const language of ['ru', 'en'] as const) {
    for (const field of ['title', 'excerpt', 'content'] as const) {
      if (values.i18n[language][field] !== before.i18n[language][field]) {
        patch.i18n ??= {};
        patch.i18n[language] ??= {};
        patch.i18n[language][field] = values.i18n[language][field];
      }
    }
  }
  if (values.i18n.media.author_avatar_url !== before.i18n.media.author_avatar_url) {
    patch.i18n ??= {};
    patch.i18n.media ??= {};
    patch.i18n.media.author_avatar_url = values.i18n.media.author_avatar_url;
  }
  if (JSON.stringify(values.i18n.media.slides) !== JSON.stringify(before.i18n.media.slides)) {
    patch.i18n ??= {};
    patch.i18n.media ??= {};
    patch.i18n.media.slides = values.i18n.media.slides;
  }
  return patch;
}

