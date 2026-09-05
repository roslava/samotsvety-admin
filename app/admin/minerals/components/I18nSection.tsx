/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { UseFormReturn } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export function I18nSection({form}:{form:UseFormReturn<MineralFormData>}) { return <Card><CardHeader><CardTitle>Тексты карточки</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-6">{(['ru','en'] as const).map(lang => <div key={lang} className="space-y-3"><h3 className="font-medium">{lang==='ru'?'Русский':'English'}</h3>{(lang === 'ru' ? [['color','Цвета (через запятую)'],['color_description','Описание цвета'],['lore','История и культурные сведения'],['safety_notes','Безопасность'],['scientific_notes.hardness','Пояснение к твёрдости'],['scientific_notes.composition','Пояснение к составу']] : [['color','Colors (comma-separated)'],['color_description','Color description'],['lore','History and cultural information'],['safety_notes','Safety'],['scientific_notes.hardness','Hardness notes'],['scientific_notes.composition','Composition notes']]).map(([key,label]) => <FormField key={key} control={form.control} name={`i18n.${lang}.${key}` as any} render={({field}) => <FormItem><FormLabel>{label}</FormLabel><FormControl>{key==='color'?<Input value={(field.value??[]).join(', ')} onChange={e=>field.onChange(e.target.value.split(',').map(v=>v.trim()).filter(Boolean))}/>:<Textarea {...field} value={field.value??''}/>}</FormControl><FormMessage/></FormItem>}/>)}</div>)}</CardContent></Card> }
