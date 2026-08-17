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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScientificSectionProps {
  form: UseFormReturn<MineralFormData>;
}

// ---- Словари подписей (Русский — единственный язык этой секции: все поля
// здесь языконезависимые коды, значение одно на весь минерал, а не два по
// числу вкладок RU/EN). ------------------------------------------------

const TRANSPARENCY_OPTIONS = [
  { value: 'transparent', label: 'Прозрачный' },
  { value: 'translucent', label: 'Полупрозрачный' },
  { value: 'opaque', label: 'Непрозрачный' },
];

// Атомарные термины (Dana/Klein) — без составных значений: комбинация
// задаётся выбором нескольких чипов, а не отдельным "составным" кодом.
const LUSTER_OPTIONS = [
  { value: 'vitreous', label: 'Стеклянный' },
  { value: 'adamantine', label: 'Алмазный' },
  { value: 'metallic', label: 'Металлический' },
  { value: 'submetallic', label: 'Полуметаллический' },
  { value: 'pearly', label: 'Перламутровый' },
  { value: 'silky', label: 'Шелковистый' },
  { value: 'resinous', label: 'Смолистый' },
  { value: 'greasy', label: 'Жирный' },
  { value: 'waxy', label: 'Восковой' },
  { value: 'dull', label: 'Тусклый' },
  { value: 'earthy', label: 'Землистый' },
];

const TENACITY_OPTIONS = [
  { value: 'brittle', label: 'Хрупкий' },
  { value: 'malleable', label: 'Ковкий' },
  { value: 'ductile', label: 'Тягучий' },
  { value: 'sectile', label: 'Секущийся' },
  { value: 'flexible', label: 'Гибкий' },
  { value: 'elastic', label: 'Эластичный' },
];

// Чисто русские подписи — как и у остальных полей этой секции
// (crystal_system, streak, и т.д.). Официальный статус IMA как термин
// сохраняется как код (approved/discredited/...) в данных, меняется
// только отображаемая подпись.
const IMA_STATUS_OPTIONS = [
  { value: 'approved', label: 'Утверждён' },
  { value: 'grandfathered', label: 'Узаконен исторически' },
  { value: 'questionable', label: 'Под вопросом' },
  { value: 'discredited', label: 'Дискредитирован' },
];

const ROCK_TYPE_OPTIONS = [
  { value: 'igneous', label: 'Магматическая' },
  { value: 'sedimentary', label: 'Осадочная' },
  { value: 'metamorphic', label: 'Метаморфическая' },
];

// Иридесценция = «переливчатость» — один код. Лабрадоресценция — частный
// случай шиллер-эффекта у лабрадорита, отдельным пунктом не дублируется.
const PHENOMENON_OPTIONS = [
  { value: 'asterism', label: 'Астеризм' },
  { value: 'iridescence', label: 'Иридесценция' },
  { value: 'aventurescence', label: 'Авантюресценция' },
  { value: 'adularescence', label: 'Адуляресценция' },
  { value: 'labradorescence', label: 'Лабрадоресценция' },
  { value: 'chatoyancy', label: 'Кошачий глаз' },
  { value: 'opalescence', label: 'Опалесценция' },
  { value: 'color_change', label: 'Цветовая смена' },
];

// Химический класс по Дана/Штрунцу — научная ось классификации.
const MINERAL_CLASS_OPTIONS = [
  { value: 'native_elements', label: 'Самородные элементы' },
  { value: 'sulfides_sulfosalts', label: 'Сульфиды и сульфосоли' },
  { value: 'halides', label: 'Галогениды' },
  { value: 'oxides_hydroxides', label: 'Оксиды и гидроксиды' },
  { value: 'carbonates_nitrates', label: 'Карбонаты и нитраты' },
  { value: 'borates', label: 'Бораты' },
  { value: 'sulfates_chromates_molybdates_tungstates', label: 'Сульфаты, хроматы, молибдаты, вольфраматы' },
  { value: 'phosphates_arsenates_vanadates', label: 'Фосфаты, арсенаты, ванадаты' },
  { value: 'silicates', label: 'Силикаты' },
  { value: 'organic', label: 'Органические минералы' },
];

