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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';   // если нет — добавь через shadcn

interface LocalitiesSectionProps {
  form: UseFormReturn<MineralFormData>;
}

export function LocalitiesSection({ form }: LocalitiesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'localities',
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Месторождения</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({
              country: '',
              region: '',
              locality: '',
              is_russian: false,
              famous: false,
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить месторождение
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 && (
          <p className="text-slate-500 text-center py-8">
            Добавьте хотя бы одно месторождение
          </p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border border-slate-700 rounded-lg p-6 space-y-4 relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-red-400 hover:text-red-500"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`localities.${index}.country`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Страна *</FormLabel>
                    <FormControl>
                      <Input placeholder="Россия" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`localities.${index}.region`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Регион / Область *</FormLabel>
                    <FormControl>
                      <Input placeholder="Свердловская область" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`localities.${index}.locality`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Конкретное месторождение *</FormLabel>
                    <FormControl>
                      <Input placeholder="Меднорудянское (Нижний Тагил)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name={`localities.${index}.is_russian`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Российское месторождение</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`localities.${index}.famous`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Знаменитое</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`localities.${index}.description_ru`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание (Русский)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}