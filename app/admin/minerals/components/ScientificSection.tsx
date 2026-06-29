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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScientificSectionProps {
  form: UseFormReturn<MineralFormData>;
}

export function ScientificSection({ form }: ScientificSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Научные свойства</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Основные поля */}
        <FormField
          control={form.control}
          name="scientific.chemical_formula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Химическая формула *</FormLabel>
              <FormControl>
                <Input placeholder="Cu₂CO₃(OH)₂" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.mineral_group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Группа минерала *</FormLabel>
              <FormControl>
                <Input placeholder="карбонаты" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.crystal_system"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Кристаллическая система *</FormLabel>
              <FormControl>
                <Input placeholder="моноклинная" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.crystal_habit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Габитус кристаллов</FormLabel>
              <FormControl>
                <Input placeholder="призматический, волокнистый..." {...field} />
              </FormControl>
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
                <FormLabel>Твёрдость (min) *</FormLabel>
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
                <FormLabel>Твёрдость (max) *</FormLabel>
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
                <FormLabel>Уд. вес (min) *</FormLabel>
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
                <FormLabel>Уд. вес (max) *</FormLabel>
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
              <FormLabel>Цвет черты *</FormLabel>
              <FormControl>
                <Input placeholder="зелёная" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.luster"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Блеск *</FormLabel>
              <FormControl>
                <Input placeholder="стеклянный, шелковистый" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.transparency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Прозрачность *</FormLabel>
              <FormControl>
                <Input placeholder="непрозрачный" {...field} />
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
                    <SelectValue placeholder="Выберите редкость" />
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

        <FormField
          control={form.control}
          name="scientific.cleavage"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Спайность</FormLabel>
              <FormControl>
                <Textarea placeholder="совершенная по одному направлению" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.fracture"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Излом</FormLabel>
              <FormControl>
                <Textarea placeholder="неровный, раковистый" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scientific.identification_tips"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Советы по идентификации</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}