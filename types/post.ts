export type PostType = 'blog' | 'guide' | 'history' | 'esoteric' | 'review';

export interface Post {
  id: string;
  slug: string;
  type: PostType;
  title_ru: string;
  title_en: string;
  excerpt_ru?: string;
  excerpt_en?: string;
  content_ru: string;
  content_en: string;
  cover_image?: string;
  gem_slugs: string[];
  tags: string[];
  published_at?: string;
  updated_at: string;
  is_published: boolean;
  author?: string;
}