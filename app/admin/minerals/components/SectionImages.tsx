'use client';
import { UseFormReturn } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { ImageUploadField } from '@/components/ImageUploadField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SectionImages({ form, section, title }: { form: UseFormReturn<MineralFormData>; section: 'lore' | 'safety' | 'esoteric'; title: string }) {
  const gallery = form.watch('images.gallery') ?? [];
  const rows = gallery.map((image, index) => ({ image, index })).filter(({ image }) => image.type === 'section:' + section);
  const update = (index: number, patch: Partial<(typeof gallery)[number]>) => {
    const next = [...(form.getValues('images.gallery') ?? [])];
    next[index] = { ...next[index], ...patch };
    form.setValue('images.gallery', next, { shouldDirty: true });
  };
  return <section className="space-y-3 rounded-lg border p-4">
    <h3 className="font-medium">{title}: изображения</h3>
    <p className="text-sm text-muted-foreground">Необязательно. Общие изображения для RU/EN, подписи — отдельно для каждого языка.</p>
    {rows.map(({ image, index }) => <div key={index} className="space-y-3 rounded border p-3">
      <ImageUploadField kind="gallery" slug={form.watch('slug')} storageKey={form.watch('images.storage_key')} value={image.path} onChange={path => update(index, { path })} label="Изображение" />
      <Input aria-label="Подпись на русском" placeholder="Подпись на русском (необязательно)" value={image.caption?.ru ?? ''} onChange={e => update(index, { caption: { ...image.caption, ru: e.target.value } })} />
      <Input aria-label="Caption in English" placeholder="Caption in English (optional)" value={image.caption?.en ?? ''} onChange={e => update(index, { caption: { ...image.caption, en: e.target.value } })} />
      <Button type="button" variant="outline" onClick={() => form.setValue('images.gallery', (form.getValues('images.gallery') ?? []).filter((_, i) => i !== index), { shouldDirty: true })}>Убрать из раздела</Button>
    </div>)}
    <Button type="button" variant="outline" onClick={() => form.setValue('images.gallery', [...(form.getValues('images.gallery') ?? []), { path: '', type: 'section:' + section, caption: { ru: null, en: null } }], { shouldDirty: true })}>Добавить изображение</Button>
  </section>;
}
