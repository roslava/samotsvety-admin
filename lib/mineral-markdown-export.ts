import { parseMineralMarkdown, serializeMineralMarkdown } from './mineral-markdown.ts';
import { MineralSchema } from './validations/mineral.ts';

export class MineralMarkdownExportError extends Error {
  readonly stage: 'validation' | 'markdown_validation' | 'equivalence';
  constructor(stage: 'validation' | 'markdown_validation' | 'equivalence', message: string) {
    super(message);
    this.name = 'MineralMarkdownExportError';
    this.stage = stage;
  }
}

// Markdown v1 represents null, missing optional fields, and empty optional
// collections with the same empty field/section. Compare their meaningful data.
function meaningful(value: unknown): unknown {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.length ? value.map(meaningful) : undefined;
  if (typeof value === 'object') {
    const entries = Object.entries(value).map(([key, item]) => [key, meaningful(item)] as const)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value;
}

function firstDifference(before: unknown, after: unknown, path = 'карточка'): string | undefined {
  if (Object.is(before, after)) return undefined;
  if (Array.isArray(before) && Array.isArray(after)) {
    if (before.length !== after.length) return path;
    return before.map((item, index) => firstDifference(item, after[index], `${path}[${index}]`)).find(Boolean);
  }
  if (before && after && typeof before === 'object' && typeof after === 'object') {
    const left = before as Record<string, unknown>;
    const right = after as Record<string, unknown>;
    for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
      const difference = firstDifference(left[key], right[key], `${path}.${key}`);
      if (difference) return difference;
    }
    return undefined;
  }
  return path;
}

/** Validates the API card and the exact document that will be downloaded. */
export function prepareMineralMarkdownExport(entity: unknown): { slug: string; markdown: string } {
  if (!entity || typeof entity !== 'object' || Array.isArray(entity)) throw new Error('Некорректные данные карточки.');
  const { created_at: _createdAt, updated_at: _updatedAt, ...data } = entity as Record<string, unknown>;
  const original = MineralSchema.safeParse(data);
  if (!original.success) {
    const issue = original.error.issues[0];
    throw new MineralMarkdownExportError('validation', `Карточка не прошла проверку: ${issue.path.join('.') || 'данные'} — ${issue.message}`);
  }
  const markdown = serializeMineralMarkdown(original.data);
  const parsed = MineralSchema.safeParse(parseMineralMarkdown(markdown));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new MineralMarkdownExportError('markdown_validation', `Markdown не прошёл проверку: ${issue.path.join('.') || 'данные'} — ${issue.message}`);
  }
  const difference = firstDifference(meaningful(original.data), meaningful(parsed.data));
  if (difference) throw new MineralMarkdownExportError('equivalence', `Markdown v1 не сохраняет значение ${difference}. Скачивание отменено.`);
  return { slug: original.data.slug, markdown };
}
