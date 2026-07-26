'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { Mineral } from '@/types/mineral';
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
import { Plus, Edit, Trash2, Eye, Search, X } from 'lucide-react';
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

export default function MineralsPage() {
  const [minerals, setMinerals] = useState<Mineral[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState('');

  // Загружаем весь список постранично (API отдаёт максимум 100 за раз),
  // чтобы поиск ниже работал по всей базе, а не только по первой сотне.
  const loadMinerals = useCallback(async () => {
    try {
      setLoading(true);
      let page = 1;
      let all: Mineral[] = [];
      while (true) {
        const batch = await api.getMinerals({ limit: 100, page });
        all = all.concat(batch);
        if (batch.length < 100 || page > 20) break;
        page++;
      }
      setMinerals(all);
    } catch (error) {
      console.error(error);
      toast.error('Не удалось загрузить список минералов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMinerals();
  }, [loadMinerals]);

  const filteredMinerals = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return minerals;

    return minerals.filter((m) => {
      const haystack = [
        m.slug,
        m.i18n?.ru?.name,
        m.i18n?.en?.name,
        m.i18n?.ru?.mineral_group,
        m.i18n?.en?.mineral_group,
        ...(m.i18n?.ru?.synonyms || []),
        ...(m.i18n?.en?.synonyms || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [minerals, query]);

  const handleDelete = async (slug: string) => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден');
      return;
    }

    setDeleting(true);
    try {
      await api.deleteMineral(slug, apiKey);
      setMinerals(minerals.filter(m => m.slug !== slug));
      toast.success('Минерал удалён');
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
          <h1 className="text-4xl font-bold tracking-tight">Минералы</h1>
          <p className="text-slate-400 mt-2">Управление базой самоцветов и минералов</p>
        </div>

        <Link href="/admin/minerals/new">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Новый минерал
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>
            {query.trim()
              ? `Найдено: ${filteredMinerals.length} из ${minerals.length}`
              : `Всего: ${minerals.length} минералов`}
          </CardTitle>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию, slug, группе, синонимам..."
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
          ) : minerals.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Пока нет минералов. Добавьте первый!
            </div>
          ) : filteredMinerals.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Ничего не найдено по запросу «{query}»
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Название (Русский)</TableHead>
                  <TableHead>Группа</TableHead>
                  <TableHead>Редкость</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMinerals.map((mineral) => (
                  <TableRow key={mineral.slug}>
                    <TableCell className="font-mono text-sm">{mineral.slug}</TableCell>
                    <TableCell className="font-medium">{mineral.i18n.ru.name}</TableCell>
                    <TableCell>{mineral.i18n.ru.mineral_group}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {mineral.scientific.rarity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/minerals/${mineral.slug}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/minerals/${mineral.slug}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-500"
                        onClick={() => setDeleteConfirm(mineral.slug)}
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
            <AlertDialogTitle>Удалить минерал?</AlertDialogTitle>
            <AlertDialogDescription>
              Минерал "{minerals.find(m => m.slug === deleteConfirm)?.i18n.ru.name}" будет удалён безвозвратно.
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
