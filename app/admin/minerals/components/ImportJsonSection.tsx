'use client';

import { UseFormReturn } from 'react-hook-form';
import { MineralFormData } from '@/lib/validations/mineral';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';

interface ImportJsonSectionProps {
  form: UseFormReturn<MineralFormData>;
}

export function ImportJsonSection({ form }: ImportJsonSectionProps) {
  const [jsonInput, setJsonInput] = useState('');

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput.trim());
      
      // Сброс + заполнение формы
      form.reset(parsed);
      
      toast.success('Данные успешно импортированы из JSON!');
      setJsonInput('');
    } catch (error) {
      toast.error('Ошибка парсинга JSON. Проверьте формат.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Импорт данных из JSON</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">
          Вставьте сюда JSON, полученный от нейросети, и нажмите «Импортировать»
        </p>
        
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"slug": "malachite", "scientific": {...}, ...}'
          className="min-h-[400px] font-mono text-sm"
        />

        <Button onClick={handleImport} className="w-full" size="lg">
          Импортировать в форму
        </Button>

        <p className="text-xs text-slate-500">
          После импорта проверьте все вкладки и отредактируйте при необходимости.
        </p>
      </CardContent>
    </Card>
  );
}