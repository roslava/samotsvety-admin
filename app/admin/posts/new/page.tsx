'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { articleFormDefaults } from '@/lib/article-form';
import { createUuidV4 } from '@/lib/uuid';
import type { ArticleResource } from '@/types/post';
import { Button } from '@/components/ui/button';

export default function NewPostPage() {
  const router = useRouter();
  // Reuse the request when React replays effects in development.
  const request = useRef<Promise<ArticleResource> | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    if (!request.current) {
      const values = articleFormDefaults();
      values.slug = 'draft-' + createUuidV4();
      request.current = api.createPost(values, localStorage.getItem('admin_api_key') || '');
    }
    request.current.then(({ post }) => {
      if (active) router.replace('/admin/posts/' + encodeURIComponent(post.slug) + '/edit');
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Не удалось создать черновик');
    });
    return () => { active = false; };
  }, [router, attempt]);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{error ? 'Не удалось создать черновик' : 'Создаём черновик…'}</h1>
      {error ? <>
        <p role="alert" className="text-destructive">{error}</p>
        <Button onClick={() => {
          request.current = null;
          setError('');
          setAttempt((value) => value + 1);
        }}>Повторить</Button>
      </> : <p role="status" className="text-muted-foreground">Редактор и загрузка изображений откроются автоматически.</p>}
    </div>
  );
}