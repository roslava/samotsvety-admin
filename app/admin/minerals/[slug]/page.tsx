'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Mineral, Lang } from '@/types/mineral';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Edit, ArrowLeft, Gem } from 'lucide-react';

const UI = {
  ru: {
    back: 'Назад',
    edit: 'Редактировать',
    loading: 'Загрузка минерала...',
    notFound: 'Минерал не найден',
    tabInfo: 'Основная информация',
    tabLore: 'Lore',
    tabEsoteric: 'Эзотерика',
    tabGallery: 'Галерея',
    scientificTitle: 'Научные свойства',
    chemicalFormula: 'Химическая формула',
    mineralGroup: 'Минеральная группа',
    crystalSystem: 'Кристаллическая система',
    crystalHabit: 'Габитус',
    hardness: 'Твёрдость (Моос)',
    specificGravity: 'Удельный вес',
    streak: 'Цвет черты',
    luster: 'Блеск',
    transparency: 'Прозрачность',
    cleavage: 'Спайность',
    fracture: 'Излом',
    tenacity: 'Вязкость',
    rarity: 'Редкость',
    imaStatus: 'Статус IMA',
    rockType: 'Тип породы',
    colorDescription: 'Описание цвета',
    composition: 'Состав',
    phenomena: 'Оптические и физические явления',
    identificationTips: 'Советы по идентификации',
    safety: '⚠️ Безопасность и уход',
    localitiesTitle: 'Месторождения',
    localitiesEmpty: 'Месторождения не указаны',
    russia: 'Россия',
    famous: 'Знаменитое',
    relatedTitle: 'Связанные минералы',
    loreTitle: 'Историко-культурный контекст',
    metaphysical: 'Метафизические свойства',
    chakras: 'Чакры',
    zodiac: 'Знаки зодиака',
    healing: 'Исцеление',
    energy: 'Энергетика',
    ritual: 'Ритуальное использование',
    esotericEmpty: 'Эзотерический блок для этого камня пока не заполнен',
    galleryEmpty: 'Галерея пока пуста',
    typeMineral: 'Минерал',
    typeVariety: 'Разновидность',
    typeRock: 'Горная порода',
  },
  en: {
    back: 'Back',
    edit: 'Edit',
    loading: 'Loading mineral...',
    notFound: 'Mineral not found',
    tabInfo: 'Overview',
    tabLore: 'Lore',
    tabEsoteric: 'Esoteric',
    tabGallery: 'Gallery',
    scientificTitle: 'Scientific properties',
    chemicalFormula: 'Chemical formula',
    mineralGroup: 'Mineral group',
    crystalSystem: 'Crystal system',
    crystalHabit: 'Crystal habit',
    hardness: 'Hardness (Mohs)',
    specificGravity: 'Specific gravity',
    streak: 'Streak',
    luster: 'Luster',
    transparency: 'Transparency',
    cleavage: 'Cleavage',
    fracture: 'Fracture',
    tenacity: 'Tenacity',
    rarity: 'Rarity',
    imaStatus: 'IMA status',
    rockType: 'Rock type',
    colorDescription: 'Color description',
    composition: 'Composition',
    phenomena: 'Optical & physical phenomena',
    identificationTips: 'Identification tips',
    safety: '⚠️ Safety & care',
    localitiesTitle: 'Localities',
    localitiesEmpty: 'No localities listed',
    russia: 'Russia',
    famous: 'Famous',
    relatedTitle: 'Related minerals',
    loreTitle: 'Historical & cultural context',
    metaphysical: 'Metaphysical properties',
    chakras: 'Chakras',
    zodiac: 'Zodiac signs',
    healing: 'Healing',
    energy: 'Energy notes',
    ritual: 'Ritual uses',
    esotericEmpty: 'Esoteric block is not filled for this stone yet',
    galleryEmpty: 'Gallery is empty',
    typeMineral: 'Mineral',
    typeVariety: 'Gem variety',
    typeRock: 'Rock',
  },
} as const;

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <>
      <div>
        <strong>{label}:</strong>
      </div>
      <div>{value && value.trim() ? value : '—'}</div>
    </>
  );
}

