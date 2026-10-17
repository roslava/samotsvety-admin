import { z } from 'zod';
import { PostResponseSchema } from './validations/post.ts';
import type { ArticleResource, Post } from '../types/post';

export interface ArticleFieldError { path: string; message: string }
export type ArticleErrorKind = 'validation' | 'authorization' | 'conflict' | 'stale' | 'precondition' | 'unavailable' | 'not_found' | 'response' | 'other';

export class ArticleApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly kind: ArticleErrorKind;
  readonly fields: ArticleFieldError[];
  constructor(
    status: number,
    code: string,
    kind: ArticleErrorKind,
    fields: ArticleFieldError[] = [],
    message = 'Ошибка работы со статьёй',
  ) {
    super(message);
    this.name = 'ArticleApiError';
    this.status = status;
    this.code = code;
    this.kind = kind;
    this.fields = fields;
  }
}

function kindFor(status: number): ArticleErrorKind {
  switch (status) {
    case 400: return 'validation';
    case 401: case 403: return 'authorization';
    case 404: return 'not_found';
    case 409: return 'conflict';
    case 412: return 'stale';
    case 428: return 'precondition';
    case 503: return 'unavailable';
    default: return 'other';
  }
}

export async function articleResponseError(response: Response): Promise<never> {
  const body: unknown = await response.json().catch(() => ({}));
  const record = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const fields = Array.isArray(record.fields)
    ? record.fields.filter((field): field is ArticleFieldError => field && typeof field.path === 'string' && typeof field.message === 'string')
    : [];
  const code = typeof record.error === 'string' ? record.error : `http_${response.status}`;
  const message = typeof record.message === 'string' ? record.message : `Ошибка HTTP ${response.status}`;
  throw new ArticleApiError(response.status, code, kindFor(response.status), fields, message);
}

export function requireArticleETag(etag: string | null | undefined): string {
  if (!etag?.trim()) throw new ArticleApiError(428, 'missing_etag', 'precondition', [], 'Нет ETag статьи. Загрузите её заново перед изменением.');
  return etag;
}

export function parseArticlePayload<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  throw new ArticleApiError(400, 'validation_error', 'validation', result.error.issues.map((issue) => ({
    path: issue.path.map(String).join('.'), message: issue.message,
  })), 'Данные статьи не соответствуют Article V2');
}

export function readArticleResource(response: Response, data: unknown): ArticleResource {
  const post = PostResponseSchema.safeParse(data);
  if (!post.success) throw new ArticleApiError(502, 'invalid_article_response', 'response', post.error.issues.map((issue) => ({
    path: issue.path.map(String).join('.'), message: issue.message,
  })), 'API вернул некорректную статью');
  return { post: post.data as Post, etag: response.headers.get('ETag') };
}

export function readArticleList(data: unknown): Post[] {
  const posts = z.array(PostResponseSchema).safeParse(data);
  if (!posts.success) throw new ArticleApiError(502, 'invalid_article_response', 'response', posts.error.issues.map((issue) => ({
    path: issue.path.map(String).join('.'), message: issue.message,
  })), 'API вернул некорректный список статей');
  return posts.data as Post[];
}

export function requireArticleAdminKey(apiKey: string): string {
  if (!apiKey?.trim()) throw new ArticleApiError(401, 'missing_api_key', 'authorization', [], 'Требуется вход редактора');
  return apiKey;
}
