'use client';

import { UseFormReturn } from 'react-hook-form';
import { MineralFormData, MineralSchema } from '@/lib/validations/mineral';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';

interface ImportJsonSectionProps {
  form: UseFormReturn<MineralFormData>;
}

const STONE_NAME_PLACEHOLDER = '[НАЗВАНИЕ_КАМНЯ]';

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

Собери **полную, точную и детализированную информацию** по камню «${STONE_NAME_PLACEHOLDER}» согласно структуре проекта Samotsvety.

**Обязательные правила:**
- "slug": транслитерация названия латиницей в нижнем регистре, только [a-z0-9-], слова через дефис,
  без пробелов и без языковых окончаний (напр. «Малахит» → "malachite», «Александрит» → "alexandrite").
  Это обязательное поле, без него JSON не пройдёт валидацию формы.
- Укажи "type": "mineral", "rock", "gem_variety" или "organic" (для янтаря и подобного).
- Необязательные поля, для которых нет данных, можно указывать как null или просто не включать
  в JSON — оба варианта корректны.

- ВСЁ нижеперечисленное — ВНУТРИ объекта "scientific" (не на верхнем уровне JSON, не в i18n!).
  Это единые для минерала данные: одно значение независимо от языка интерфейса.

  Обязательные поля scientific (без них JSON не пройдёт валидацию):
  - hardness: { "min": число, "max": число } — твёрдость по шкале Мооса. Укажи реалистичный
    диапазон именно для этого вида по справочным минералогическим данным (напр. кварц: min 7,
    max 7; если у вида фиксированное значение — min и max совпадают, не выдумывай разброс).
  - specific_gravity: { "min": число, "max": число } — плотность, г/см³, аналогично hardness.
  - rarity — редкость на коллекционном/ювелирном рынке, ОДНО из: "common" | "uncommon" |
    "rare" | "very_rare". Ориентир: common — широко распространённые породообразующие виды
    (кварц, кальцит, полевые шпаты); uncommon — известные, но не повсеместные (малахит,
    флюorit); rare — специфичные месторождения, коллекционная ценность (александрит, бенитоит);
    very_rare — считаные месторождения в мире или экстремальная редкость находок.

  Необязательные одиночные поля (один код или не указывать вовсе):
  - crystal_system: monoclinic | orthorhombic | hexagonal | isometric | triclinic | tetragonal | amorphous
  - streak: black | white_or_colourless | grey | green | blue | brown | pink_to_red | yellow_to_orange
  - fracture: conchoidal | uneven | splintery | hackly | earthy | fibrous
  - cleavage_degree: none | very_poor | poor | good | perfect
  - cleavage_direction: "1" | "2" | "3" | "4" (строкой; указывай, только если cleavage_degree
    != none; это число направлений, а не граней формы — напр. кубическая спайность галита это
    3 направления, а не 6 граней куба; октаэдрическая у флюорита — 4, а не 8 граней октаэдра)
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

  Необязательные массивы (можно несколько значений одновременно — заполняй ТОЛЬКО тем, что
  реально верно для этого минерала, не пытайся заполнить все варианты):
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

  Необязательный свободный текст (тоже внутри scientific, одно значение на минерал, не в i18n):
  - chemical_formula — химическая формула (для минерала почти всегда стоит указать, для
    породы обычно не применимо, тогда не указывай)
  - hardness_note — короткая ремарка к твёрдости
  - composition — для минерала обычно не нужен (дублировал бы chemical_formula); для
    породы — содержательное петрографическое описание, напр. "Состоит преимущественно
    из кварца и полевых шпатов, с примесью биотита"

- В i18n.ru и i18n.en остаётся только по-настоящему переводимый контент — заполняй его на
  обоих языках отдельно, с реальным переводом, а не заглушками:
  - name — название на языке
  - synonyms — массив синонимов/альтернативных названий
  - color — МАССИВ строк с названиями цветов/оттенков (не одна строка!), напр.
    ["ярко-зелёный", "тёмно-зелёный"]. Обязателен (минимум 1 элемент), если язык заполняется.
  - color_description — связное описание окраски и рисунка текстом (это отдельное поле,
    не то же самое что color)
  - lore — минимум 20 символов, если язык заполняется
  - identification_tips, safety_notes — свободный текст
  - esoteric — объект (см. ниже); можно опустить целиком, если эзотерическая часть неуместна

  esoteric.<lang> — обязательные поля внутри (если объект esoteric присутствует):
  - metaphysical_properties — массив строк, минимум 1 значение
  - chakras — МАССИВ строк (обязательное поле; если чакры неприменимы или неизвестны — передай
    пустой массив [], но не пропускай поле и не делай его строкой)
  - zodiac — МАССИВ строк знаков зодиака (та же логика: [] можно, пропускать нельзя)
  - healing_interpretation — минимум 10 символов, реально 2–3 содержательных предложения
  - energy_notes — минимум 10 символов, реально 2–3 содержательных предложения
  - ritual_uses — ОДНА строка свободного текста (НЕ массив), необязательно

- Localities — массив, минимум 1 элемент. У каждого элемента:
  - country_ru/country_en, region_ru/region_en, locality_ru/locality_en — заполняй оба языка,
    где возможно; требуется страна хотя бы на одном языке
  - is_russian — ОБЯЗАТЕЛЬНОЕ булево поле (true/false) для КАЖДОГО месторождения: true, если
    оно в России, иначе false. Никогда не пропускай это поле.
  - famous — необязательное булево, true если месторождение имеет коллекционную/историческую
    известность
  - description_ru/description_en — содержательное описание месторождения на обоих языках
- Особенно подробно опиши российские (уральские и сибирские) месторождения, если они есть;
  если для этого вида нет подтверждённых российских месторождений — честно укажи это в
  description, а не выдумывай.
- Lore — увлекательный историко-культурный текст, на обоих языках.
- Эзотерика — мягкая формулировка («в традиции считается», «многие практики отмечают»).
- related_minerals — МАССИВ SLUG'ОВ (не названий!) 2–4 реально похожих или часто путаемых
  минералов в том же формате, что и slug выше (напр. ["azurite", "chrysocolla"]). Если не
  уверен в slug соседнего минерала — лучше не включай его.
- Изображения (main_image_url, thumbnail_url, gallery[].url) — это ПРИМЕР-ПЛЕЙСХОЛДЕР пути
  в Yandex Cloud (samotsvety-cdn), а не реальные файлы. Оставь структуру путей как в шаблоне
  (hero.webp, thumbnail.webp, gallery/specimen-01.webp и т.д.) — после генерации JSON нужно
  либо загрузить файлы с такими именами в облако, либо вручную подставить настоящие URL
  перед сохранением формы, иначе поле пройдёт валидацию (это просто строка-URL), но картинка
  не отобразится. main_image_url обязателен, thumbnail_url необязателен.
  - Каждый элемент gallery — объект { url, type, description_ru, description_en }, где
    type: "specimen" | "polished" | "jewelry" | "micro" (см. пример в шаблоне)

**Формат вывода — строго синтаксически валидный JSON, без единого отклонения:**
- НЕ оборачивай URL в markdown-ссылки вида "[https://...](https://...)" — только голая строка
  "https://...". Это касается main_image_url, thumbnail_url и gallery[].url без исключений.
- НЕ используй прямые двойные кавычки ASCII (") ВНУТРИ значений строк для выделения слов или
  цитат — это ломает JSON-парсинг (строка обрывается на первой внутренней кавычке). Для
  выделения используй «ёлочки» (в русском тексте) или одинарные кавычки/просто без кавычек
  (в английском), например: Crocodile Jasper без кавычек или 'Crocodile Jasper', но не
  "Crocodile Jasper" внутри JSON-строки.
- НЕ оборачивай ответ в \`\`\`json блок и не добавляй пояснений до или после — первый символ
  ответа должен быть "{", последний — "}".
- Перед выводом мысленно сверь структуру со schema: hardness/specific_gravity/rarity —
  ВНУТРИ scientific; color — массив; chakras/zodiac — массивы, не пропущены; ritual_uses —
  строка, не массив; is_russian — булево на каждом месторождении.

Верни **только валидный JSON** без дополнительного текста.`;

export function ImportJsonSection({ form }: ImportJsonSectionProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState<'import' | 'template'>('import');
  // Название камня для подстановки в промпт — предзаполняем из уже введённого
  // на вкладке "Основное" русского названия, если оно есть, но дальше не
  // синхронизируем принудительно: пользователь может печатать сюда что угодно
  // (например, английское название или синоним) независимо от формы.
  const [stoneName, setStoneName] = useState(() => form.getValues('i18n.ru.name') ?? '');

  const renderedPrompt = useMemo(
    () => PROMPT_TEMPLATE.replaceAll(STONE_NAME_PLACEHOLDER, stoneName.trim() || STONE_NAME_PLACEHOLDER),
    [stoneName]
  );

  // Модели иногда всё равно оборачивают URL в markdown-ссылку
  // "[https://x/a.webp](https://x/a.webp)" — это синтаксически валидный JSON
  // (кавычки тут ни при чём), но падает на z.string().url(), т.к. строка
  // начинается с "[". Раз оба URL внутри скобок идентичны, извлекаем их
  // автоматически вместо того, чтобы заставлять человека чистить руками.
  const unwrapMarkdownLinks = (value: unknown): unknown => {
    if (typeof value === 'string') {
      const match = value.match(/^\[(https?:\/\/[^\]]+)\]\(\1\)$/);
      return match ? match[1] : value;
    }
    if (Array.isArray(value)) {
      return value.map(unwrapMarkdownLinks);
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, unwrapMarkdownLinks(v)])
      );
    }
    return value;
  };

  // JSON.parse даёт только "Unexpected token ... at position N" — бесполезно
  // на JSON в 200+ строк без указания, где именно искать. Показываем строку,
  // столбец и сам проблемный фрагмент, чтобы не листать текст вручную.
  const describeJsonError = (raw: string, error: unknown): string => {
    const message = error instanceof Error ? error.message : String(error);
    const positionMatch = message.match(/position (\d+)/);
    if (!positionMatch) {
      return `Ошибка парсинга JSON: проверьте синтаксис (запятые, кавычки, скобки).\n${message}`;
    }
    const pos = Number(positionMatch[1]);
    const before = raw.slice(0, pos);
    const line = before.split('\n').length;
    const col = pos - before.lastIndexOf('\n');
    const snippetStart = Math.max(0, pos - 40);
    const snippet = raw.slice(snippetStart, pos + 20).replace(/\n/g, ' ');
    return (
      `Ошибка парсинга JSON на строке ${line}, столбец ${col}.\n` +
      `Частая причина — незаэкранированные кавычки " внутри текста или markdown-ссылка вместо URL.\n` +
      `Фрагмент рядом с ошибкой: …${snippet}…`
    );
  };

  const handleImport = () => {
    let parsed: unknown;
    const trimmedInput = jsonInput.trim();
    try {
      parsed = unwrapMarkdownLinks(JSON.parse(trimmedInput));
    } catch (error) {
      toast.error(describeJsonError(trimmedInput, error), { duration: 15000 });
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

  // navigator.clipboard требует "secure context" (https или localhost) — при
  // открытии админки по WSL2-сетевому IP (http://172.x.x.x:3000, см. заметки
  // проекта про WSL2-networking) этого API просто нет (undefined), поэтому
  // .writeText() падал с TypeError. Фолбэк через скрытый textarea +
  // document.execCommand('copy') работает и в небезопасном контексте.
  const copyToClipboard = (text: string, successMessage: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success(successMessage))
        .catch(() => copyViaFallback(text, successMessage));
      return;
    }
    copyViaFallback(text, successMessage);
  };

  const copyViaFallback = (text: string, successMessage: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const copied = document.execCommand('copy');
      if (copied) {
        toast.success(successMessage);
      } else {
        toast.error('Не удалось скопировать автоматически — выделите текст вручную (Ctrl+C)');
      }
    } catch {
      toast.error('Не удалось скопировать автоматически — выделите текст вручную (Ctrl+C)');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const copyTemplate = () => {
    copyToClipboard(JSON_TEMPLATE, 'Шаблон JSON скопирован');
  };

  const copyPrompt = () => {
    if (!stoneName.trim()) {
      toast.warning('Название камня не указано — в промпте останется плейсхолдер [НАЗВАНИЕ_КАМНЯ]');
    }
    copyToClipboard(renderedPrompt, 'Промпт скопирован');
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
            <Button type="button" onClick={handleImport} className="w-full" size="lg">
              Импортировать в форму
            </Button>
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Шаблон JSON (актуальный)</h4>
                <Button type="button" variant="outline" size="sm" onClick={copyTemplate}>
                  <Copy className="h-4 w-4 mr-2" /> Скопировать
                </Button>
              </div>
              <pre className="bg-[var(--color-inkwell-teal)] text-[var(--color-bone)] p-4 rounded-2xl text-xs overflow-auto max-h-[350px]">{JSON_TEMPLATE}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Промпт для нейросети</h4>
              <div className="mb-3 space-y-1.5">
                <label className="text-sm font-medium" htmlFor="stone-name-input">
                  Название камня
                </label>
                <Input
                  id="stone-name-input"
                  value={stoneName}
                  onChange={(e) => setStoneName(e.target.value)}
                  placeholder="Например: Малахит"
                />
                <p className="text-xs text-[var(--color-slate-veil)]">
                  Подставится в промпт вместо [НАЗВАНИЕ_КАМНЯ] при копировании.
                </p>
              </div>
              <pre className="bg-[var(--color-inkwell-teal)] text-[var(--color-bone)] p-4 rounded-2xl text-xs overflow-auto whitespace-pre-wrap">
                {renderedPrompt}
              </pre>
              <Button type="button" variant="outline" size="sm" onClick={copyPrompt} className="mt-3">
                <Copy className="h-4 w-4 mr-2" /> Скопировать промпт
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
