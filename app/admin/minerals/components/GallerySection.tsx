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
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface GallerySectionProps {
  form: UseFormReturn<MineralFormData>;
}

export function GallerySection({ form }: GallerySectionProps) {
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
              type: 'specimen',
              description_ru: '',
              description_en: '',
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить изображение
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 && (
          <div className="text-slate-500 text-center py-12 border border-dashed border-slate-700 rounded-lg">
            <ImageIcon className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>Пока нет изображений в галерее</p>
          </div>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border border-slate-700 rounded-lg p-5 space-y-4">
            <div className="flex justify-between">
              <h4 className="font-medium">Изображение #{index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <FormField
              control={form.control}
              name={`gallery.${index}.url`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL изображения *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://cdn.samotsvety.com/images/..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`gallery.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип изображения</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="specimen">Образец (сырой)</SelectItem>
                        <SelectItem value="polished">Полированный</SelectItem>
                        <SelectItem value="jewelry">В ювелирном изделии</SelectItem>
                        <SelectItem value="micro">Микрофото</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`gallery.${index}.description_ru`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (RU)</FormLabel>
                    <FormControl>
                      <Input placeholder="Натуральный образец с Урала" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}