export default function MineralViewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [mineral, setMineral] = useState<Mineral | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>('ru');

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

  const ui = UI[lang];

  if (loading) return <div className="p-8 text-center">{ui.loading}</div>;
  if (!mineral) return <div className="p-8 text-center">{ui.notFound}</div>;

  const t = mineral.i18n?.[lang] ?? mineral.i18n?.ru;
  const scientific = mineral.scientific;
  const esoteric = t?.esoteric;

  const hasEsoteric =
    !!esoteric &&
    ((esoteric.metaphysical_properties?.length ?? 0) > 0 ||
      (esoteric.chakras?.length ?? 0) > 0 ||
      (esoteric.zodiac?.length ?? 0) > 0 ||
      !!esoteric.healing_interpretation ||
      !!esoteric.energy_notes ||
      !!esoteric.ritual_uses);

  const typeLabel =
    mineral.type === 'mineral'
      ? ui.typeMineral
      : mineral.type === 'gem_variety'
        ? ui.typeVariety
        : mineral.type === 'rock'
          ? ui.typeRock
          : mineral.type;

  const hardnessText = `${scientific.hardness.min} – ${scientific.hardness.max}${
    t?.hardness_note ? ` (${t.hardness_note})` : ''
  }`;

  const sgText = `${scientific.specific_gravity.min} – ${scientific.specific_gravity.max}`;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          {ui.back}
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setLang('ru')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                lang === 'ru'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              🇷🇺 RU
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                lang === 'en'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <Link href={`/admin/minerals/${slug}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              {ui.edit}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <Gem className="h-8 w-8 text-emerald-500" />
        <div>
          <h1 className="text-5xl font-bold">{t?.name || mineral.slug}</h1>
          <p className="text-xl text-slate-400">/{mineral.slug}</p>
        </div>
        {mineral.type && (
          <Badge variant="outline" className="ml-auto text-lg px-4 py-1">
            {typeLabel}
          </Badge>
        )}
      </div>

      {mineral.main_image_url && (
        <div className="mb-12 rounded-3xl overflow-hidden border border-slate-700">
          <img
            src={mineral.main_image_url}
            alt={t?.name || mineral.slug}
            className="w-full max-h-[520px] object-contain bg-slate-950"
          />
        </div>
      )}

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="info">{ui.tabInfo}</TabsTrigger>
          <TabsTrigger value="lore">{ui.tabLore}</TabsTrigger>
          <TabsTrigger value="esoteric">{ui.tabEsoteric}</TabsTrigger>
          <TabsTrigger value="gallery">{ui.tabGallery}</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{ui.scientificTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <Row label={ui.chemicalFormula} value={scientific.chemical_formula} />
                  <Row label={ui.mineralGroup} value={t?.mineral_group} />
                  <Row label={ui.crystalSystem} value={t?.crystal_system} />
                  <Row label={ui.crystalHabit} value={t?.crystal_habit} />
                  <Row label={ui.hardness} value={hardnessText} />
                  <Row label={ui.specificGravity} value={sgText} />
                  <Row label={ui.streak} value={t?.streak} />
                  <Row label={ui.luster} value={t?.luster} />
                  <Row label={ui.transparency} value={t?.transparency} />
                  <Row label={ui.cleavage} value={t?.cleavage} />
                  <Row label={ui.fracture} value={t?.fracture} />
                  <Row label={ui.tenacity} value={t?.tenacity} />
                  <div>
                    <strong>{ui.rarity}:</strong>
                  </div>
                  <div>
                    <Badge variant="secondary">{scientific.rarity}</Badge>
                  </div>
                  <Row label={ui.imaStatus} value={t?.ima_status} />
                  <Row label={ui.rockType} value={t?.rock_type} />
                </div>

                <div>
                  <strong>{ui.colorDescription}:</strong>
                  <p className="mt-1 text-slate-300">{t?.color_description || '—'}</p>
                </div>

                <div>
                  <strong>{ui.composition}:</strong>
                  <p className="mt-1 text-slate-300">{t?.composition || '—'}</p>
                </div>

                <div>
                  <strong>{ui.phenomena}:</strong>
                  {t?.phenomena && t.phenomena.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {t.phenomena.map((phen, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-amber-400 border-amber-400/30 px-3 py-1"
                        >
                          {phen}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-slate-300">—</p>
                  )}
                </div>

                <div>
                  <strong>{ui.identificationTips}:</strong>
                  <p className="mt-2 text-slate-300 leading-relaxed">
                    {t?.identification_tips || '—'}
                  </p>
                </div>

                <div className="pt-4 border-t border-rose-900/50 bg-rose-950/30 p-4 rounded-xl">
                  <strong className="text-rose-400">{ui.safety}:</strong>
                  <p className="mt-2 text-rose-300/90 text-sm leading-relaxed">
                    {t?.safety_notes || '—'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{ui.localitiesTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mineral.localities && mineral.localities.length > 0 ? (
                  mineral.localities.map((loc, i) => {
                    const localityName =
                      lang === 'en'
                        ? loc.locality_en || loc.locality_ru
                        : loc.locality_ru || loc.locality_en;
                    const region =
                      lang === 'en'
                        ? loc.region_en || loc.region_ru
                        : loc.region_ru || loc.region_en;
                    const country =
                      lang === 'en'
                        ? loc.country_en || loc.country_ru
                        : loc.country_ru || loc.country_en;
                    const description =
                      lang === 'en'
                        ? loc.description_en || loc.description_ru
                        : loc.description_ru || loc.description_en;

                    return (
                      <div
                        key={i}
                        className="p-5 bg-slate-950 rounded-2xl border border-slate-800"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-lg">{localityName || '—'}</div>
                            <div className="text-slate-400">
                              {[region, country].filter(Boolean).join(', ')}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {loc.is_russian && <Badge variant="default">{ui.russia}</Badge>}
                            {loc.famous && <Badge variant="outline">{ui.famous}</Badge>}
                          </div>
                        </div>
                        {description && (
                          <p className="mt-4 text-slate-300 leading-relaxed">{description}</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 py-8 text-center">{ui.localitiesEmpty}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {mineral.related_minerals && mineral.related_minerals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{ui.relatedTitle}</CardTitle>
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

        <TabsContent value="lore">
          <Card>
            <CardContent className="pt-8">
              <h3 className="text-2xl font-semibold mb-6">{ui.loreTitle}</h3>
              <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                <p className="whitespace-pre-wrap">{t?.lore || '—'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esoteric">
          {hasEsoteric && esoteric ? (
            <Card>
              <CardContent className="pt-8 space-y-10">
                {esoteric.metaphysical_properties &&
                  esoteric.metaphysical_properties.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">{ui.metaphysical}</h3>
                      <div className="flex flex-wrap gap-3">
                        {esoteric.metaphysical_properties.map((prop, i) => (
                          <Badge key={i} variant="outline" className="text-base px-5 py-2">
                            {prop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {((esoteric.chakras?.length ?? 0) > 0 ||
                  (esoteric.zodiac?.length ?? 0) > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(esoteric.chakras?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">{ui.chakras}</h4>
                        <p className="text-lg">{esoteric.chakras!.join(', ')}</p>
                      </div>
                    )}
                    {(esoteric.zodiac?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">{ui.zodiac}</h4>
                        <p className="text-lg">{esoteric.zodiac!.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {(esoteric.healing_interpretation ||
                  esoteric.energy_notes ||
                  esoteric.ritual_uses) && (
                  <div className="space-y-6">
                    {esoteric.healing_interpretation && (
                      <div>
                        <h4 className="font-medium mb-3">{ui.healing}</h4>
                        <p className="text-slate-300 leading-relaxed">
                          {esoteric.healing_interpretation}
                        </p>
                      </div>
                    )}
                    {esoteric.energy_notes && (
                      <div>
                        <h4 className="font-medium mb-3">{ui.energy}</h4>
                        <p className="text-slate-300 leading-relaxed">{esoteric.energy_notes}</p>
                      </div>
                    )}
                    {esoteric.ritual_uses && (
                      <div>
                        <h4 className="font-medium mb-3">{ui.ritual}</h4>
                        <p className="text-slate-300 leading-relaxed">{esoteric.ritual_uses}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-20 pb-20 text-center text-slate-500">
                {ui.esotericEmpty}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gallery">
          {mineral.gallery && mineral.gallery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mineral.gallery.map((img, i) => {
                const description =
                  typeof img === 'string'
                    ? ''
                    : lang === 'en'
                      ? img.description_en || img.description_ru || ''
                      : img.description_ru || img.description_en || '';

                return (
                  <Card key={i} className="overflow-hidden">
                    <img
                      src={typeof img === 'string' ? img : img.url}
                      alt={description}
                      className="w-full aspect-video object-cover"
                    />
                    {typeof img !== 'string' && (
                      <CardContent className="p-4">
                        {img.type && (
                          <Badge variant="secondary" className="mb-2">
                            {img.type}
                          </Badge>
                        )}
                        {description && (
                          <p className="text-sm text-slate-400">{description}</p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-20">{ui.galleryEmpty}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}