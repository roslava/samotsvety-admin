/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { entityImagePathFromUrl, mediaUrl, normalizeEntityImageInput } from '@/lib/media-url';

export function GallerySection({ form, onStorageKeyManualChange }: { form: UseFormReturn<MineralFormData>; onStorageKeyManualChange: () => void }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'images.gallery' });
  const [uploading, setUploading] = useState(false);
  const images = form.watch('images');
  const storageKey = images?.storage_key || '';
  const slug = form.watch('slug');
  const upload = async (file: File, kind: 'hero' | 'thumbnail' | 'gallery') => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(storageKey)) {
      toast.error('Сначала укажите корректные slug и папку изображений');
      return;
    }
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) { toast.error('API Key не найден'); return; }
    setUploading(true);
    try {
      const { url } = await api.uploadMedia(file, apiKey, { kind, slug, storageKey });
      const path = entityImagePathFromUrl(url, storageKey);
      if (kind === 'gallery') {
        append({ path, type: null, caption: { ru: null, en: null } });
      } else {
        form.setValue(`images.${kind}.path`, path, { shouldDirty: true, shouldValidate: true });
      }
      toast.success('Изображение загружено. Сохраните карточку, чтобы закрепить путь.');
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Не удалось загрузить изображение');
    } finally { setUploading(false); }
  };
  const uploadControl = (kind: 'hero' | 'thumbnail' | 'gallery', text: string) =>
    <label className={`inline-flex w-fit cursor-pointer rounded-md border px-3 py-2 text-sm ${uploading ? 'opacity-50' : ''}`}>
      {text}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void upload(file, kind);
        event.target.value = '';
      }} />
    </label>;
  const preview = (path?: string | null, alt?: string) => {
    const url = path && storageKey ? mediaUrl(storageKey, path) : '';
    return url ? <Image src={url} alt={alt || 'Предпросмотр'} width={160} height={112} unoptimized className="h-28 w-40 rounded border object-contain" /> : null;
  };
  const pathField = (name: string, label: string, placeholder: string, description?: string) => { const isImagePath = name.endsWith('.path'); return <FormField control={form.control} name={name as any} rules={isImagePath ? { validate: (value: string | null | undefined) => !value || !/^https?:\/\//i.test(value) || 'Укажите путь внутри папки, а не полный URL.' } : undefined} render={({ field }) => <FormItem><FormLabel>{label}</FormLabel><FormControl><Input {...field} placeholder={placeholder} value={field.value ?? ''} onBlur={event => { field.onBlur(); if (isImagePath) { try { field.onChange(normalizeEntityImageInput(event.target.value, storageKey)); form.clearErrors(name as any); } catch (error) { form.setError(name as any, { message: error instanceof Error ? error.message : 'Некорректная ссылка CDN' }); } } }} /></FormControl>{description && <FormDescription>{description}</FormDescription>}<FormMessage /></FormItem>} />; };
  return <Card><CardHeader><CardTitle>Изображения</CardTitle></CardHeader><CardContent className="space-y-5"><FormField control={form.control} name="images.storage_key" render={({ field }) => <FormItem><FormLabel>Папка изображений</FormLabel><FormControl><Input {...field} placeholder="kambaba_jasper" value={field.value ?? ''} onChange={event => { onStorageKeyManualChange(); field.onChange(event.target.value); }} /></FormControl><FormDescription>Имя папки этой карточки в хранилище. Используется для всех изображений камня.</FormDescription><FormMessage /></FormItem>} />
    <div className="space-y-2">{pathField('images.hero.path', 'Главное изображение', 'hero.webp', 'Путь внутри папки изображений.')}{preview(images?.hero?.path, 'Главное изображение')}{uploadControl('hero', 'Загрузить главное изображение')}</div>
    <div className="space-y-2">{pathField('images.thumbnail.path', 'Миниатюра', 'thumbnail.webp')}{preview(images?.thumbnail?.path, 'Миниатюра')}{uploadControl('thumbnail', 'Загрузить миниатюру')}</div>
    <div className="space-y-3"><div><h3 className="font-medium">Галерея и иллюстрации разделов</h3><p className="text-sm text-muted-foreground">Добавьте изображение с CDN и выберите раздел. Для иллюстраций используйте content/имя.webp, для общей галереи — gallery/имя.webp. Можно вставить полный URL CDN или ключ entities/папка/images/content/имя.webp.</p></div>{fields.map((row, index) => <section key={row.id} className="rounded border p-4 space-y-3"><div className="flex items-center justify-between gap-3"><h4 className="font-medium">Изображение {index + 1}</h4><Button type="button" variant="destructive" onClick={() => remove(index)}>Удалить</Button></div>{pathField(`images.gallery.${index}.path`, 'Ссылка CDN или путь к изображению', images?.gallery?.[index]?.type?.startsWith('section:') ? 'content/jaspis_red.webp' : 'gallery/image.webp')}<label className="block text-sm">Раздел<select className="mt-1 block w-full rounded border p-2" value={images?.gallery?.[index]?.type ?? ''} onChange={event => form.setValue(`images.gallery.${index}.type`, event.target.value || null, { shouldDirty: true })}><option value="">Общая галерея</option>{images?.gallery?.[index]?.type && !['section:lore','section:safety','section:esoteric'].includes(images.gallery[index].type!) && <option value={images.gallery[index].type!}>{images.gallery[index].type}</option>}<option value="section:lore">История и культура</option><option value="section:safety">Безопасность</option><option value="section:esoteric">Эзотерика</option></select></label>{images?.gallery?.[index]?.path && <a className="block break-all text-xs text-muted-foreground underline" href={mediaUrl(storageKey, images.gallery[index].path)} target="_blank" rel="noopener noreferrer">{mediaUrl(storageKey, images.gallery[index].path)}</a>}{preview(images?.gallery?.[index]?.path, `Изображение галереи ${index + 1}`)}{pathField(`images.gallery.${index}.caption.ru`, 'Подпись на русском', 'Необязательно')}{pathField(`images.gallery.${index}.caption.en`, 'Caption in English', 'Optional')}</section>)}<div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => append({ path: '', type: null, caption: { ru: null, en: null } })}>Добавить изображение из CDN</Button></div></div></CardContent></Card>;
}
