import { mediaBaseUrl, publicMediaUrl } from './media-url.ts';

const imageExtension = /\.(webp|png|jpe?g|gif)$/i;
const roots = new Set(['articles', 'entities', 'common_images']);

function validObjectPath(path: string): boolean {
  const parts = path.split('/');
  if (parts.length < 2 || !roots.has(parts[0])) return false;
  try {
    if (parts.some((part) => {
      const decoded = decodeURIComponent(part);
      return !part || decoded === '.' || decoded === '..' ||
        /[\\/%?#\u0000-\u001f\u007f]/.test(decoded) ||
        /\s/.test(part) ||
        /[\\?\u0000-\u001f\u007f]/.test(part);
    })) return false;
    return imageExtension.test(decodeURIComponent(parts.at(-1)!));
  } catch { return false; }
}

function validCdnBase(base: string): boolean {
  try {
    const url = new URL(base);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      !url.search && !url.hash &&
      (url.hostname === 'lithoteka-cdn.storage.yandexcloud.net' && url.pathname === '/' ||
       url.hostname === 'storage.yandexcloud.net' && url.pathname === '/lithoteka-cdn');
  } catch { return false; }
}

// New article references may point anywhere inside the Lithoteka bucket.
// Existing URLs are left intact by the editor when their fields are unchanged.
export function articleCdnUrl(input: string): string | null {
  const value = input.trim();
  if (!value || value.includes('\\')) return null;
  const base = mediaBaseUrl();
  if (!validCdnBase(base)) return null;
  if (!value.includes('://')) {
    return !value.startsWith('/') && validObjectPath(value) ? `${base}/${value}` : null;
  }
  const match = /^https:\/\/([^/?#]+)(\/[^?#]*)$/.exec(value);
  if (!match) return null;
  const [, authority, rawPath] = match;
  if (authority.includes('@') || authority.includes(':')) return null;
  const configured = new URL(base);
  const host = authority.toLowerCase();
  if (host !== configured.hostname && host !== 'lithoteka-cdn.storage.yandexcloud.net' && host !== 'storage.yandexcloud.net') return null;
  const path = host === 'storage.yandexcloud.net'
    ? rawPath.startsWith('/lithoteka-cdn/') ? rawPath.slice('/lithoteka-cdn/'.length) : ''
    : rawPath.slice(1);
  return validObjectPath(path) ? value : null;
}

// An unchanged URL returned by the API is historical article data, even when
// its bucket is no longer the destination for newly added media.
export function articleUrlForSave(input: string, previous?: string): string | null {
  if (previous !== undefined && input === previous) {
    try {
      const url = new URL(input);
      if (url.protocol === 'https:' && !url.username && !url.password && !url.port &&
          (url.hostname === 'samotsvety-cdn.storage.yandexcloud.net' ||
           url.hostname === 'storage.yandexcloud.net' && url.pathname.startsWith('/samotsvety-cdn/'))) return input;
    } catch { /* New media validation below reports the invalid URL. */ }
  }
  return articleCdnUrl(input);
}

export function markdownImageUrls(markdown: string): string[] {
  return [...markdown.matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].map((match) => match[1]);
}

export function articleSlideUrl(input: string): string | null {
  const value = input.trim();
  if (value.startsWith('https://')) {
    try {
      const url = new URL(value);
      return url.hostname && !url.username && !url.password ? value : null;
    } catch {
      return null;
    }
  }

  const segments = value.split('/');
  if (segments[0] !== 'articles' || segments.length < 3 ||
      segments.some((segment) => !/^[A-Za-z0-9._-]+$/.test(segment) || segment === '.' || segment === '..') ||
      !segments.at(-1)?.toLowerCase().endsWith('.webp')) return null;
  return publicMediaUrl(value) || null;
}
