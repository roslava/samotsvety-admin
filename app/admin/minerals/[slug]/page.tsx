"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ApiValidationError } from "@/lib/api";
import { GemEntityV2Response, LocalizedContent } from "@/types/mineral";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Language = "ru" | "en";
type Row = [string, ReactNode | null | undefined];
type RelatedLookup =
  | { state: "loading" }
  | { state: "found"; entity: GemEntityV2Response }
  | { state: "not_found" }
  | { state: "error" };
const keyLabels: Record<Language, string[]> = {
  ru: [
    "Твёрдость по Моосу",
    "Плотность",
    "Редкость",
    "Прозрачность",
    "Форма выделения",
    "Блеск",
    "Характер разрушения",
    "Излом",
    "Спайность",
    "Тип породы",
  ],
  en: [
    "Mohs hardness",
    "Specific gravity",
    "Rarity",
    "Transparency",
    "Crystal habit",
    "Lustre",
    "Tenacity",
    "Fracture",
    "Cleavage",
    "Rock type",
  ],
};
const typeLabels: Record<Language, Record<string, string>> = {
  ru: {
    mineral: "Минерал",
    rock: "Горная порода",
    gem_variety: "Разновидность",
    organic: "Органический материал",
  },
  en: {
    mineral: "Mineral",
    rock: "Rock",
    gem_variety: "Gem variety",
    organic: "Organic material",
  },
};
const scientificLabels: Record<Language, Record<string, string>> = {
  ru: {
    chemical_formula: "Химическая формула",
    rarity: "Редкость",
    base_color: "Основной цвет",
    mineral_class: "Класс минерала",
    silicate_subclass: "Подкласс силикатов",
    mineral_family: "Минеральная группа",
    crystal_system: "Кристаллическая система",
    crystal_habit: "Форма выделения",
    streak: "Цвет черты",
    transparency: "Прозрачность",
    luster: "Блеск",
    tenacity: "Характер разрушения",
    fracture: "Излом",
    cleavage_degree: "Спайность",
    cleavage_direction: "Направления спайности",
    cleavage_type: "Тип спайности",
    phenomena: "Оптические эффекты",
    ima_status: "Статус IMA",
    rock_type: "Тип породы",
  },
  en: {
    chemical_formula: "Chemical formula",
    rarity: "Rarity",
    base_color: "Base colour",
    mineral_class: "Mineral class",
    silicate_subclass: "Silicate subclass",
    mineral_family: "Mineral family",
    crystal_system: "Crystal system",
    crystal_habit: "Crystal habit",
    streak: "Streak",
    transparency: "Transparency",
    luster: "Lustre",
    tenacity: "Tenacity",
    fracture: "Fracture",
    cleavage_degree: "Cleavage",
    cleavage_direction: "Cleavage directions",
    cleavage_type: "Cleavage type",
    phenomena: "Optical phenomena",
    ima_status: "IMA status",
    rock_type: "Rock type",
  },
};
const ruEnums: Record<string, string> = {
  common: "Обычный",
  uncommon: "Нечастый",
  rare: "Редкий",
  very_rare: "Очень редкий",
  red: "Красный",
  black: "Чёрный",
  bi_color: "Двухцветный",
  blue: "Синий",
  brown: "Коричневый",
  green: "Зелёный",
  yellow: "Жёлтый",
  grey: "Серый",
  purple: "Фиолетовый",
  white: "Белый",
  pink: "Розовый",
  multicolor: "Многоцветный",
  orange: "Оранжевый",
  native_elements: "Самородные элементы",
  sulfides_sulfosalts: "Сульфиды и сульфосоли",
  halides: "Галогениды",
  oxides_hydroxides: "Оксиды и гидроксиды",
  carbonates_nitrates: "Карбонаты и нитраты",
  borates: "Бораты",
  sulfates_chromates_molybdates_tungstates:
    "Сульфаты, хроматы, молибдаты и вольфраматы",
  phosphates_arsenates_vanadates: "Фосфаты, арсенаты и ванадаты",
  silicates: "Силикаты",
  organic: "Органические минералы",
  nesosilicates: "Островные силикаты",
  sorosilicates: "Групповые силикаты",
  cyclosilicates: "Кольцевые силикаты",
  inosilicates: "Цепочечные силикаты",
  phyllosilicates: "Слоистые силикаты",
  tectosilicates: "Каркасные силикаты",
  garnet_group: "Гранаты",
  feldspar_group: "Полевые шпаты",
  quartz_group: "Кварцы",
  tourmaline_group: "Турмалины",
  mica_group: "Слюды",
  pyroxene_group: "Пироксены",
  amphibole_group: "Амфиболы",
  zeolite_group: "Цеолиты",
  beryl_group: "Бериллы",
  spinel_group: "Шпинели",
  corundum_group: "Корунды",
  calcite_group: "Кальциты",
  monoclinic: "Моноклинная",
  orthorhombic: "Ромбическая",
  hexagonal: "Гексагональная",
  trigonal: "Тригональная",
  isometric: "Кубическая",
  triclinic: "Триклинная",
  tetragonal: "Тетрагональная",
  amorphous: "Аморфная",
  prismatic: "Призматический",
  acicular: "Игольчатый",
  tabular: "Таблитчатый",
  platy: "Пластинчатый",
  foliated: "Листоватый",
  fibrous: "Волокнистый",
  granular: "Зернистый",
  massive: "Массивный",
  druzy: "Друзовый",
  radiating: "Лучистый",
  globular: "Шаровидный",
  reniform: "Почковидный",
  botryoidal: "Гроздевидный",
  columnar: "Столбчатый",
  cubic: "Кубический",
  rhombohedral: "Ромбоэдрический",
  dendritic: "Дендритовый",
  earthy: "Землистый",
  white_or_colourless: "Белая или бесцветная",
  pink_to_red: "Розовая до красной",
  yellow_to_orange: "Жёлтая до оранжевой",
  transparent: "Прозрачный",
  translucent: "Просвечивающий",
  opaque: "Непрозрачный",
  vitreous: "Стеклянный",
  adamantine: "Алмазный",
  metallic: "Металлический",
  submetallic: "Полуметаллический",
  pearly: "Перламутровый",
  silky: "Шёлковистый",
  resinous: "Смолистый",
  greasy: "Жирный",
  waxy: "Восковой",
  dull: "Матовый",
  brittle: "Хрупкий",
  malleable: "Ковкий",
  ductile: "Тягучий",
  sectile: "Режется ножом",
  flexible: "Гибкий",
  elastic: "Упругий",
  conchoidal: "Раковистый",
  uneven: "Неровный",
  splintery: "Занозистый",
  hackly: "Крючковатый",
  none: "Отсутствует",
  very_poor: "Весьма несовершенная",
  poor: "Несовершенная",
  good: "Средняя",
  perfect: "Совершенная",
  basal: "Базальная",
  pinacoidal: "Пинакоидальная",
  octahedral: "Октаэдрическая",
  dodecahedral: "Додекаэдрическая",
  asterism: "Астеризм",
  iridescence: "Иризация",
  aventurescence: "Авантюресценция",
  adularescence: "Адуляресценция",
  labradorescence: "Лабрадоресценция",
  chatoyancy: "Кошачий глаз",
  opalescence: "Опалесценция",
  color_change: "Смена цвета",
  approved: "Утверждён IMA",
  grandfathered: "Признан ранее",
  questionable: "Сомнительный",
  discredited: "Дискредитирован",
  igneous: "Магматическая",
  sedimentary: "Осадочная",
  metamorphic: "Метаморфическая",
  "1": "Одно направление",
  "2": "Два направления",
  "3": "Три направления",
  "4": "Четыре направления",
};
const enEnums: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  very_rare: "Very rare",
  red: "Red",
  black: "Black",
  bi_color: "Bi-colour",
  blue: "Blue",
  brown: "Brown",
  green: "Green",
  yellow: "Yellow",
  grey: "Grey",
  purple: "Purple",
  white: "White",
  pink: "Pink",
  multicolor: "Multicolour",
  orange: "Orange",
  native_elements: "Native elements",
  sulfides_sulfosalts: "Sulfides and sulfosalts",
  halides: "Halides",
  oxides_hydroxides: "Oxides and hydroxides",
  carbonates_nitrates: "Carbonates and nitrates",
  borates: "Borates",
  sulfates_chromates_molybdates_tungstates:
    "Sulfates, chromates, molybdates and tungstates",
  phosphates_arsenates_vanadates: "Phosphates, arsenates and vanadates",
  silicates: "Silicates",
  organic: "Organic minerals",
  nesosilicates: "Nesosilicates",
  sorosilicates: "Sorosilicates",
  cyclosilicates: "Cyclosilicates",
  inosilicates: "Inosilicates",
  phyllosilicates: "Phyllosilicates",
  tectosilicates: "Tectosilicates",
  garnet_group: "Garnet group",
  feldspar_group: "Feldspar group",
  quartz_group: "Quartz group",
  tourmaline_group: "Tourmaline group",
  mica_group: "Mica group",
  pyroxene_group: "Pyroxene group",
  amphibole_group: "Amphibole group",
  zeolite_group: "Zeolite group",
  beryl_group: "Beryl group",
  spinel_group: "Spinel group",
  corundum_group: "Corundum group",
  calcite_group: "Calcite group",
  monoclinic: "Monoclinic",
  orthorhombic: "Orthorhombic",
  hexagonal: "Hexagonal",
  trigonal: "Trigonal",
  isometric: "Isometric",
  triclinic: "Triclinic",
  tetragonal: "Tetragonal",
  amorphous: "Amorphous",
  prismatic: "Prismatic",
  acicular: "Acicular",
  tabular: "Tabular",
  platy: "Platy",
  foliated: "Foliated",
  fibrous: "Fibrous",
  granular: "Granular",
  massive: "Massive",
  druzy: "Druzy",
  radiating: "Radiating",
  globular: "Globular",
  reniform: "Reniform",
  botryoidal: "Botryoidal",
  columnar: "Columnar",
  cubic: "Cubic",
  rhombohedral: "Rhombohedral",
  dendritic: "Dendritic",
  earthy: "Earthy",
  white_or_colourless: "White or colourless",
  pink_to_red: "Pink to red",
  yellow_to_orange: "Yellow to orange",
  transparent: "Transparent",
  translucent: "Translucent",
  opaque: "Opaque",
  vitreous: "Vitreous",
  adamantine: "Adamantine",
  metallic: "Metallic",
  submetallic: "Submetallic",
  pearly: "Pearly",
  silky: "Silky",
  resinous: "Resinous",
  greasy: "Greasy",
  waxy: "Waxy",
  dull: "Dull",
  brittle: "Brittle",
  malleable: "Malleable",
  ductile: "Ductile",
  sectile: "Sectile",
  flexible: "Flexible",
  elastic: "Elastic",
  conchoidal: "Conchoidal",
  uneven: "Uneven",
  splintery: "Splintery",
  hackly: "Hackly",
  none: "None",
  very_poor: "Very poor",
  poor: "Poor",
  good: "Good",
  perfect: "Perfect",
  basal: "Basal",
  pinacoidal: "Pinacoidal",
  octahedral: "Octahedral",
  dodecahedral: "Dodecahedral",
  asterism: "Asterism",
  iridescence: "Iridescence",
  aventurescence: "Aventurescence",
  adularescence: "Adularescence",
  labradorescence: "Labradorescence",
  chatoyancy: "Chatoyancy",
  opalescence: "Opalescence",
  color_change: "Colour change",
  approved: "IMA approved",
  grandfathered: "Grandfathered",
  questionable: "Questionable",
  discredited: "Discredited",
  igneous: "Igneous",
  sedimentary: "Sedimentary",
  metamorphic: "Metamorphic",
  "1": "One direction",
  "2": "Two directions",
  "3": "Three directions",
  "4": "Four directions",
};
const enumLabel = (language: Language, value: string) =>
  (language === "ru" ? ruEnums : enEnums)[value] ?? value;
