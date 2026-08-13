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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface I18nSectionProps {
  form: UseFormReturn<MineralFormData>;
}

// LangLabels — теперь только по-настоящему переводимый контент. Всё, что было
// закрытым минералогическим справочником (mineral_group/class/family,
// crystal_habit, luster, transparency, tenacity, hardness_note, ima_status,
// rock_type, composition, phenomena), переехало в ScientificSection как
// языконезависимые enum/multi-select поля — см. комментарий там.
interface LangLabels {
  name: string;
  namePlaceholder: string;
  lore: string;
  lorePlaceholder: string;
  colorDescription: string;
  colorPlaceholder: string;
  identificationTips: string;
  identificationTipsPlaceholder: string;
  safetyNotes: string;
  safetyNotesPlaceholder: string;
}

function LangFields(props: {
  form: UseFormReturn<MineralFormData>;
  lang: 'ru' | 'en';
  labels: LangLabels;
}) {
  const { form, lang, labels } = props;
  const base = 'i18n.' + lang + '.';

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name={(base + 'name') as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.name} *</FormLabel>
            <FormControl>
              <Input placeholder={labels.namePlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={(base + 'lore') as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.lore} *</FormLabel>
            <FormControl>
              <Textarea rows={6} placeholder={labels.lorePlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={(base + 'color_description') as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.colorDescription}</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder={labels.colorPlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={(base + 'identification_tips') as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.identificationTips}</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder={labels.identificationTipsPlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={(base + 'safety_notes') as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.safetyNotes}</FormLabel>
            <FormControl>
              <Textarea rows={2} placeholder={labels.safetyNotesPlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

const RU_LABELS: LangLabels = {
  name: 'Название (Русский)',
  namePlaceholder: 'Малахит',
  lore: 'Lore / Историко-культурный контекст',
  lorePlaceholder: 'История добычи на Урале, использование в камнерезном искусстве...',
  colorDescription: 'Описание цвета',
  colorPlaceholder: 'Характерный насыщенный зелёный цвет с полосчатым рисунком...',
  identificationTips: 'Советы по идентификации',
  identificationTipsPlaceholder: 'Отличительные признаки...',
  safetyNotes: 'Предупреждения по безопасности',
  safetyNotesPlaceholder: 'Содержит медь. Не рекомендуется длительный контакт с кожей...',
};

const EN_LABELS: LangLabels = {
  name: 'Name (English)',
  namePlaceholder: 'Malachite',
  lore: 'Lore / Historical & Cultural Context',
  lorePlaceholder: 'History of mining in the Urals, use in hardstone carving...',
  colorDescription: 'Color Description',
  colorPlaceholder: 'Characteristic rich green color with banded patterns...',
  identificationTips: 'Identification tips',
  identificationTipsPlaceholder: 'Distinguishing features...',
  safetyNotes: 'Safety notes',
  safetyNotesPlaceholder: 'Contains copper. Prolonged skin contact is not recommended...',
};

export function I18nSection({ form }: I18nSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Названия и Lore (Русский + English)</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ru" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ru">🇷🇺 Русский</TabsTrigger>
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
          </TabsList>

          <TabsContent value="ru" className="mt-6">
            <LangFields form={form} lang="ru" labels={RU_LABELS} />
          </TabsContent>

          <TabsContent value="en" className="mt-6">
            <LangFields form={form} lang="en" labels={EN_LABELS} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
