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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScientificSectionProps {
  form: UseFormReturn<MineralFormData>;
}

// Здесь языконезависимые данные: формула, числа твёрдости/плотности,
// редкость — и, с этой ревизии, закрытые перечисления (сингония, черта,
// излом, спайность), которые раньше по ошибке жили как свободный текст на
// вкладках RU/EN. Группа минерала, блеск, прозрачность, состав и прочие
// действительно свободные описания по-прежнему заполняются в I18nSection.
export function ScientificSection({ form }: ScientificSectionProps) {
  const cleavageDegree = form.watch('scientific.cleavage_degree');
  const showCleavageDirection = !!cleavageDegree && cleavageDegree !== 'none';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Научные свойства (язык-независимые)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="scientific.chemical_formula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Химическая формула</FormLabel>
              <FormControl>
                <Input placeholder="Cu₂CO₃(OH)₂" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.rarity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Редкость *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="very_rare">Very Rare</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Твёрдость */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scientific.hardness.min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Твёрдость min *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scientific.hardness.max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Твёрдость max *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Удельный вес */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scientific.specific_gravity.min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Уд. вес min *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scientific.specific_gravity.max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Уд. вес max *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="scientific.crystal_system"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Кристаллическая система</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Не указано" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Не указано</SelectItem>
                  <SelectItem value="monoclinic">Моноклинная</SelectItem>
                  <SelectItem value="orthorhombic">Ромбическая</SelectItem>
                  <SelectItem value="hexagonal">Гексагональная</SelectItem>
                  <SelectItem value="isometric">Кубическая</SelectItem>
                  <SelectItem value="triclinic">Триклинная</SelectItem>
                  <SelectItem value="tetragonal">Тетрагональная</SelectItem>
                  <SelectItem value="amorphous">Аморфная</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.streak"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Цвет черты</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Не указано" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Не указано</SelectItem>
                  <SelectItem value="black">Чёрная</SelectItem>
                  <SelectItem value="white_or_colourless">Белая или бесцветная</SelectItem>
                  <SelectItem value="grey">Серая</SelectItem>
                  <SelectItem value="green">Зелёная</SelectItem>
                  <SelectItem value="blue">Синяя</SelectItem>
                  <SelectItem value="brown">Коричневая</SelectItem>
                  <SelectItem value="pink_to_red">От розовой до красной</SelectItem>
                  <SelectItem value="yellow_to_orange">От жёлтой до оранжевой</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.fracture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Излом</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Не указано" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Не указано</SelectItem>
                  <SelectItem value="conchoidal">Раковистый</SelectItem>
                  <SelectItem value="uneven">Неровный</SelectItem>
                  <SelectItem value="splintery">Занозистый</SelectItem>
                  <SelectItem value="hackly">Крючковатый</SelectItem>
                  <SelectItem value="earthy">Землистый</SelectItem>
                  <SelectItem value="fibrous">Волокнистый</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Спайность — три поля вместо одного текстового: степень (закрытый список),
            направление (видно только когда степень задана и не 'none' — при none
            количество направлений неприменимо по определению) и необязательный
            геометрический тип. */}
        <FormField
          control={form.control}
          name="scientific.cleavage_degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Спайность — степень</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value === 'unset' ? undefined : value);
                  if (value === 'none' || value === 'unset') {
                    form.setValue('scientific.cleavage_direction', undefined);
                  }
                }}
                value={field.value || 'unset'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Не указано" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unset">Не указано</SelectItem>
                  <SelectItem value="none">Нет</SelectItem>
                  <SelectItem value="very_poor">Очень несовершенная</SelectItem>
                  <SelectItem value="poor">Несовершенная</SelectItem>
                  <SelectItem value="good">Хорошая</SelectItem>
                  <SelectItem value="perfect">Совершенная</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCleavageDirection && (
          <FormField
            control={form.control}
            name="scientific.cleavage_direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Спайность — направления</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                  value={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Не указано" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Не указано</SelectItem>
                    <SelectItem value="1">1 направление</SelectItem>
                    <SelectItem value="2">2 направления</SelectItem>
                    <SelectItem value="3">3 направления</SelectItem>
                    <SelectItem value="4">4 направления</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="scientific.cleavage_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Спайность — тип (геометрия)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Не определён" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Не определён</SelectItem>
                  <SelectItem value="basal">Базальная</SelectItem>
                  <SelectItem value="prismatic">Призматическая</SelectItem>
                  <SelectItem value="pinacoidal">Пинакоидальная</SelectItem>
                  <SelectItem value="rhombohedral">Ромбоэдрическая</SelectItem>
                  <SelectItem value="cubic">Кубическая</SelectItem>
                  <SelectItem value="octahedral">Октаэдрическая</SelectItem>
                  <SelectItem value="dodecahedral">Додекаэдрическая</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="md:col-span-2 text-sm text-slate-500">
          Группа минерала, блеск, прозрачность, состав и другие свободные текстовые
          описания заполняются на вкладке «Названия + Lore» — отдельно для русского
          и английского. Поля выше (сингония, черта, излом, спайность) — закрытые
          перечисления, языконезависимые: значение одно на весь минерал, а подпись
          переводится словарём при отображении на сайте.
        </p>
      </CardContent>
    </Card>
  );
}
