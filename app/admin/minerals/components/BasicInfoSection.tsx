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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
              <FormLabel>Главное изображение (URL) *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://cdn.samotsvety.com/images/malachite/hero.jpg" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
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

        {/* Safety notes */}
        <FormField
          control={form.control}
          name="safety_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Предупреждения по безопасности</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Содержит медь. Не рекомендуется длительный контакт с кожей..." 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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