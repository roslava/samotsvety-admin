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
      <section className="rounded-[28px] bg-[var(--color-inkwell-teal)] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-vellum-lavender)]/80">Контент</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-bone)] md:text-4xl">
              Статьи
            </h1>
            <p className="mt-2 text-sm text-[var(--color-bone)]/60">
              Управление публикациями, типами материалов и редакционным статусом.
            </p>
          </div>

          <Link href="/admin/posts/new">
            <Button size="lg" className="rounded-full bg-[var(--color-vellum-lavender)] text-[var(--color-inkwell-teal)] hover:bg-[var(--color-vellum-lavender)]/90">
              <Plus className="mr-2 h-4 w-4" />
              Новая статья
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-bone)]/60">Всего</p>
              <FileText className="h-4 w-4 text-[var(--color-vellum-lavender)]" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-[var(--color-bone)]">{stats.total}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-bone)]/60">Опубликовано</p>
              <CheckCircle2 className="h-4 w-4 text-[var(--color-vellum-lavender)]" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-[var(--color-bone)]">{stats.published}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-bone)]/60">Черновики</p>
              <NotebookText className="h-4 w-4 text-[var(--color-vellum-lavender)]" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-[var(--color-bone)]">{stats.draft}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-bone)]/60">Типы</p>
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-vellum-lavender)]">CMS</span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-[var(--color-bone)]">{stats.types}</p>
          </div>
        </div>
      </section>

      <Card className="border-[var(--color-sage-mist)] bg-[var(--color-paper-white)] text-[var(--color-inkwell-teal)]">
        <CardHeader className="space-y-4 border-b border-[var(--color-sage-mist)] pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-xl text-[var(--color-inkwell-teal)]">
              {query.trim()
                ? `Найдено: ${filteredPosts.length} из ${posts.length}`
                : `Всего: ${posts.length} статей`}
            </CardTitle>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-slate-veil)]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по заголовку, slug, тегам..."
                className="h-11 rounded-full border-[var(--color-sage-mist)] bg-[var(--color-bone)] pl-9 pr-10 text-[var(--color-inkwell-teal)] placeholder:text-[var(--color-slate-veil)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-veil)] hover:text-[var(--color-inkwell-teal)]"
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
            <div className="py-16 text-center text-[var(--color-slate-veil)]">Загрузка данных...</div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-[var(--color-slate-veil)]">
              Пока нет статей. Добавьте первую публикацию.
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center text-[var(--color-slate-veil)]">
              Ничего не найдено по запросу «{query}».
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--color-sage-mist)] bg-[var(--color-bone)] hover:bg-[var(--color-bone)]">
                    <TableHead className="pl-6 text-[var(--color-slate-veil)]">Slug</TableHead>
                    <TableHead className="text-[var(--color-slate-veil)]">Заголовок</TableHead>
                    <TableHead className="text-[var(--color-slate-veil)]">Тип</TableHead>
                    <TableHead className="text-[var(--color-slate-veil)]">Статус</TableHead>
                    <TableHead className="pr-6 text-right text-[var(--color-slate-veil)]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.slug} className="border-[var(--color-driftwood)] hover:bg-[var(--color-bone)]">
                      <TableCell className="pl-6 font-mono text-xs text-[var(--color-slate-veil)]">{post.slug}</TableCell>
                      <TableCell className="font-medium text-[var(--color-inkwell-teal)]">{post.i18n.ru.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full border-0 bg-[var(--color-driftwood)] text-[var(--color-pewter-deep)]">
                          {TYPE_LABELS[post.type] || post.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={post.is_published ? 'default' : 'outline'}
                          className={
                            post.is_published
                              ? 'rounded-full border-0 bg-[var(--color-vellum-lavender)] text-[var(--color-inkwell-teal)]'
                              : 'rounded-full border-[var(--color-sage-mist)] bg-[var(--color-bone)] text-[var(--color-slate-veil)]'
                          }
                        >
                          {post.is_published ? 'Опубликовано' : 'Черновик'}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/posts/${post.slug}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full border border-[var(--color-sage-mist)] bg-[var(--color-bone)] hover:bg-[var(--color-driftwood)]">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
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
              className="rounded-full bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Удаляю...' : 'Удалить'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
