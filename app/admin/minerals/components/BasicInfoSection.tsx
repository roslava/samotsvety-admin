'use client';
import { UseFormReturn } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BasicInfoSection({ form }: { form: UseFormReturn<MineralFormData> }) {
  return <Card><CardHeader><CardTitle>Основная информация</CardTitle></CardHeader><CardContent className="space-y-5">
    <FormField control={form.control} name="slug" render={({field}) => <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} onChange={e => field.onChange(e.target.value.toLowerCase().trim())} /></FormControl><FormMessage /></FormItem>} />
    <FormField control={form.control} name="type" render={({field}) => <FormItem><FormLabel>Тип сущности</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{[['mineral','Минерал'],['rock','Горная порода'],['gem_variety','Разновидность'],['organic','Органический материал']].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} />
    {(['ru','en'] as const).map(lang => <div key={lang} className="space-y-3 rounded border p-4"><h3>{lang === 'ru' ? 'Русский' : 'English'}</h3><FormField control={form.control} name={`i18n.${lang}.name`} render={({field}) => <FormItem><FormLabel>Название</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name={`i18n.${lang}.synonyms`} render={({field}) => <FormItem><FormLabel>Синонимы (через запятую)</FormLabel><FormControl><Input value={(field.value ?? []).join(', ')} onChange={e => field.onChange(e.target.value.split(',').map(v=>v.trim()).filter(Boolean))} /></FormControl></FormItem>} /><FormField control={form.control} name={`i18n.${lang}.identification_tips`} render={({field}) => <FormItem><FormLabel>Советы по идентификации</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl></FormItem>} /></div>)}
    <FormField control={form.control} name="related_entities" render={({field}) => <FormItem><FormLabel>Связанные сущности (slug через запятую)</FormLabel><FormControl><Input value={(field.value ?? []).join(', ')} onChange={e => field.onChange(e.target.value.split(',').map(v=>v.trim()).filter(Boolean))} /></FormControl><FormMessage /></FormItem>} />
  </CardContent></Card>;
}
