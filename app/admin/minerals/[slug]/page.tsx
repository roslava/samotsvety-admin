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
    mineralClass: 'Химический класс',
    silicateSubclass: 'Подкласс силикатов',
    mineralFamily: 'Коллекционная группа',
    crystalSystem: 'Кристаллическая система',
    crystalHabit: 'Габитус',
    hardness: 'Твёрдость (Моос)',
    specificGravity: 'Удельный вес',
    streak: 'Цвет черты',
    luster: 'Блеск',
    transparency: 'Прозрачность',
    cleavageDegree: 'Спайность (степень)',
    cleavageDirection: 'Направления спайности',
    cleavageType: 'Тип спайности',
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
    mineralClass: 'Chemical class',
    silicateSubclass: 'Silicate subclass',
    mineralFamily: 'Collector group',
    crystalSystem: 'Crystal system',
    crystalHabit: 'Crystal habit',
    hardness: 'Hardness (Mohs)',
    specificGravity: 'Specific gravity',
    streak: 'Streak',
    luster: 'Luster',
    transparency: 'Transparency',
    cleavageDegree: 'Cleavage (degree)',
    cleavageDirection: 'Cleavage directions',
    cleavageType: 'Cleavage type',
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

// scientific.crystal_system/streak/fracture/cleavage_* — языконезависимые
// коды (как rarity), поэтому подпись для отображения берётся отсюда, а не
// из t?.<field> — того текста в i18n для них больше нет.
const CRYSTAL_SYSTEM_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    monoclinic: 'Моноклинная',
    orthorhombic: 'Ромбическая',
    hexagonal: 'Гексагональная',
    isometric: 'Кубическая',
    triclinic: 'Триклинная',
    tetragonal: 'Тетрагональная',
    amorphous: 'Аморфная',
  },
  en: {
    monoclinic: 'Monoclinic',
    orthorhombic: 'Orthorhombic',
    hexagonal: 'Hexagonal',
    isometric: 'Isometric',
    triclinic: 'Triclinic',
    tetragonal: 'Tetragonal',
    amorphous: 'Amorphous',
  },
};

const STREAK_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    black: 'Чёрная',
    white_or_colourless: 'Белая или бесцветная',
    grey: 'Серая',
    green: 'Зелёная',
    blue: 'Синяя',
    brown: 'Коричневая',
    pink_to_red: 'От розовой до красной',
    yellow_to_orange: 'От жёлтой до оранжевой',
  },
  en: {
    black: 'Black',
    white_or_colourless: 'White or colourless',
    grey: 'Grey',
    green: 'Green',
    blue: 'Blue',
    brown: 'Brown',
    pink_to_red: 'Pink to Red',
    yellow_to_orange: 'Yellow to Orange',
  },
};

const FRACTURE_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    conchoidal: 'Раковистый',
    uneven: 'Неровный',
    splintery: 'Занозистый',
    hackly: 'Крючковатый',
    earthy: 'Землистый',
    fibrous: 'Волокнистый',
  },
  en: {
    conchoidal: 'Conchoidal',
    uneven: 'Uneven',
    splintery: 'Splintery',
    hackly: 'Hackly',
    earthy: 'Earthy',
    fibrous: 'Fibrous',
  },
};

const CLEAVAGE_DEGREE_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    none: 'Нет',
    very_poor: 'Очень несовершенная',
    poor: 'Несовершенная',
    good: 'Хорошая',
    perfect: 'Совершенная',
  },
  en: {
    none: 'None',
    very_poor: 'Very poor',
    poor: 'Poor',
    good: 'Good',
    perfect: 'Perfect',
  },
};

// Направление показывается, только если степень спайности не 'none' —
// при none количество направлений неприменимо по определению.
const CLEAVAGE_DIRECTION_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    '1': '1 направление',
    '2': '2 направления',
    '3': '3 направления',
    '4': '4 направления',
  },
  en: {
    '1': '1 direction',
    '2': '2 directions',
    '3': '3 directions',
    '4': '4 directions',
  },
};

