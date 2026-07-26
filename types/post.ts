export type PostType = 'blog' | 'guide' | 'history' | 'esoteric' | 'review';

// PostLangData — контент статьи на одном языке.
// Раньше title_ru/title_en/content_ru/content_en были плоскими полями прямо
// на Post — теперь, как и у минералов, всё языкозависимое лежит в i18n.ru/en.
export interface PostLangData {
  title: string;
  excerpt?: string;
  content: string;
}

export interface Post {
  id: string;
  slug: string;
  type: PostType;
  i18n: {
    ru: PostLangData;
    en: PostLangData;
  };
  cover_image?: string;
  gem_slugs: string[];
  tags: string[];
  published_at?: string;
  updated_at: string;
  is_published: boolean;
  author?: string;
}
