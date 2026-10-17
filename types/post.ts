export type PostType = 'blog' | 'guide' | 'history' | 'esoteric' | 'review';

export interface ArticleLanguage {
  title: string;
  excerpt: string;
  content: string; // Markdown
}

export interface LocalizedText {
  ru?: string;
  en?: string;
}

export interface ArticleSlide {
  id: string;
  url: string;
  source?: 'cdn';
  caption?: LocalizedText;
  alt?: LocalizedText;
}

export interface CoverSequences { default: string[]; ru: string[]; en: string[] }

// API drafts can omit individual language strings and optional media fields.
export interface Post {
  id: string;
  slug: string;
  type: PostType;
  i18n: {
    ru: Partial<ArticleLanguage>;
    en: Partial<ArticleLanguage>;
    media: {
      schema_version: 2;
      slides: ArticleSlide[];
      author_avatar_url?: string;
      cover_frames?: CoverSequences;
    };
  };
  author?: string;
  gem_slugs?: string[];
  tags?: string[];
  is_published: boolean;
  published_at?: string;
  updated_at: string;
}

// Form values have explicit strings so controls never receive undefined.
export interface ArticleV2FormValues {
  slug: string;
  type: PostType;
  i18n: {
    ru: ArticleLanguage;
    en: ArticleLanguage;
    media: {
      slides: ArticleSlide[];
      author_avatar_url: string;
    };
  };
  author: string;
  gem_slugs: string[];
  tags: string[];
  is_published: boolean;
}

export interface CreatePostPayload {
  slug: string;
  type?: PostType;
  i18n: {
    ru: Partial<ArticleLanguage>;
    en: Partial<ArticleLanguage>;
    media?: { slides?: ArticleSlide[]; author_avatar_url?: string; cover_frames?: CoverSequences };
  };
  author?: string;
  gem_slugs?: string[];
  tags?: string[];
  is_published?: boolean;
}

// Omitted keys keep their server values. Sending slides replaces the array.
export type UpdatePostPayload = Partial<Omit<CreatePostPayload, 'i18n'>> & {
  i18n?: {
    ru?: Partial<ArticleLanguage>;
    en?: Partial<ArticleLanguage>;
    media?: { slides?: ArticleSlide[]; author_avatar_url?: string; cover_frames?: CoverSequences };
  };
};

export interface ArticleResource {
  post: Post;
  etag: string | null;
}
