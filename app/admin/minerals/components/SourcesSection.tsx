'use client';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SourcesSection({ form }: { form: UseFormReturn<MineralFormData> }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'sources' });
  return <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Источники</CardTitle><Button type="button" variant="outline" onClick={() => append({ title: null, url: null, author: null, publisher: null })}>Добавить</Button></CardHeader><CardContent className="space-y-4">
    {fields.map((item, i) => <div key={item.id} className="rounded border p-4 space-y-3"><div className="flex justify-end"><Button type="button" variant="ghost" onClick={() => remove(i)}>Удалить</Button></div>
      {([['title', 'Название источника'],['url', 'Ссылка'],['author', 'Автор'],['publisher', 'Издатель']] as const).map(([key, label]) => <FormField key={key} control={form.control} name={`sources.${i}.${key}`} render={({ field }) => <FormItem><FormLabel>{label}</FormLabel><FormControl><Input {...field} type={key === 'url' ? 'url' : 'text'} value={field.value ?? ''} /></FormControl>{key === 'url' && <FormDescription>Добавьте название источника или ссылку.</FormDescription>}<FormMessage /></FormItem>} />)}
    </div>)}
    {!fields.length && <p className="text-sm text-muted-foreground">Источники не добавлены. Пустой массив допустим.</p>}
  </CardContent></Card>;
}
