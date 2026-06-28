'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function NewMineralPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('admin_api_key') || '';
    setApiKey(key);
  }, []);

  const [formData, setFormData] = useState({
    slug: '',
    scientific: {
      chemical_formula: '',
      mineral_group: '',
      crystal_system: '',
      hardness: { min: 3, max: 7 },
      specific_gravity: { min: 2, max: 4 },
      streak: '',
      luster: '',
      transparency: '',
      rarity: 'common' as const,
    },
    i18n: {
      ru: {
        name: '',
        lore: '',
      },
      en: {
        name: '',
        lore: '',
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      toast.error('API Key не найден. Войдите заново.');
      return;
    }

    setLoading(true);
    try {
      await api.createMineral(formData, apiKey);
      toast.success('Минерал успешно создан!');
      router.push('/admin/minerals');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error('Ошибка при создании: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Новый минерал</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Slug (уникальный идентификатор)</Label>
              <Input 
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                placeholder="malachite"
                required
              />
            </div>

            <div>
              <Label>Название (Русский)</Label>
              <Input 
                value={formData.i18n.ru.name}
                onChange={(e) => setFormData({
                  ...formData,
                  i18n: { ...formData.i18n, ru: { ...formData.i18n.ru, name: e.target.value }}
                })}
                placeholder="Малахит"
                required
              />
            </div>

            <div>
              <Label>Lore (Русский)</Label>
              <textarea 
                className="w-full h-32 p-3 border border-slate-700 bg-slate-950 rounded-md"
                value={formData.i18n.ru.lore}
                onChange={(e) => setFormData({
                  ...formData,
                  i18n: { ...formData.i18n, ru: { ...formData.i18n.ru, lore: e.target.value }}
                })}
                placeholder="Краткое описание истории и значения..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Создание...' : 'Создать минерал'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}