const CLEAVAGE_TYPE_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    basal: 'Базальная',
    prismatic: 'Призматическая',
    pinacoidal: 'Пинакоидальная',
    rhombohedral: 'Ромбоэдрическая',
    cubic: 'Кубическая',
    octahedral: 'Октаэдрическая',
    dodecahedral: 'Додекаэдрическая',
  },
  en: {
    basal: 'Basal',
    prismatic: 'Prismatic',
    pinacoidal: 'Pinacoidal',
    rhombohedral: 'Rhombohedral',
    cubic: 'Cubic',
    octahedral: 'Octahedral',
    dodecahedral: 'Dodecahedral',
  },
};

const TRANSPARENCY_LABELS: Record<Lang, Record<string, string>> = {
  ru: { transparent: 'Прозрачный', translucent: 'Полупрозрачный', opaque: 'Непрозрачный' },
  en: { transparent: 'Transparent', translucent: 'Translucent', opaque: 'Opaque' },
};

// Атомарные термины — образец может иметь несколько значений сразу
// (напр. luster: ['vitreous', 'silky']), рендерится через join.
const LUSTER_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    vitreous: 'Стеклянный',
    adamantine: 'Алмазный',
    metallic: 'Металлический',
    submetallic: 'Полуметаллический',
    pearly: 'Перламутровый',
    silky: 'Шелковистый',
    resinous: 'Смолистый',
    greasy: 'Жирный',
    waxy: 'Восковой',
    dull: 'Тусклый',
    earthy: 'Землистый',
  },
  en: {
    vitreous: 'Vitreous',
    adamantine: 'Adamantine',
    metallic: 'Metallic',
    submetallic: 'Submetallic',
    pearly: 'Pearly',
    silky: 'Silky',
    resinous: 'Resinous',
    greasy: 'Greasy',
    waxy: 'Waxy',
    dull: 'Dull',
    earthy: 'Earthy',
  },
};

const TENACITY_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    brittle: 'Хрупкий',
    malleable: 'Ковкий',
    ductile: 'Тягучий',
    sectile: 'Секущийся',
    flexible: 'Гибкий',
    elastic: 'Эластичный',
  },
  en: {
    brittle: 'Brittle',
    malleable: 'Malleable',
    ductile: 'Ductile',
    sectile: 'Sectile',
    flexible: 'Flexible',
    elastic: 'Elastic',
  },
};

// Только статус вида по IMA (approved/grandfathered/questionable/discredited) —
// формальные термины, используются как есть в обеих локалях, как rarity.
// Именно статус вида по IMA. Подписи теперь по-настоящему переведены на RU
// (было: одинаковый английский текст в обеих локалях) — как и остальные
// enum-словари на этой странице (CRYSTAL_SYSTEM_LABELS и т.д.).
const IMA_STATUS_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    approved: 'Утверждён',
    grandfathered: 'Узаконен исторически',
    questionable: 'Под вопросом',
    discredited: 'Дискредитирован',
  },
  en: { approved: 'Approved', grandfathered: 'Grandfathered', questionable: 'Questionable', discredited: 'Discredited' },
};

const RARITY_LABELS: Record<Lang, Record<string, string>> = {
  ru: { common: 'Обычный', uncommon: 'Нечастый', rare: 'Редкий', very_rare: 'Очень редкий' },
  en: { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', very_rare: 'Very Rare' },
};

const ROCK_TYPE_LABELS: Record<Lang, Record<string, string>> = {
  ru: { igneous: 'Магматическая', sedimentary: 'Осадочная', metamorphic: 'Метаморфическая' },
  en: { igneous: 'Igneous', sedimentary: 'Sedimentary', metamorphic: 'Metamorphic' },
};

// Иридесценция = «переливчатость» — один код. Лабрадоресценция — частный
// случай шиллер-эффекта у лабрадорита, отдельно не дублируется.
const PHENOMENON_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    asterism: 'Астеризм',
    iridescence: 'Иридесценция',
    aventurescence: 'Авантюресценция',
    adularescence: 'Адуляресценция',
    labradorescence: 'Лабрадоресценция',
    chatoyancy: 'Кошачий глаз',
    opalescence: 'Опалесценция',
    color_change: 'Цветовая смена',
  },
  en: {
    asterism: 'Asterism',
    iridescence: 'Iridescence',
    aventurescence: 'Aventurescence',
    adularescence: 'Adularescence',
    labradorescence: 'Labradorescence',
    chatoyancy: 'Chatoyancy',
    opalescence: 'Opalescence',
    color_change: 'Color change',
  },
};