// Показывается только при mineral_class === 'silicates'.
const SILICATE_SUBCLASS_OPTIONS = [
  { value: 'nesosilicates', label: 'Несосиликаты (островные)' },
  { value: 'sorosilicates', label: 'Соросиликаты (групповые)' },
  { value: 'cyclosilicates', label: 'Циклосиликаты (кольцевые)' },
  { value: 'inosilicates', label: 'Иносиликаты (цепочечные)' },
  { value: 'phyllosilicates', label: 'Филлосиликаты (слоистые)' },
  { value: 'tectosilicates', label: 'Тектосиликаты (каркасные)' },
];

// Коллекционная группа/семейство — независимая ось: то, чем пользуется
// коллекционер при поиске («покажи все гранаты»). Стартовый список.
const MINERAL_FAMILY_OPTIONS = [
  { value: 'garnet_group', label: 'Гранаты' },
  { value: 'feldspar_group', label: 'Полевые шпаты' },
  { value: 'quartz_group', label: 'Кварцы' },
  { value: 'tourmaline_group', label: 'Турмалины' },
  { value: 'mica_group', label: 'Слюды' },
  { value: 'pyroxene_group', label: 'Пироксены' },
  { value: 'amphibole_group', label: 'Амфиболы' },
  { value: 'zeolite_group', label: 'Цеолиты' },
  { value: 'beryl_group', label: 'Бериллы' },
  { value: 'spinel_group', label: 'Шпинели' },
  { value: 'corundum_group', label: 'Корунды' },
  { value: 'calcite_group', label: 'Кальциты' },
];

// Почти всегда комбинация нескольких форм одновременно («призматический,
// волокнистый, радиально-лучистый») — формы кристаллов и агрегатов пока
// в одном списке, разделение можно ввести позже отдельным полем.
const CRYSTAL_HABIT_OPTIONS = [
  { value: 'prismatic', label: 'Призматический' },
  { value: 'acicular', label: 'Игольчатый' },
  { value: 'tabular', label: 'Таблитчатый' },
  { value: 'platy', label: 'Пластинчатый' },
  { value: 'foliated', label: 'Листоватый' },
  { value: 'fibrous', label: 'Волокнистый' },
  { value: 'granular', label: 'Зернистый' },
  { value: 'massive', label: 'Массивный' },
  { value: 'druzy', label: 'Друзовый' },
  { value: 'radiating', label: 'Радиально-лучистый' },
  { value: 'globular', label: 'Шаровидный' },
  { value: 'reniform', label: 'Почковидный' },
  { value: 'botryoidal', label: 'Ботриоидальный' },
  { value: 'columnar', label: 'Столбчатый' },
  { value: 'cubic', label: 'Кубический' },
  { value: 'rhombohedral', label: 'Ромбический' },
  { value: 'dendritic', label: 'Дендритный' },
  { value: 'earthy', label: 'Землистый' },
];

// ---- Мульти-select на чипах — для полей, где физически возможна
// комбинация нескольких значений сразу (luster, tenacity, phenomena,
// crystal_habit). Переиспользует существующий Badge (variant default/outline
// как toggle-состояние), без новых зависимостей. ------------------------
function MultiSelectChips({
  value,
  onChange,
  options,
}: {
  value: string[] | undefined;
  onChange: (next: string[]) => void;
  options: { value: string; label: string }[];
}) {
  const selected = value || [];
  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <Badge key={opt.value} asChild variant={isSelected ? 'default' : 'outline'}>
            <button type="button" className="cursor-pointer" onClick={() => toggle(opt.value)}>
              {opt.label}
            </button>
          </Badge>
        );
      })}
    </div>
  );
}

