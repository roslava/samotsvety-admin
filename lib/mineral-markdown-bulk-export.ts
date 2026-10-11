import { strToU8, zipSync } from 'fflate';
import { MineralMarkdownExportError, prepareMineralMarkdownExport } from './mineral-markdown-export.ts';
import { MineralMarkdownParseError } from './mineral-markdown.ts';

export type CatalogExportProgress = {
  phase: 'fetching' | 'processing' | 'packing' | 'complete';
  total: number;
  processed: number;
  exported: number;
  failed: number;
};
export type CatalogExportError = { identifier: string; stage: string; reason: string };
export type CatalogManifest = {
  format: 'samotsvety-markdown-bundle';
  version: 1;
  markdown_version: 'v1';
  exported_at: string;
  status: 'complete' | 'partial';
  summary: { total: number; exported: number; failed: number };
  files: { slug: string; path: string; status: 'success' }[];
  errors: CatalogExportError[];
};
export type CatalogArchive = { manifest: CatalogManifest; filename?: string; archive?: Uint8Array };
type CatalogResponse = { data: unknown[]; total: number };

function slugOf(entity: unknown): string | undefined {
  const slug = entity && typeof entity === 'object' && 'slug' in entity ? entity.slug : undefined;
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : undefined;
}

function errorDetails(cause: unknown): Pick<CatalogExportError, 'stage' | 'reason'> {
  if (cause instanceof MineralMarkdownExportError) return { stage: cause.stage, reason: cause.message };
  if (cause instanceof MineralMarkdownParseError) return { stage: 'parsing', reason: cause.message };
  return { stage: 'markdown', reason: cause instanceof Error ? cause.message : 'Не удалось подготовить Markdown.' };
}

const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Builds an archive from the complete, unfiltered V2 list. Never performs per-card GETs. */
export async function buildMineralCatalogArchive(
  catalog: CatalogResponse,
  onProgress?: (progress: CatalogExportProgress) => void,
  now = new Date(),
): Promise<CatalogArchive> {
  if (!Array.isArray(catalog.data) || !Number.isSafeInteger(catalog.total) ||
      catalog.total < 0 || catalog.data.length !== catalog.total) {
    throw new Error('Количество карточек API не совпадает с полученным списком. Экспорт отменён.');
  }
  const records = catalog.data.map((entity, index) => ({ entity, index, slug: slugOf(entity), identifier: slugOf(entity) ?? `row-${index + 1}` }))
    .sort((a, b) => a.identifier < b.identifier ? -1 : a.identifier > b.identifier ? 1 : a.index - b.index);
  const slugCounts = new Map<string, number>();
  for (const record of records) {
    if (record.slug) slugCounts.set(record.slug, (slugCounts.get(record.slug) ?? 0) + 1);
  }
  const markdownFiles = new Map<string, Uint8Array>();
  const errors: CatalogExportError[] = [];
  const files: CatalogManifest['files'] = [];
  const progress: CatalogExportProgress = { phase: 'processing', total: catalog.total, processed: 0, exported: 0, failed: 0 };
  onProgress?.({ ...progress });
  for (const record of records) {
    try {
      if (record.slug && (slugCounts.get(record.slug) ?? 0) > 1) {
        errors.push({ identifier: record.identifier, stage: 'duplicate_slug', reason: 'Slug встречается в ответе API более одного раза.' });
      } else {
        const { slug, markdown } = prepareMineralMarkdownExport(record.entity);
        const path = `minerals/${slug}.md`;
        markdownFiles.set(path, strToU8(markdown));
        files.push({ slug, path, status: 'success' });
      }
    } catch (cause) {
      errors.push({ identifier: record.identifier, ...errorDetails(cause) });
    }
    progress.processed++;
    progress.exported = files.length;
    progress.failed = errors.length;
    onProgress?.({ ...progress });
    if (progress.processed % 20 === 0) await pause();
  }
  const manifest: CatalogManifest = {
    format: 'samotsvety-markdown-bundle', version: 1, markdown_version: 'v1',
    exported_at: now.toISOString(), status: errors.length ? 'partial' : 'complete',
    summary: { total: catalog.total, exported: files.length, failed: errors.length },
    files, errors,
  };
  if (!files.length) return { manifest };
  onProgress?.({ ...progress, phase: 'packing' });
  const entries: Record<string, Uint8Array> = {
    'samotsvety-catalog/manifest.json': strToU8(JSON.stringify(manifest, null, 2) + '\n'),
  };
  for (const [path, content] of markdownFiles) entries[`samotsvety-catalog/${path}`] = content;
  let archive: Uint8Array;
  try {
    archive = zipSync(entries, { level: 6 });
  } catch {
    throw new Error('Не удалось собрать ZIP-архив каталога.');
  }
  const stamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
  const filename = `samotsvety-catalog-${errors.length ? 'PARTIAL-' : ''}${stamp}.zip`;
  onProgress?.({ ...progress, phase: 'complete' });
  return { manifest, filename, archive };
}

export function downloadCatalogArchive(archive: Uint8Array, filename: string): void {
  const url = URL.createObjectURL(new Blob([new Uint8Array(archive)], { type: 'application/zip' }));
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    try { link.click(); } finally { link.remove(); }
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function exportMineralCatalog(
  onProgress?: (progress: CatalogExportProgress) => void,
  loadCatalog: () => Promise<CatalogResponse> = async () => (await import('./api.ts')).api.getGemEntitiesForExport(),
  saveArchive: (archive: Uint8Array, filename: string) => void = downloadCatalogArchive,
): Promise<CatalogArchive> {
  onProgress?.({ phase: 'fetching', total: 0, processed: 0, exported: 0, failed: 0 });
  const catalog = await loadCatalog();
  const result = await buildMineralCatalogArchive(catalog, onProgress);
  if (result.archive && result.filename) saveArchive(result.archive, result.filename);
  return result;
}
