export type PostType = 'blog' | 'guide' | 'history' | 'esoteric' | 'review';

// PostLangData — контент статьи на одном языке.
// Раньше title_ru/title_en/content_ru/content_en были плоскими полями прямо
// на Post — теперь, как и у минералов, всё языкозависимое лежит в i18n.ru/en.
export interface PostLangData {
  title: string;
  excerpt?: string;
  content?: string; // Markdown — устаревшее поле, для статей до перехода на content_blocks
  cover_image?: string; // override общей обложки для этого языка
}

// BlockType — тип блока композиции статьи (см. domain.BlockType в API)
export type BlockType = 'heading' | 'paragraph' | 'image' | 'image_pair' | 'quote';

// ImageLayout — вариант вёрстки одиночной картинки
export type ImageLayout = 'full' | 'inset';

// HeadingLevel — уровень заголовка: раздел статьи (крупный) или подзаголовок внутри раздела (помельче)
export type HeadingLevel = 'section' | 'subheading';

// BlockLangData — языкозависимый текст внутри блока.
// Какие поля используются, зависит от типа блока:
//   heading / paragraph / quote — text (quote — ещё и attribution)
//   image                       — caption, и опционально image_url
//                                  (override общей картинки — для схем со встроенным текстом)
//   image_pair                  — captions[0], captions[1], и опционально image_urls (override пары)
export interface BlockLangData {
  text?: string;
  attribution?: string;
  caption?: string;
  captions?: string[];
  image_url?: string;
  image_urls?: string[];
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  level?: HeadingLevel; // только для type === 'heading'
  layout?: ImageLayout; // только для type === 'image'
  image_url?: string; // для type === 'image'
  image_urls?: string[]; // для type === 'image_pair', ровно 2 элемента
  i18n: {
    ru: BlockLangData;
    en: BlockLangData;
  };
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
  content_blocks?: ContentBlock[];
  gem_slugs: string[];
  tags: string[];
  published_at?: string;
  updated_at: string;
  is_published: boolean;
  author?: string;
}
