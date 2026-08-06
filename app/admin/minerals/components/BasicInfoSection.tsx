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
import { ImageUploadField } from '@/components/ImageUploadField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoSectionProps {
  form: UseFormReturn<MineralFormData>;
  slug?: string;
}

export function BasicInfoSection({ form, slug = '' }: BasicInfoSectionProps) {
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
                <ImageUploadField value={field.value} onChange={field.onChange} kind="hero" slug={slug} />
              </FormControl>
              <FormMessage />
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
                <ImageUploadField value={field.value} onChange={field.onChange} kind="thumbnail" slug={slug} />
              </FormControl>
              <FormMessage />
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
