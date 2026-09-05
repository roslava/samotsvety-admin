'use client';

import { UseFormReturn } from 'react-hook-form';
import { MineralFormData, GemEntityV2ImportSchema } from '@/lib/validations/mineral';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { MINERAL_IMPORT_EXAMPLE } from '@/lib/mineral-import-example';
import { normalizeV2ImportSourceUrls } from '@/lib/v2-helpers';

interface ImportJsonSectionProps {
  form: UseFormReturn<MineralFormData>;
}

const STONE_NAME_PLACEHOLDER = '[НАЗВАНИЕ_КАМНЯ]';

const JSON_TEMPLATE = JSON.stringify(MINERAL_IMPORT_EXAMPLE, null, 2);

const PROMPT_TEMPLATE = `Ты — эксперт-минералог и геммолог. Создай запись для «${STONE_NAME_PLACEHOLDER}».

Верни ТОЛЬКО синтаксически валидный JSON: первый символ {, последний }. Никакого Markdown, markdown-ссылок, code fence или пояснений. Структура должна строго соответствовать MineralSchema: не добавляй никаких других ключей. Неизвестное необязательное значение опускай или указывай null.

Верхний уровень: slug (lowercase [a-z0-9-]), type (mineral | rock | gem_variety | organic), scientific, i18n {ru, en}; опционально localities, images, related_entities, sources.

Перед выбором type сначала определи научную природу объекта. type определяется по ней, а не по торговому названию, слову "jasper", использованию в ювелирном деле или названию раздела админки. mineral — самостоятельный минеральный вид. rock — горная порода, полиминеральный агрегат или природная смесь минералов, если объект геологически является породой. gem_variety — геммологическая или ювелирная разновидность конкретного минерала либо минерального материала, когда это именно разновидность, а не отдельная горная порода. organic — природный материал органического происхождения. Не классифицируй объект как mineral только потому, что он называется "камнем", gemstone, jasper или подобным торговым названием. Контрольный пример: Kambaba Jasper → type: "rock", scientific.rock_type: "igneous"; не mineral и не sedimentary rock.

scientific содержит только: chemical_formula, hardness {min,max} (числа 1–10), specific_gravity {min,max} (положительные числа), rarity (common|uncommon|rare|very_rare), base_color (red|black|bi_color|blue|brown|green|yellow|grey|purple|white|pink|multicolor|orange), mineral_class (native_elements|sulfides_sulfosalts|halides|oxides_hydroxides|carbonates_nitrates|borates|sulfates_chromates_molybdates_tungstates|phosphates_arsenates_vanadates|silicates|organic), silicate_subclass (nesosilicates|sorosilicates|cyclosilicates|inosilicates|phyllosilicates|tectosilicates), mineral_family (garnet_group|feldspar_group|quartz_group|tourmaline_group|mica_group|pyroxene_group|amphibole_group|zeolite_group|beryl_group|spinel_group|corundum_group|calcite_group), crystal_system (monoclinic|orthorhombic|hexagonal|trigonal|isometric|triclinic|tetragonal|amorphous), crystal_habit, streak (black|white_or_colourless|grey|green|blue|brown|pink_to_red|yellow_to_orange), transparency (transparent|translucent|opaque), luster, tenacity, fracture (conchoidal|uneven|splintery|hackly|earthy|fibrous), cleavage_degree (none|very_poor|poor|good|perfect), cleavage_direction ("1"|"2"|"3"|"4"), cleavage_type (basal|prismatic|pinacoidal|rhombohedral|cubic|octahedral|dodecahedral), phenomena, ima_status (approved|grandfathered|questionable|discredited), rock_type (igneous|sedimentary|metamorphic). Массивы crystal_habit, luster, tenacity и phenomena содержат только коды из schema. base_color описывай, когда он известен. Для type=rock не требуй и не выдумывай свойства отдельного минерала: chemical_formula, crystal_system, mineral_class, IMA и подобные поля добавляй лишь когда они применимы. rock_type применяй только для rock: он отражает происхождение породы (igneous | sedimentary | metamorphic), а не торговое название. Если происхождение достоверно определить нельзя, не заполняй rock_type, а не угадывай.

В scientific НИКОГДА не включай hardness_note или composition. Локализованные заметки указывай отдельно как i18n.ru.scientific_notes {hardness, composition} и i18n.en.scientific_notes {hardness, composition}.

i18n.ru и i18n.en обязательны и содержат name; возможны synonyms (массив), color (массив), color_description, lore, identification_tips, safety_notes, scientific_notes и esoteric. В esoteric допустимы только metaphysical_properties (массив), chakras (массив), zodiac (массив), healing_interpretation, energy_notes, ritual_uses.

Каждая locality содержит ТОЛЬКО country_code, country_ru, country_en, region_ru, region_en, locality_ru, locality_en, description_ru, description_en, latitude, longitude, coordinate_precision, famous. country_code обязателен: ISO 3166-1 alpha-2, две заглавные буквы, например RU, MG, US. Не используй is_russian. latitude и longitude необязательны: каждое поле можно опустить или указать null; latitude — число от -90 до 90, longitude — число от -180 до 180, включая 0. coordinate_precision необязательно и допускает только exact, approximate или region (либо null). Добавляй координаты только при наличии надёжного источника: не выдумывай точные координаты и не ставь exact для приблизительной, региональной или неизвестной привязки. Если надёжных координат нет, опусти latitude, longitude и coordinate_precision или укажи null. В localities описывай только подтверждённые места происхождения или месторождения, реально относящиеся к данному камню. Не добавляй сведения об отсутствии месторождений в России, на Урале, в Сибири или в любых других странах и регионах, если отсутствие само по себе не имеет особого минералогического или исторического значения для данного материала. Не перечисляй страны и регионы только для того, чтобы сообщить, что камень там не встречается. Не создавай locality для предположительного или неподтверждённого месторождения. Если точная локализация источниками не установлена, укажи только достоверно известный уровень географии и не выдумывай более точные region/locality.

images: {storage_key, hero:{path}, thumbnail:{path}, gallery:[{path,type,caption:{ru,en}}]}. storage_key — идентификатор папки; все path относительны к нему, например hero.webp, thumbnail.webp, gallery/example00.webp. Не используй полные URL и не включай main_image_url, thumbnail_url или gallery[].url.

related_entities — массив slug, не related_minerals. sources — массив объектов только с title, url, author, publisher; у каждого source должен быть хотя бы title или url. URL — обычная строка URL, никогда не Markdown-ссылка.

Верни только валидный JSON без дополнительного текста.`;

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
      parsed = normalizeV2ImportSourceUrls(JSON.parse(trimmedInput));
    } catch (error) {
      toast.error(describeJsonError(trimmedInput, error), { duration: 15000 });
      return;
    }

    // Раньше `parsed as MineralFormData` был просто TS-кастом без реальной
    // проверки — форма молча обновлялась и показывала "успех", даже если
    // структура не совпадала со схемой (опечатка в enum-коде, не тот тип
    // поля и т.д.); ошибки вылезали только при сабмите, без явной связи
    // с тем, что источник — вставленный JSON. Теперь проверяем сразу.
    const result = GemEntityV2ImportSchema.safeParse(parsed);

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
    const aliasSuggestion: Record<string, string> = {
      chemical_class: 'Используйте scientific.mineral_class.', collector_group: 'Используйте scientific.mineral_family.',
      hardness_note: 'Поле больше не language-neutral. Используйте i18n.ru.scientific_notes.hardness или i18n.en.scientific_notes.hardness.',
      composition: 'Используйте i18n.ru.scientific_notes.composition или i18n.en.scientific_notes.composition.',
      related_minerals: 'Используйте related_entities.', main_image_url: 'Используйте images.storage_key и images.hero.path.', thumbnail_url: 'Используйте images.storage_key и images.thumbnail.path.',
    };
    const structuralIssues = result.error.issues.filter((issue) => issue.code !== 'custom');
    const businessIssues = result.error.issues.filter((issue) => issue.code === 'custom');

    if (structuralIssues.length > 0) {
      const preview = structuralIssues
        .slice(0, 5)
        .map((issue) => { const path = issue.path.join('.'); const key = String(issue.path.at(-1) ?? ''); return `${path}: ${issue.message}${aliasSuggestion[key] ? ` ${aliasSuggestion[key]}` : ''}`; })
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
