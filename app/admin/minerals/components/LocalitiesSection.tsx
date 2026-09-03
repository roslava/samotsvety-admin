/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const keys = ['country_code','country_ru','country_en','region_ru','region_en','locality_ru','locality_en','description_ru','description_en'] as const;
export function LocalitiesSection({ form }: { form: UseFormReturn<MineralFormData> }) {
 const { fields, append, remove } = useFieldArray({ control: form.control, name: 'localities' });
 return <Card><CardHeader className="flex flex-row justify-between"><CardTitle>Месторождения</CardTitle><Button type="button" onClick={() => append({ country_code:'', country_ru:null, country_en:null, region_ru:null, region_en:null, locality_ru:null, locality_en:null, description_ru:null, description_en:null, famous:false })}>Добавить</Button></CardHeader><CardContent className="space-y-4">
 {fields.map((row, i) => <div key={row.id} className="border rounded p-4 grid md:grid-cols-2 gap-3">{keys.map(k => <FormField key={k} control={form.control} name={`localities.${i}.${k}` as any} render={({ field }) => <FormItem><FormLabel>{k}</FormLabel><FormControl>{k.startsWith('description') ? <Textarea {...field} value={field.value ?? ''} /> : <Input {...field} value={field.value ?? ''} onChange={e => field.onChange(k === 'country_code' ? e.target.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,2) : e.target.value)} />}</FormControl><FormMessage /></FormItem>} />)}<FormField control={form.control} name={`localities.${i}.famous` as any} render={({field}) => <Input type="checkbox" checked={!!field.value} onChange={e=>field.onChange(e.target.checked)} />} /><Button type="button" variant="destructive" onClick={() => remove(i)}>Удалить</Button></div>)}
 {!fields.length && <p className="text-muted-foreground">localities: []</p>}</CardContent></Card>;
}
