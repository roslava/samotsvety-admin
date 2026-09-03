/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { UseFormReturn } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export function I18nSection({form}:{form:UseFormReturn<MineralFormData>}) { return <Card><CardHeader><CardTitle>Локализованный контент</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-6">{(['ru','en'] as const).map(lang => <div key={lang} className="space-y-3"><h3 className="font-medium">{lang==='ru'?'Русский':'English'}</h3>{([['color','Цвета (через запятую)'],['color_description','Описание цвета'],['lore','Lore'],['safety_notes','Безопасность'],['scientific_notes.hardness',lang==='ru'?'Пояснение к твёрдости — RU':'Hardness note — EN'],['scientific_notes.composition','Composition']] as const).map(([key,label]) => <FormField key={key} control={form.control} name={`i18n.${lang}.${key}` as any} render={({field}) => <FormItem><FormLabel>{label}</FormLabel><FormControl>{key==='color'?<Input value={(field.value??[]).join(', ')} onChange={e=>field.onChange(e.target.value.split(',').map(v=>v.trim()).filter(Boolean))}/>:<Textarea {...field} value={field.value??''}/>}</FormControl><FormMessage/></FormItem>}/>)}</div>)}</CardContent></Card> }
