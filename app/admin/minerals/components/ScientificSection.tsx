/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const options: Record<string, Array<[string, string]>> = {
  rarity: [['common', 'Обычный'], ['uncommon', 'Нечастый'], ['rare', 'Редкий'], ['very_rare', 'Очень редкий']],
  base_color: [['red', 'Красный'], ['black', 'Чёрный'], ['bi_color', 'Двухцветный'], ['blue', 'Синий'], ['brown', 'Коричневый'], ['green', 'Зелёный'], ['yellow', 'Жёлтый'], ['grey', 'Серый'], ['purple', 'Фиолетовый'], ['white', 'Белый'], ['pink', 'Розовый'], ['multicolor', 'Многоцветный'], ['orange', 'Оранжевый']],
  mineral_class: [['native_elements', 'Самородные элементы'], ['sulfides_sulfosalts', 'Сульфиды и сульфосоли'], ['halides', 'Галогениды'], ['oxides_hydroxides', 'Оксиды и гидроксиды'], ['carbonates_nitrates', 'Карбонаты и нитраты'], ['borates', 'Бораты'], ['sulfates_chromates_molybdates_tungstates', 'Сульфаты, хроматы, молибдаты и вольфраматы'], ['phosphates_arsenates_vanadates', 'Фосфаты, арсенаты и ванадаты'], ['silicates', 'Силикаты'], ['organic', 'Органические минералы']],
  silicate_subclass: [['nesosilicates', 'Островные силикаты'], ['sorosilicates', 'Групповые силикаты'], ['cyclosilicates', 'Кольцевые силикаты'], ['inosilicates', 'Цепочечные силикаты'], ['phyllosilicates', 'Слоистые силикаты'], ['tectosilicates', 'Каркасные силикаты']],
  mineral_family: [['garnet_group', 'Гранаты'], ['feldspar_group', 'Полевые шпаты'], ['quartz_group', 'Кварцы'], ['tourmaline_group', 'Турмалины'], ['mica_group', 'Слюды'], ['pyroxene_group', 'Пироксены'], ['amphibole_group', 'Амфиболы'], ['zeolite_group', 'Цеолиты'], ['beryl_group', 'Бериллы'], ['spinel_group', 'Шпинели'], ['corundum_group', 'Корунды'], ['calcite_group', 'Кальциты']],
  crystal_system: [['monoclinic', 'Моноклинная'], ['orthorhombic', 'Ромбическая'], ['hexagonal', 'Гексагональная'], ['trigonal', 'Тригональная'], ['isometric', 'Кубическая'], ['triclinic', 'Триклинная'], ['tetragonal', 'Тетрагональная'], ['amorphous', 'Аморфная']],
  streak: [['black', 'Чёрная'], ['white_or_colourless', 'Белая или бесцветная'], ['grey', 'Серая'], ['green', 'Зелёная'], ['blue', 'Синяя'], ['brown', 'Коричневая'], ['pink_to_red', 'Розовая до красной'], ['yellow_to_orange', 'Жёлтая до оранжевой']],
  transparency: [['transparent', 'Прозрачный'], ['translucent', 'Просвечивающий'], ['opaque', 'Непрозрачный']],
  fracture: [['conchoidal', 'Раковистый'], ['uneven', 'Неровный'], ['splintery', 'Занозистый'], ['hackly', 'Крючковатый'], ['earthy', 'Землистый'], ['fibrous', 'Волокнистый']],
  cleavage_degree: [['none', 'Отсутствует'], ['very_poor', 'Весьма несовершенная'], ['poor', 'Несовершенная'], ['good', 'Средняя'], ['perfect', 'Совершенная']],
  cleavage_direction: [['1', 'Одно направление'], ['2', 'Два направления'], ['3', 'Три направления'], ['4', 'Четыре направления']],
  cleavage_type: [['basal', 'Базальная'], ['prismatic', 'Призматическая'], ['pinacoidal', 'Пинакоидальная'], ['rhombohedral', 'Ромбоэдрическая'], ['cubic', 'Кубическая'], ['octahedral', 'Октаэдрическая'], ['dodecahedral', 'Додекаэдрическая']],
  ima_status: [['approved', 'Утверждён IMA'], ['grandfathered', 'Признан ранее'], ['questionable', 'Сомнительный'], ['discredited', 'Дискредитирован']],
  rock_type: [['igneous', 'Магматическая'], ['sedimentary', 'Осадочная'], ['metamorphic', 'Метаморфическая']],
  crystal_habit: [['prismatic', 'Призматический'], ['acicular', 'Игольчатый'], ['tabular', 'Таблитчатый'], ['platy', 'Пластинчатый'], ['foliated', 'Листоватый'], ['fibrous', 'Волокнистый'], ['granular', 'Зернистый'], ['massive', 'Массивный'], ['druzy', 'Друзовый'], ['radiating', 'Лучистый'], ['globular', 'Шаровидный'], ['reniform', 'Почковидный'], ['botryoidal', 'Гроздевидный'], ['columnar', 'Столбчатый'], ['cubic', 'Кубический'], ['rhombohedral', 'Ромбоэдрический'], ['dendritic', 'Дендритовый'], ['earthy', 'Землистый']],
  luster: [['vitreous', 'Стеклянный'], ['adamantine', 'Алмазный'], ['metallic', 'Металлический'], ['submetallic', 'Полуметаллический'], ['pearly', 'Перламутровый'], ['silky', 'Шёлковистый'], ['resinous', 'Смолистый'], ['greasy', 'Жирный'], ['waxy', 'Восковой'], ['dull', 'Матовый'], ['earthy', 'Землистый']],
  tenacity: [['brittle', 'Хрупкий'], ['malleable', 'Ковкий'], ['ductile', 'Тягучий'], ['sectile', 'Режется ножом'], ['flexible', 'Гибкий'], ['elastic', 'Упругий']],
  phenomena: [['asterism', 'Астеризм'], ['iridescence', 'Иризация'], ['aventurescence', 'Авантюресценция'], ['adularescence', 'Адуляресценция'], ['labradorescence', 'Лабрадоресценция'], ['chatoyancy', 'Кошачий глаз'], ['opalescence', 'Опалесценция'], ['color_change', 'Смена цвета']],
};
const labels: Record<string, string> = { rarity: 'Редкость', base_color: 'Основной цвет', mineral_class: 'Класс минерала', silicate_subclass: 'Подкласс силикатов', mineral_family: 'Минеральная группа', crystal_system: 'Кристаллическая система', streak: 'Цвет черты', transparency: 'Прозрачность', fracture: 'Излом', cleavage_degree: 'Совершенство спайности', cleavage_direction: 'Направления спайности', cleavage_type: 'Тип спайности', ima_status: 'Статус IMA', rock_type: 'Тип горной породы', crystal_habit: 'Форма кристаллов', luster: 'Блеск', tenacity: 'Механические свойства', phenomena: 'Оптические эффекты' };

