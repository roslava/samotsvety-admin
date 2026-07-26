'use client';

import { UseFormReturn } from 'react-hook-form';
import { PostFormData } from '@/lib/validations/post';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoSectionProps {
  form: UseFormReturn<PostFormData>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="malachite-ural" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Тип статьи</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="blog">Блог</SelectItem>
                <SelectItem value="guide">Гайд</SelectItem>
                <SelectItem value="history">История</SelectItem>
                <SelectItem value="esoteric">Эзотерика</SelectItem>
                <SelectItem value="review">Обзор</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="i18n.ru.title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Заголовок (Русский) *</FormLabel>
            <FormControl>
              <Input placeholder="Малахит Урала..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="i18n.en.title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Заголовок (English)</FormLabel>
            <FormControl>
              <Input placeholder="Ural Malachite..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="i18n.ru.excerpt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Краткое описание (Русский)</FormLabel>
            <FormControl>
              <Input placeholder="Короткий анонс для карточки статьи..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="i18n.en.excerpt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Excerpt (English)</FormLabel>
            <FormControl>
              <Input placeholder="Short teaser for the article card..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="author"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Автор</FormLabel>
            <FormControl>
              <Input placeholder="roslava" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
