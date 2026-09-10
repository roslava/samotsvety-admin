export const ENTITY_SLUG_RE = /^[a-z0-9-]+$/;
export type RelatedEntityWarningKind = 'invalid' | 'not-found' | 'unverified';
export type RelatedEntityWarning = { slug: string; kind: RelatedEntityWarningKind };

export function isValidEntitySlug(value: string): boolean { return ENTITY_SLUG_RE.test(value); }
export function dedupeSlugs(slugs: string[]): string[] { return [...new Set(slugs)]; }

/** Parses the comma-separated control without inventing or normalizing slugs. */
export function parseRelatedEntityInput(input: string | string[]): { slugs: string[]; warnings: RelatedEntityWarning[] } {
  const values = (Array.isArray(input) ? input : input.split(',')).map((value) => value.trim()).filter(Boolean);
  const slugs: string[] = [];
  const warnings: RelatedEntityWarning[] = [];
  for (const value of dedupeSlugs(values)) {
    if (isValidEntitySlug(value)) slugs.push(value);
    else warnings.push({ slug: value, kind: 'invalid' });
  }
  return { slugs, warnings };
}

export function relatedEntityWarningText(warning: RelatedEntityWarning, locale: 'ru' | 'en' = 'ru'): string {
  if (locale === 'en') {
    if (warning.kind === 'invalid') return `"${warning.slug}" is not a valid slug and will be skipped.`;
    if (warning.kind === 'not-found') return `Related entity "${warning.slug}" was not found and will be skipped.`;
    return `Could not verify related entity "${warning.slug}". It will not be added.`;
  }
  if (warning.kind === 'invalid') return `Значение "${warning.slug}" не является допустимым slug и будет пропущено.`;
  if (warning.kind === 'not-found') return `Связанная сущность "${warning.slug}" не найдена и будет пропущена.`;
  return `Не удалось проверить связанную сущность "${warning.slug}". Она не будет добавлена.`;
}

export function normalizeErrorMessage(error: unknown, fallback = 'Не удалось выполнить запрос.'): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (error instanceof Error && error.message.trim()) return error.message;
  if (error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string' && (error as { message: string }).message.trim()) return (error as { message: string }).message;
  return fallback;
}

export async function resolveRelatedEntities(input: string | string[], getEntity: (slug: string) => Promise<unknown>): Promise<{ slugs: string[]; warnings: RelatedEntityWarning[] }> {
  const parsed = parseRelatedEntityInput(input);
  const settled = await Promise.allSettled(parsed.slugs.map((slug) => getEntity(slug)));
  const slugs: string[] = [];
  const warnings = [...parsed.warnings];
  settled.forEach((result, index) => {
    const slug = parsed.slugs[index];
    if (result.status === 'fulfilled') slugs.push(slug);
    else warnings.push({ slug, kind: (result.reason as { status?: unknown })?.status === 404 ? 'not-found' : 'unverified' });
  });
  return { slugs, warnings };
}
