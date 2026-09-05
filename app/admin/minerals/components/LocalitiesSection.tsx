/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelect } from '@/components/CountrySelect';
import { getCountryValues } from '@/lib/countries';

const languageFields = {
  ru: [
    ['country_ru', 'Страна'], ['region_ru', 'Регион'], ['locality_ru', 'Местность'], ['description_ru', 'Описание'],
  ],
  en: [
    ['country_en', 'Country'], ['region_en', 'Region'], ['locality_en', 'Locality'], ['description_en', 'Description'],
  ],
} as const;

function optionalCoordinate(value: string): number | null {
  if (value === '') return null;
  const coordinate = Number(value);
  return Number.isNaN(coordinate) ? null : coordinate;
}

export function LocalitiesSection({ form }: { form: UseFormReturn<MineralFormData> }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'localities' });

  return <Card><CardHeader className="flex flex-row justify-between"><CardTitle>Месторождения</CardTitle><Button type="button" onClick={() => append({ country_code: '', country_ru: null, country_en: null, region_ru: null, region_en: null, locality_ru: null, locality_en: null, description_ru: null, description_en: null, latitude: null, longitude: null, coordinate_precision: null, famous: false })}>Добавить</Button></CardHeader><CardContent className="space-y-4">
    {fields.map((row, i) => <div key={row.id} className="space-y-5 rounded border p-4"><h3 className="font-medium">Месторождение {i + 1}</h3><FormField control={form.control} name={`localities.${i}.country_code` as any} render={({ field }) => <FormItem><FormLabel>Страна</FormLabel><CountrySelect value={field.value} onBlur={field.onBlur} onSelect={country => { const countryValues = getCountryValues(country); form.setValue(`localities.${i}.country_code` as any, countryValues.country_code, { shouldDirty: true, shouldValidate: true }); form.setValue(`localities.${i}.country_ru` as any, countryValues.country_ru, { shouldDirty: true, shouldValidate: true }); form.setValue(`localities.${i}.country_en` as any, countryValues.country_en, { shouldDirty: true, shouldValidate: true }); }} /><FormDescription>Выберите страну по названию или ISO 3166-1 коду. Код виден в списке.</FormDescription><FormMessage /></FormItem>} /><div className="grid gap-5 md:grid-cols-3"><FormField control={form.control} name={`localities.${i}.latitude` as any} render={({ field }) => <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input {...field} type="number" min={-90} max={90} step="any" value={field.value ?? ''} onChange={event => field.onChange(optionalCoordinate(event.target.value))} /></FormControl><FormDescription>От -90 до 90.</FormDescription><FormMessage /></FormItem>} /><FormField control={form.control} name={`localities.${i}.longitude` as any} render={({ field }) => <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input {...field} type="number" min={-180} max={180} step="any" value={field.value ?? ''} onChange={event => field.onChange(optionalCoordinate(event.target.value))} /></FormControl><FormDescription>От -180 до 180.</FormDescription><FormMessage /></FormItem>} /><FormField control={form.control} name={`localities.${i}.coordinate_precision` as any} render={({ field }) => <FormItem><FormLabel>Coordinate precision</FormLabel><Select value={field.value ?? 'unset'} onValueChange={value => field.onChange(value === 'unset' ? null : value)}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="unset">Не указано</SelectItem><SelectItem value="exact">Exact</SelectItem><SelectItem value="approximate">Approximate</SelectItem><SelectItem value="region">Region</SelectItem></SelectContent></Select><FormMessage /></FormItem>} /></div><div className="grid gap-5 md:grid-cols-2">{(['ru', 'en'] as const).map(language => <section key={language} className="space-y-3"><h4 className="font-medium">{language === 'ru' ? 'Русский' : 'English'}</h4>{languageFields[language].map(([key, label]) => <FormField key={key} control={form.control} name={`localities.${i}.${key}` as any} render={({ field }) => <FormItem><FormLabel>{label}</FormLabel><FormControl>{key.startsWith('description') ? <Textarea {...field} className="min-h-28" value={field.value ?? ''} /> : <Input {...field} value={field.value ?? ''} />}</FormControl><FormMessage /></FormItem>} />)}</section>)}</div><FormField control={form.control} name={`localities.${i}.famous` as any} render={({ field }) => <FormItem className="flex flex-row items-center gap-2 space-y-0"><FormControl><Input className="h-4 w-4" type="checkbox" checked={!!field.value} onChange={event => field.onChange(event.target.checked)} /></FormControl><FormLabel>Известное месторождение</FormLabel></FormItem>} /><Button type="button" variant="destructive" onClick={() => remove(i)}>Удалить месторождение</Button></div>)}
    {!fields.length && <p className="text-muted-foreground">localities: []</p>}</CardContent></Card>;
}
