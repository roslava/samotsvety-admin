'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { api } from '@/lib/api';
import { mediaUrl } from '@/lib/media-url';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Gem = { slug: string; i18n?: { ru?: { name?: string } }; images?: { storage_key?: string; hero?: { path?: string } } };
export default function RelatedGemPicker({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [gems, setGems] = useState<Gem[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    api.getGemEntitiesForExport().then(result => {
      if (!cancelled) setGems(result.data as Gem[]);
    }).catch(() => { if (!cancelled) setError('Не удалось загрузить каталог. Выбранные связи сохранены.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [attempt]);
  const title = (gem?: Gem, slug?: string) => gem?.i18n?.ru?.name || slug || '';
  const photo = (gem?: Gem) => gem?.images?.storage_key && gem.images.hero?.path
    ? mediaUrl(gem.images.storage_key, gem.images.hero.path) : '';
  const thumbnail = (gem?: Gem) => photo(gem) ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo(gem)} alt="" className="size-10 shrink-0 rounded object-cover" loading="lazy" />
  ) : <span className="size-10 shrink-0 rounded bg-muted" aria-hidden="true" />;
  const matches = gems.filter(gem => !value.includes(gem.slug) && (title(gem) + ' ' + gem.slug).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const move = (index: number, direction: number) => {
    const next = [...value];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Выберите камни для карточек под статьёй. Порядок в списке определяет порядок на сайте.</p>
    <div onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <label htmlFor="related-gem-search" className="text-sm">Поиск по названию или slug</label>
      <Input id="related-gem-search" value={query} disabled={loading || !!error}
        aria-expanded={open} aria-controls="related-gem-options"
        onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); }}
        onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); } }}
        placeholder={loading ? 'Загрузка каталога…' : 'Например, кварц или quartz'} />
      {open && !loading && !error && <div id="related-gem-options" className="max-h-64 overflow-auto rounded-md border bg-background p-1">
        {matches.length === 0 && <p className="p-3 text-sm text-muted-foreground">Нет подходящих камней</p>}
        {matches.map(gem => <button key={gem.slug} type="button" className="flex w-full items-center gap-3 rounded p-2 text-left hover:bg-muted focus-visible:bg-muted"
          onClick={() => { onChange([...value, gem.slug]); setQuery(''); setOpen(false); document.getElementById('related-gem-search')?.focus(); }}>
          {thumbnail(gem)}<span><span className="block text-sm">{title(gem)}</span><span className="block text-xs text-muted-foreground">{gem.slug}</span></span>
        </button>)}
      </div>}
    </div>
    {error && <div role="alert" className="text-sm">{error} <Button type="button" variant="outline" onClick={() => { setLoading(true); setError(''); setAttempt(n => n + 1); }}>Повторить</Button></div>}
    <ul className="space-y-2">{value.map((slug, index) => {
      const gem = gems.find(item => item.slug === slug);
      return <li key={slug} className="flex items-center gap-3 rounded-md border p-2">
        {thumbnail(gem)}<span className="min-w-0 flex-1"><span className="block text-sm">{title(gem, slug)}</span><span className="block break-all text-xs text-muted-foreground">{slug}</span></span>
        <Button type="button" size="icon" variant="ghost" disabled={index === 0} aria-label={'Выше: ' + title(gem, slug)} onClick={() => move(index, -1)}><ArrowUp size={16} /></Button>
        <Button type="button" size="icon" variant="ghost" disabled={index === value.length - 1} aria-label={'Ниже: ' + title(gem, slug)} onClick={() => move(index, 1)}><ArrowDown size={16} /></Button>
        <Button type="button" size="icon" variant="ghost" aria-label={'Удалить: ' + title(gem, slug)} onClick={() => onChange(value.filter(item => item !== slug))}><X size={16} /></Button>
      </li>;
    })}</ul>
  </div>;
}
