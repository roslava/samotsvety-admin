const defaultMediaBase = 'https://storage.yandexcloud.net/lithoteka-cdn';

export const mediaBaseUrl = () =>
  (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || defaultMediaBase).replace(/\/+$/, '');

function safeSegments(value: string): string[] | null {
  if (!value || value.includes('\\')) return null;
  const segments = value.split('/');
  return segments.every((part) => part && part !== '.' && part !== '..' && !/[\u0000-\u001f\u007f]/.test(part)) ? segments : null;
}

export function publicMediaUrl(objectKey: string): string {
  const segments = safeSegments(objectKey);
  return segments ? `${mediaBaseUrl()}/${segments.map(encodeURIComponent).join('/')}` : '';
}

export function mediaUrl(storageKey: string, path: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(storageKey)) return '';
  const segments = safeSegments(path);
  if (!segments || segments[0] === storageKey || segments[0] === 'entities' || segments[0] === 'images') return '';
  return publicMediaUrl(`entities/${storageKey}/images/${path}`);
}

export function entityImagePathFromUrl(url: string, storageKey: string): string {
  const prefix = `${mediaBaseUrl()}/entities/${encodeURIComponent(storageKey)}/images/`;
  if (!url.startsWith(prefix)) throw new Error('API вернул URL вне папки изображений сущности');
  const encoded = url.slice(prefix.length);
  let path: string;
  try { path = encoded.split('/').map((part) => decodeURIComponent(part)).join('/'); }
  catch { throw new Error('API вернул некорректный URL изображения'); }
  if (!mediaUrl(storageKey, path) || mediaUrl(storageKey, path) !== url) {
    throw new Error('API вернул некорректный путь изображения');
  }
  return path;
}

/** Accept a CDN URL, full entity key, or a path relative to images/. */
export function normalizeEntityImageInput(value: string, storageKey: string): string {
  const input = value.trim();
  if (!input) return '';
  if (/^https?:\/\//i.test(input)) return entityImagePathFromUrl(input, storageKey);
  const prefix = `entities/${storageKey}/images/`;
  const path = input.startsWith(prefix) ? input.slice(prefix.length) : input;
  if (!mediaUrl(storageKey, path)) throw new Error('Укажите ссылку CDN этой карточки или путь content/имя.webp');
  return path;
}
