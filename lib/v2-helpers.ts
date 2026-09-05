import { MineralSchema, type MineralFormData } from './validations/mineral.ts';
import type { GemEntityV2Response, GemEntityV2WritePayload } from '../types/mineral';

/**
 * Chat clients can turn a pasted URL into `[URL](URL)`.  This deliberately
 * only handles source URLs: other strings may legitimately contain Markdown.
 * Values which are not an exact self-link are preserved for schema validation.
 */
export function normalizeV2ImportSourceUrls(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;

  const entity = value as Record<string, unknown>;
  if (!Array.isArray(entity.sources)) return value;

  return {
    ...entity,
    sources: entity.sources.map((source) => {
      if (!source || typeof source !== 'object' || Array.isArray(source)) return source;

      const sourceRecord = source as Record<string, unknown>;
      if (typeof sourceRecord.url !== 'string') return source;

      const match = sourceRecord.url.match(/^\[([^\]]+)\]\(\1\)$/);
      return match ? { ...sourceRecord, url: match[1] } : source;
    }),
  };
}

export function parseV2Import(raw: string): MineralFormData {
  let value: unknown;
  try { value = JSON.parse(raw); } catch (error) { throw new Error(`invalid JSON: ${error instanceof Error ? error.message : String(error)}`); }
  // Keep programmatic imports aligned with the UI import path: normalize the
  // one supported presentation-only URL form, then validate the complete
  // payload against the strict canonical schema.
  return MineralSchema.parse(normalizeV2ImportSourceUrls(value));
}

export function toV2WritePayload(entity: GemEntityV2Response | MineralFormData): GemEntityV2WritePayload {
  const write = { ...entity } as Partial<GemEntityV2Response>;
  delete write.created_at;
  delete write.updated_at;
  return write as GemEntityV2WritePayload;
}
