'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types/post';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`);
      const data = await res.json();
      setPosts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Статьи</h1>
        <a href="/admin/posts/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Новая статья
        </a>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div key={post.id} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{post.i18n.ru.title}</h3>
                <p className="text-sm text-gray-500">{post.slug}</p>
                <span className={`text-xs px-2 py-1 rounded ${post.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                  {post.is_published ? 'Опубликовано' : 'Черновик'}
                </span>
              </div>
              <div className="flex gap-2">
                <a href={`/admin/posts/${post.slug}/edit`} className="text-blue-600 hover:underline">Редактировать</a>
                <button className="text-red-600 hover:underline">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
