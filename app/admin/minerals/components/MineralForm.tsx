/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm, FormProvider, useWatch, type FieldErrors } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MineralSchema, type MineralFormData } from '@/lib/validations/mineral';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { api, ApiValidationError } from '@/lib/api';
import { useRouter } from 'next/navigation';

import { ImportMarkdownSection } from './ImportMarkdownSection';
import { toV2WritePayload } from '@/lib/v2-helpers';
import { BasicInfoSection } from './BasicInfoSection';
import { ScientificSection } from './ScientificSection';
import { I18nSection } from './I18nSection';
import { LocalitiesSection } from './LocalitiesSection';
import { GallerySection } from './GallerySection';
import { SourcesSection } from './SourcesSection';
import { normalizeErrorMessage, relatedEntityWarningText, resolveRelatedEntities } from '@/lib/related-entities';

interface MineralFormProps {
  defaultValues?: Partial<MineralFormData>;
  isEdit?: boolean;
  slug?: string;
}

// Определяет, к какой вкладке формы относится путь невалидного поля,
// чтобы можно было показать пользователю, где именно искать ошибку.
function getTab(path: string): { value: string; label: string } {
  if (path.startsWith('i18n')) return { value: 'i18n', label: 'RU / EN' };
  if (path.startsWith('scientific')) return { value: 'scientific', label: 'Научные' };
  if (path.startsWith('localities')) return { value: 'localities', label: 'Месторождения' };
  if (path.startsWith('images')) return { value: 'images', label: 'Изображения' };
  if (path.startsWith('sources')) return { value: 'sources', label: 'Источники' };
  return { value: 'basic', label: 'Основное' };
}

function readableError(path: string, message: unknown): string {
  if (path === 'slug') return 'Проверьте адрес карточки: используйте строчные латинские буквы, цифры и дефисы.';
  if (path === 'images.storage_key') return 'Укажите папку изображений: только латиница, цифры, точка, дефис или подчёркивание.';
  if (/localities\.\d+\.country_code/.test(path)) return 'Укажите двухбуквенный код страны, например MG, RU или US.';
  if (/sources\.\d+$/.test(path)) return 'Укажите название источника или ссылку.';
  return normalizeErrorMessage(message, 'Проверьте значение поля.');
}

// Рекурсивно собирает плоский список сообщений об ошибках из вложенного
// объекта errors react-hook-form вместе с меткой вкладки, где искать поле.
function collectFieldErrors(
  errors: FieldErrors<MineralFormData>,
  prefix = ''
): { path: string; message: string }[] {
  const results: { path: string; message: string }[] = [];

  for (const key of Object.keys(errors)) {
    const value = (errors as Record<string, unknown>)[key];
    if (!value || typeof value !== 'object') continue;

    const path = prefix ? `${prefix}.${key}` : key;
    const maybeMessage = (value as { message?: unknown }).message;

    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      results.push({ path, message: maybeMessage });
    } else {
      results.push(
        ...collectFieldErrors(value as FieldErrors<MineralFormData>, path)
      );
    }
  }

  return results;
}

// Пустой языковой блок — используется как дефолт для i18n.ru / i18n.en,
// чтобы избежать controlled/uncontrolled input warning. Все закрытые
// перечисления (mineral_class/family, crystal_habit, luster, transparency,
// tenacity, ima_status, rock_type, phenomena) и связанный с ними свободный
// текст (hardness_note, composition) сюда больше не входят — живут в
// scientific (см. completeDefaults ниже), не переводятся.
const emptyLangData = {
  name: '',
  synonyms: [],
  color: [],
  color_description: '',
  lore: '',
  esoteric: undefined,
  identification_tips: '',
  safety_notes: '',
};

