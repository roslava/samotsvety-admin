'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MineralSchema, type MineralFormData } from '@/lib/validations/mineral';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ScientificSection } from './ScientificSection';
import { I18nSection } from './I18nSection';
import { LocalitiesSection } from './LocalitiesSection';
import { GallerySection } from './GallerySection';
import { BasicInfoSection } from './BasicInfoSection';
import { EsotericSection } from './EsotericSection';

// ...

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
      localities: [],
      gallery: [],
      related_minerals: [],
      ...defaultValues,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: MineralFormData) => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден. Пожалуйста, войдите заново.');
      return;
    }

    try {
      if (isEdit && slug) {
        await api.updateMineral(slug, data, apiKey);
        toast.success('Минерал успешно обновлён!');
      } else {
        await api.createMineral(data, apiKey);
        toast.success('Минерал успешно создан!');
      }
      router.push('/admin/minerals');
    } catch (error: any) {
      toast.error(error.message || 'Произошла ошибка при сохранении');
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Редактирование минерала' : 'Новый минерал'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-12">
            {/* Здесь будем подключать секции */}
            <BasicInfoSection form={form} />
            <ScientificSection form={form} />
            
            <I18nSection form={form} />
            <LocalitiesSection form={form} />
            <GallerySection form={form} />
            <EsotericSection form={form} />
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