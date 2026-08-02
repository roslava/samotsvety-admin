'use client';

import { UseFormReturn } from 'react-hook-form';
import { PostFormData } from '@/lib/validations/post';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { BlockEditor } from './BlockEditor';

interface ContentSectionProps {
  form: UseFormReturn<PostFormData>;
}

export function ContentSection({ form }: ContentSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-1">Композиция статьи</h3>
        <BlockEditor form={form} />
      </div>

      <details className="border rounded-lg p-4">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
          Устаревшее markdown-поле (для статей, ещё не переведённых на блоки)
        </summary>
        <div className="space-y-6 mt-4">
          <FormField
            control={form.control}
            name="i18n.ru.content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Содержимое (Русский)</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="i18n.en.content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Содержимое (English)</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </details>
    </div>
  );
}
