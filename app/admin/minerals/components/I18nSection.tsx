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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface I18nSectionProps {
  form: UseFormReturn<MineralFormData>;
}

interface LangLabels {
  name: string;
  namePlaceholder: string;
  lore: string;
  lorePlaceholder: string;
  colorDescription: string;
  colorPlaceholder: string;
  sectionTitle: string;
  mineralGroup: string;
  mineralGroupPlaceholder: string;
  crystalSystem: string;
  crystalSystemPlaceholder: string;
  crystalHabit: string;
  crystalHabitPlaceholder: string;
  streak: string;
  streakPlaceholder: string;
  luster: string;
  lusterPlaceholder: string;
  transparency: string;
  transparencyPlaceholder: string;
  cleavage: string;
  cleavagePlaceholder: string;
  fracture: string;
  fracturePlaceholder: string;
  tenacity: string;
  tenacityPlaceholder: string;
  hardnessNote: string;
  hardnessNotePlaceholder: string;
  imaStatus: string;
  imaStatusPlaceholder: string;
  rockType: string;
  rockTypePlaceholder: string;
  composition: string;
  compositionPlaceholder: string;
  identificationTips: string;
  identificationTipsPlaceholder: string;
  phenomena: string;
  phenomenaPlaceholder: string;
  safetyNotes: string;
  safetyNotesPlaceholder: string;
}

// Значения сингоний хранятся отдельно для каждого языка (i18n.ru / i18n.en),
// поэтому и value, и подпись пункта должны быть на языке соответствующей вкладки.
const CRYSTAL_SYSTEM_OPTIONS: Record<'ru' | 'en', { value: string; label: string }[]> = {
  ru: [
    { value: 'Моноклинная', label: 'Моноклинная' },
    { value: 'Ромбическая', label: 'Ромбическая' },
    { value: 'Гексагональная', label: 'Гексагональная' },
    { value: 'Кубическая', label: 'Кубическая' },
    { value: 'Триклинная', label: 'Триклинная' },
    { value: 'Тетрагональная', label: 'Тетрагональная' },
    { value: 'Аморфная', label: 'Аморфная' },
  ],
  en: [
    { value: 'Monoclinic', label: 'Monoclinic' },
    { value: 'Orthorhombic', label: 'Orthorhombic' },
    { value: 'Hexagonal', label: 'Hexagonal' },
    { value: 'Isometric', label: 'Isometric' },
    { value: 'Triclinic', label: 'Triclinic' },
    { value: 'Tetragonal', label: 'Tetragonal' },
    { value: 'Amorphous', label: 'Amorphous' },
  ],
};

