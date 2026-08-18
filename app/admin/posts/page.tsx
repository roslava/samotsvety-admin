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
import { Plus, Edit, Trash2, Search, X, FileText, CheckCircle2, NotebookText } from 'lucide-react';
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

  const stats = useMemo(() => {
    const published = posts.filter((post) => post.is_published).length;
    const draft = posts.length - published;
    const types = new Set(posts.map((post) => post.type)).size;

    return {
      total: posts.length,
      published,
      draft,
      types,
    };
  }, [posts]);

  const handleDelete = async (slug: string) => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден');
      return;
    }

    setDeleting(true);
    try {
      await api.deletePost(slug, apiKey);
      setPosts((current) => current.filter((p) => p.slug !== slug));
      toast.success('Статья удалена');
      setDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">Контент</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Статьи
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Управление публикациями, типами материалов и редакционным статусом.
            </p>
          </div>

          <Link href="/admin/posts/new">
            <Button size="lg" className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              <Plus className="mr-2 h-4 w-4" />
              Новая статья
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Всего</p>
              <FileText className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Опубликовано</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{stats.published}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Черновики</p>
              <NotebookText className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{stats.draft}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Типы</p>
              <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">CMS</span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{stats.types}</p>
          </div>
        </div>
      </section>

      <Card className="border-white/10 bg-slate-950/70 text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <CardHeader className="space-y-4 border-b border-white/10 pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-xl text-white">
              {query.trim()
                ? `Найдено: ${filteredPosts.length} из ${posts.length}`
                : `Всего: ${posts.length} статей`}
            </CardTitle>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по заголовку, slug, тегам..."
                className="h-11 border-white/10 bg-slate-900/80 pl-9 pr-10 text-slate-100 placeholder:text-slate-500"
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
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-400">Загрузка данных...</div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              Пока нет статей. Добавьте первую публикацию.
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              Ничего не найдено по запросу «{query}».
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 bg-slate-900/80 hover:bg-slate-900/80">
                    <TableHead className="pl-6 text-slate-300">Slug</TableHead>
                    <TableHead className="text-slate-300">Заголовок</TableHead>
                    <TableHead className="text-slate-300">Тип</TableHead>
                    <TableHead className="text-slate-300">Статус</TableHead>
                    <TableHead className="pr-6 text-right text-slate-300">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.slug} className="border-white/5 hover:bg-white/3">
                      <TableCell className="pl-6 font-mono text-xs text-slate-300">{post.slug}</TableCell>
                      <TableCell className="font-medium text-white">{post.i18n.ru.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full border border-white/10 bg-slate-800 text-slate-200">
                          {TYPE_LABELS[post.type] || post.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={post.is_published ? 'default' : 'outline'}
                          className={post.is_published ? 'bg-emerald-500/20 text-emerald-200' : 'border-white/10 bg-slate-900 text-slate-300'}
                        >
                          {post.is_published ? 'Опубликовано' : 'Черновик'}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/posts/${post.slug}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                            onClick={() => setDeleteConfirm(post.slug)}
                            disabled={deleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
          <div className="flex justify-end gap-3">
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
