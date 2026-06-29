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
import { Switch } from '@/components/ui/switch';

interface EsotericSectionProps {
  form: UseFormReturn<MineralFormData>;
}

export function EsotericSection({ form }: EsotericSectionProps) {
  const { fields: propertiesFields, append: appendProperty, remove: removeProperty } = useFieldArray({
    control: form.control,
    name: 'i18n.ru.esoteric.metaphysical_properties', // Пока только для ru, en можно скопировать позже
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Эзотерические свойства</CardTitle>
          <FormField
            control={form.control}
            name="i18n.ru.esoteric"
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center gap-2">
                <Switch 
                  checked={!!value} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange({
                        metaphysical_properties: [],
                        chakras: [],
                        zodiac: [],
                        healing_interpretation: '',
                        energy_notes: '',
                      });
                    } else {
                      onChange(undefined);
                    }
                  }}
                />
                <span className="text-sm">Включить эзотерику</span>
              </div>
            )}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Показываем только если эзотерика включена */}
        {form.watch('i18n.ru.esoteric') && (
          <>
            {/* Metaphysical Properties */}
            <div>
              <div className="flex justify-between mb-3">
                <FormLabel>Метафизические свойства</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendProperty('')}
                >
                  <Plus className="h-4 w-4 mr-1" /> Добавить
                </Button>
              </div>
              <div className="space-y-2">
                {propertiesFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`i18n.ru.esoteric.metaphysical_properties.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="защита, эмоциональное исцеление..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" onClick={() => removeProperty(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chakras & Zodiac */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="i18n.ru.esoteric.chakras"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Чакры</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="сердечная чакра (Анахата)" 
                        value={field.value?.join(', ') || ''}
                        onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="i18n.ru.esoteric.zodiac"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Знаки зодиака</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Телец, Весы, Козерог" 
                        value={field.value?.join(', ') || ''}
                        onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Interpretation & Notes */}
            <FormField
              control={form.control}
              name="i18n.ru.esoteric.healing_interpretation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Интерпретация исцеления</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="i18n.ru.esoteric.energy_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заметки об энергии</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}