const MINERAL_CLASS_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    native_elements: 'Самородные элементы',
    sulfides_sulfosalts: 'Сульфиды и сульфосоли',
    halides: 'Галогениды',
    oxides_hydroxides: 'Оксиды и гидроксиды',
    carbonates_nitrates: 'Карбонаты и нитраты',
    borates: 'Бораты',
    sulfates_chromates_molybdates_tungstates: 'Сульфаты, хроматы, молибдаты, вольфраматы',
    phosphates_arsenates_vanadates: 'Фосфаты, арсенаты, ванадаты',
    silicates: 'Силикаты',
    organic: 'Органические минералы',
  },
  en: {
    native_elements: 'Native elements',
    sulfides_sulfosalts: 'Sulfides and sulfosalts',
    halides: 'Halides',
    oxides_hydroxides: 'Oxides and hydroxides',
    carbonates_nitrates: 'Carbonates and nitrates',
    borates: 'Borates',
    sulfates_chromates_molybdates_tungstates: 'Sulfates, chromates, molybdates, tungstates',
    phosphates_arsenates_vanadates: 'Phosphates, arsenates, vanadates',
    silicates: 'Silicates',
    organic: 'Organic minerals',
  },
};

const SILICATE_SUBCLASS_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    nesosilicates: 'Несосиликаты (островные)',
    sorosilicates: 'Соросиликаты (групповые)',
    cyclosilicates: 'Циклосиликаты (кольцевые)',
    inosilicates: 'Иносиликаты (цепочечные)',
    phyllosilicates: 'Филлосиликаты (слоистые)',
    tectosilicates: 'Тектосиликаты (каркасные)',
  },
  en: {
    nesosilicates: 'Nesosilicates',
    sorosilicates: 'Sorosilicates',
    cyclosilicates: 'Cyclosilicates',
    inosilicates: 'Inosilicates',
    phyllosilicates: 'Phyllosilicates',
    tectosilicates: 'Tectosilicates',
  },
};

const MINERAL_FAMILY_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
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
  },
  en: {
    garnet_group: 'Garnet group',
    feldspar_group: 'Feldspar group',
    quartz_group: 'Quartz group',
    tourmaline_group: 'Tourmaline group',
    mica_group: 'Mica group',
    pyroxene_group: 'Pyroxene group',
    amphibole_group: 'Amphibole group',
    zeolite_group: 'Zeolite group',
    beryl_group: 'Beryl group',
    spinel_group: 'Spinel group',
    corundum_group: 'Corundum group',
    calcite_group: 'Calcite group',
  },
};

