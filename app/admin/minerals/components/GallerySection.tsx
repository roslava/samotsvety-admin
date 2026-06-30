'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

const IMAGE_TYPES = [
  { value: 'specimen', label: 'Образец (сырой)' },
  { value: 'polished', label: 'Полированный' },
  { value: 'jewelry', label: 'В ювелирке' },
  { value: 'micro', label: 'Микро' },
];

interface GallerySectionProps {
  form: UseFormReturn<MineralFormData>;
  slug?: string;
}

export function GallerySection({ form, slug = '' }: GallerySectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'gallery',
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Галерея изображений</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({
              url: '',
              type: undefined,        // ← не заполняем по умолчанию
              description_ru: '',
              description_en: '',
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 && (
          <div className="text-slate-500 text-center py-12 border border-dashed rounded-lg">
            Добавьте изображения
          </div>
        )}

        {fields.map((field, index) => {
          const currentUrl = form.watch(`gallery.${index}.url`);

          return (
            <div key={field.id} className="border border-slate-700 rounded-lg p-5 space-y-4">
              <div className="flex justify-between">
                <h4 className="font-medium">Изображение #{index + 1}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`gallery.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL изображения</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://storage.yandexcloud.net/..." />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Выбор типа — опциональный */}
              <FormField
                control={form.control}
                name={`gallery.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип изображения (опционально)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Не указан" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {IMAGE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Предпросмотр */}
              {currentUrl && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1">Предпросмотр:</p>
                  <img 
                    key={currentUrl}
                    src={currentUrl} 
                    alt="Preview" 
                    className="max-h-48 rounded-md border border-slate-700 object-contain bg-slate-950" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0.4';
                    }}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name={`gallery.${index}.description_ru`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (Русский)</FormLabel>
                    <FormControl>
                      <Input placeholder="Описание этого изображения" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}