function LangFields(props: {
  form: UseFormReturn<MineralFormData>;
  lang: 'ru' | 'en';
  labels: LangLabels;
}) {
  const { form, lang, labels } = props;
  const base = 'i18n.' + lang + '.';
  const crystalSystemOptions = CRYSTAL_SYSTEM_OPTIONS[lang];
  const noneLabel = lang === 'ru' ? 'Не указано' : 'Not specified';

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

      <div className="border-t border-slate-700 pt-6">
        <h4 className="font-medium mb-4 text-sm text-slate-400 uppercase tracking-wide">
          {labels.sectionTitle}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name={(base + 'mineral_group') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {labels.mineralGroup} {lang === 'ru' ? '*' : ''}
                </FormLabel>
                <FormControl>
                  <Input placeholder={labels.mineralGroupPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'crystal_system') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.crystalSystem}</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  value={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={labels.crystalSystemPlaceholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">{noneLabel}</SelectItem>
                    {crystalSystemOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'crystal_habit') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.crystalHabit}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.crystalHabitPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'streak') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {labels.streak} {lang === 'ru' ? '*' : ''}
                </FormLabel>
                <FormControl>
                  <Input placeholder={labels.streakPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'luster') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {labels.luster} {lang === 'ru' ? '*' : ''}
                </FormLabel>
                <FormControl>
                  <Input placeholder={labels.lusterPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'transparency') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {labels.transparency} {lang === 'ru' ? '*' : ''}
                </FormLabel>
                <FormControl>
                  <Input placeholder={labels.transparencyPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'cleavage') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.cleavage}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.cleavagePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'fracture') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.fracture}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.fracturePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'tenacity') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.tenacity}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.tenacityPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'hardness_note') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.hardnessNote}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.hardnessNotePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'ima_status') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.imaStatus}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.imaStatusPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'rock_type') as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.rockType}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.rockTypePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'composition') as any}
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{labels.composition}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.compositionPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'identification_tips') as any}
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{labels.identificationTips}</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder={labels.identificationTipsPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'phenomena') as any}
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{labels.phenomena}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={labels.phenomenaPlaceholder}
                    value={field.value?.join(', ') || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((s: string) => s.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={(base + 'safety_notes') as any}
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{labels.safetyNotes}</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder={labels.safetyNotesPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
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
  sectionTitle: 'Научные свойства (текстовые, RU)',
  mineralGroup: 'Группа минерала / тип породы',
  mineralGroupPlaceholder: 'карбонаты',
  crystalSystem: 'Кристаллическая система',
  crystalSystemPlaceholder: 'моноклинная',
  crystalHabit: 'Габитус кристаллов',
  crystalHabitPlaceholder: 'призматический, волокнистый, почковидный',
  streak: 'Цвет черты',
  streakPlaceholder: 'зелёная',
  luster: 'Блеск',
  lusterPlaceholder: 'стеклянный, шелковистый',
  transparency: 'Прозрачность',
  transparencyPlaceholder: 'непрозрачный',
  cleavage: 'Спайность',
  cleavagePlaceholder: 'совершенная по одному направлению',
  fracture: 'Излом',
  fracturePlaceholder: 'неровный, раковистый',
  tenacity: 'Вязкость',
  tenacityPlaceholder: 'хрупкий',
  hardnessNote: 'Примечание к твёрдости',
  hardnessNotePlaceholder: 'по шкале Мооса',
  imaStatus: 'Статус IMA',
  imaStatusPlaceholder: 'approved / trade name / not a distinct species',
  rockType: 'Тип породы',
  rockTypePlaceholder: 'метаморфическая / магматическая / осадочная',
  composition: 'Преобладающий состав',
  compositionPlaceholder: 'Cu + CO3 + OH',
  identificationTips: 'Советы по идентификации',
  identificationTipsPlaceholder: 'Отличительные признаки...',
  phenomena: 'Оптические явления (через запятую)',
  phenomenaPlaceholder: 'иризация, астеризм, кошачий глаз',
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
  sectionTitle: 'Scientific properties (descriptive, EN)',
  mineralGroup: 'Mineral group / rock type',
  mineralGroupPlaceholder: 'carbonates',
  crystalSystem: 'Crystal system',
  crystalSystemPlaceholder: 'monoclinic',
  crystalHabit: 'Crystal habit',
  crystalHabitPlaceholder: 'prismatic, fibrous, botryoidal',
  streak: 'Streak',
  streakPlaceholder: 'green',
  luster: 'Luster',
  lusterPlaceholder: 'vitreous, silky',
  transparency: 'Transparency',
  transparencyPlaceholder: 'opaque',
  cleavage: 'Cleavage',
  cleavagePlaceholder: 'perfect in one direction',
  fracture: 'Fracture',
  fracturePlaceholder: 'uneven, conchoidal',
  tenacity: 'Tenacity',
  tenacityPlaceholder: 'brittle',
  hardnessNote: 'Hardness note',
  hardnessNotePlaceholder: 'Mohs scale',
  imaStatus: 'IMA status',
  imaStatusPlaceholder: 'approved / trade name / not a distinct species',
  rockType: 'Rock type',
  rockTypePlaceholder: 'metamorphic / igneous / sedimentary',
  composition: 'Composition',
  compositionPlaceholder: 'Cu + CO3 + OH',
  identificationTips: 'Identification tips',
  identificationTipsPlaceholder: 'Distinguishing features...',
  phenomena: 'Optical phenomena (comma-separated)',
  phenomenaPlaceholder: 'iridescence, asterism, chatoyancy',
  safetyNotes: 'Safety notes',
  safetyNotesPlaceholder: 'Contains copper. Prolonged skin contact is not recommended...',
};

export function I18nSection({ form }: I18nSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Названия, Lore и научные описания (Русский + English)</CardTitle>
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