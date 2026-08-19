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
                          ritual_uses: '',
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
                          ritual_uses: '',
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

// Подписи полей — раньше были жёстко на русском для обеих вкладок (только
// плейсхолдеры переключались по lang), из-за чего на вкладке English
// человек видел русские названия полей. Теперь подписи тоже идут по словарю.
const ESOTERIC_LABELS: Record<'ru' | 'en', {
  metaphysicalProperties: string;
  metaphysicalPlaceholder: string;
  add: string;
  chakras: string;
  chakrasPlaceholder: string;
  zodiac: string;
  zodiacPlaceholder: string;
  healingInterpretation: string;
  energyNotes: string;
  ritualUses: string;
}> = {
  ru: {
    metaphysicalProperties: 'Метафизические свойства',
    metaphysicalPlaceholder: 'защита, очищение...',
    add: 'Добавить',
    chakras: 'Чакры',
    chakrasPlaceholder: 'сердечная чакра',
    zodiac: 'Знаки зодиака',
    zodiacPlaceholder: 'Телец, Весы',
    healingInterpretation: 'Интерпретация исцеления',
    energyNotes: 'Заметки об энергии',
    ritualUses: 'Ритуальное использование (опционально)',
  },
  en: {
    metaphysicalProperties: 'Metaphysical properties',
    metaphysicalPlaceholder: 'protection, emotional healing...',
    add: 'Add',
    chakras: 'Chakras',
    chakrasPlaceholder: 'heart chakra',
    zodiac: 'Zodiac signs',
    zodiacPlaceholder: 'Taurus, Libra',
    healingInterpretation: 'Healing interpretation',
    energyNotes: 'Energy notes',
    ritualUses: 'Ritual uses (optional)',
  },
};

// Вспомогательный компонент
function EsotericFields({ form, lang }: { form: UseFormReturn<MineralFormData>; lang: 'ru' | 'en' }) {
  const path = `i18n.${lang}.esoteric.metaphysical_properties` as const;
  const fields = form.watch(path) ?? [];
  const labels = ESOTERIC_LABELS[lang];

  const appendValue = () => {
    const current = form.getValues(path) ?? [];
    form.setValue(path, [...current, '']);
  };

  const removeValue = (index: number) => {
    const current = [...(form.getValues(path) ?? [])];
    current.splice(index, 1);
    form.setValue(path, current);
  };

  return (
    <div className="space-y-8">
      {/* Metaphysical Properties */}
      <div>
        <div className="flex justify-between mb-3">
          <FormLabel>{labels.metaphysicalProperties}</FormLabel>
          <Button type="button" variant="outline" size="sm" onClick={appendValue}>
            <Plus className="h-4 w-4 mr-1" /> {labels.add}
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((field: string, index: number) => (
            <div key={`${path}-${index}`} className="flex gap-2">
              <FormField
                control={form.control}
                name={`${path}.${index}` as const}
                render={({ field: itemField }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder={labels.metaphysicalPlaceholder}
                        value={itemField.value ?? ''}
                        onChange={(e) => itemField.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" onClick={() => removeValue(index)}>
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
              <FormLabel>{labels.chakras}</FormLabel>
              <FormControl>
                <Input
                  placeholder={labels.chakrasPlaceholder}
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
              <FormLabel>{labels.zodiac}</FormLabel>
              <FormControl>
                <Input
                  placeholder={labels.zodiacPlaceholder}
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
            <FormLabel>{labels.healingInterpretation}</FormLabel>
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
            <FormLabel>{labels.energyNotes}</FormLabel>
            <FormControl>
              <Textarea rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ritual_uses — было в схеме (EsotericSchema.ritual_uses), но контрола
          не было ни на одном языке; попасть можно было только через JSON-импорт. */}
      <FormField
        control={form.control}
        name={`i18n.${lang}.esoteric.ritual_uses`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.ritualUses}</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
