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
import { Plus, Edit, Trash2, Eye, Search, X, Gem, Sparkles, Layers3 } from 'lucide-react';
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

const MINERAL_FAMILY_LABELS: Record<string, string> = {
  garnet_group: 'Гранаты',
  feldspar_group: 'Полевые шпаты',
  quartz_group: 'Кварцы',
  tourmaline_group: 'Турмалины',
  mica_group: 'Слюды',
  pyroxene_group: 'Пироксены',
  amphibole_group: 'Амфиболы',
  zeolite_group: 'Цеолиты',
  beryl_group: 'Бериллы',
  spinel_group: 'Шпинели',
  corundum_group: 'Корунды',
  calcite_group: 'Кальциты',
};

export default function MineralsPage() {
  const [minerals, setMinerals] = useState<Mineral[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState('');

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
        m.scientific?.mineral_family,
        ...(m.i18n?.ru?.synonyms || []),
        ...(m.i18n?.en?.synonyms || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [minerals, query]);

  const stats = useMemo(() => {
    const uniqueGroups = new Set(
      minerals
        .map((mineral) => mineral.scientific?.mineral_family)
        .filter(Boolean)
    ).size;

    const withImages = minerals.filter((mineral) => (mineral.gallery?.length || 0) > 0).length;

    return {
      total: minerals.length,
      groups: uniqueGroups,
      withImages,
    };
  }, [minerals]);

  const handleDelete = async (slug: string) => {
    const apiKey = localStorage.getItem('admin_api_key');
    if (!apiKey) {
      toast.error('API Key не найден');
      return;
    }

    setDeleting(true);
    try {
      await api.deleteMineral(slug, apiKey);
      setMinerals((current) => current.filter((m) => m.slug !== slug));
      toast.success('Минерал удалён');
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
            <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">Каталог</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Минералы
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Управление базой самоцветов, группами и карточками объектов.
            </p>
          </div>

          <Link href="/admin/minerals/new">
            <Button size="lg" className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              <Plus className="mr-2 h-4 w-4" />
              Новый минерал
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Всего</p>
              <Gem className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Групп</p>
              <Layers3 className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{stats.groups}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">С картинками</p>
              <Sparkles className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{stats.withImages}</p>
          </div>
        </div>
      </section>

      <Card className="border-white/10 bg-slate-950/70 text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <CardHeader className="space-y-4 border-b border-white/10 pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-xl text-white">
              {query.trim()
                ? `Найдено: ${filteredMinerals.length} из ${minerals.length}`
                : `Всего: ${minerals.length} минералов`}
            </CardTitle>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию, slug, группе, синонимам..."
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
          ) : minerals.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              Пока нет минералов. Добавьте первый объект.
            </div>
          ) : filteredMinerals.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              Ничего не найдено по запросу «{query}».
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 bg-slate-900/80 hover:bg-slate-900/80">
                    <TableHead className="pl-6 text-slate-300">Slug</TableHead>
                    <TableHead className="text-slate-300">Название</TableHead>
                    <TableHead className="text-slate-300">Группа</TableHead>
                    <TableHead className="text-slate-300">Редкость</TableHead>
                    <TableHead className="pr-6 text-right text-slate-300">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMinerals.map((mineral) => (
                    <TableRow key={mineral.slug} className="border-white/5 hover:bg-white/3">
                      <TableCell className="pl-6 font-mono text-xs text-slate-300">{mineral.slug}</TableCell>
                      <TableCell className="font-medium text-white">{mineral.i18n.ru.name}</TableCell>
                      <TableCell className="text-slate-300">
                        {mineral.scientific.mineral_family
                          ? MINERAL_FAMILY_LABELS[mineral.scientific.mineral_family] || mineral.scientific.mineral_family
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-200">
                          {mineral.scientific.rarity}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/minerals/${mineral.slug}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/minerals/${mineral.slug}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                            onClick={() => setDeleteConfirm(mineral.slug)}
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
            <AlertDialogTitle>Удалить минерал?</AlertDialogTitle>
            <AlertDialogDescription>
              Минерал "{minerals.find((m) => m.slug === deleteConfirm)?.i18n.ru.name}" будет удалён безвозвратно.
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
