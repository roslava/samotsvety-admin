'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Mineral } from '@/types/mineral';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Edit, ArrowLeft, Eye } from 'lucide-react';

export default function MineralViewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [mineral, setMineral] = useState<Mineral | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'normal' | 'esoteric'>('normal');

  useEffect(() => {
    const loadMineral = async () => {
      try {
        const data = await api.getMineral(slug);
        setMineral(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadMineral();
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Загрузка минерала...</div>;
  if (!mineral) return <div className="p-8 text-center">Минерал не найден</div>;

  const currentI18n = mineral.i18n.ru; // можно добавить переключатель языка позже

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{currentI18n.name}</h1>
            <p className="text-slate-400">/{mineral.slug}</p>
          </div>
        </div>

        <Link href={`/admin/minerals/${slug}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
        </Link>
      </div>

      {/* Главное изображение */}
      {mineral.main_image_url && (
        <div className="mb-10">
          <img 
            src={mineral.main_image_url} 
            alt={currentI18n.name}
            className="w-full max-h-[500px] object-contain rounded-3xl border border-slate-700" 
          />
        </div>
      )}

      <Tabs defaultValue="normal" className="w-full" onValueChange={(v) => setViewMode(v as any)}>
        <TabsList className="mb-8">
          <TabsTrigger value="normal">Обычный режим</TabsTrigger>
          <TabsTrigger value="esoteric">С эзотерикой</TabsTrigger>
        </TabsList>

        <TabsContent value="normal" className="space-y-10">
          {/* Научные свойства */}
          <Card>
            <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div><strong>Формула</strong><br/>{mineral.scientific.chemical_formula}</div>
              <div><strong>Группа</strong><br/>{mineral.scientific.mineral_group}</div>
              <div><strong>Система</strong><br/>{mineral.scientific.crystal_system}</div>
              <div><strong>Твёрдость</strong><br/>{mineral.scientific.hardness.min}–{mineral.scientific.hardness.max}</div>
              <div><strong>Уд. вес</strong><br/>{mineral.scientific.specific_gravity.min}–{mineral.scientific.specific_gravity.max}</div>
              <div><strong>Редкость</strong><br/><Badge variant="secondary">{mineral.scientific.rarity}</Badge></div>
            </CardContent>
          </Card>

          {/* Lore */}
          <Card>
            <CardContent className="pt-6 prose prose-invert max-w-none">
              <h3 className="mb-4">Историко-культурный контекст</h3>
              <p className="whitespace-pre-wrap text-slate-300">{currentI18n.lore}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esoteric" className="space-y-10">
          {currentI18n.esoteric ? (
            <Card>
              <CardContent className="pt-6 space-y-8">
                <div>
                  <h3 className="mb-4">Метафизические свойства</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentI18n.esoteric.metaphysical_properties.map((prop, i) => (
                      <Badge key={i} variant="outline">{prop}</Badge>
                    ))}
                  </div>
                </div>

                {currentI18n.esoteric.chakras.length > 0 && (
                  <div>
                    <h3 className="mb-3">Чакры</h3>
                    <p>{currentI18n.esoteric.chakras.join(', ')}</p>
                  </div>
                )}

                <div>
                  <h3 className="mb-3">Интерпретация</h3>
                  <p className="text-slate-300">{currentI18n.esoteric.healing_interpretation}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-slate-500">Эзотерический блок не заполнен</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Галерея */}
      {mineral.gallery.length > 0 && (
        <Card className="mt-10">
          <CardContent className="pt-6">
            <h3 className="mb-6 text-lg font-semibold">Галерея</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mineral.gallery.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-slate-700">
                  <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                  <div className="p-2 text-xs text-slate-400">
                    {img.type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}