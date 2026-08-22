'use client';

import { UseFormReturn } from 'react-hook-form';
import { MineralFormData, MineralSchema } from '@/lib/validations/mineral';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useState } from 'react';
import { Copy } from 'lucide-react';

interface ImportJsonSectionProps {
  form: UseFormReturn<MineralFormData>;
}

const JSON_TEMPLATE = `{
  "slug": "malachite",
  "type": "mineral",
  "scientific": {
    "chemical_formula": "Cu₂CO₃(OH)₂",
    "hardness": { "min": 3.5, "max": 4.0 },
    "hardness_note": "варьируется в зависимости от примесей",
    "specific_gravity": { "min": 3.6, "max": 4.05 },
    "rarity": "common",
    "mineral_class": "carbonates_nitrates",
    "silicate_subclass": null,
    "mineral_family": null,
    "composition": "",
    "crystal_system": "monoclinic",
    "crystal_habit": ["botryoidal", "fibrous", "radiating"],
    "streak": "green",
    "transparency": "opaque",
    "luster": ["vitreous", "silky", "dull"],
    "fracture": "uneven",
    "cleavage_degree": "perfect",
    "cleavage_direction": "1",
    "cleavage_type": "pinacoidal",
    "tenacity": ["brittle"],
    "phenomena": [],
    "ima_status": "approved",
    "rock_type": null
  },
  "i18n": {
    "ru": {
      "name": "Малахит",
      "synonyms": ["медная зелень", "малахитовая руда"],
      "color": ["ярко-зелёный", "тёмно-зелёный", "изумрудно-зелёный"],
      "color_description": "Характерный насыщенный зелёный цвет с полосчатым и концентрическим рисунком",
      "lore": "История добычи на Урале, использование в камнерезном искусстве, легенды и культурное значение...",
      "identification_tips": "Отличительные признаки от похожих минералов...",
      "safety_notes": "Содержит медь. Не рекомендуется длительный контакт с кожей...",
      "esoteric": {
        "metaphysical_properties": ["защита", "эмоциональное исцеление", "гармония"],
        "chakras": ["сердечная чакра (Анахата)"],
        "zodiac": ["Телец", "Весы", "Козерог"],
        "healing_interpretation": "В эзотерической традиции малахит считается мощным камнем эмоционального очищения...",
        "energy_notes": "Многие практики отмечают, что камень помогает трансформировать тяжёлые эмоции...",
        "ritual_uses": "Используется в медитациях на сердечную чакру..."
      }
    },
    "en": {
      "name": "Malachite",
      "synonyms": ["copper green"],
      "color": ["bright green", "dark green", "emerald green"],
      "color_description": "Characteristic rich green color with banded patterns",
      "lore": "History of mining in the Urals...",
      "identification_tips": "Distinguishing features from similar minerals...",
      "safety_notes": "Contains copper. Prolonged skin contact is not recommended...",
      "esoteric": {
        "metaphysical_properties": ["protection", "emotional healing", "harmony"],
        "chakras": ["heart chakra (Anahata)"],
        "zodiac": ["Taurus", "Libra", "Capricorn"],
        "healing_interpretation": "In esoteric tradition, malachite is considered a powerful stone of emotional cleansing...",
        "energy_notes": "Many practitioners note that the stone helps transform heavy emotions...",
        "ritual_uses": "Used in heart chakra meditations..."
      }
    }
  },
  "localities": [
    {
      "country_ru": "Россия",
      "country_en": "Russia",
      "region_ru": "Свердловская область",
      "region_en": "Sverdlovsk Oblast",
      "locality_ru": "Меднорудянское месторождение (Нижний Тагил)",
      "locality_en": "Mednorudyanskoye deposit (Nizhny Tagil)",
      "is_russian": true,
      "famous": true,
      "description_ru": "Классическое уральское месторождение...",
      "description_en": "Classic Ural malachite deposit..."
    }
  ],
  "main_image_url": "https://storage.yandexcloud.net/samotsvety-cdn/malachite/hero.webp",
  "thumbnail_url": "https://storage.yandexcloud.net/samotsvety-cdn/malachite/thumbnail.webp",
  "gallery": [
    {
      "url": "https://storage.yandexcloud.net/samotsvety-cdn/malachite/gallery/specimen-01.webp",
      "type": "specimen",
      "description_ru": "Необработанный образец с характерным концентрическим рисунком",
      "description_en": "Raw specimen with characteristic concentric banding"
    }
  ],
  "related_minerals": ["azurite", "chrysocolla"]
}`;

