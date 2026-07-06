'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types/post';

export default function NewPostPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Post>>({
    type: 'blog',
    is_published: false,
    gem_slugs: [],
    tags: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/admin/posts');
      } else {
        alert('Ошибка при создании');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Новая статья</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label>Slug</label>
          <input type="text" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="w-full border p-2" required />
        </div>

        <div>
          <label>Тип</label>
          <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value as any})} className="w-full border p-2">
            <option value="blog">Блог</option>
            <option value="guide">Гайд</option>
            <option value="history">История</option>
            <option value="esoteric">Эзотерика</option>
          </select>
        </div>

        <div>
          <label>Заголовок (RU)</label>
          <input type="text" value={form.title_ru} onChange={(e) => setForm({...form, title_ru: e.target.value})} className="w-full border p-2" required />
        </div>

        <div>
          <label>Заголовок (EN)</label>
          <input type="text" value={form.title_en} onChange={(e) => setForm({...form, title_en: e.target.value})} className="w-full border p-2" />
        </div>

        <div>
          <label>Содержимое (RU)</label>
          <textarea value={form.content_ru} onChange={(e) => setForm({...form, content_ru: e.target.value})} rows={10} className="w-full border p-2" required />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded">
            {loading ? 'Сохранение...' : 'Создать'}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-500 text-white px-6 py-2 rounded">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}