export default function MineralForm({ defaultValues, isEdit = false, slug: editSlug }: MineralFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const storageKeyEdited = useRef(isEdit || Boolean(defaultValues?.images?.storage_key));
  const automaticallySuggestedStorageKey = useRef<string | null>(null);

  const completeDefaults: MineralFormData = {
    slug: defaultValues?.slug ?? '',
    type: defaultValues?.type ?? 'mineral',
    scientific: {
      chemical_formula: defaultValues?.scientific?.chemical_formula ?? null,
      hardness: defaultValues?.scientific?.hardness ?? null,
      specific_gravity: defaultValues?.scientific?.specific_gravity ?? null,
      rarity: defaultValues?.scientific?.rarity ?? null,
      ...defaultValues?.scientific,
    },
    i18n: {
      ru: { ...emptyLangData, name: defaultValues?.i18n?.ru?.name ?? '', ...defaultValues?.i18n?.ru },
      en: { ...emptyLangData, name: defaultValues?.i18n?.en?.name ?? '', ...defaultValues?.i18n?.en },
    },
    localities: defaultValues?.localities ?? [], images: defaultValues?.images ?? { storage_key: '', hero: null, thumbnail: null, gallery: [] },
    related_entities: defaultValues?.related_entities ?? [], sources: defaultValues?.sources ?? [],
  } as MineralFormData;

  const form = useForm<MineralFormData>({
    resolver: zodResolver(MineralSchema),
    defaultValues: completeDefaults,
    mode: 'onBlur',
  });
  const slug = useWatch({ control: form.control, name: 'slug' });
  const storageKey = useWatch({ control: form.control, name: 'images.storage_key' });

  // Предложение папки доступно сразу после ввода slug, даже если вкладка
  // «Изображения» не открывалась. После ручного изменения ключа не трогаем его.
  useEffect(() => {
    if (isEdit || storageKeyEdited.current || !slug) return;
    const suggestedKey = slug.replaceAll('-', '_');
    if (storageKey && storageKey !== automaticallySuggestedStorageKey.current && storageKey !== suggestedKey) {
      storageKeyEdited.current = true;
      return;
    }
    if (storageKey !== suggestedKey) {
      form.setValue('images.storage_key', suggestedKey, { shouldDirty: false, shouldValidate: true });
    }
    automaticallySuggestedStorageKey.current = suggestedKey;
  }, [form, isEdit, slug, storageKey]);

  const onSubmit = async (data: MineralFormData) => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден');
      return;
    }

    try {
      const resolvedRelated = await resolveRelatedEntities(data.related_entities ?? [], api.getGemEntity);
      const payload = toV2WritePayload({ ...data, related_entities: resolvedRelated.slugs }) as unknown as Record<string, unknown>;
      if (resolvedRelated.warnings.length) toast.warning(resolvedRelated.warnings.map((warning) => relatedEntityWarningText(warning)).join('\n'), { duration: 10000 });
      if (isEdit && editSlug) {
        await api.replaceGemEntity(editSlug, payload, apiKey);
        toast.success('Минерал обновлён!');
      } else {
        await api.createGemEntity(payload, apiKey);
        toast.success('Минерал создан!');
      }
      router.push('/admin/minerals');
    } catch (error: unknown) {
      if (error instanceof ApiValidationError) {
        error.fields.forEach(({ path, message }) => form.setError(path as any, { message: readableError(path, message) }));
        const firstError = error.fields[0];
        if (firstError) setActiveTab(getTab(firstError.path).value);
        const detail = error.fields.slice(0, 3).map(e => readableError(e.path, e.message)).join('; ');
        toast.error(detail || normalizeErrorMessage(error, 'Не удалось сохранить карточку.'), { duration: 10000 });
      } else toast.error(normalizeErrorMessage(error, 'Не удалось сохранить карточку.'));
    }
  };

  // Вызывается react-hook-form, когда форма НЕ проходит валидацию —
  // до этого сохранение просто молча не срабатывало, без единой подсказки.
  const onError = (errors: FieldErrors<MineralFormData>) => {
    const fieldErrors = collectFieldErrors(errors);
    if (fieldErrors.length === 0) {
      toast.error('Форма невалидна, но конкретную причину определить не удалось');
      return;
    }

    const tabs = Array.from(new Set(fieldErrors.map((e) => getTab(e.path).label)));
    const firstFew = fieldErrors.slice(0, 3).map((e) => readableError(e.path, e.message)).join('; ');
    const firstError = fieldErrors[0];
    if (firstError) setActiveTab(getTab(firstError.path).value);

    toast.error(
      `Не сохранено: проверьте вкладк${tabs.length > 1 ? 'и' : 'у'} «${tabs.join('», «')}». ${firstFew}`,
      { duration: 8000 }
    );
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7 overflow-x-auto">
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="scientific">Научные</TabsTrigger>
                <TabsTrigger value="i18n">RU / EN</TabsTrigger>
                <TabsTrigger value="localities">Месторождения</TabsTrigger>
                <TabsTrigger value="images">Изображения</TabsTrigger>
                <TabsTrigger value="sources">Источники</TabsTrigger>
                <TabsTrigger value="import">Markdown</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="mt-6"><BasicInfoSection form={form} /></TabsContent>
              <TabsContent value="scientific" className="mt-6"><ScientificSection form={form} /></TabsContent>
              <TabsContent value="i18n" className="mt-6"><I18nSection form={form} /></TabsContent>
              <TabsContent value="localities" className="mt-6"><LocalitiesSection form={form} /></TabsContent>
              <TabsContent value="images" className="mt-6"><GallerySection form={form} onStorageKeyManualChange={() => { storageKeyEdited.current = true; }} /></TabsContent>
              <TabsContent value="sources" className="mt-6"><SourcesSection form={form} /></TabsContent>
              <TabsContent value="import" className="mt-6">
                <ImportMarkdownSection form={form} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? 'Сохранение...'
            : isEdit ? 'Обновить минерал' : 'Создать минерал'
          }
        </Button>
      </form>
    </FormProvider>
  );
}
