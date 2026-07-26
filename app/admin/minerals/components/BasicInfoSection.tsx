'use client';

import { UseFormReturn } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoSectionProps {
  form: UseFormReturn<MineralFormData>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип сущности *</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'mineral'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mineral">Минерал</SelectItem>
                    <SelectItem value="rock">Горная порода / агрегат</SelectItem>
                    <SelectItem value="gem_variety">Разновидность минерала</SelectItem>
                    <SelectItem value="organic">Органический материал</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (уникальный идентификатор) *</FormLabel>
              <FormControl>
                <Input
                  placeholder="malachite"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toLowerCase().trim())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Главное изображение */}
        <FormField
          control={form.control}
          name="main_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Главное изображение (hero) *</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://storage.yandexcloud.net/samotsvety-cdn/malachite/hero.webp"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-slate-500 mt-1">
                Пример: <code>https://storage.yandexcloud.net/samotsvety-cdn/[slug]/hero.webp</code>
              </p>
              {field.value && (
                <div className="mt-3">
                  <img
                    src={field.value}
                    alt="Preview"
                    className="max-h-48 rounded-md border border-slate-700 object-contain bg-slate-950"
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        {/* Thumbnail */}
        <FormField
          control={form.control}
          name="thumbnail_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail (превью)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://storage.yandexcloud.net/samotsvety-cdn/malachite/thumbnail.webp"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-slate-500 mt-1">
                Пример: <code>https://storage.yandexcloud.net/samotsvety-cdn/[slug]/thumbnail.webp</code>
              </p>
              {field.value && (
                <div className="mt-2">
                  <img
                    src={field.value}
                    alt="Thumbnail"
                    className="max-h-32 rounded-md border border-slate-700 object-contain bg-slate-950"
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        {/* Safety notes переехали на вкладку "Названия + Lore" — там они
            заполняются отдельно для RU и EN (i18n.<lang>.safety_notes) */}

        {/* Related minerals */}
        <FormField
          control={form.control}
          name="related_minerals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Связанные минералы (через запятую)</FormLabel>
              <FormControl>
                <Input
                  placeholder="azurite, chrysocolla, cuprite"
                  value={field.value?.join(', ') || ''}
                  onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