const PROMPT_TEMPLATE = `Ты — эксперт-минералог и геммолог высшего уровня.

Собери **полную, точную и детализированную информацию** по камню «[НАЗВАНИЕ_КАМНЯ]» согласно структуре проекта Samotsvety.

**Обязательные правила:**
- Укажи "type": "mineral", "rock", "gem_variety" или "organic" (для янтаря и подобного).
- Необязательные поля, для которых нет данных, можно указывать как null или просто не включать
  в JSON — оба варианта корректны.
- ВАЖНО: почти все научные свойства находятся ВНУТРИ scientific (не в i18n!) — это закрытые
  перечисления с фиксированными кодами, ОДНО значение на весь минерал (не переводится и не
  дублируется по языкам). Если поле не определено или не подходит под перечисление — просто
  не указывай его (не выдумывай значение).

  Одиночные (один код):
  - crystal_system: monoclinic | orthorhombic | hexagonal | isometric | triclinic | tetragonal | amorphous
  - streak: black | white_or_colourless | grey | green | blue | brown | pink_to_red | yellow_to_orange
  - fracture: conchoidal | uneven | splintery | hackly | earthy | fibrous
  - cleavage_degree: none | very_poor | poor | good | perfect
  - cleavage_direction: "1" | "2" | "3" | "4" (указывай, только если cleavage_degree != none;
    это число направлений, а не граней формы — напр. кубическая спайность галита это 3
    направления, а не 6 граней куба; октаэдрическая у флюорита — 4, а не 8 граней октаэдра)
  - cleavage_type (необязательно): basal | prismatic | pinacoidal | rhombohedral | cubic | octahedral | dodecahedral
  - transparency: transparent | translucent | opaque
  - ima_status — ТОЛЬКО формальный статус вида по IMA, не путать с торговым названием:
    approved | grandfathered | questionable | discredited
  - rock_type (только для type: "rock"): igneous | sedimentary | metamorphic
  - mineral_class — химический класс по Дана/Штрунцу: native_elements | sulfides_sulfosalts |
    halides | oxides_hydroxides | carbonates_nitrates | borates |
    sulfates_chromates_molybdates_tungstates | phosphates_arsenates_vanadates | silicates | organic
  - silicate_subclass (только если mineral_class == "silicates"): nesosilicates | sorosilicates |
    cyclosilicates | inosilicates | phyllosilicates | tectosilicates
  - mineral_family — коллекционная группа (независимая от mineral_class ось, для фильтров
    на сайте): garnet_group | feldspar_group | quartz_group | tourmaline_group | mica_group |
    pyroxene_group | amphibole_group | zeolite_group | beryl_group | spinel_group |
    corundum_group | calcite_group (если минерал не входит ни в одну — не указывай)

  Массивы (можно несколько значений одновременно — заполняй ТОЛЬКО тем, что реально верно
  для этого минерала, не пытайся заполнить все варианты):
  - luster: vitreous | adamantine | metallic | submetallic | pearly | silky | resinous | greasy | waxy | dull | earthy
  - tenacity: brittle | malleable | ductile | sectile | flexible | elastic
    (напр. золото: ["malleable", "ductile"]; слюда: ["flexible", "elastic"])
  - phenomena: asterism | iridescence | aventurescence | adularescence | labradorescence |
    chatoyancy | opalescence | color_change (iridescence уже включает то, что иногда называют
    "переливчатостью" — не дублируй отдельным термином; labradorescence не дублируй как
    отдельный "шиллер-эффект")
  - crystal_habit: prismatic | acicular | tabular | platy | foliated | fibrous | granular |
    massive | druzy | radiating | globular | reniform | botryoidal | columnar | cubic |
    rhombohedral | dendritic | earthy

  Свободный текст (тоже в scientific, ОДНО значение на минерал, не в i18n):
  - hardness_note — короткая ремарка к твёрдости
  - composition — для минерала обычно не нужен (дублировал бы chemical_formula); для
    породы — содержательное петрографическое описание, напр. "Состоит преимущественно
    из кварца и полевых шпатов, с примесью биотита"

- В i18n.ru и i18n.en остаётся только по-настоящему переводимый контент: name, synonyms,
  color, color_description, lore, identification_tips, safety_notes, esoteric — заполняй
  их на обоих языках отдельно, с реальным переводом, а не заглушками.
- Localities: country/region/locality — country_ru+country_en, region_ru+region_en,
  locality_ru+locality_en — заполняй оба языка.
- Особенно подробно опиши российские (уральские и сибирские) месторождения.
- Lore — увлекательный историко-культурный текст, на обоих языках.
- Эзотерика — мягкая формулировка («в традиции считается», «многие практики отмечают»).
- Изображения уже загружены в Yandex Cloud (samotsvety-cdn):
  - hero.webp, thumbnail.webp
  - gallery/specimen-01.webp, gallery/polished-01.webp и т.д.
  - Каждый элемент gallery — объект { url, type, description_ru, description_en }, где
    type: "specimen" | "polished" | "jewelry" | "micro" (см. пример в шаблоне)

Верни **только валидный JSON** без дополнительного текста.`;

