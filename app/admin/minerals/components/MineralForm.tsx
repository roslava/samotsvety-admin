'use client';

import { useForm, FormProvider } from 'react-hook-form';
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
import {ImportJsonSection} from './ImportJsonSection'
 

interface MineralFormProps {
  defaultValues?: Partial<MineralFormData>;
  isEdit?: boolean;
  slug?: string;
}

export default function MineralForm({ defaultValues, isEdit = false, slug }: MineralFormProps) {
  const router = useRouter();
  
  const form = useForm<MineralFormData>({
    resolver: zodResolver(MineralSchema),
    defaultValues: {
      localities: [/* можно дефолт */],
      gallery: [],
      related_minerals: [],
      ...defaultValues,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: MineralFormData) => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден');
      return;
    }

    try {
      if (isEdit && slug) {
        await api.updateMineral(slug, data, apiKey);
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

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <BasicInfoSection form={form} />
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
                <GallerySection form={form} />
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