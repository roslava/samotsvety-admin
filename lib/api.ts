import { ArticleApiError, articleResponseError, parseArticlePayload, readArticleList, readArticleResource, requireArticleAdminKey, requireArticleETag } from './article-api.ts';
import { PostCreateSchema, PostUpdateSchema } from './validations/post.ts';
import type { ArticleResource, CreatePostPayload, Post, UpdatePostPayload } from '../types/post';

const API_BASE = '/backend';

export type CoverLanguage = '' | 'ru' | 'en';
export interface CoverFrame { index: number; url: string }
export interface CoverSequences { default: string[]; ru: string[]; en: string[] }

const getHeaders = (apiKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  return headers;
};

export class ApiValidationError extends Error {
  readonly fields: Array<{ path: string; message: string; suggestion?: string }>;
  readonly status?: number;
  constructor(fields: Array<{ path: string; message: string; suggestion?: string }>, message: string, status?: number) {
    super(message);
    this.fields = fields;
    this.status = status;
  }
}
async function v2Error(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  const fields = Array.isArray(body.fields) ? body.fields : body.path ? [{ path: body.path, message: body.message || 'Ошибка валидации', suggestion: body.suggestion }] : [];
  throw new ApiValidationError(fields, body.message || body.error || 'Ошибка сохранения', res.status);
}

