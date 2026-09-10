'use client';

import { UseFormReturn } from 'react-hook-form';
import { MineralFormData, GemEntityV2ImportSchema } from '@/lib/validations/mineral';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useState } from 'react';
import { Copy, Download, Upload } from 'lucide-react';
import { MINERAL_MARKDOWN_PROMPT_TEMPLATE, MINERAL_MARKDOWN_TEMPLATE, MineralMarkdownParseError, parseMineralMarkdownWithWarnings } from '@/lib/mineral-markdown';
import { api } from '@/lib/api';
import { relatedEntityWarningText, resolveRelatedEntities } from '@/lib/related-entities';

interface ImportMarkdownSectionProps {
  form: UseFormReturn<MineralFormData>;
}

const STONE_NAME_PLACEHOLDER = '[НАЗВАНИЕ_КАМНЯ]';

export function ImportMarkdownSection({ form }: ImportMarkdownSectionProps) {
  const [markdownInput, setMarkdownInput] = useState('');
  const [markdownFileName, setMarkdownFileName] = useState('');
  const [activeTab, setActiveTab] = useState<'markdown' | 'template'>('markdown');
  // Название камня для подстановки в промпт — предзаполняем из уже введённого
  // на вкладке "Основное" русского названия, если оно есть, но дальше не
  // синхронизируем принудительно: пользователь может печатать сюда что угодно
  // (например, английское название или синоним) независимо от формы.
  const [stoneName, setStoneName] = useState(() => form.getValues('i18n.ru.name') ?? '');


  const handleMarkdownImport = async () => {
    let parsed: { data: unknown; warnings: ReturnType<typeof parseMineralMarkdownWithWarnings>['warnings'] };
    try {
      parsed = parseMineralMarkdownWithWarnings(markdownInput);
    } catch (error) {
      const message = error instanceof MineralMarkdownParseError
        ? `Ошибка Markdown: ${error.message}`
        : `Ошибка Markdown: ${error instanceof Error ? error.message : String(error)}`;
      toast.error(message, { duration: 12000 });
      return;
    }
    const result = GemEntityV2ImportSchema.safeParse(parsed.data);
    if (!result.success) {
      const preview = result.error.issues.slice(0, 5).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
      toast.error(`Markdown разобран, но не соответствует canonical V2:\n${preview}`, { duration: 12000 });
      return;
    }
    const resolved = await resolveRelatedEntities(result.data.related_entities ?? [], api.getGemEntity);
    form.reset({ ...result.data, related_entities: resolved.slugs });
    const warnings = [...parsed.warnings, ...resolved.warnings];
    if (warnings.length) {
      toast.warning(`Карточка импортирована, но некоторые связи пропущены:\n${warnings.map((warning) => relatedEntityWarningText(warning)).join('\n')}`, { duration: 12000 });
    } else {
      toast.success('Форма обновлена из Markdown — все поля прошли canonical V2 проверку');
    }
  };

  const handleMarkdownFile = async (file?: File) => {
    if (!file) return;
    try {
      setMarkdownInput(await file.text());
      setMarkdownFileName(file.name);
      toast.success(`Файл ${file.name} загружен — проверьте и импортируйте его в форму`);
    } catch {
      toast.error('Не удалось прочитать Markdown-файл');
    }
  };

  // navigator.clipboard требует "secure context" (https или localhost) — при
  // открытии админки по WSL2-сетевому IP (http://172.x.x.x:3000, см. заметки
  // проекта про WSL2-networking) этого API просто нет (undefined), поэтому
  // .writeText() падал с TypeError. Фолбэк через скрытый textarea +
  // document.execCommand('copy') работает и в небезопасном контексте.
  const copyToClipboard = (text: string, successMessage: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success(successMessage))
        .catch(() => copyViaFallback(text, successMessage));
      return;
    }
    copyViaFallback(text, successMessage);
  };

  const copyViaFallback = (text: string, successMessage: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const copied = document.execCommand('copy');
      if (copied) {
        toast.success(successMessage);
      } else {
        toast.error('Не удалось скопировать автоматически — выделите текст вручную (Ctrl+C)');
      }
    } catch {
      toast.error('Не удалось скопировать автоматически — выделите текст вручную (Ctrl+C)');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const copyMarkdownTemplate = () => copyToClipboard(MINERAL_MARKDOWN_TEMPLATE, 'Шаблон Markdown скопирован');

  const downloadMarkdownTemplate = () => {
    const url = URL.createObjectURL(new Blob([MINERAL_MARKDOWN_TEMPLATE], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'samotsvety-mineral-v1.md';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Импорт из Markdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="markdown">Импорт Markdown</TabsTrigger>
            <TabsTrigger value="template">Шаблон Markdown</TabsTrigger>
          </TabsList>

          <TabsContent value="markdown" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="mineral-markdown-file">Markdown-файл</label>
              <Input id="mineral-markdown-file" type="file" accept=".md,text/markdown,text/plain" onChange={(event) => void handleMarkdownFile(event.target.files?.[0])} />
              {markdownFileName && <p className="text-sm text-[var(--color-slate-veil)]">Выбран файл: {markdownFileName}</p>}
            </div>
            <Textarea value={markdownInput} onChange={(event) => { setMarkdownInput(event.target.value); setMarkdownFileName(''); }} placeholder="Загрузите .md файл или вставьте Samotsvety Markdown v1..." className="min-h-[420px] font-mono text-sm" />
            <Button type="button" onClick={handleMarkdownImport} className="w-full" size="lg" disabled={!markdownInput.trim()}>
              <Upload className="h-4 w-4 mr-2" /> Импортировать в форму
            </Button>
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Шаблон Samotsvety Markdown v1</h4>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={copyMarkdownTemplate}><Copy className="h-4 w-4 mr-2" /> Скопировать</Button>
                  <Button type="button" variant="outline" size="sm" onClick={downloadMarkdownTemplate}><Download className="h-4 w-4 mr-2" /> Скачать .md</Button>
                </div>
              </div>
              <pre className="bg-[var(--color-inkwell-teal)] text-[var(--color-bone)] p-4 rounded-2xl text-xs overflow-auto max-h-[350px]">{MINERAL_MARKDOWN_TEMPLATE}</pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Промпт для генерации Markdown</h4>
              <div className="mb-3 space-y-1.5">
                <label className="text-sm font-medium" htmlFor="stone-name-input">Название камня</label>
                <Input id="stone-name-input" value={stoneName} onChange={(e) => setStoneName(e.target.value)} placeholder="Например: Малахит" />
              </div>
              <pre className="bg-[var(--color-inkwell-teal)] text-[var(--color-bone)] p-4 rounded-2xl text-xs overflow-auto whitespace-pre-wrap">{MINERAL_MARKDOWN_PROMPT_TEMPLATE.replaceAll('[НАЗВАНИЕ_КАМНЯ]', stoneName.trim() || STONE_NAME_PLACEHOLDER)}</pre>
              <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(MINERAL_MARKDOWN_PROMPT_TEMPLATE.replaceAll('[НАЗВАНИЕ_КАМНЯ]', stoneName.trim() || STONE_NAME_PLACEHOLDER), 'Markdown-промпт скопирован')} className="mt-3"><Copy className="h-4 w-4 mr-2" /> Скопировать промпт</Button>
            </div>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}
