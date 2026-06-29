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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface I18nSectionProps {
  form: UseFormReturn<MineralFormData>;
}

export function I18nSection({ form }: I18nSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Локализация (Русский + English)</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ru" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ru">🇷🇺 Русский</TabsTrigger>
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
          </TabsList>

          {/* Русский */}
          <TabsContent value="ru" className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="i18n.ru.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название (Русский) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Малахит" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="i18n.ru.lore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lore / Историко-культурный контекст *</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={6}
                      placeholder="История добычи на Урале, использование в камнерезном искусстве..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="i18n.ru.color_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание цвета</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Характерный насыщенный зелёный цвет с полосчатым рисунком..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* English */}
          <TabsContent value="en" className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="i18n.en.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Malachite" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="i18n.en.lore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lore / Historical & Cultural Context *</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={6}
                      placeholder="History of mining in the Urals, use in hardstone carving..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="i18n.en.color_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Characteristic rich green color with banded patterns..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}