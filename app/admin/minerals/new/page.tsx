'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mineral } from '@/types/mineral';

export default function NewMineralPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Mineral>>({
    slug: '',
    scientific: {
      chemical_formula: '',
      mineral_group: '',
      crystal_system: '',
      hardness: { min: 3, max: 7 },
      specific_gravity: { min: 2.5, max: 4 },
      streak: '',
      luster: '',
      transparency: '',
      rarity: 'common',
    },
    i18n: {
      ru: {
        name: '',
        lore: '',
        color: [],
        color_description: '',
      },
      en: {
        name: '',
        lore: '',
        color: [],
        color_description: '',
      },
    },
    main_image_url: '',
    safety_notes: '',
  });

  useEffect(() => {
    const key = localStorage.getItem('admin_api_key') || '';
    setApiKey(key);
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      toast.error('API Key не найден');
      return;
    }

    setLoading(true);
    try {
      await api.createMineral(formData as Mineral, apiKey);
      toast.success('Минерал успешно создан!');
      router.push('/admin/minerals');
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Новый минерал</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основное */}
            <div>
              <Label>Slug *</Label>
              <Input value={formData.slug} onChange={(e) => handleChange('slug', e.target.value.toLowerCase())} required />
            </div>

            <div>
              <Label>Название (RU) *</Label>
              <Input value={formData.i18n?.ru?.name} onChange={(e) => handleChange('i18n.ru.name', e.target.value)} required />
            </div>

            {/* Научные данные */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chemical Formula *</Label>
                <Input value={formData.scientific?.chemical_formula} onChange={(e) => handleChange('scientific.chemical_formula', e.target.value)} required />
              </div>
              <div>
                <Label>Mineral Group</Label>
                <Input value={formData.scientific?.mineral_group} onChange={(e) => handleChange('scientific.mineral_group', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Crystal System</Label>
                <Input value={formData.scientific?.crystal_system} onChange={(e) => handleChange('scientific.crystal_system', e.target.value)} />
              </div>
              <div>
                <Label>Rarity</Label>
                <Input value={formData.scientific?.rarity} onChange={(e) => handleChange('scientific.rarity', e.target.value)} />
              </div>
            </div>

            {/* Цвета */}
            <div>
              <Label>Цвета (RU)</Label>
              <Input 
                placeholder="зелёный, тёмно-зелёный" 
                onChange={(e) => handleChange('i18n.ru.color', e.target.value.split(',').map(s => s.trim()))} 
              />
            </div>

            <div>
              <Label>Lore (RU)</Label>
              <Textarea value={formData.i18n?.ru?.lore} onChange={(e) => handleChange('i18n.ru.lore', e.target.value)} className="h-32" />
            </div>

            <div>
              <Label>Safety Notes</Label>
              <Textarea value={formData.safety_notes} onChange={(e) => handleChange('safety_notes', e.target.value)} />
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