const present = (value: unknown) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  (!Array.isArray(value) || value.length > 0);
const range = (
  language: Language,
  value: { min: number; max: number },
  suffix = "",
) =>
  `${[value.min, value.max].map((number) => (language === "ru" ? String(number).replace(".", ",") : String(number))).join("–")}${suffix}`;
const mediaUrl = (storageKey: string, path: string) =>
  `${(process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "https://storage.yandexcloud.net/samotsvety-cdn").replace(/\/$/, "")}/${encodeURIComponent(storageKey)}/${path.split("/").map(encodeURIComponent).join("/")}`;

function Grid({ rows }: { rows: Row[] }) {
  const visible = rows.filter(([, value]) => present(value));
  return visible.length ? (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
      {visible.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground">
            {label}
          </dt>
          <dd className="mt-1 text-sm leading-6">{value}</dd>
        </div>
      ))}
    </dl>
  ) : null;
}
function Chips({ values }: { values?: string[] | null }) {
  return present(values) ? (
    <div className="flex flex-wrap gap-2">
      {values!.map((value) => (
        <Badge key={value} variant="secondary">
          {value}
        </Badge>
      ))}
    </div>
  ) : null;
}
function Paragraph({ title, value }: { title: string; value?: string | null }) {
  return present(value) ? (
    <section>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-7 text-foreground/90">
        {value}
      </p>
    </section>
  ) : null;
}
function Preview({
  src,
  alt,
  className,
  unavailable,
}: {
  src: string;
  alt: string;
  className: string;
  unavailable: string;
}) {
  const [error, setError] = useState(false);
  return error ? (
    <div
      className={`${className} flex items-center justify-center px-4 text-center text-sm text-muted-foreground`}
    >
      {unavailable}
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
function Localized({
  language,
  content,
}: {
  language: Language;
  content: LocalizedContent;
}) {
  const ru = language === "ru";
  const e = content.esoteric;
  const l = ru
    ? {
        about: "О камне",
        name: "Название",
        synonyms: "Синонимы",
        colors: "Цвета",
        color: "Описание цвета",
        lore: "История и культурные сведения",
        identification: "Советы по идентификации",
        safety: "Безопасность",
        hardness: "Пояснение к твёрдости",
        composition: "Пояснение к составу",
        esoteric: "Метафизические свойства",
        chakras: "Чакры",
        zodiac: "Знаки зодиака",
        healing: "Трактовка лечебных свойств",
        energy: "Заметки об энергии",
        ritual: "Ритуальное применение",
      }
    : {
        about: "About the stone",
        name: "Name",
        synonyms: "Synonyms",
        colors: "Colours",
        color: "Colour description",
        lore: "History and cultural information",
        identification: "Identification tips",
        safety: "Safety",
        hardness: "Hardness notes",
        composition: "Composition notes",
        esoteric: "Metaphysical properties",
        chakras: "Chakras",
        zodiac: "Zodiac signs",
        healing: "Healing interpretation",
        energy: "Energy notes",
        ritual: "Ritual uses",
      };
  const hasEsoteric =
    present(e?.metaphysical_properties) ||
    present(e?.chakras) ||
    present(e?.zodiac) ||
    present(e?.healing_interpretation) ||
    present(e?.energy_notes) ||
    present(e?.ritual_uses);
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold">{l.about}</h2>
        <div className="mt-5 space-y-5">
          <div>
            <p className="text-sm font-medium">{l.name}</p>
            <p className="mt-1 text-sm leading-6">{content.name}</p>
          </div>
          {present(content.synonyms) && (
            <div>
              <p className="mb-2 text-sm font-medium">{l.synonyms}</p>
              <Chips values={content.synonyms} />
            </div>
          )}
          {present(content.color) && (
            <div>
              <p className="mb-2 text-sm font-medium">{l.colors}</p>
              <Chips values={content.color} />
            </div>
          )}
        </div>
      </section>
      <Paragraph title={l.color} value={content.color_description} />
      <Paragraph title={l.lore} value={content.lore} />
      <Paragraph title={l.identification} value={content.identification_tips} />
      <Paragraph title={l.safety} value={content.safety_notes} />
      <Paragraph
        title={l.hardness}
        value={content.scientific_notes?.hardness}
      />
      <Paragraph
        title={l.composition}
        value={content.scientific_notes?.composition}
      />
      {hasEsoteric && (
        <section className="space-y-5 border-t pt-8">
          <h2 className="text-xl font-semibold">{l.esoteric}</h2>
          {present(e?.metaphysical_properties) && (
            <div>
              <p className="mb-2 text-sm font-medium">{l.esoteric}</p>
              <Chips values={e?.metaphysical_properties} />
            </div>
          )}
          {present(e?.chakras) && (
            <div>
              <p className="mb-2 text-sm font-medium">{l.chakras}</p>
              <Chips values={e?.chakras} />
            </div>
          )}
          {present(e?.zodiac) && (
            <div>
              <p className="mb-2 text-sm font-medium">{l.zodiac}</p>
              <Chips values={e?.zodiac} />
            </div>
          )}
          <Paragraph title={l.healing} value={e?.healing_interpretation} />
          <Paragraph title={l.energy} value={e?.energy_notes} />
          <Paragraph title={l.ritual} value={e?.ritual_uses} />
        </section>
      )}
    </div>
  );
}

export default function MineralDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [entity, setEntity] = useState<GemEntityV2Response | null>(null);
  const [relatedBySlug, setRelatedBySlug] = useState<
    Map<string, RelatedLookup>
  >(new Map());
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<Language>("ru");
  useEffect(() => {
    let cancelled = false;
    setEntity(null);
    setError("");
    setRelatedBySlug(new Map());
    api
      .getGemEntity(slug)
      .then(async (value: GemEntityV2Response) => {
        if (cancelled) return;
        setEntity(value);
        const relatedSlugs = [...new Set(value.related_entities ?? [])];
        setRelatedBySlug(
          new Map<string, RelatedLookup>(
            relatedSlugs.map((relatedSlug) => [
              relatedSlug,
              { state: "loading" },
            ]),
          ),
        );
        const results = await Promise.allSettled(
          relatedSlugs.map((relatedSlug) => api.getGemEntity(relatedSlug)),
        );
        if (cancelled) return;
        const lookup = new Map<string, RelatedLookup>();
        results.forEach((result, index) => {
          const relatedSlug = relatedSlugs[index];
          if (result.status === "fulfilled")
            lookup.set(relatedSlug, {
              state: "found",
              entity: result.value as GemEntityV2Response,
            });
          else
            lookup.set(relatedSlug, {
              state:
                result.reason instanceof ApiValidationError &&
                result.reason.status === 404
                  ? "not_found"
                  : "error",
            });
        });
        setRelatedBySlug(lookup);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Не найдено");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  if (error) return <div className="p-8">{error}</div>;
  if (!entity) return <div className="p-8">Загрузка...</div>;
  const ru = language === "ru";
  const image = entity.images;
  const translate = (value: string) => enumLabel(language, value);
  const labels = keyLabels[language];
  const keyProperties: Row[] = [
    [
      labels[0],
      entity.scientific.hardness && range(language, entity.scientific.hardness),
    ],
    [
      labels[1],
      entity.scientific.specific_gravity &&
        range(
          language,
          entity.scientific.specific_gravity,
          ru ? " г/см³" : " g/cm³",
        ),
    ],
    [
      labels[2],
      entity.scientific.rarity && translate(entity.scientific.rarity),
    ],
    [
      labels[3],
      entity.scientific.transparency &&
        translate(entity.scientific.transparency),
    ],
    [labels[4], entity.scientific.crystal_habit?.map(translate).join(", ")],
    [labels[5], entity.scientific.luster?.map(translate).join(", ")],
    [labels[6], entity.scientific.tenacity?.map(translate).join(", ")],
    [
      labels[7],
      entity.scientific.fracture && translate(entity.scientific.fracture),
    ],
    [
      labels[8],
      entity.scientific.cleavage_degree &&
        translate(entity.scientific.cleavage_degree),
    ],
    [
      labels[9],
      entity.scientific.rock_type && translate(entity.scientific.rock_type),
    ],
  ];
  const rest: Row[] = Object.entries(entity.scientific)
    .filter(
      ([key]) =>
        ![
          "hardness",
          "specific_gravity",
          "rarity",
          "transparency",
          "crystal_habit",
          "luster",
          "tenacity",
          "fracture",
          "cleavage_degree",
          "rock_type",
        ].includes(key),
    )
    .map(([key, value]) => [
      scientificLabels[language][key] ?? key,
      Array.isArray(value)
        ? value.map(translate).join(", ")
        : typeof value === "string"
          ? translate(value)
          : null,
    ]);
  return (
    <main className="mx-auto max-w-6xl space-y-10 p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          {ru ? "Назад" : "Back"}
        </Button>
        <Link href={`/admin/minerals/${entity.slug}/edit`}>
          <Button>{ru ? "Редактировать" : "Edit"}</Button>
        </Link>
      </div>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {entity.i18n[language].name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {typeLabels[language][entity.type] ?? entity.type}
          <span className="mx-2">·</span>
          <span className="font-mono text-xs">{entity.slug}</span>
        </p>
      </header>
      <Tabs
        value={language}
        onValueChange={(value) => setLanguage(value as Language)}
      >
        <TabsList>
          <TabsTrigger value="ru">Русский</TabsTrigger>
          <TabsTrigger value="en">English</TabsTrigger>
        </TabsList>
      </Tabs>
      <section className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          {image?.hero?.path ? (
            <Preview
              src={mediaUrl(image.storage_key, image.hero.path)}
              alt={entity.i18n[language].name}
              unavailable={ru ? "Изображение недоступно" : "Image unavailable"}
              className="aspect-[4/3] w-full rounded-lg border bg-muted object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border bg-muted px-6 text-center text-sm text-muted-foreground">
              {ru
                ? "Главное изображение не указано"
                : "No hero image specified"}
            </div>
          )}
        </div>
        <div className="self-center">
          <h2 className="mb-5 text-xl font-semibold">
            {ru ? "Ключевые свойства" : "Key properties"}
          </h2>
          <Grid rows={keyProperties} />
        </div>
      </section>
      <Localized language={language} content={entity.i18n[language]} />
      {rest.some(([, value]) => present(value)) && (
        <section className="border-t pt-8">
          <h2 className="mb-5 text-xl font-semibold">
            {ru
              ? "Дополнительные научные свойства"
              : "Additional scientific properties"}
          </h2>
          <Grid rows={rest} />
        </section>
      )}
      <section className="border-t pt-8">
        <h2 className="mb-5 text-xl font-semibold">
          {ru ? "Месторождения" : "Localities"}
        </h2>
        {entity.localities?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {entity.localities.map((locality, index) => (
              <Card key={`${locality.country_code}-${index}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {(ru ? locality.country_ru : locality.country_en) ||
                          (ru ? locality.country_en : locality.country_ru) ||
                          (ru ? "Месторождение" : "Locality")}
                      </h3>
                      {[
                        ru ? locality.region_ru : locality.region_en,
                        ru ? locality.locality_ru : locality.locality_en,
                      ].filter(present).length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[
                            ru ? locality.region_ru : locality.region_en,
                            ru ? locality.locality_ru : locality.locality_en,
                          ]
                            .filter(present)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {locality.country_code}
                    </span>
                  </div>
                  {locality.famous && (
                    <p className="mt-3 text-sm font-medium">
                      {ru ? "Известное месторождение" : "Notable locality"}
                    </p>
                  )}
                  {present(
                    ru ? locality.description_ru : locality.description_en,
                  ) && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/90">
                      {ru ? locality.description_ru : locality.description_en}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {ru ? "Месторождения не указаны." : "No localities specified."}
          </p>
        )}
      </section>
      <section className="border-t pt-8">
        <h2 className="mb-5 text-xl font-semibold">
          {ru ? "Изображения" : "Images"}
        </h2>
        {image ? (
          <div className="space-y-6">
            {image.thumbnail?.path && (
              <div className="flex items-center gap-4">
                <Preview
                  src={mediaUrl(image.storage_key, image.thumbnail.path)}
                  alt={ru ? "Миниатюра" : "Thumbnail"}
                  unavailable={
                    ru ? "Изображение недоступно" : "Image unavailable"
                  }
                  className="h-20 w-20 rounded-md border bg-muted object-cover"
                />
                <p className="text-xs text-muted-foreground">
                  {image.thumbnail.path}
                </p>
              </div>
            )}
            {image.gallery?.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {image.gallery.map((item, index) => (
                  <figure key={`${item.path}-${index}`} className="min-w-0">
                    <Preview
                      src={mediaUrl(image.storage_key, item.path)}
                      alt={
                        item.caption?.[language] || entity.i18n[language].name
                      }
                      unavailable={
                        ru ? "Изображение недоступно" : "Image unavailable"
                      }
                      className="aspect-square w-full rounded-md border bg-muted object-cover"
                    />
                    {(item.caption?.[language] || item.type || item.path) && (
                      <figcaption
                        className="mt-2 truncate text-xs text-muted-foreground"
                        title={item.path}
                      >
                        {item.caption?.[language] || item.type || item.path}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            ) : !image.hero?.path && !image.thumbnail?.path ? (
              <p className="text-sm text-muted-foreground">
                {ru ? "Изображения не указаны." : "No images specified."}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {ru ? "Изображения не указаны." : "No images specified."}
          </p>
        )}
      </section>
      <section className="border-t pt-8">
        <h2 className="mb-4 text-xl font-semibold">
          {ru ? "Связанные камни" : "Related stones"}
        </h2>
        {entity.related_entities?.length ? (
          <div className="flex flex-wrap gap-2">
            {entity.related_entities.map((relatedSlug, index) => {
              const related = relatedBySlug.get(relatedSlug);
              const found = related?.state === "found" ? related.entity : null;
              const name = found
                ? ru
                  ? found.i18n.ru.name || found.i18n.en.name
                  : found.i18n.en.name || found.i18n.ru.name
                : relatedSlug;
              const warning = found
                ? !name
                  ? ru
                    ? "Название не заполнено"
                    : "Name is missing"
                  : null
                : related?.state === "not_found"
                  ? ru
                    ? "Связанная карточка не найдена"
                    : "Related entity not found"
                  : related?.state === "error"
                    ? ru
                      ? "Не удалось загрузить связанную карточку"
                      : "Failed to load related entity"
                    : null;
              return (
                <div
                  key={`${relatedSlug}-${index}`}
                  className="flex flex-col gap-1"
                >
                  <Badge asChild={!!found} variant="outline">
                    {found ? (
                  <Link
                    href={`/admin/minerals/${relatedSlug}`}
                        title={relatedSlug}
                      >
                        {name || relatedSlug}
                      </Link>
                    ) : (
                      <span title={relatedSlug}>{name}</span>
                    )}
                  </Badge>
                  {warning && (
                    <span className="text-xs text-amber-700" role="status">
                      {warning}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {ru
              ? "Связанные камни не указаны."
              : "No related stones specified."}
          </p>
        )}
      </section>
      <section className="border-t pt-8">
        <h2 className="mb-4 text-xl font-semibold">
          {ru ? "Источники" : "Sources"}
        </h2>
        {entity.sources?.length ? (
          <ul className="space-y-4">
            {entity.sources.map((source, index) => (
              <li
                key={`${source.url ?? source.title ?? "source"}-${index}`}
                className="max-w-3xl"
              >
                <div className="font-medium">
                  {source.url ? (
                    <a
                      className="text-primary underline underline-offset-4"
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.title || source.url}
                    </a>
                  ) : (
                    source.title
                  )}
                </div>
                {(source.author || source.publisher) && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[source.author, source.publisher]
                      .filter(present)
                      .join(" · ")}
                  </p>
                )}
                {source.url && source.title && (
                  <a
                    className="mt-1 block truncate text-xs text-muted-foreground hover:underline"
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.url}
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {ru ? "Источники не указаны." : "No sources specified."}
          </p>
        )}
      </section>
    </main>
  );
}
