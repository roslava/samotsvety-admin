'use client';

import { useForm, FormProvider, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MineralSchema, type MineralFormData } from '@/lib/validations/mineral';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

import { BasicInfoSection } from './BasicInfoSection';
import { ScientificSection } from './ScientificSection';
import { I18nSection } from './I18nSection';
import { LocalitiesSection } from './LocalitiesSection';
import { GallerySection } from './GallerySection';
import { EsotericSection } from './EsotericSection';
import { ImportJsonSection } from './ImportJsonSection';

interface MineralFormProps {
  defaultValues?: Partial<MineralFormData>;
  isEdit?: boolean;
  slug?: string;
}

// Определяет, к какой вкладке формы относится путь невалидного поля,
// чтобы можно было показать пользователю, где именно искать ошибку.
function getTabLabel(path: string): string {
  if (path.includes('.esoteric')) return 'Эзотерика';
  if (path.startsWith('i18n')) return 'Названия + Lore';
  if (path.startsWith('scientific')) return 'Научные';
  if (path.startsWith('localities')) return 'Месторождения';
  if (path.startsWith('gallery')) return 'Галерея';
  return 'Основное';
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

  const completeDefaults: MineralFormData = {
    slug: '',
    type: 'mineral',
    scientific: {
      chemical_formula: '',
      hardness: { min: 1, max: 1 },
      specific_gravity: { min: 1, max: 1 },
      rarity: 'common',
    },
    i18n: {
      ru: { ...emptyLangData },
      en: { ...emptyLangData },
    },
    localities: [],
    main_image_url: '',
    thumbnail_url: '',
    gallery: [],
    related_minerals: [],
    ...defaultValues,
  };

  const form = useForm<MineralFormData>({
    resolver: zodResolver(MineralSchema),
    defaultValues: completeDefaults,
    mode: 'onBlur',
  });

  const currentSlug = useWatch({
    control: form.control,
    name: 'slug',
    defaultValue: editSlug || '',
  });

  const onSubmit = async (data: MineralFormData) => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден');
      return;
    }

    try {
      if (isEdit && editSlug) {
        await api.updateMineral(editSlug, data, apiKey);
        toast.success('Минерал обновлён!');
      } else {
        await api.createMineral(data, apiKey);
        toast.success('Минерал создан!');
      }
      router.push('/admin/minerals');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения');
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

    const tabs = Array.from(new Set(fieldErrors.map((e) => getTabLabel(e.path))));
    const firstFew = fieldErrors.slice(0, 3).map((e) => e.message).join('; ');

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
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="scientific">Научные</TabsTrigger>
                <TabsTrigger value="i18n">Названия + Lore</TabsTrigger>
                <TabsTrigger value="localities">Месторождения</TabsTrigger>
                <TabsTrigger value="gallery">Галерея</TabsTrigger>
                <TabsTrigger value="esoteric">Эзотерика</TabsTrigger>
                <TabsTrigger value="import">Импорт JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <BasicInfoSection form={form} slug={currentSlug} />
              </TabsContent>

              <TabsContent value="scientific" className="mt-6">
                <ScientificSection form={form} />
              </TabsContent>

              <TabsContent value="i18n" className="mt-6">
                <I18nSection form={form} />
              </TabsContent>

              <TabsContent value="localities" className="mt-6">
                <LocalitiesSection form={form} />
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                <GallerySection form={form} slug={currentSlug} />
              </TabsContent>

              <TabsContent value="esoteric" className="mt-6">
                <EsotericSection form={form} />
              </TabsContent>

              <TabsContent value="import" className="mt-6">
                <ImportJsonSection form={form} />
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