// Почти всегда комбинация нескольких форм сразу — рендерится через join.
const CRYSTAL_HABIT_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    prismatic: 'Призматический',
    acicular: 'Игольчатый',
    tabular: 'Таблитчатый',
    platy: 'Пластинчатый',
    foliated: 'Листоватый',
    fibrous: 'Волокнистый',
    granular: 'Зернистый',
    massive: 'Массивный',
    druzy: 'Друзовый',
    radiating: 'Радиально-лучистый',
    globular: 'Шаровидный',
    reniform: 'Почковидный',
    botryoidal: 'Ботриоидальный',
    columnar: 'Столбчатый',
    cubic: 'Кубический',
    rhombohedral: 'Ромбический',
    dendritic: 'Дендритный',
    earthy: 'Землистый',
  },
  en: {
    prismatic: 'Prismatic',
    acicular: 'Acicular',
    tabular: 'Tabular',
    platy: 'Platy',
    foliated: 'Foliated',
    fibrous: 'Fibrous',
    granular: 'Granular',
    massive: 'Massive',
    druzy: 'Druzy',
    radiating: 'Radiating',
    globular: 'Globular',
    reniform: 'Reniform',
    botryoidal: 'Botryoidal',
    columnar: 'Columnar',
    cubic: 'Cubic',
    rhombohedral: 'Rhombohedral',
    dendritic: 'Dendritic',
    earthy: 'Earthy',
  },
};

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
    scientific.hardness_note ? ` (${scientific.hardness_note})` : ''
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
          <div className="flex rounded-full border border-[var(--color-sage-mist)] overflow-hidden">
            <button
              type="button"
              onClick={() => setLang('ru')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                lang === 'ru'
                  ? 'bg-[var(--color-inkwell-teal)] text-[var(--color-paper-white)]'
                  : 'bg-[var(--color-bone)] text-[var(--color-slate-veil)] hover:text-[var(--color-inkwell-teal)]'
              }`}
            >
              🇷🇺 RU
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                lang === 'en'
                  ? 'bg-[var(--color-inkwell-teal)] text-[var(--color-paper-white)]'
                  : 'bg-[var(--color-bone)] text-[var(--color-slate-veil)] hover:text-[var(--color-inkwell-teal)]'
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
        <Gem className="h-8 w-8 text-[var(--color-vellum-lavender)]" />
        <div>
          <h1 className="text-5xl font-bold text-[var(--color-inkwell-teal)]">{t?.name || mineral.slug}</h1>
          <p className="text-xl text-[var(--color-slate-veil)]">/{mineral.slug}</p>
        </div>
        {mineral.type && (
          <Badge variant="outline" className="ml-auto rounded-full border-[var(--color-sage-mist)] text-[var(--color-inkwell-teal)] text-lg px-4 py-1">
            {typeLabel}
          </Badge>
        )}
      </div>

      {mineral.main_image_url && (
        <div className="mb-12 rounded-3xl overflow-hidden border border-[var(--color-sage-mist)]">
          <img
            src={mineral.main_image_url}
            alt={t?.name || mineral.slug}
            className="w-full max-h-[520px] object-contain bg-[var(--color-driftwood)]"
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
                  <Row
                    label={ui.mineralClass}
                    value={
                      scientific.mineral_class
                        ? MINERAL_CLASS_LABELS[lang][scientific.mineral_class]
                        : undefined
                    }
                  />
                  {scientific.mineral_class === 'silicates' && (
                    <Row
                      label={ui.silicateSubclass}
                      value={
                        scientific.silicate_subclass
                          ? SILICATE_SUBCLASS_LABELS[lang][scientific.silicate_subclass]
                          : undefined
                      }
                    />
                  )}
                  <Row
                    label={ui.mineralFamily}
                    value={
                      scientific.mineral_family
                        ? MINERAL_FAMILY_LABELS[lang][scientific.mineral_family]
                        : undefined
                    }
                  />
                  <Row
                    label={ui.crystalSystem}
                    value={
                      scientific.crystal_system
                        ? CRYSTAL_SYSTEM_LABELS[lang][scientific.crystal_system]
                        : undefined
                    }
                  />
                  <Row
                    label={ui.crystalHabit}
                    value={
                      scientific.crystal_habit && scientific.crystal_habit.length > 0
                        ? scientific.crystal_habit.map((v) => CRYSTAL_HABIT_LABELS[lang][v]).join(', ')
                        : undefined
                    }
                  />
                  <Row label={ui.hardness} value={hardnessText} />
                  <Row label={ui.specificGravity} value={sgText} />
                  <Row
                    label={ui.streak}
                    value={scientific.streak ? STREAK_LABELS[lang][scientific.streak] : undefined}
                  />
                  <Row
                    label={ui.luster}
                    value={
                      scientific.luster && scientific.luster.length > 0
                        ? scientific.luster.map((v) => LUSTER_LABELS[lang][v]).join(', ')
                        : undefined
                    }
                  />
                  <Row
                    label={ui.transparency}
                    value={
                      scientific.transparency
                        ? TRANSPARENCY_LABELS[lang][scientific.transparency]
                        : undefined
                    }
                  />
                  <Row
                    label={ui.cleavageDegree}
                    value={
                      scientific.cleavage_degree
                        ? CLEAVAGE_DEGREE_LABELS[lang][scientific.cleavage_degree]
                        : undefined
                    }
                  />
                  {scientific.cleavage_degree && scientific.cleavage_degree !== 'none' && (
                    <Row
                      label={ui.cleavageDirection}
                      value={
                        scientific.cleavage_direction
                          ? CLEAVAGE_DIRECTION_LABELS[lang][scientific.cleavage_direction]
                          : undefined
                      }
                    />
                  )}
                  <Row
                    label={ui.cleavageType}
                    value={
                      scientific.cleavage_type
                        ? CLEAVAGE_TYPE_LABELS[lang][scientific.cleavage_type]
                        : undefined
                    }
                  />
                  <Row
                    label={ui.fracture}
                    value={scientific.fracture ? FRACTURE_LABELS[lang][scientific.fracture] : undefined}
                  />
                  <Row
                    label={ui.tenacity}
                    value={
                      scientific.tenacity && scientific.tenacity.length > 0
                        ? scientific.tenacity.map((v) => TENACITY_LABELS[lang][v]).join(', ')
                        : undefined
                    }
                  />
                  <div>
                    <strong>{ui.rarity}:</strong>
                  </div>
                  <div>
                    <Badge variant="secondary">{RARITY_LABELS[lang][scientific.rarity]}</Badge>
                  </div>
                  <Row
                    label={ui.imaStatus}
                    value={scientific.ima_status ? IMA_STATUS_LABELS[lang][scientific.ima_status] : undefined}
                  />
                  <Row
                    label={ui.rockType}
                    value={scientific.rock_type ? ROCK_TYPE_LABELS[lang][scientific.rock_type] : undefined}
                  />
                </div>

                <div>
                  <strong>{ui.colorDescription}:</strong>
                  <p className="mt-1 text-[var(--color-slate-veil)]">{t?.color_description || '—'}</p>
                </div>

                <div>
                  <strong>{ui.composition}:</strong>
                  <p className="mt-1 text-[var(--color-slate-veil)]">{scientific.composition || '—'}</p>
                </div>

                <div>
                  <strong>{ui.phenomena}:</strong>
                  {scientific.phenomena && scientific.phenomena.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {scientific.phenomena.map((phen) => (
                        <Badge
                          key={phen}
                          variant="outline"
                          className="rounded-full text-amber-700 border-amber-300 bg-amber-50 px-3 py-1"
                        >
                          {PHENOMENON_LABELS[lang][phen]}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-[var(--color-slate-veil)]">—</p>
                  )}
                </div>

                <div>
                  <strong>{ui.identificationTips}:</strong>
                  <p className="mt-2 text-[var(--color-slate-veil)] leading-relaxed">
                    {t?.identification_tips || '—'}
                  </p>
                </div>

                <div className="pt-4 border-t border-red-200 bg-red-50 p-4 rounded-xl">
                  <strong className="text-red-700">{ui.safety}:</strong>
                  <p className="mt-2 text-red-700/80 text-sm leading-relaxed">
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
                        className="p-5 bg-[var(--color-bone)] rounded-2xl border border-[var(--color-sage-mist)]"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-lg text-[var(--color-inkwell-teal)]">{localityName || '—'}</div>
                            <div className="text-[var(--color-slate-veil)]">
                              {[region, country].filter(Boolean).join(', ')}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {loc.is_russian && <Badge variant="default" className="rounded-full">{ui.russia}</Badge>}
                            {loc.famous && <Badge variant="outline" className="rounded-full">{ui.famous}</Badge>}
                          </div>
                        </div>
                        {description && (
                          <p className="mt-4 text-[var(--color-slate-veil)] leading-relaxed">{description}</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[var(--color-slate-veil)] py-8 text-center">{ui.localitiesEmpty}</p>
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
              <h3 className="text-2xl font-semibold mb-6 text-[var(--color-inkwell-teal)]">{ui.loreTitle}</h3>
              <div className="prose max-w-none text-lg leading-relaxed text-[var(--color-inkwell-teal)]">
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
                        <p className="text-[var(--color-slate-veil)] leading-relaxed">
                          {esoteric.healing_interpretation}
                        </p>
                      </div>
                    )}
                    {esoteric.energy_notes && (
                      <div>
                        <h4 className="font-medium mb-3">{ui.energy}</h4>
                        <p className="text-[var(--color-slate-veil)] leading-relaxed">{esoteric.energy_notes}</p>
                      </div>
                    )}
                    {esoteric.ritual_uses && (
                      <div>
                        <h4 className="font-medium mb-3">{ui.ritual}</h4>
                        <p className="text-[var(--color-slate-veil)] leading-relaxed">{esoteric.ritual_uses}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-20 pb-20 text-center text-[var(--color-slate-veil)]">
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
                          <p className="text-sm text-[var(--color-slate-veil)]">{description}</p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-[var(--color-slate-veil)] text-center py-20">{ui.galleryEmpty}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}