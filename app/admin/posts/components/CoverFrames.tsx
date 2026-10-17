'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { api, type CoverSequences } from '@/lib/api';
import { articleCdnUrl, articleUrlForSave } from '@/lib/article-media-url';
import { changeCoverSequence, moveCoverFrame, removeCoverFrame } from '@/lib/cover-sequences';
import type { ArticleResource } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Sequence = keyof CoverSequences;
const languages: { code: Sequence; title: string }[] = [
  { code: 'default', title: 'Универсальная' },
  { code: 'ru', title: 'Русская' },
  { code: 'en', title: 'Английская' },
];
const emptySequences = (): CoverSequences => ({ default: [], ru: [], en: [] });

export function CoverFrames({ slug, etag, onSaved }: {
  slug: string;
  etag: string | null;
  onSaved: (resource: ArticleResource) => void;
}) {
  const [sequences, setSequences] = useState<CoverSequences>(emptySequences);
  const [loadedSequences, setLoadedSequences] = useState<CoverSequences>(emptySequences);
  const [inputs, setInputs] = useState<Record<Sequence, string>>({ default: '', ru: '', en: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    api.getCoverSequences(slug, localStorage.getItem('admin_api_key') || '')
      .then(({ sequences: loaded }) => { if (active) { setSequences(loaded); setLoadedSequences(loaded); setError(''); } })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Не удалось загрузить кадры'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  const change = (lang: Sequence, values: string[]) => {
    setSequences((current) => changeCoverSequence(current, lang, values));
    setDirty(true);
    setError('');
  };
  const add = (lang: Sequence) => {
    const url = articleCdnUrl(inputs[lang]);
    if (!url) { setError('Укажите полный HTTPS URL или путь внутри lithoteka-cdn'); return; }
    change(lang, [...sequences[lang], url]);
    setInputs((current) => ({ ...current, [lang]: '' }));
  };
  const move = (lang: Sequence, index: number, offset: number) => {
    setSequences((current) => moveCoverFrame(current, lang, index, offset));
    setDirty(true);
    setError('');
  };
  const save = async () => {
    if (languages.some(({ code }) => sequences[code].some((url) =>
      !articleUrlForSave(url, loadedSequences[code].includes(url) ? url : undefined)))) {
      setError('Укажите полный HTTPS URL или путь внутри lithoteka-cdn');
      return;
    }
    const key = localStorage.getItem('admin_api_key') || '';
    setSaving(true);
    setError('');
    try {
      const resource = await api.updatePost(slug, { i18n: { media: { cover_frames: sequences } } }, key, etag);
      const stored = resource.post.i18n.media.cover_frames;
      if (!stored || languages.some(({ code }) => JSON.stringify(stored[code]) !== JSON.stringify(sequences[code]))) {
        throw new Error('API не подтвердил сохранение последовательности. Обновите статью и проверьте кадры.');
      }
      onSaved(resource);
      setLoadedSequences(sequences);
      setDirty(false);
      toast.success('Кадры обложки сохранены');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось сохранить кадры обложки');
    } finally { setSaving(false); }
  };

  return <Card><CardHeader><CardTitle>Кадры обложки</CardTitle></CardHeader><CardContent className="space-y-5">
    <p className="text-sm text-muted-foreground">Первый кадр — основной. Пустая языковая последовательность использует универсальную. Изменения сохраняют только ссылки в статье.</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {loading ? <p className="text-sm text-muted-foreground">Загрузка кадров…</p> : languages.map(({ code, title }) => {
      const frames = sequences[code];
      return <section key={code} className="space-y-3 rounded-lg border p-4">
        <h3 className="font-medium">{title}</h3>
        {frames.length === 0 && <p className="text-sm text-muted-foreground">{code !== 'default' && sequences.default.length ? 'Используется универсальная последовательность' : 'Кадров нет'}</p>}
        {frames.map((url, index) => <div key={`${code}-${index}`} className="flex flex-wrap items-center gap-3 rounded border p-2">
          {imageErrors[url] ? <span className="flex h-20 w-28 items-center justify-center bg-muted text-xs">Изображение недоступно</span>
            : <Image src={url} alt={`${title}: кадр ${index + 1}`} width={112} height={80} unoptimized className="h-20 w-28 rounded bg-muted object-contain" onError={() => setImageErrors((current) => ({ ...current, [url]: true }))} />}
          <div className="min-w-0 flex-1"><p className="text-sm font-medium">Кадр {index + 1}{index === 0 ? ' · Основной' : ''}</p><p className="break-all text-xs text-muted-foreground">{url}</p></div>
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="outline" disabled={saving || index === 0} onClick={() => move(code, index, -1)}>Вверх</Button>
            <Button type="button" size="sm" variant="outline" disabled={saving || index === frames.length - 1} onClick={() => move(code, index, 1)}>Вниз</Button>
            <Button type="button" size="sm" variant="destructive" disabled={saving} onClick={() => { setSequences((current) => removeCoverFrame(current, code, index)); setDirty(true); setError(''); }}>Удалить</Button>
          </div>
        </div>)}
        <div className="flex flex-wrap gap-2">
          <Input aria-label={`URL или путь изображения из Lithoteka CDN: ${title}`} value={inputs[code]} onChange={(event) => setInputs((current) => ({ ...current, [code]: event.target.value }))} placeholder="articles/quartz/images/cover/01.webp" className="min-w-64 flex-1" />
          <Button type="button" variant="outline" disabled={saving} onClick={() => add(code)}>Добавить кадр</Button>
        </div>
      </section>;
    })}
    <Button type="button" disabled={loading || saving || !dirty} onClick={() => void save()}>{saving ? 'Сохранение…' : 'Сохранить кадры'}</Button>
  </CardContent></Card>;
}