function SelectField({ form, name }: { form: UseFormReturn<MineralFormData>; name: string }) {
  return <FormField control={form.control} name={name as any} render={({ field }) => <FormItem><FormLabel>{labels[name.replace('scientific.', '')]}</FormLabel><Select value={field.value ?? ''} onValueChange={value => field.onChange(value === '__none__' ? null : value)}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Не указано" /></SelectTrigger></FormControl><SelectContent><SelectItem value="__none__">Не указано</SelectItem>{options[name.replace('scientific.', '')].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} />;
}
function MultiSelectField({ form, name }: { form: UseFormReturn<MineralFormData>; name: string }) {
  const key = name.replace('scientific.', '');
  return <FormField control={form.control} name={name as any} render={({ field }) => <FormItem><FormLabel>{labels[key]}</FormLabel><div className="flex flex-wrap gap-2">{options[key].map(([value, label]) => { const selected = (field.value ?? []).includes(value); return <Button type="button" variant={selected ? 'default' : 'outline'} key={value} aria-pressed={selected} onClick={() => field.onChange(selected ? field.value.filter((item: string) => item !== value) : [...(field.value ?? []), value])}>{label}</Button>; })}</div><FormMessage /></FormItem>} />;
}

export function ScientificSection({ form }: { form: UseFormReturn<MineralFormData> }) {
  const [hardnessEnabled, setHardnessEnabled] = useState(Boolean(form.getValues('scientific.hardness')));
  const [gravityEnabled, setGravityEnabled] = useState(Boolean(form.getValues('scientific.specific_gravity')));
  const range = (kind: 'hardness' | 'specific_gravity', enabled: boolean, setEnabled: (value: boolean) => void, label: string, min: number, step: number) => <div className="rounded border p-3 space-y-2"><div className="flex items-center justify-between gap-3"><FormLabel>{label}</FormLabel><Button type="button" variant="outline" onClick={() => { setEnabled(!enabled); if (enabled) form.setValue(`scientific.${kind}` as any, null); }}>{enabled ? 'Удалить диапазон' : 'Указать диапазон'}</Button></div>{enabled && <div className="grid grid-cols-2 gap-3">{(['min', 'max'] as const).map(bound => <FormField key={bound} control={form.control} name={`scientific.${kind}.${bound}` as any} render={({ field }) => <FormItem><FormLabel>{bound === 'min' ? 'От' : 'До'}</FormLabel><FormControl><Input type="number" step={step} min={min} value={field.value ?? ''} onChange={event => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))} /></FormControl><FormMessage /></FormItem>} />)}</div>}</div>;
  return <Card><CardHeader><CardTitle>Научные свойства</CardTitle></CardHeader><CardContent className="space-y-5">{range('hardness', hardnessEnabled, setHardnessEnabled, 'Твёрдость по Моосу', 1, 0.1)}{range('specific_gravity', gravityEnabled, setGravityEnabled, 'Плотность, г/см³', 0, 0.01)}<FormField control={form.control} name="scientific.chemical_formula" render={({ field }) => <FormItem><FormLabel>Химическая формула</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>} /><div className="grid md:grid-cols-2 gap-4">{['rarity', 'base_color', 'mineral_class', 'silicate_subclass', 'mineral_family', 'crystal_system', 'streak', 'transparency', 'fracture', 'cleavage_degree', 'cleavage_direction', 'cleavage_type', 'ima_status', 'rock_type'].map(key => <SelectField key={key} form={form} name={`scientific.${key}`} />)}</div>{['crystal_habit', 'luster', 'tenacity', 'phenomena'].map(key => <MultiSelectField key={key} form={form} name={`scientific.${key}`} />)}</CardContent></Card>;
}
