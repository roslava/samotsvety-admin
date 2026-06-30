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
  { value: 'polished', label: 'Полированный срез' },
  { value: 'jewelry', label: 'В ювелирном изделии' },
  { value: 'micro', label: 'Макро / Микрофото' },
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

  const generateUrl = (type: string, index: number) => {
    if (!slug) return '';
    const typePrefix = type === 'specimen' ? 'specimen' : 
                      type === 'polished' ? 'polished' : 
                      type === 'jewelry' ? 'jewelry' : 'micro';
    return `https://storage.yandexcloud.net/samotsvety-cdn/${slug}/gallery/${typePrefix}-${String(index + 1).padStart(2, '0')}.webp`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Галерея изображений</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newIndex = fields.length;
              append({
                url: '',
                type: 'specimen',
                description_ru: '',
                description_en: '',
              });
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 && (
          <div className="text-slate-500 text-center py-12 border border-dashed border-slate-700 rounded-lg">
            Добавьте изображения в галерею
          </div>
        )}

        {fields.map((field, index) => {
          const currentType = form.watch(`gallery.${index}.type`);
          const suggestedUrl = generateUrl(currentType || 'specimen', index);

          return (
            <div key={field.id} className="border border-slate-700 rounded-lg p-5 space-y-4">
              <div className="flex justify-between">
                <h4 className="font-medium">Изображение #{index + 1}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<FormField
  control={form.control}
  name={`gallery.${index}.type`}
  render={({ field: typeField }) => (
    <FormItem>
      <FormLabel>Тип изображения</FormLabel>   {/* убрали * */}
      <Select 
        onValueChange={(value) => {
          typeField.onChange(value);
          const newUrl = generateUrl(value, index);
          form.setValue(`gallery.${index}.url`, newUrl);
        }} 
        value={typeField.value}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Не указан" />   {/* изменили placeholder */}
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {IMAGE_TYPES.map(t => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

                <FormField
                  control={form.control}
                  name={`gallery.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL изображения</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={suggestedUrl || "https://storage.yandexcloud.net/samotsvety-cdn/..."} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`gallery.${index}.description_ru`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (Русский)</FormLabel>
                    <FormControl>
                      <Input placeholder="Крупный натуральный образец с Урала" {...field} />
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