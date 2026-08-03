'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { Post } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TYPE_LABELS: Record<string, string> = {
  blog: 'Блог',
  guide: 'Гид',
  history: 'История',
  esoteric: 'Эзотерика',
  review: 'Обзор',
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState('');

  // Загружаем весь список постранично, чтобы поиск ниже работал по всей базе
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      let page = 1;
      let all: Post[] = [];
      while (true) {
        const batch = await api.getPosts({ limit: 100, page });
        all = all.concat(batch);
        if (batch.length < 100 || page > 20) break;
        page++;
      }
      setPosts(all);
    } catch (error) {
      console.error(error);
      toast.error('Не удалось загрузить список статей');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter((p) => {
      const haystack = [p.slug, p.i18n?.ru?.title, p.i18n?.en?.title, ...(p.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

  const handleDelete = async (slug: string) => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден');
      return;
    }

    setDeleting(true);
    try {
      await api.deletePost(slug, apiKey);
      setPosts(posts.filter((p) => p.slug !== slug));
      toast.success('Статья удалена');
      setDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Статьи</h1>
          <p className="text-slate-400 mt-2">Управление статьями и материалами</p>
        </div>

        <Link href="/admin/posts/new">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Новая статья
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>
            {query.trim()
              ? `Найдено: ${filteredPosts.length} из ${posts.length}`
              : `Всего: ${posts.length} статей`}
          </CardTitle>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по заголовку, slug, тегам..."
              className="pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label="Очистить поиск"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-slate-400">Загрузка данных...</div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Пока нет статей. Добавьте первую!
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Ничего не найдено по запросу «{query}»
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Заголовок (Русский)</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.slug}>
                    <TableCell className="font-mono text-sm">{post.slug}</TableCell>
                    <TableCell className="font-medium">{post.i18n.ru.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{TYPE_LABELS[post.type] || post.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.is_published ? 'default' : 'outline'}>
                        {post.is_published ? 'Опубликовано' : 'Черновик'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/posts/${post.slug}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-500"
                        onClick={() => setDeleteConfirm(post.slug)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить статью?</AlertDialogTitle>
            <AlertDialogDescription>
              Статья "{posts.find((p) => p.slug === deleteConfirm)?.i18n.ru.title}" будет удалена безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Удаляю...' : 'Удалить'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
