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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EsotericSectionProps {
  form: UseFormReturn<MineralFormData>;
}

export function EsotericSection({ form }: EsotericSectionProps) {
  const ruEsoteric = form.watch('i18n.ru.esoteric');
  const enEsoteric = form.watch('i18n.en.esoteric');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Эзотерические свойства</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ru" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ru">🇷🇺 Русский</TabsTrigger>
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
          </TabsList>

          {/* Русский */}
          <TabsContent value="ru" className="mt-6 space-y-8">
            <FormField
              control={form.control}
              name="i18n.ru.esoteric"
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={!!value} 
                    onCheckedChange={(checked) => {
                      if (checked && !value) {
                        onChange({
                          metaphysical_properties: [''],
                          chakras: [],
                          zodiac: [],
                          healing_interpretation: '',
                          energy_notes: '',
                        });
                      } else if (!checked) {
                        onChange(undefined);
                      }
                    }}
                  />
                  <span>Включить эзотерический блок (RU)</span>
                </div>
              )}
            />

            {ruEsoteric && (
              <EsotericFields form={form} lang="ru" />
            )}
          </TabsContent>

          {/* English */}
          <TabsContent value="en" className="mt-6 space-y-8">
            <FormField
              control={form.control}
              name="i18n.en.esoteric"
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={!!value} 
                    onCheckedChange={(checked) => {
                      if (checked && !value) {
                        onChange({
                          metaphysical_properties: [''],
                          chakras: [],
                          zodiac: [],
                          healing_interpretation: '',
                          energy_notes: '',
                        });
                      } else if (!checked) {
                        onChange(undefined);
                      }
                    }}
                  />
                  <span>Enable Esoteric Block (EN)</span>
                </div>
              )}
            />

            {enEsoteric && (
              <EsotericFields form={form} lang="en" />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Вспомогательный компонент
function EsotericFields({ form, lang }: { form: UseFormReturn<MineralFormData>; lang: 'ru' | 'en' }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `i18n.${lang}.esoteric.metaphysical_properties` as const,
  });

  return (
    <div className="space-y-8">
      {/* Metaphysical Properties */}
      <div>
        <div className="flex justify-between mb-3">
          <FormLabel>Метафизические свойства</FormLabel>
          <Button type="button" variant="outline" size="sm" onClick={() => append('')}>
            <Plus className="h-4 w-4 mr-1" /> Добавить
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`i18n.${lang}.esoteric.metaphysical_properties.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder={lang === 'ru' ? "защита, очищение..." : "protection, emotional healing..."} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name={`i18n.${lang}.esoteric.chakras`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Чакры</FormLabel>
              <FormControl>
                <Input 
                  placeholder={lang === 'ru' ? "сердечная чакра" : "heart chakra"} 
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
          name={`i18n.${lang}.esoteric.zodiac`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Знаки зодиака</FormLabel>
              <FormControl>
                <Input 
                  placeholder={lang === 'ru' ? "Телец, Весы" : "Taurus, Libra"} 
                  value={field.value?.join(', ') || ''}
                  onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`i18n.${lang}.esoteric.healing_interpretation`}
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
        name={`i18n.${lang}.esoteric.energy_notes`}
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
    </div>
  );
}