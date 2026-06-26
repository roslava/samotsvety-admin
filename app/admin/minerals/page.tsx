'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Mineral } from '@/types/mineral';
import { Button } from '@/components/ui/button';
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
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MineralsPage() {
  const [minerals, setMinerals] = useState<Mineral[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey] = useState(() => localStorage.getItem('admin_api_key') || '');

  useEffect(() => {
    loadMinerals();
  }, []);

  const loadMinerals = async () => {
    try {
      setLoading(true);
      const data = await api.getMinerals({ limit: 100 });
      // API может возвращать { minerals: [...] } или сразу массив
      setMinerals(Array.isArray(data) ? data : data.minerals || []);
    } catch (error) {
      console.error(error);
      toast.error('Не удалось загрузить список минералов');
    } finally {
      setLoading(false);
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
        <CardHeader>
          <CardTitle>Всего: {minerals.length} минералов</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-slate-400">Загрузка данных...</div>
          ) : minerals.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Пока нет минералов. Добавьте первый!
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
                {minerals.map((mineral) => (
                  <TableRow key={mineral.slug}>
                    <TableCell className="font-mono text-sm">{mineral.slug}</TableCell>
                    <TableCell className="font-medium">{mineral.i18n.ru.name}</TableCell>
                    <TableCell>{mineral.scientific.mineral_group}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {mineral.scientific.rarity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/minerals/${mineral.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/minerals/${mineral.slug}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-500"
                        onClick={() => {
                          if (confirm(`Удалить ${mineral.i18n.ru.name}?`)) {
                            // TODO: delete function
                            toast.info('Удаление пока в разработке');
                          }
                        }}
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
    </div>
  );
}
