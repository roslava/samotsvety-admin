'use client';

import { UseFormReturn } from 'react-hook-form';
import { PostFormData } from '@/lib/validations/post';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface ContentSectionProps {
  form: UseFormReturn<PostFormData>;
}

export function ContentSection({ form }: ContentSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="i18n.ru.content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Содержимое (Русский) *</FormLabel>
            <FormControl>
              <Textarea rows={15} {...field} />
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
              <Textarea rows={15} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
