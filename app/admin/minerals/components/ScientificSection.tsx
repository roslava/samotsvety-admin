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

// Здесь остались только по-настоящему языконезависимые данные: формула,
// числа твёрдости/плотности, редкость. Всё текстовое (группа, система,
// блеск, спайность и т.д.) переехало в I18nSection — на вкладки RU/EN,
// потому что раньше эти поля были одноязычными по факту схемы БД.
export function ScientificSection({ form }: ScientificSectionProps) {
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

        <p className="md:col-span-2 text-sm text-slate-500">
          Группа минерала, кристаллическая система, блеск, спайность, состав и другие
          текстовые описания теперь заполняются на вкладке «Названия + Lore» — отдельно
          для русского и английского, потому что раньше эти поля физически не могли иметь
          перевод.
        </p>
      </CardContent>
    </Card>
  );
}