export function ImportJsonSection({ form }: ImportJsonSectionProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState<'import' | 'template'>('import');

  const handleImport = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonInput.trim());
    } catch (error) {
      toast.error('Ошибка парсинга JSON: проверьте синтаксис (запятые, кавычки, скобки)');
      return;
    }

    // Раньше `parsed as MineralFormData` был просто TS-кастом без реальной
    // проверки — форма молча обновлялась и показывала "успех", даже если
    // структура не совпадала со схемой (опечатка в enum-коде, не тот тип
    // поля и т.д.); ошибки вылезали только при сабмите, без явной связи
    // с тем, что источник — вставленный JSON. Теперь проверяем сразу.
    const result = MineralSchema.safeParse(parsed);

    if (result.success) {
      form.reset(result.data);
      toast.success('Форма обновлена из JSON — все поля прошли проверку');
      setJsonInput('');
      return;
    }

    // Отделяем структурные ошибки (неверный тип/значение enum — значит в
    // JSON опечатка или устаревшее поле, импортировать такое небезопасно)
    // от бизнес-правил (superRefine ниже в схеме: "язык не дописан до
    // конца", "у месторождения нет страны") — это нормальное состояние
    // черновика, который человек доработает в самой форме после импорта.
    const structuralIssues = result.error.issues.filter((issue) => issue.code !== 'custom');
    const businessIssues = result.error.issues.filter((issue) => issue.code === 'custom');

    if (structuralIssues.length > 0) {
      const preview = structuralIssues
        .slice(0, 5)
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      toast.error(
        `JSON не соответствует схеме формы (${structuralIssues.length} ` +
          `${structuralIssues.length === 1 ? 'ошибка' : 'ошибок'}), импорт отменён:\n${preview}` +
          (structuralIssues.length > 5 ? '\n...' : ''),
        { duration: 12000 }
      );
      return;
    }

    // Структура верна, не хватает только требований к заполненности —
    // импортируем как черновик, дальше можно доработать прямо в форме.
    form.reset(parsed as MineralFormData);
    toast.warning(
      `Импортировано как черновик: ${businessIssues.length} ` +
        `${businessIssues.length === 1 ? 'пункт' : 'пункта(ов)'} нужно доработать перед сохранением ` +
        `(см. вкладки формы)`,
      { duration: 10000 }
    );
    setJsonInput('');
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(JSON_TEMPLATE);
    toast.success('Шаблон JSON скопирован');
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATE);
    toast.success('Промпт скопирован');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Импорт / Шаблон JSON</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="import">Импорт JSON</TabsTrigger>
            <TabsTrigger value="template">Шаблон + Промпт</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Вставьте сюда полный JSON минерала...'
              className="min-h-[420px] font-mono text-sm"
            />
            <Button onClick={handleImport} className="w-full" size="lg">
              Импортировать в форму
            </Button>
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Шаблон JSON (актуальный)</h4>
                <Button variant="outline" size="sm" onClick={copyTemplate}>
                  <Copy className="h-4 w-4 mr-2" /> Скопировать
                </Button>
              </div>
              <pre className="bg-[var(--color-inkwell-teal)] text-[var(--color-bone)] p-4 rounded-2xl text-xs overflow-auto max-h-[350px]">{JSON_TEMPLATE}</pre>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Промпт для нейросети</h4>
                <Button variant="outline" size="sm" onClick={copyPrompt}>
                  <Copy className="h-4 w-4 mr-2" /> Скопировать промпт
                </Button>
              </div>
              <pre className="bg-[var(--color-inkwell-teal)] text-[var(--color-bone)] p-4 rounded-2xl text-xs overflow-auto whitespace-pre-wrap">
                {PROMPT_TEMPLATE}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
