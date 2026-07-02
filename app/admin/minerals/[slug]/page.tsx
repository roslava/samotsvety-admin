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
import { Edit, ArrowLeft, Gem } from 'lucide-react';

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
  const scientific = mineral.scientific;

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

      <div className="flex items-center gap-4 mb-2">
        <Gem className="h-8 w-8 text-emerald-500" />
        <div>
          <h1 className="text-5xl font-bold">{ru.name}</h1>
          <p className="text-xl text-slate-400">/{mineral.slug}</p>
        </div>
        {mineral.type && (
          <Badge variant="outline" className="ml-auto text-lg px-4 py-1">
            {mineral.type === 'mineral' ? 'Минерал' : 
             mineral.type === 'gem_variety' ? 'Разновидность' : 
             mineral.type === 'rock' ? 'Горная порода' : mineral.type}
          </Badge>
        )}
      </div>

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

        {/* ==================== ОСНОВНАЯ ИНФОРМАЦИЯ ==================== */}
        <TabsContent value="info" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Научные свойства — расширенные */}
            <Card>
              <CardHeader>
                <CardTitle>Научные свойства</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div><strong>Химическая формула:</strong></div>
                  <div className="font-mono">{scientific.chemical_formula || '—'}</div>

                  <div><strong>Минеральная группа:</strong></div>
                  <div>{scientific.mineral_group}</div>

                  <div><strong>Кристаллическая система:</strong></div>
                  <div>{scientific.crystal_system}</div>

                  <div><strong>Твёрдость (Моос):</strong></div>
                  <div>{scientific.hardness.min} – {scientific.hardness.max}</div>

                  <div><strong>Удельный вес:</strong></div>
                  <div>{scientific.specific_gravity.min} – {scientific.specific_gravity.max}</div>

                  <div><strong>Редкость:</strong></div>
                  <div><Badge variant="secondary">{scientific.rarity}</Badge></div>
                </div>

                {scientific.composition && (
                  <div>
                    <strong>Состав:</strong>
                    <p className="mt-1 text-slate-300">{scientific.composition}</p>
                  </div>
                )}

                {scientific.phenomena && scientific.phenomena.length > 0 && (
                  <div>
                    <strong>Оптические и физические явления:</strong>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {scientific.phenomena.map((phen, i) => (
                        <Badge key={i} variant="outline" className="text-amber-400 border-amber-400/30 px-3 py-1">
                          {phen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {scientific.identification_tips && (
                  <div>
                    <strong>Советы по идентификации:</strong>
                    <p className="mt-2 text-slate-300 leading-relaxed">
                      {scientific.identification_tips}
                    </p>
                  </div>
                )}

                {mineral.safety_notes && (
                  <div className="pt-4 border-t border-rose-900/50 bg-rose-950/30 p-4 rounded-xl">
                    <strong className="text-rose-400">⚠️ Безопасность и уход:</strong>
                    <p className="mt-2 text-rose-300/90 text-sm leading-relaxed">
                      {mineral.safety_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Месторождения */}
            <Card>
              <CardHeader>
                <CardTitle>Месторождения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mineral.localities.length > 0 ? (
                  mineral.localities.map((loc, i) => (
                    <div key={i} className="p-5 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-lg">{loc.locality}</div>
                          <div className="text-slate-400">{loc.region}, {loc.country}</div>
                        </div>
                        {loc.is_russian && <Badge variant="default">Россия</Badge>}
                        {loc.famous && <Badge variant="outline">Знаменитое</Badge>}
                      </div>
                      {loc.description_ru && (
                        <p className="mt-4 text-slate-300 leading-relaxed">
                          {loc.description_ru}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 py-8 text-center">Месторождения не указаны</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Связанные минералы */}
          {mineral.related_minerals && mineral.related_minerals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Связанные минералы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {mineral.related_minerals.map((rel, i) => (
                    <Badge key={i} variant="secondary" className="text-base px-4 py-2">
                      {rel}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== LORE ==================== */}
        <TabsContent value="lore">
          <Card>
            <CardContent className="pt-8">
              <h3 className="text-2xl font-semibold mb-6">Историко-культурный контекст</h3>
              <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                <p className="whitespace-pre-wrap">{ru.lore}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ЭЗОТЕРИКА ==================== */}
        <TabsContent value="esoteric">
          {ru?.esoteric && (
            (ru.esoteric.metaphysical_properties?.length ?? 0) > 0 ||
            (ru.esoteric.chakras?.length ?? 0) > 0 ||
            (ru.esoteric.zodiac?.length ?? 0) > 0 ||
            ru.esoteric.healing_interpretation ||
            ru.esoteric.energy_notes ||
            ru.esoteric.ritual_uses
          ) ? (
            <Card>
              <CardContent className="pt-8 space-y-10">
                {/* Метафизические свойства */}
                {ru.esoteric.metaphysical_properties?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Метафизические свойства</h3>
                    <div className="flex flex-wrap gap-3">
                      {ru.esoteric.metaphysical_properties.map((prop, i) => (
                        <Badge key={i} variant="outline" className="text-base px-5 py-2">
                          {prop}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Чакры + Зодиак */}
                {(ru.esoteric.chakras?.length > 0 || ru.esoteric.zodiac?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {ru.esoteric.chakras?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Чакры</h4>
                        <p className="text-lg">{ru.esoteric.chakras.join(', ')}</p>
                      </div>
                    )}
                    {ru.esoteric.zodiac?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Знаки зодиака</h4>
                        <p className="text-lg">{ru.esoteric.zodiac.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Интерпретации */}
                {(ru.esoteric.healing_interpretation || ru.esoteric.energy_notes || ru.esoteric.ritual_uses) && (
                  <div className="space-y-6">
                    {ru.esoteric.healing_interpretation && (
                      <div>
                        <h4 className="font-medium mb-3">Исцеление</h4>
                        <p className="text-slate-300 leading-relaxed">{ru.esoteric.healing_interpretation}</p>
                      </div>
                    )}
                    {ru.esoteric.energy_notes && (
                      <div>
                        <h4 className="font-medium mb-3">Энергетика</h4>
                        <p className="text-slate-300 leading-relaxed">{ru.esoteric.energy_notes}</p>
                      </div>
                    )}
                    {ru.esoteric.ritual_uses && (
                      <div>
                        <h4 className="font-medium mb-3">Ритуальное использование</h4>
                        <p className="text-slate-300 leading-relaxed">{ru.esoteric.ritual_uses}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-20 pb-20 text-center text-slate-500">
                Эзотерический блок для этого камня пока не заполнен
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== ГАЛЕРЕЯ ==================== */}
        <TabsContent value="gallery">
          {mineral.gallery && mineral.gallery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mineral.gallery.map((img, i) => (
                <Card key={i} className="overflow-hidden">
                  <img 
                    src={typeof img === 'string' ? img : img.url} 
                    alt={typeof img === 'string' ? '' : (img.description_ru || '')} 
                    className="w-full aspect-video object-cover" 
                  />
                  {typeof img !== 'string' && (
                    <CardContent className="p-4">
                      {img.type && <Badge variant="secondary" className="mb-2">{img.type}</Badge>}
                      {img.description_ru && <p className="text-sm text-slate-400">{img.description_ru}</p>}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-20">Галерея пока пуста</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}