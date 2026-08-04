'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Post } from '@/types/post';
import PostForm from '../../components/PostForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type PostFormData } from '@/lib/validations/post';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await api.getPost(slug);
        setPost(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Загрузка статьи...</div>;
  if (!post) return <div className="p-8 text-center">Статья не найдена</div>;

  const formData: PostFormData = {
    slug: post.slug,
    type: post.type,
    i18n: {
      ru: {
        title: post.i18n.ru.title,
        excerpt: post.i18n.ru.excerpt || '',
        content: post.i18n.ru.content || '',
        cover_image: post.i18n.ru.cover_image || '',
      },
      en: {
        title: post.i18n.en.title || '',
        excerpt: post.i18n.en.excerpt || '',
        content: post.i18n.en.content || '',
        cover_image: post.i18n.en.cover_image || '',
      },
    },
    cover_image: post.cover_image || '',
    content_blocks: (post.content_blocks || []).map((b) => ({
      id: b.id,
      type: b.type,
      level: b.level,
      layout: b.layout,
      image_url: b.image_url || '',
      image_urls: b.image_urls && b.image_urls.length ? b.image_urls : ['', ''],
      i18n: {
        ru: {
          text: b.i18n?.ru?.text || '',
          attribution: b.i18n?.ru?.attribution || '',
          caption: b.i18n?.ru?.caption || '',
          captions: b.i18n?.ru?.captions && b.i18n.ru.captions.length ? b.i18n.ru.captions : ['', ''],
          image_url: b.i18n?.ru?.image_url || '',
          image_urls: b.i18n?.ru?.image_urls && b.i18n.ru.image_urls.length ? b.i18n.ru.image_urls : ['', ''],
        },
        en: {
          text: b.i18n?.en?.text || '',
          attribution: b.i18n?.en?.attribution || '',
          caption: b.i18n?.en?.caption || '',
          captions: b.i18n?.en?.captions && b.i18n.en.captions.length ? b.i18n.en.captions : ['', ''],
          image_url: b.i18n?.en?.image_url || '',
          image_urls: b.i18n?.en?.image_urls && b.i18n.en.image_urls.length ? b.i18n.en.image_urls : ['', ''],
        },
      },
    })),
    gem_slugs: post.gem_slugs || [],
    tags: post.tags || [],
    is_published: post.is_published,
    author: post.author || '',
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Назад
      </Button>

      <h1 className="text-4xl font-bold mb-8">Редактировать статью: {post.i18n.ru.title}</h1>

      <PostForm defaultValues={formData} isEdit={true} slug={slug} />
    </div>
  );
}
