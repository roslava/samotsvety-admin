'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { PostFormData, ContentBlockFormData } from '@/lib/validations/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploadField } from '@/components/ImageUploadField';
import { ArrowDown, ArrowUp, GripVertical, ImageIcon, Images, Plus, Quote, Trash2, Type } from 'lucide-react';
import type { BlockType } from '@/types/post';

interface BlockEditorProps {
  form: UseFormReturn<PostFormData>;
}

const BLOCK_LABELS: Record<BlockType, string> = {
  heading: 'Заголовок',
  paragraph: 'Абзац текста',
  image: 'Картинка',
  image_pair: 'Пара картинок (2 колонки)',
  quote: 'Цитата',
};

const BLOCK_ICONS: Record<BlockType, React.ElementType> = {
  heading: Type,
  paragraph: Type,
  image: ImageIcon,
  image_pair: Images,
  quote: Quote,
};

function makeBlock(type: BlockType): ContentBlockFormData {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `block-${Date.now()}`;
  const emptyLang = { text: '', attribution: '', caption: '', captions: ['', ''] };

  const base: ContentBlockFormData = {
    id,
    type,
    image_url: '',
    image_urls: [],
    i18n: { ru: { ...emptyLang }, en: { ...emptyLang } },
  };

  if (type === 'image') {
    return { ...base, layout: 'inset' };
  }
  if (type === 'image_pair') {
    return { ...base, image_urls: ['', ''] };
  }
  return base;
}

export function BlockEditor({ form }: BlockEditorProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'content_blocks',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Композиция статьи — порядок блоков здесь = порядок на странице. Картинки и их расположение
          общие для RU/EN, тексты внутри блока — раздельные.
        </p>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
          Пока нет ни одного блока — добавьте первый кнопками ниже
        </div>
      )}

      {fields.map((field, index) => {
        const type = field.type as BlockType;
        const Icon = BLOCK_ICONS[type];

        return (
          <Card key={field.id}>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Icon className="h-4 w-4" />
                {BLOCK_LABELS[type]}
                <span className="text-muted-foreground font-normal">#{index + 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  title="Переместить вверх"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  title="Переместить вниз"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  title="Удалить блок"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {(type === 'heading' || type === 'paragraph') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Текст (Русский)</label>
                    <Textarea
                      rows={type === 'heading' ? 1 : 4}
                      {...form.register(`content_blocks.${index}.i18n.ru.text`)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Text (English)</label>
                    <Textarea
                      rows={type === 'heading' ? 1 : 4}
                      {...form.register(`content_blocks.${index}.i18n.en.text`)}
                    />
                  </div>
                </div>
              )}

              {type === 'quote' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Цитата (Русский)</label>
                      <Textarea rows={3} {...form.register(`content_blocks.${index}.i18n.ru.text`)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Quote (English)</label>
                      <Textarea rows={3} {...form.register(`content_blocks.${index}.i18n.en.text`)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Автор / источник (Русский)</label>
                      <Input {...form.register(`content_blocks.${index}.i18n.ru.attribution`)} placeholder="необязательно" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Attribution (English)</label>
                      <Input {...form.register(`content_blocks.${index}.i18n.en.attribution`)} placeholder="optional" />
                    </div>
                  </div>
                </div>
              )}

              {type === 'image' && (
                <div className="space-y-4">
                  <div className="space-y-1 max-w-xs">
                    <label className="text-sm text-muted-foreground">Вёрстка</label>
                    <Select
                      value={form.watch(`content_blocks.${index}.layout`) || 'inset'}
                      onValueChange={(v) => form.setValue(`content_blocks.${index}.layout`, v as 'full' | 'inset')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inset">В колонке текста</SelectItem>
                        <SelectItem value="full">На всю ширину (full-bleed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <ImageUploadField
                    label="Изображение"
                    value={form.watch(`content_blocks.${index}.image_url`)}
                    onChange={(url) => form.setValue(`content_blocks.${index}.image_url`, url)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Подпись (Русский)</label>
                      <Input {...form.register(`content_blocks.${index}.i18n.ru.caption`)} placeholder="необязательно" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Caption (English)</label>
                      <Input {...form.register(`content_blocks.${index}.i18n.en.caption`)} placeholder="optional" />
                    </div>
                  </div>
                </div>
              )}

              {type === 'image_pair' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1].map((i) => (
                      <div key={i} className="space-y-3">
                        <ImageUploadField
                          label={`Изображение ${i + 1}`}
                          value={form.watch(`content_blocks.${index}.image_urls.${i}`)}
                          onChange={(url) => form.setValue(`content_blocks.${index}.image_urls.${i}`, url)}
                        />
                        <div className="space-y-1">
                          <label className="text-sm text-muted-foreground">Подпись RU</label>
                          <Input {...form.register(`content_blocks.${index}.i18n.ru.captions.${i}`)} placeholder="необязательно" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm text-muted-foreground">Caption EN</label>
                          <Input {...form.register(`content_blocks.${index}.i18n.en.captions.${i}`)} placeholder="optional" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex flex-wrap gap-2 pt-2">
        {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => {
          const Icon = BLOCK_ICONS[type];
          return (
            <Button
              key={type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(makeBlock(type))}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              <Icon className="mr-1 h-3.5 w-3.5" />
              {BLOCK_LABELS[type]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
