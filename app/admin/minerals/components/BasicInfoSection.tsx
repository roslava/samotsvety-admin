'use client';
import { UseFormReturn } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { api } from '@/lib/api';
import { parseRelatedEntityInput, relatedEntityWarningText, resolveRelatedEntities, type RelatedEntityWarning } from '@/lib/related-entities';

export function BasicInfoSection({ form }: { form: UseFormReturn<MineralFormData> }) {
  const [relatedInput, setRelatedInput] = useState(() => (form.getValues('related_entities') ?? []).join(', '));
  const [relatedWarnings, setRelatedWarnings] = useState<RelatedEntityWarning[]>([]);
  const checkRelatedEntities = async () => {
    const parsed = parseRelatedEntityInput(relatedInput);
    const resolved = await resolveRelatedEntities(parsed.slugs, api.getGemEntity);
    form.setValue('related_entities', resolved.slugs, { shouldDirty: true, shouldValidate: true });
    setRelatedWarnings([...parsed.warnings, ...resolved.warnings]);
  };
  return <Card><CardHeader><CardTitle>Основная информация</CardTitle></CardHeader><CardContent className="space-y-5">
    <FormField control={form.control} name="slug" render={({field}) => <FormItem><FormLabel>Адрес карточки (slug)</FormLabel><FormControl><Input {...field} placeholder="kambaba-jasper" onChange={e => field.onChange(e.target.value.toLowerCase().trim())} /></FormControl><FormDescription>Техническое имя для URL. Латиница, цифры и дефисы.</FormDescription><FormMessage /></FormItem>} />
    <FormField control={form.control} name="type" render={({field}) => <FormItem><FormLabel>Тип сущности</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{[['mineral','Минерал'],['rock','Горная порода'],['gem_variety','Разновидность'],['organic','Органический материал']].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} />
    {(['ru','en'] as const).map(lang => <div key={lang} className="space-y-3 rounded border p-4"><h3>{lang === 'ru' ? 'Русский' : 'English'}</h3><FormField control={form.control} name={`i18n.${lang}.name`} render={({field}) => <FormItem><FormLabel>{lang === 'ru' ? 'Название' : 'Name'}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name={`i18n.${lang}.synonyms`} render={({field}) => <FormItem><FormLabel>{lang === 'ru' ? 'Синонимы (через запятую)' : 'Synonyms (comma-separated)'}</FormLabel><FormControl><Input value={(field.value ?? []).join(', ')} onChange={e => field.onChange(e.target.value.split(',').map(v=>v.trim()).filter(Boolean))} /></FormControl></FormItem>} /><FormField control={form.control} name={`i18n.${lang}.identification_tips`} render={({field}) => <FormItem><FormLabel>{lang === 'ru' ? 'Советы по идентификации' : 'Identification tips'}</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl></FormItem>} /></div>)}
    <FormField control={form.control} name="related_entities" render={() => <FormItem><FormLabel>Связанные камни</FormLabel><FormControl><Input value={relatedInput} onChange={e => { const value = e.target.value; setRelatedInput(value); form.setValue('related_entities', parseRelatedEntityInput(value).slugs, { shouldDirty: true, shouldValidate: true }); }} onBlur={() => void checkRelatedEntities()} /></FormControl><FormDescription>Укажите slug существующих карточек через запятую. Проверка выполняется после ухода из поля.</FormDescription>{relatedWarnings.length > 0 && <div className="text-sm text-destructive" role="alert">{relatedWarnings.map((warning, index) => <p key={`${warning.slug}-${index}`}>{relatedEntityWarningText(warning)}</p>)}</div>}<FormMessage /></FormItem>} />
  </CardContent></Card>;
}
