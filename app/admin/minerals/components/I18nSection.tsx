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

function LangFields(props: { form: UseFormReturn<MineralFormData>; lang: 'ru' | 'en'; labels: LangLabels }) {
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
                <FormLabel>{labels.mineralGroup} {lang === 'ru' ? '*' : ''}</FormLabel>
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
                <FormControl>
                  <Input placeholder={labels.crystalSystemPlaceholder} {...field} />
                </FormControl>
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
                <FormLabel>{labels.streak} {lang === 'ru' ? '*' : ''}</FormLabel>
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
                <FormLabel>{labels.luster} {lang === 'ru' ? '*' : ''}</FormLabel>
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
                <FormLabel>{labels.transparency} {lang === 'ru' ? '*' : ''}</FormLabel>
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
                  <Textarea rows={3} placeholder={labels.identificationTipsPlaceholder} {...field} />
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
                    onChange={(e) => field.onChange(e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
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
  name: 'РќР°Р·РІР°РЅРёРµ (Р СѓСЃСЃРєРёР№)',
  namePlaceholder: 'РњР°Р»Р°С…РёС‚',
  lore: 'Lore / РСЃС‚РѕСЂРёРєРѕ-РєСѓР»СЊС‚СѓСЂРЅС‹Р№ РєРѕРЅС‚РµРєСЃС‚',
  lorePlaceholder: 'РСЃС‚РѕСЂРёСЏ РґРѕР±С‹С‡Рё РЅР° РЈСЂР°Р»Рµ, РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ РІ РєР°РјРЅРµСЂРµР·РЅРѕРј РёСЃРєСѓСЃСЃС‚РІРµ...',
  colorDescription: 'РћРїРёСЃР°РЅРёРµ С†РІРµС‚Р°',
  colorPlaceholder: 'РҐР°СЂР°РєС‚РµСЂРЅС‹Р№ РЅР°СЃС‹С‰РµРЅРЅС‹Р№ Р·РµР»С‘РЅС‹Р№ С†РІРµС‚ СЃ РїРѕР»РѕСЃС‡Р°С‚С‹Рј СЂРёСЃСѓРЅРєРѕРј...',
  sectionTitle: 'РќР°СѓС‡РЅС‹Рµ СЃРІРѕР№СЃС‚РІР° (С‚РµРєСЃС‚РѕРІС‹Рµ, RU)',
  mineralGroup: 'Р“СЂСѓРїРїР° РјРёРЅРµСЂР°Р»Р° / С‚РёРї РїРѕСЂРѕРґС‹',
  mineralGroupPlaceholder: 'РєР°СЂР±РѕРЅР°С‚С‹',
  crystalSystem: 'РљСЂРёСЃС‚Р°Р»Р»РёС‡РµСЃРєР°СЏ СЃРёСЃС‚РµРјР°',
  crystalSystemPlaceholder: 'РјРѕРЅРѕРєР»РёРЅРЅР°СЏ',
  crystalHabit: 'Р“Р°Р±РёС‚СѓСЃ РєСЂРёСЃС‚Р°Р»Р»РѕРІ',
  crystalHabitPlaceholder: 'РїСЂРёР·РјР°С‚РёС‡РµСЃРєРёР№, РІРѕР»РѕРєРЅРёСЃС‚С‹Р№, РїРѕС‡РєРѕРІРёРґРЅС‹Р№',
  streak: 'Р¦РІРµС‚ С‡РµСЂС‚С‹',
  streakPlaceholder: 'Р·РµР»С‘РЅР°СЏ',
  luster: 'Р‘Р»РµСЃРє',
  lusterPlaceholder: 'СЃС‚РµРєР»СЏРЅРЅС‹Р№, С€РµР»РєРѕРІРёСЃС‚С‹Р№',
  transparency: 'РџСЂРѕР·СЂР°С‡РЅРѕСЃС‚СЊ',
  transparencyPlaceholder: 'РЅРµРїСЂРѕР·СЂР°С‡РЅС‹Р№',
  cleavage: 'РЎРїР°Р№РЅРѕСЃС‚СЊ',
  cleavagePlaceholder: 'СЃРѕРІРµСЂС€РµРЅРЅР°СЏ РїРѕ РѕРґРЅРѕРјСѓ РЅР°РїСЂР°РІР»РµРЅРёСЋ',
  fracture: 'РР·Р»РѕРј',
  fracturePlaceholder: 'РЅРµСЂРѕРІРЅС‹Р№, СЂР°РєРѕРІРёСЃС‚С‹Р№',
  tenacity: 'Р’СЏР·РєРѕСЃС‚СЊ',
  tenacityPlaceholder: 'С…СЂСѓРїРєРёР№',
  hardnessNote: 'РџСЂРёРјРµС‡Р°РЅРёРµ Рє С‚РІС‘СЂРґРѕСЃС‚Рё',
  hardnessNotePlaceholder: 'РїРѕ С€РєР°Р»Рµ РњРѕРѕСЃР°',
  imaStatus: 'РЎС‚Р°С‚СѓСЃ IMA',
  imaStatusPlaceholder: 'approved / trade name / not a distinct species',
  rockType: 'РўРёРї РїРѕСЂРѕРґС‹',
  rockTypePlaceholder: 'РјРµС‚Р°РјРѕСЂС„РёС‡РµСЃРєР°СЏ / РјР°РіРјР°С‚РёС‡РµСЃРєР°СЏ / РѕСЃР°РґРѕС‡РЅР°СЏ',
  composition: 'РџСЂРµРѕР±Р»Р°РґР°СЋС‰РёР№ СЃРѕСЃС‚Р°РІ',
  compositionPlaceholder: 'Cu + CO3 + OH',
  identificationTips: 'РЎРѕРІРµС‚С‹ РїРѕ РёРґРµРЅС‚РёС„РёРєР°С†РёРё',
  identificationTipsPlaceholder: 'РћС‚Р»РёС‡РёС‚РµР»СЊРЅС‹Рµ РїСЂРёР·РЅР°РєРё...',
  phenomena: 'РћРїС‚РёС‡РµСЃРєРёРµ СЏРІР»РµРЅРёСЏ (С‡РµСЂРµР· Р·Р°РїСЏС‚СѓСЋ)',
  phenomenaPlaceholder: 'РёСЂРёР·Р°С†РёСЏ, Р°СЃС‚РµСЂРёР·Рј, РєРѕС€Р°С‡РёР№ РіР»Р°Р·',
  safetyNotes: 'РџСЂРµРґСѓРїСЂРµР¶РґРµРЅРёСЏ РїРѕ Р±РµР·РѕРїР°СЃРЅРѕСЃС‚Рё',
  safetyNotesPlaceholder: 'РЎРѕРґРµСЂР¶РёС‚ РјРµРґСЊ. РќРµ СЂРµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РґР»РёС‚РµР»СЊРЅС‹Р№ РєРѕРЅС‚Р°РєС‚ СЃ РєРѕР¶РµР№...',
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
        <CardTitle>РќР°Р·РІР°РЅРёСЏ, Lore Рё РЅР°СѓС‡РЅС‹Рµ РѕРїРёСЃР°РЅРёСЏ (Р СѓСЃСЃРєРёР№ + English)</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ru" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ru">рџ‡·рџ‡є Р СѓСЃСЃРєРёР№</TabsTrigger>
            <TabsTrigger value="en">рџ‡¬рџ‡§ English</TabsTrigger>
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
