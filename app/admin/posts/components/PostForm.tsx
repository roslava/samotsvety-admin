'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostSchema, type PostFormData } from '@/lib/validations/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

import { BasicInfoSection } from './BasicInfoSection';
import { ContentSection } from './ContentSection';
import { MetaSection } from './MetaSection';

interface PostFormProps {
  defaultValues?: Partial<PostFormData>;
  isEdit?: boolean;
  slug?: string;
}

export default function PostForm({ defaultValues, isEdit = false, slug: editSlug }: PostFormProps) {
  const router = useRouter();

  const completeDefaults: PostFormData = {
    slug: '',
    type: 'blog',
    title_ru: '',
    title_en: '',
    excerpt_ru: '',
    excerpt_en: '',
    content_ru: '',
    content_en: '',
    cover_image: '',
    gem_slugs: [],
    tags: [],
    is_published: false,
    author: 'roslava',
    ...defaultValues,
  };

  const form = useForm<PostFormData>({
    resolver: zodResolver(PostSchema),
    defaultValues: completeDefaults,
    mode: 'onBlur',
  });

  const onSubmit = async (data: PostFormData) => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден');
      return;
    }

    try {
      if (isEdit && editSlug) {
        await api.updatePost(editSlug, data, apiKey);
        toast.success('Статья обновлена!');
      } else {
        await api.createPost(data, apiKey);
        toast.success('Статья создана!');
      }
      router.push('/admin/posts');
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="content">Содержимое</TabsTrigger>
                <TabsTrigger value="meta">Метаданные</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <BasicInfoSection form={form} />
              </TabsContent>

              <TabsContent value="content" className="mt-6">
                <ContentSection form={form} />
              </TabsContent>

              <TabsContent value="meta" className="mt-6">
                <MetaSection form={form} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting 
            ? 'Сохранение...' 
            : isEdit ? 'Обновить статью' : 'Создать статью'
          }
        </Button>
      </form>
    </FormProvider>
  );
}