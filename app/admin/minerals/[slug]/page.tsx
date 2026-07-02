'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Mineral } from '@/types/mineral';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Edit, ArrowLeft } from 'lucide-react';

export default function MineralViewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [mineral, setMineral] = useState<Mineral | null>(null);
  const [loading, setLoading] = useState(true);

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

  const ru = mineral.i18n.ru;
  const en = mineral.i18n.en;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Назад
        </Button>

        <Link href={`/admin/minerals/${slug}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
        </Link>
      </div>

      <h1 className="text-5xl font-bold mb-1">{ru.name}</h1>
      <p className="text-xl text-slate-400 mb-10">/{mineral.slug}</p>

      {/* Главное изображение */}
      {mineral.main_image_url && (
        <div className="mb-12 rounded-3xl overflow-hidden border border-slate-700">
          <img 
            src={mineral.main_image_url} 
            alt={ru.name}
            className="w-full max-h-[520px] object-contain bg-slate-950" 
          />
        </div>
      )}

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="info">Основная информация</TabsTrigger>
          <TabsTrigger value="lore">Lore</TabsTrigger>
          <TabsTrigger value="esoteric">Эзотерика</TabsTrigger>
          <TabsTrigger value="gallery">Галерея</TabsTrigger>
        </TabsList>

        {/* Основная информация */}
        <TabsContent value="info" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Научные свойства</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><strong>Формула:</strong> {mineral.scientific.chemical_formula}</div>
                <div><strong>Группа:</strong> {mineral.scientific.mineral_group}</div>
                <div><strong>Система:</strong> {mineral.scientific.crystal_system}</div>
                <div><strong>Твёрдость:</strong> {mineral.scientific.hardness.min} – {mineral.scientific.hardness.max}</div>
                <div><strong>Удельный вес:</strong> {mineral.scientific.specific_gravity.min} – {mineral.scientific.specific_gravity.max}</div>
                <div><strong>Редкость:</strong> <Badge>{mineral.scientific.rarity}</Badge></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Месторождения</CardTitle>
              </CardHeader>
              <CardContent>
                {mineral.localities.length > 0 ? (
                  mineral.localities.map((loc, i) => (
                    <div key={i} className="mb-6 last:mb-0 p-4 bg-slate-950 rounded-xl">
                      <div className="font-medium">{loc.locality || '—'}</div>
                      <div className="text-sm text-slate-400">{loc.region}, {loc.country}</div>
                      {loc.description_ru && <p className="mt-3 text-sm">{loc.description_ru}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Месторождения не указаны</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lore */}
        <TabsContent value="lore">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-6">Историко-культурный контекст</h3>
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-lg">{ru.lore}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

{/* Эзотерика */}
<TabsContent value="esoteric">
  {ru?.esoteric && 
   (
     (ru.esoteric.metaphysical_properties?.length ?? 0) > 0 ||
     (ru.esoteric.chakras?.length ?? 0) > 0 ||
     (ru.esoteric.zodiac?.length ?? 0) > 0 ||
     (ru.esoteric.healing_interpretation?.trim() ?? '').length > 0 ||
     (ru.esoteric.energy_notes?.trim() ?? '').length > 0 ||
     (ru.esoteric.ritual_uses?.trim() ?? '').length > 0
   ) ? (
    <Card>
      <CardContent className="pt-6 space-y-10">
        <div>
          <h3 className="text-xl font-semibold mb-4">Метафизические свойства</h3>
          <div className="flex flex-wrap gap-3">
            {ru.esoteric.metaphysical_properties.map((prop, i) => (
              <Badge key={i} variant="outline" className="text-base px-4 py-1">
                {prop}
              </Badge>
            ))}
          </div>
        </div>

        {(ru.esoteric.chakras.length > 0 || ru.esoteric.zodiac.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ru.esoteric.chakras.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Чакры</h4>
                <p className="text-lg">{ru.esoteric.chakras.join(', ')}</p>
              </div>
            )}
            {ru.esoteric.zodiac.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Знаки зодиака</h4>
                <p className="text-lg">{ru.esoteric.zodiac.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        <div>
          <h4 className="font-medium mb-3">Исцеление и энергия</h4>
          
          {ru.esoteric.healing_interpretation && (
            <p className="text-slate-300 leading-relaxed mb-6">
              {ru.esoteric.healing_interpretation}
            </p>
          )}
          
          {ru.esoteric.energy_notes && (
            <p className="mt-6 text-slate-300 leading-relaxed">
              {ru.esoteric.energy_notes}
            </p>
          )}
          
          {ru.esoteric.ritual_uses && (
            <p className="mt-6 text-slate-300 leading-relaxed">
              {ru.esoteric.ritual_uses}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardContent className="pt-12 pb-12 text-center text-slate-500">
        Эзотерический блок для этого минерала не заполнен
      </CardContent>
    </Card>
  )}
</TabsContent>

        {/* Галерея */}
        <TabsContent value="gallery">
          {mineral.gallery && mineral.gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {mineral.gallery.map((img, i) => (
                <Card key={i} className="overflow-hidden">
                  <img 
                    src={img.url} 
                    alt={img.description_ru || ''} 
                    className="w-full aspect-square object-cover" 
                  />
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2">{img.type}</Badge>
                    {img.description_ru && <p className="text-sm text-slate-400">{img.description_ru}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-12">Галерея пуста</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}