'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Post } from '@/types/post';
import PostForm from '../../components/PostForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [etag, setETag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const apiKey = localStorage.getItem('admin_api_key') || '';
        const resource = await api.getPost(slug, apiKey);
        setPost(resource.post);
        setETag(resource.etag);
      } catch (error) {
        console.error(error);
        setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить статью');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Загрузка статьи...</div>;
  if (loadError) return <div className="p-8 text-center" role="alert">{loadError}</div>;
  if (!post) return <div className="p-8 text-center">Статья не найдена</div>;
  if (post.slug !== slug) return <div className="p-8 text-center">Загрузка статьи...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Назад
      </Button>

      <h1 className="text-4xl font-bold mb-8">Редактировать статью: {post.i18n.ru.title}</h1>

      <PostForm key={slug} post={post} etag={etag} />
    </div>
  );
}