export const api = {
  async getGemEntity(slug: string) {
    const res = await fetch(`${API_BASE}/api/v2/gem-entities/${encodeURIComponent(slug)}`);
    if (!res.ok) await v2Error(res);
    return res.json();
  },
  async getGemEntities() {
    const res = await fetch(`${API_BASE}/api/v2/gem-entities`);
    if (!res.ok) await v2Error(res);
    const result = await res.json();
    return Array.isArray(result) ? result : (result.data || []);
  },
  async getGemEntitiesForExport(): Promise<{ data: unknown[]; total: number }> {
    const res = await fetch(`${API_BASE}/api/v2/gem-entities`, { cache: 'no-store' });
    if (!res.ok) await v2Error(res);
    const result: unknown = await res.json();
    if (!result || typeof result !== 'object' ||
        !Array.isArray((result as { data?: unknown }).data) ||
        !Number.isSafeInteger((result as { total?: unknown }).total) ||
        (result as { total: number }).total < 0) {
      throw new Error('API вернул некорректный список каталога.');
    }
    const catalog = result as { data: unknown[]; total: number };
    if (catalog.data.length !== catalog.total) {
      throw new Error(`API сообщил ${catalog.total} карточек, но вернул ${catalog.data.length}. Экспорт отменён.`);
    }
    return catalog;
  },
  async createGemEntity(data: Record<string, unknown>, apiKey: string) {
    const res = await fetch(`${API_BASE}/api/v2/gem-entities`, { method: 'POST', headers: getHeaders(apiKey), body: JSON.stringify(data) });
    if (!res.ok) await v2Error(res);
    return res.json();
  },
  async replaceGemEntity(slug: string, data: Record<string, unknown>, apiKey: string) {
    const res = await fetch(`${API_BASE}/api/v2/gem-entities/${encodeURIComponent(slug)}`, { method: 'PUT', headers: getHeaders(apiKey), body: JSON.stringify(data) });
    if (!res.ok) await v2Error(res);
    return res.json();
  },
  async deleteGemEntity(slug: string, apiKey: string) {
    const res = await fetch(`${API_BASE}/api/v2/gem-entities/${encodeURIComponent(slug)}`, { method: 'DELETE', headers: getHeaders(apiKey) });
    if (!res.ok) await v2Error(res);
    return true;
  },
  // Public endpoints
  async getMinerals(params: { 
    lang?: 'ru' | 'en'; 
    view?: 'normal' | 'esoteric';
    limit?: number;
    page?: number;
    rarity?: string;
    russian_only?: boolean;
  } = {}) {
    const query = new URLSearchParams();
    if (params.lang) query.append('lang', params.lang);
    if (params.view) query.append('view', params.view);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.page) query.append('page', params.page.toString());
    if (params.rarity) query.append('rarity', params.rarity);
    if (params.russian_only) query.append('russian_only', 'true');

    const res = await fetch(`${API_BASE}/api/v1/minerals?${query}`);
    if (!res.ok) throw new Error('Failed to fetch minerals');
    
    const result = await res.json();
    return Array.isArray(result) ? result : (result.data || []);
  },

  async getMineral(slug: string, lang: 'ru' | 'en' = 'ru', view?: 'normal' | 'esoteric') {
    const params = new URLSearchParams();
    params.append('lang', lang);
    if (view) params.append('view', view);
    
    const res = await fetch(`${API_BASE}/api/v1/minerals/${slug}?${params}`);
    if (!res.ok) throw new Error('Mineral not found');
    return res.json();
  },

  // Admin endpoints (require API Key)
  async createMineral(data: Record<string, unknown>, apiKey: string) {
    const res = await fetch(`${API_BASE}/api/v1/minerals`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create mineral');
    return res.json();
  },

  async updateMineral(slug: string, data: Record<string, unknown>, apiKey: string) {
    const res = await fetch(`${API_BASE}/api/v1/minerals/${slug}`, {
      method: 'PUT',
      headers: getHeaders(apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update mineral');
    return res.json();
  },

  async deleteMineral(slug: string, apiKey: string) {
    const res = await fetch(`${API_BASE}/api/v1/minerals/${slug}`, {
      method: 'DELETE',
      headers: getHeaders(apiKey),
    });
    if (!res.ok) throw new Error('Failed to delete mineral');
    return res.ok;
  },

  async searchMinerals(query: string, lang: 'ru' | 'en' = 'ru') {
    const res = await fetch(`${API_BASE}/api/v1/search?q=${encodeURIComponent(query)}&lang=${lang}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // === Посты ===
  async getPosts(apiKey: string, params: { limit?: number; page?: number } = {}): Promise<Post[]> {
    requireArticleAdminKey(apiKey);
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.page) query.append('page', params.page.toString());

    const res = await fetch(`${API_BASE}/api/v1/posts?${query}`, { headers: getHeaders(apiKey), cache: 'no-store' });
    if (!res.ok) await articleResponseError(res);

    const result = await res.json();
    return readArticleList(Array.isArray(result) ? result : result.data);
  },

  async getPost(slug: string, apiKey: string): Promise<ArticleResource> {
    requireArticleAdminKey(apiKey);
    const res = await fetch(`${API_BASE}/api/v1/posts/${encodeURIComponent(slug)}`, { headers: getHeaders(apiKey), cache: 'no-store' });
    if (!res.ok) await articleResponseError(res);
    return readArticleResource(res, await res.json());
  },

  async createPost(data: CreatePostPayload, apiKey: string): Promise<ArticleResource> {
    requireArticleAdminKey(apiKey);
    const payload = parseArticlePayload(PostCreateSchema, data);
    const res = await fetch(`${API_BASE}/api/v1/posts`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(payload),
    });
    if (!res.ok) await articleResponseError(res);
    return readArticleResource(res, await res.json());
  },

  async updatePost(slug: string, data: UpdatePostPayload, apiKey: string, etag: string | null): Promise<ArticleResource> {
    requireArticleAdminKey(apiKey);
    const currentETag = requireArticleETag(etag);
    const payload = parseArticlePayload(PostUpdateSchema, data);
    const res = await fetch(`${API_BASE}/api/v1/posts/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      headers: { ...getHeaders(apiKey), 'If-Match': currentETag },
      body: JSON.stringify(payload),
    });
    if (!res.ok) await articleResponseError(res);
    return readArticleResource(res, await res.json());
  },

  async deletePost(slug: string, apiKey: string, etag: string | null) {
    requireArticleAdminKey(apiKey);
    const currentETag = requireArticleETag(etag);
    const res = await fetch(`${API_BASE}/api/v1/posts/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      headers: { ...getHeaders(apiKey), 'If-Match': currentETag },
    });
    if (!res.ok) await articleResponseError(res);
    return res.ok;
  },

  // === Медиа (иллюстрации минералов и статей) ===
  async getCoverFrames(slug: string, lang: CoverLanguage = ''): Promise<CoverFrame[]> {
    const query = lang ? `?lang=${lang}` : '';
    const res = await fetch(`${API_BASE}/api/v1/posts/${encodeURIComponent(slug)}/cover-frames${query}`, { cache: 'no-store' });
    if (!res.ok) await articleResponseError(res);
    const body: unknown = await res.json();
    const record = body && typeof body === 'object' ? body as Record<string, unknown> : {};
    if (record.slug !== slug || record.lang !== lang || !Array.isArray(record.frames) ||
        !record.frames.every((frame: unknown) => frame && typeof frame === 'object' &&
          Number.isSafeInteger((frame as CoverFrame).index) && (frame as CoverFrame).index > 0 &&
          typeof (frame as CoverFrame).url === 'string' && (frame as CoverFrame).url.startsWith('https://'))) {
      throw new ArticleApiError(502, 'invalid_cover_frames', 'response', [], 'API вернул некорректный список кадров');
    }
    return (record.frames as CoverFrame[]).sort((a, b) => a.index - b.index);
  },

  async getCoverSequences(slug: string, apiKey: string): Promise<{ sequences: CoverSequences; managed: boolean }> {
    requireArticleAdminKey(apiKey);
    const res = await fetch(`${API_BASE}/api/v1/posts/${encodeURIComponent(slug)}/cover-frames?all=1`, {
      headers: { 'X-API-Key': apiKey }, cache: 'no-store',
    });
    if (!res.ok) await articleResponseError(res);
    const body: unknown = await res.json();
    const record = body && typeof body === 'object' ? body as Record<string, unknown> : {};
    const sequences = record.sequences as CoverSequences | undefined;
    if (record.slug !== slug || typeof record.managed !== 'boolean' || !sequences ||
        !(['default', 'ru', 'en'] as const).every((lang) => Array.isArray(sequences[lang]) &&
          sequences[lang].every((url) => typeof url === 'string'))) {
      throw new ArticleApiError(502, 'invalid_cover_frames', 'response', [], 'API вернул некорректные последовательности обложки');
    }
    return { sequences, managed: record.managed };
  },

  async uploadMedia(
    file: File,
    apiKey: string,
    options?: {
      kind?: 'hero' | 'thumbnail' | 'gallery' | 'cover' | 'block_image' | 'block_pair' | 'article_slide' | 'author_avatar';
      slug?: string;
      storageKey?: string;
      slideId?: string;
      blockIndex?: number;
      pairIndex?: 1 | 2;
      lang?: 'ru' | 'en';
    }
  ): Promise<{ url: string; index?: number }> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.kind) formData.append('kind', options.kind);
    if (options?.slug) formData.append('slug', options.slug);
    if (options?.storageKey) formData.append('storage_key', options.storageKey);
    if (options?.slideId) formData.append('slide_id', options.slideId);
    if (options?.blockIndex !== undefined) formData.append('block_index', String(options.blockIndex));
    if (options?.pairIndex !== undefined) formData.append('pair_index', String(options.pairIndex));
    if (options?.lang) formData.append('lang', options.lang);

    const res = await fetch(`${API_BASE}/api/v1/media`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey }, // без Content-Type — браузер сам проставит multipart boundary
      body: formData,
    });

    if (!res.ok) {
      await articleResponseError(res);
    }
    const result: unknown = await res.json();
    if (!result || typeof result !== 'object' || typeof (result as { url?: unknown }).url !== 'string') {
      throw new ArticleApiError(502, 'invalid_media_response', 'response', [], 'API вернул некорректный URL изображения');
    }
    if (options?.kind === 'cover' && (!Number.isSafeInteger((result as { index?: unknown }).index) ||
        (result as { index: number }).index < 1)) {
      throw new ArticleApiError(502, 'invalid_media_response', 'response', [], 'API вернул некорректный номер кадра');
    }
    return result as { url: string; index?: number };
  },

  async uploadArticleSlide(file: File, apiKey: string, slug: string, slideId: string): Promise<{ url: string }> {
    requireArticleAdminKey(apiKey);
    if (!slug || !slideId) throw new ArticleApiError(400, 'validation_error', 'validation', [], 'Нужны slug и slide_id');
    return this.uploadMedia(file, apiKey, { kind: 'article_slide', slug, slideId });
  },

  async uploadAuthorAvatar(file: File, apiKey: string, slug: string): Promise<{ url: string }> {
    requireArticleAdminKey(apiKey);
    if (!slug) throw new ArticleApiError(400, 'validation_error', 'validation', [], 'Нужен slug');
    return this.uploadMedia(file, apiKey, { kind: 'author_avatar', slug });
  },
};
