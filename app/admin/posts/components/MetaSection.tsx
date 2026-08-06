'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PostFormData } from '@/lib/validations/post';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/ImageUploadField';
import { Languages } from 'lucide-react';

interface MetaSectionProps {
  form: UseFormReturn<PostFormData>;
}

export function MetaSection({ form }: MetaSectionProps) {
  const slug = form.watch('slug');
  const [perLanguageCover, setPerLanguageCover] = useState(
    Boolean(form.watch('i18n.ru.cover_image') || form.watch('i18n.en.cover_image'))
  );

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="is_published"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <Label>Опубликовано</Label>
          </FormItem>
        )}
      />

      <div className="space-y-3">
        <Label>Обложка статьи</Label>

        <div className="flex items-center gap-3 rounded-md border p-3 bg-muted/30">
          <Switch checked={perLanguageCover} onCheckedChange={setPerLanguageCover} id="per-lang-cover" />
          <label htmlFor="per-lang-cover" className="text-sm cursor-pointer flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-muted-foreground" />
            Разные обложки для RU и EN
            <span className="text-muted-foreground">— если на обложке есть текст</span>
          </label>
        </div>

        {!perLanguageCover ? (
          <ImageUploadField
            label="Обложка (общая для RU и EN)"
            value={form.watch('cover_image')}
            onChange={(url) => form.setValue('cover_image', url)}
            kind="cover"
            slug={slug}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUploadField
              label="Обложка — Русский"
              value={form.watch('i18n.ru.cover_image')}
              onChange={(url) => form.setValue('i18n.ru.cover_image', url)}
              kind="cover"
              slug={slug}
              lang="ru"
            />
            <ImageUploadField
              label="Cover — English"
              value={form.watch('i18n.en.cover_image')}
              onChange={(url) => form.setValue('i18n.en.cover_image', url)}
              kind="cover"
              slug={slug}
              lang="en"
            />
          </div>
        )}
      </div>
    </div>
  );
}