// Здесь живут все языконезависимые данные минерала: формула, числа, и
// закрытые перечисления (сингония, черта, излом, спайность, прозрачность,
// блеск, вязкость, статус IMA, тип породы, оптические явления, химический
// класс/подкласс, коллекционное семейство, габитус). Значение одно на весь
// минерал, не переводится — подпись для отображения на сайте берётся из
// аналогичного словаря по коду. Группа полей ниже соответствует условным
// разделам: Химия / Физика / Кристаллография / Оптика / Классификация.
// Названия, Lore и другой по-настоящему переводимый текст — в I18nSection.
export function ScientificSection({ form }: ScientificSectionProps) {
  const cleavageDegree = form.watch('scientific.cleavage_degree');
  const showCleavageDirection = !!cleavageDegree && cleavageDegree !== 'none';
  const mineralClass = form.watch('scientific.mineral_class');
  const showSilicateSubclass = mineralClass === 'silicates';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Научные свойства (язык-независимые)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* ===== Химия ===== */}
        <div>
          <h4 className="font-medium mb-4 text-sm text-slate-400 uppercase tracking-wide">Химия</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              name="scientific.mineral_class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Химический класс (Дана/Штрунц)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === 'none' ? undefined : value);
                      if (value !== 'silicates') {
                        form.setValue('scientific.silicate_subclass', undefined);
                      }
                    }}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Не указано" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Не указано</SelectItem>
                      {MINERAL_CLASS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showSilicateSubclass && (
              <FormField
                control={form.control}
                name="scientific.silicate_subclass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Подкласс силикатов</FormLabel>
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
                        {SILICATE_SUBCLASS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="scientific.mineral_family"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Коллекционная группа / семейство</FormLabel>
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
                      {MINERAL_FAMILY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scientific.composition"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Состав (петрографическое описание)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Состоит преимущественно из кварца и полевых шпатов, с примесью биотита"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ===== Физика ===== */}
        <div className="border-t border-slate-700 pt-8">
          <h4 className="font-medium mb-4 text-sm text-slate-400 uppercase tracking-wide">Физика</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <FormField
              control={form.control}
              name="scientific.hardness_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Примечание к твёрдости</FormLabel>
                  <FormControl>
                    <Input placeholder="варьируется в зависимости от примесей" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="scientific.transparency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Прозрачность</FormLabel>
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
                      {TRANSPARENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
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

            <FormField
              control={form.control}
              name="scientific.luster"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Блеск (можно несколько — образец бывает неоднородным)</FormLabel>
                  <FormControl>
                    <MultiSelectChips value={field.value} onChange={field.onChange} options={LUSTER_OPTIONS} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scientific.tenacity"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Вязкость (можно несколько, напр. золото — ковкое и тягучее)</FormLabel>
                  <FormControl>
                    <MultiSelectChips value={field.value} onChange={field.onChange} options={TENACITY_OPTIONS} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Спайность — три поля: степень (закрытый список), направление
                (видно только когда степень задана и не 'none' — при none
                количество направлений неприменимо по определению) и
                необязательный геометрический тип. */}
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
          </div>
        </div>

        {/* ===== Кристаллография ===== */}
        <div className="border-t border-slate-700 pt-8">
          <h4 className="font-medium mb-4 text-sm text-slate-400 uppercase tracking-wide">Кристаллография</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              name="scientific.crystal_habit"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Габитус кристаллов (можно несколько)</FormLabel>
                  <FormControl>
                    <MultiSelectChips value={field.value} onChange={field.onChange} options={CRYSTAL_HABIT_OPTIONS} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ===== Оптика ===== */}
        <div className="border-t border-slate-700 pt-8">
          <h4 className="font-medium mb-4 text-sm text-slate-400 uppercase tracking-wide">Оптика</h4>
          <FormField
            control={form.control}
            name="scientific.phenomena"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Оптические явления (можно несколько)</FormLabel>
                <FormControl>
                  <MultiSelectChips value={field.value} onChange={field.onChange} options={PHENOMENON_OPTIONS} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ===== Классификация ===== */}
        <div className="border-t border-slate-700 pt-8">
          <h4 className="font-medium mb-4 text-sm text-slate-400 uppercase tracking-wide">Классификация</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <SelectItem value="common">Обычный</SelectItem>
                      <SelectItem value="uncommon">Нечастый</SelectItem>
                      <SelectItem value="rare">Редкий</SelectItem>
                      <SelectItem value="very_rare">Очень редкий</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scientific.ima_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус IMA</FormLabel>
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
                      {IMA_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scientific.rock_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип породы</FormLabel>
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
                      {ROCK_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Название, Lore, описание цвета, советы по идентификации и предупреждения по
          безопасности заполняются на вкладке «Названия + Lore» — отдельно для русского
          и английского. Все поля на этой странице — закрытые перечисления, языконезависимые:
          значение одно на весь минерал, а подпись переводится словарём при отображении на сайте.
        </p>
      </CardContent>
    </Card>
  );
}
