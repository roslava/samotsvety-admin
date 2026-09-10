import {
  BASE_COLOR_VALUES, CLEAVAGE_DEGREE_VALUES, CLEAVAGE_DIRECTION_VALUES, CLEAVAGE_TYPE_VALUES,
  CRYSTAL_HABIT_VALUES, CRYSTAL_SYSTEM_VALUES, ENTITY_TYPE_VALUES, FRACTURE_VALUES,
  IMA_STATUS_VALUES, LUSTER_VALUES, MINERAL_CLASS_VALUES, MINERAL_FAMILY_VALUES,
  PHENOMENON_VALUES, RARITY_VALUES, ROCK_TYPE_VALUES, SILICATE_SUBCLASS_VALUES,
  STREAK_VALUES, TENACITY_VALUES, TRANSPARENCY_VALUES, type MineralFormData,
} from './validations/mineral.ts';
import { parseRelatedEntityInput, type RelatedEntityWarning } from './related-entities.ts';

export const MINERAL_MARKDOWN_VERSION = '<!-- samotsvety-mineral-md:v1 -->';

export class MineralMarkdownParseError extends Error {
  public readonly line?: number;
  public readonly section?: string;

  constructor(message: string, line?: number, section?: string) {
    super(`${section ? `${section}: ` : ''}${message}${line ? ` (строка ${line})` : ''}`);
    this.name = 'MineralMarkdownParseError';
    this.line = line;
    this.section = section;
  }
}

const scientificKeys = new Set([
  'chemical_formula', 'hardness_min', 'hardness_max', 'specific_gravity_min', 'specific_gravity_max',
  'rarity', 'base_color', 'mineral_class', 'silicate_subclass', 'mineral_family', 'crystal_system',
  'crystal_habit', 'streak', 'transparency', 'luster', 'tenacity', 'fracture', 'cleavage_degree',
  'cleavage_direction', 'cleavage_type', 'phenomena', 'ima_status', 'rock_type',
]);
// Keep this classification aligned with MineralSchema: these are the only
// scientific table rows that Markdown v1 turns into comma-separated arrays.
const scientificArrayKeys = new Set(['crystal_habit', 'luster', 'tenacity', 'phenomena']);
const scientificScalarEnumKeys = [
  'rarity', 'base_color', 'mineral_class', 'silicate_subclass', 'mineral_family', 'crystal_system',
  'streak', 'transparency', 'fracture', 'cleavage_degree', 'cleavage_direction', 'cleavage_type',
  'ima_status', 'rock_type',
] as const;
const localizedKeys = new Set([
  'name', 'synonyms', 'color', 'color_description', 'lore', 'identification_tips', 'safety_notes',
  'scientific_notes.hardness', 'scientific_notes.composition', 'esoteric.metaphysical_properties',
  'esoteric.chakras', 'esoteric.zodiac', 'esoteric.healing_interpretation', 'esoteric.energy_notes',
  'esoteric.ritual_uses',
]);
const topLevelSections = new Set(['Основное', 'Научные данные', 'Русский', 'English', 'Месторождения', 'Изображения', 'Связанные сущности', 'Источники']);
const localityColumns = ['country_code', 'country_ru', 'country_en', 'region_ru', 'region_en', 'locality_ru', 'locality_en', 'description_ru', 'description_en', 'latitude', 'longitude', 'coordinate_precision', 'famous'];
const galleryColumns = ['path', 'type', 'caption_ru', 'caption_en'];
const sourceColumns = ['title', 'url', 'author', 'publisher'];

type Section = { name: string; line: number; body: string[]; bodyStart: number };
type Row = Record<string, string>;

const error = (message: string, line?: number, section?: string): never => { throw new MineralMarkdownParseError(message, line, section); };
const valueOrUndefined = (value: string) => value.trim() || undefined;
const commaList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const assertRelativeImagePath = (value: string, line: number, field: string): string => {
  const path = value.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) error(`${field} должен быть относительным путём, а не URL`, line, 'Изображения');
  return path;
};

function numberValue(value: string, line: number, field: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Number('') and parseFloat('3abc') are deliberately not accepted.
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(trimmed)) error(`Поле ${field} должно быть числом`, line);
  const number = Number(trimmed);
  if (!Number.isFinite(number)) error(`Поле ${field} должно быть конечным числом`, line);
  return number;
}

function table(section: Section, expectedColumns: string[]): { rows: Row[]; lineByRow: number[] } {
  const rows = section.body.map((text, index) => ({ text, line: section.bodyStart + index })).filter(({ text }) => text.trim());
  if (rows.length < 2) error('Ожидается таблица с заголовком и разделителем', section.line, section.name);
  const parseCells = (text: string, line: number): string[] => {
    const trimmed = text.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) error('Строка таблицы должна начинаться и заканчиваться символом |', line, section.name);
    const cells: string[] = [];
    let cell = '';
    let escaped = false;
    for (const character of trimmed.slice(1, -1)) {
      if (escaped) { cell += character === 'n' ? '\n' : character; escaped = false; }
      else if (character === '\\') escaped = true;
      else if (character === '|') { cells.push(cell.trim()); cell = ''; }
      else cell += character;
    }
    if (escaped) error('Незавершённая escape-последовательность в таблице', line, section.name);
    cells.push(cell.trim());
    return cells;
  };
  const header = parseCells(rows[0].text, rows[0].line);
  if (header.length !== expectedColumns.length || header.some((cell, index) => cell !== expectedColumns[index])) {
    error(`Неожиданные колонки таблицы; ожидаются: ${expectedColumns.join(', ')}`, rows[0].line, section.name);
  }
  const separator = parseCells(rows[1].text, rows[1].line);
  if (separator.length !== header.length || separator.some((cell) => !/^:?-{3,}:?$/.test(cell))) error('Некорректная строка-разделитель таблицы', rows[1].line, section.name);
  const parsed: Row[] = [];
  const lineByRow: number[] = [];
  for (const row of rows.slice(2)) {
    const cells = parseCells(row.text, row.line);
    if (cells.length !== header.length) error(`Ожидается ${header.length} колонок, получено ${cells.length}`, row.line, section.name);
    parsed.push(Object.fromEntries(header.map((column, index) => [column, cells[index]])));
    lineByRow.push(row.line);
  }
  return { rows: parsed, lineByRow };
}

function keyValueTable(section: Section, allowed: Set<string>): Map<string, { value: string; line: number }> {
  const result = table(section, ['Поле', 'Значение']);
  const values = new Map<string, { value: string; line: number }>();
  result.rows.forEach((row, index) => {
    const key = row.Поле;
    if (!allowed.has(key)) error(`Неизвестное поле таблицы: ${key}`, result.lineByRow[index], section.name);
    if (values.has(key)) error(`Поле ${key} указано повторно`, result.lineByRow[index], section.name);
    values.set(key, { value: row.Значение, line: result.lineByRow[index] });
  });
  return values;
}

function optionalText(object: Record<string, unknown>, key: string, value: string): void { const result = valueOrUndefined(value); if (result !== undefined) object[key] = result; }

function localized(section: Section): Record<string, unknown> {
  const parts: { key: string; line: number; value: string }[] = [];
  let current: { key: string; line: number; lines: string[] } | undefined;
  section.body.forEach((line, index) => {
    const lineNumber = section.bodyStart + index;
    const heading = line.match(/^### ([^#].*)$/);
    if (heading) {
      if (current) parts.push({ key: current.key, line: current.line, value: current.lines.join('\n').replace(/^\n+|\n+$/g, '') });
      const key = heading[1].trim();
      if (!localizedKeys.has(key)) error(`Неизвестное локализованное поле: ${key}`, lineNumber, section.name);
      if (parts.some((part) => part.key === key) || current?.key === key) error(`Поле ${key} указано повторно`, lineNumber, section.name);
      current = { key, line: lineNumber, lines: [] };
    } else {
      if (/^#{1,6}\s/.test(line)) error('Допустимы только заголовки уровня ### для локализованных полей', lineNumber, section.name);
      if (!current && line.trim()) error('Текст должен находиться под заголовком ### поля', lineNumber, section.name);
      current?.lines.push(line);
    }
  });
  if (current) parts.push({ key: current.key, line: current.line, value: current.lines.join('\n').replace(/^\n+|\n+$/g, '') });
  const result: Record<string, unknown> = {};
  for (const part of parts) {
    if (!part.value.trim()) continue;
    if (['synonyms', 'color'].includes(part.key)) result[part.key] = commaList(part.value);
    else if (part.key.startsWith('scientific_notes.')) {
      const notes = (result.scientific_notes ??= {}) as Record<string, unknown>;
      notes[part.key.slice('scientific_notes.'.length)] = part.value;
    } else if (part.key.startsWith('esoteric.')) {
      const esoteric = (result.esoteric ??= {}) as Record<string, unknown>;
      const key = part.key.slice('esoteric.'.length);
      esoteric[key] = ['metaphysical_properties', 'chakras', 'zodiac'].includes(key) ? commaList(part.value) : part.value;
    } else result[part.key] = part.value;
  }
  return result;
}

/** Strict parser for the deliberately small Samotsvety Markdown v1 interchange format. */
export function parseMineralMarkdown(markdown: string): unknown {
  const lines = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  if (lines[0]?.trim() !== MINERAL_MARKDOWN_VERSION) error(`Требуется маркер формата ${MINERAL_MARKDOWN_VERSION}`, 1);
  let index = 1;
  while (!lines[index]?.trim()) index++;
  const title = lines[index]?.match(/^# ([^#].*)$/);
  if (!title || !title[1].trim()) error('После маркера требуется заголовок вида # <человеческое название>', index + 1);
  index++;
  const sections: Section[] = [];
  let current: Section | undefined;
  for (; index < lines.length; index++) {
    const heading = lines[index].match(/^## ([^#].*)$/);
    if (heading) {
      if (current) sections.push(current);
      const name = heading[1].trim();
      if (!topLevelSections.has(name)) error(`Неизвестный раздел: ${name}`, index + 1);
      if (sections.some((section) => section.name === name)) error(`Раздел ${name} указан повторно`, index + 1);
      current = { name, line: index + 1, body: [], bodyStart: index + 2 };
    } else if (/^### [^#]/.test(lines[index]) && current) {
      current.body.push(lines[index]);
    } else if (/^#{1,6}\s/.test(lines[index])) {
      error('Неожиданный заголовок: разделы должны быть ##, поля — ###', index + 1, current?.name);
    } else if (current) current.body.push(lines[index]);
    else if (lines[index].trim()) error('Текст вне раздела не допускается', index + 1);
  }
  if (current) sections.push(current);
  const byName = new Map(sections.map((section) => [section.name, section]));
  for (const required of ['Основное', 'Научные данные', 'Русский', 'English']) if (!byName.has(required)) error(`Отсутствует обязательный раздел ${required}`);

  const main = keyValueTable(byName.get('Основное')!, new Set(['slug', 'type']));
  const output: Record<string, unknown> = {
    scientific: {},
    i18n: { ru: localized(byName.get('Русский')!), en: localized(byName.get('English')!) },
  };
  for (const key of ['slug', 'type']) { const item = main.get(key); if (item?.value.trim()) output[key] = item.value.trim(); }
  const scientific = output.scientific as Record<string, unknown>;
  const science = keyValueTable(byName.get('Научные данные')!, scientificKeys);
  for (const [key, item] of science) {
    if (!item.value.trim()) continue;
    if (key === 'hardness_min' || key === 'hardness_max') {
      const hardness = (scientific.hardness ??= {}) as Record<string, unknown>;
      hardness[key.slice('hardness_'.length)] = numberValue(item.value, item.line, key);
    } else if (key === 'specific_gravity_min' || key === 'specific_gravity_max') {
      const gravity = (scientific.specific_gravity ??= {}) as Record<string, unknown>;
      gravity[key.slice('specific_gravity_'.length)] = numberValue(item.value, item.line, key);
    } else if (scientificArrayKeys.has(key)) scientific[key] = commaList(item.value);
    else scientific[key] = item.value.trim();
  }
  if (!Object.keys(scientific).length) delete output.scientific;

  const localitySection = byName.get('Месторождения');
  if (localitySection) {
    const parsed = table(localitySection, localityColumns);
    output.localities = parsed.rows.map((row, rowIndex) => {
      if (!row.country_code.trim()) error('country_code обязателен', parsed.lineByRow[rowIndex], localitySection.name);
      const locality: Record<string, unknown> = { country_code: row.country_code.trim() };
      for (const key of ['country_ru', 'country_en', 'region_ru', 'region_en', 'locality_ru', 'locality_en', 'description_ru', 'description_en']) optionalText(locality, key, row[key]);
      for (const key of ['latitude', 'longitude']) { const value = numberValue(row[key], parsed.lineByRow[rowIndex], key); if (value !== undefined) locality[key] = value; }
      if (row.coordinate_precision.trim()) {
        const precision = row.coordinate_precision.trim();
        if (!['exact', 'approximate', 'region'].includes(precision)) error('coordinate_precision допускает только exact, approximate или region', parsed.lineByRow[rowIndex], localitySection.name);
        locality.coordinate_precision = precision;
      }
      if (row.famous.trim()) {
        if (!['true', 'false'].includes(row.famous.trim())) error('famous допускает только true, false или пустое значение', parsed.lineByRow[rowIndex], localitySection.name);
        locality.famous = row.famous.trim() === 'true';
      }
      return locality;
    });
  }

  const imagesSection = byName.get('Изображения');
  if (imagesSection) {
    const blocks = new Map<string, { value: string; line: number }>();
    let active: { key: string; line: number; lines: string[] } | undefined;
    const flush = () => { if (active) blocks.set(active.key, { value: active.lines.join('\n').trim(), line: active.line }); };
    imagesSection.body.forEach((line, offset) => {
      const heading = line.match(/^### ([^#].*)$/);
      if (heading) { flush(); const key = heading[1].trim(); if (!['storage_key', 'hero', 'thumbnail', 'gallery'].includes(key)) error(`Неизвестное поле изображений: ${key}`, imagesSection.bodyStart + offset, imagesSection.name); if (blocks.has(key)) error(`Поле ${key} указано повторно`, imagesSection.bodyStart + offset, imagesSection.name); active = { key, line: imagesSection.bodyStart + offset, lines: [] }; }
      else { if (!active && line.trim()) error('Содержимое изображений должно находиться под ### полем', imagesSection.bodyStart + offset, imagesSection.name); active?.lines.push(line); }
    });
    flush();
    const images: Record<string, unknown> = {};
    for (const key of ['storage_key', 'hero', 'thumbnail']) {
      const block = blocks.get(key);
      if (block?.value) images[key] = key === 'storage_key' ? block.value : { path: assertRelativeImagePath(block.value, block.line, key) };
    }
    const gallery = blocks.get('gallery');
    if (gallery) {
      const galleryBody = gallery.value ? gallery.value.split('\n') : [];
      const parsed = table({ name: 'Изображения / gallery', line: gallery.line, body: galleryBody, bodyStart: gallery.line + 1 }, galleryColumns);
      images.gallery = parsed.rows.map((row, index) => {
        const item: Record<string, unknown> = { path: assertRelativeImagePath(row.path, parsed.lineByRow[index], 'gallery.path'), type: row.type.trim() };
        const caption: Record<string, unknown> = {}; optionalText(caption, 'ru', row.caption_ru); optionalText(caption, 'en', row.caption_en);
        if (Object.keys(caption).length) item.caption = caption;
        return item;
      });
    }
    if (Object.keys(images).length) output.images = images;
  }
  const related = byName.get('Связанные сущности');
  if (related) {
    const values: string[] = [];
    related.body.forEach((line, offset) => {
      if (!line.trim()) return;
      const match = line.match(/^- ([^\s].*)$/);
      // Only list entries are related entities. Ordinary prose in this optional
      // section must not be promoted to a relationship.
      if (!match) return;
      values.push(match[1]);
    });
    output.related_entities = parseRelatedEntityInput(values).slugs;
  }
  const sourceSection = byName.get('Источники');
  if (sourceSection) {
    const parsed = table(sourceSection, sourceColumns);
    output.sources = parsed.rows.map((row) => { const source: Record<string, unknown> = {}; for (const key of sourceColumns) optionalText(source, key, row[key]); return source; });
  }
  return output;
}

/** Strict parse plus non-blocking related-entity warnings for the importer. */
export function parseMineralMarkdownWithWarnings(markdown: string): { data: unknown; warnings: RelatedEntityWarning[] } {
  const data = parseMineralMarkdown(markdown);
  const section = markdown.replace(/\r\n?/g, '\n').match(/^## Связанные сущности\n([\s\S]*?)(?=^## |$(?![\s\S]))/m);
  const values = section?.[1].split('\n').flatMap((line) => line.match(/^- (.*)$/) ? [line.slice(2)] : []) ?? [];
  return { data, warnings: parseRelatedEntityInput(values).warnings };
}

function textBlock(key: string, value: unknown): string { return value == null || value === '' ? '' : `### ${key}\n${value}\n\n`; }
function cell(value: unknown): string { return value == null ? '' : String(value).replaceAll('\\', '\\\\').replaceAll('|', '\\|').replaceAll('\n', '\\n'); }
function valueAt(object: Record<string, unknown> | null | undefined, key: string): unknown { return object?.[key]; }

/** Serializes canonical form data to the only Markdown format accepted by parseMineralMarkdown. */
export function serializeMineralMarkdown(data: MineralFormData): string {
  const source = data as unknown as Record<string, any>;
  const science = source.scientific ?? {};
  const line = (key: string, value: unknown) => `| ${key} | ${cell(value)} |`;
  const scientificRows: [string, unknown][] = [
    ['chemical_formula', science.chemical_formula], ['hardness_min', science.hardness?.min], ['hardness_max', science.hardness?.max], ['specific_gravity_min', science.specific_gravity?.min], ['specific_gravity_max', science.specific_gravity?.max], ['rarity', science.rarity], ['base_color', science.base_color], ['mineral_class', science.mineral_class], ['silicate_subclass', science.silicate_subclass], ['mineral_family', science.mineral_family], ['crystal_system', science.crystal_system], ['crystal_habit', science.crystal_habit?.join(', ')], ['streak', science.streak], ['transparency', science.transparency], ['luster', science.luster?.join(', ')], ['tenacity', science.tenacity?.join(', ')], ['fracture', science.fracture], ['cleavage_degree', science.cleavage_degree], ['cleavage_direction', science.cleavage_direction], ['cleavage_type', science.cleavage_type], ['phenomena', science.phenomena?.join(', ')], ['ima_status', science.ima_status], ['rock_type', science.rock_type],
  ];
  const localizedSection = (heading: string, locale: Record<string, any>) => {
    const blocks = [textBlock('name', locale.name), textBlock('synonyms', locale.synonyms?.join(', ')), textBlock('color', locale.color?.join(', ')), textBlock('color_description', locale.color_description), textBlock('lore', locale.lore), textBlock('identification_tips', locale.identification_tips), textBlock('safety_notes', locale.safety_notes), textBlock('scientific_notes.hardness', locale.scientific_notes?.hardness), textBlock('scientific_notes.composition', locale.scientific_notes?.composition), textBlock('esoteric.metaphysical_properties', locale.esoteric?.metaphysical_properties?.join(', ')), textBlock('esoteric.chakras', locale.esoteric?.chakras?.join(', ')), textBlock('esoteric.zodiac', locale.esoteric?.zodiac?.join(', ')), textBlock('esoteric.healing_interpretation', locale.esoteric?.healing_interpretation), textBlock('esoteric.energy_notes', locale.esoteric?.energy_notes), textBlock('esoteric.ritual_uses', locale.esoteric?.ritual_uses)].filter(Boolean).join('');
    return `## ${heading}\n${blocks}`;
  };
  const localities = source.localities ?? [];
  const localityRows = localities.map((item: Record<string, unknown>) => `| ${localityColumns.map((key) => cell(item[key])).join(' | ')} |`).join('\n');
  const gallery = source.images?.gallery ?? [];
  const galleryRows = gallery.map((item: Record<string, any>) => `| ${[item.path, item.type, item.caption?.ru, item.caption?.en].map(cell).join(' | ')} |`).join('\n');
  const sources = source.sources ?? [];
  const sourceRows = sources.map((item: Record<string, unknown>) => `| ${sourceColumns.map((key) => cell(item[key])).join(' | ')} |`).join('\n');
  return `${MINERAL_MARKDOWN_VERSION}\n\n# ${source.i18n?.ru?.name ?? source.i18n?.en?.name ?? source.slug}\n\n## Основное\n| Поле | Значение |\n|---|---|\n${line('slug', source.slug)}\n${line('type', source.type)}\n\n## Научные данные\n| Поле | Значение |\n|---|---|\n${scientificRows.map(([key, value]) => line(key, value)).join('\n')}\n\n${localizedSection('Русский', source.i18n.ru)}${localizedSection('English', source.i18n.en)}## Месторождения\n| ${localityColumns.join(' | ')} |\n|---|---|---|---|---|---|---|---|---|---:|---:|---|---|\n${localityRows}\n\n## Изображения\n${textBlock('storage_key', source.images?.storage_key)}${textBlock('hero', source.images?.hero?.path)}${textBlock('thumbnail', source.images?.thumbnail?.path)}### gallery\n| ${galleryColumns.join(' | ')} |\n|---|---|---|---|\n${galleryRows}\n\n## Связанные сущности\n${(source.related_entities ?? []).map((slug: string) => `- ${slug}`).join('\n')}\n\n## Источники\n| ${sourceColumns.join(' | ')} |\n|---|---|---|---|\n${sourceRows}\n`;
}

export const MINERAL_MARKDOWN_TEMPLATE = serializeMineralMarkdown({
  slug: 'kambaba-jasper', type: 'rock', scientific: { hardness: { min: 6, max: 7 }, specific_gravity: { min: 2.6, max: 2.8 }, base_color: 'green', rock_type: 'igneous' },
  i18n: { ru: { name: 'Камбаба-яшма', synonyms: ['Камбаба', 'крокодиловая яшма'], color: ['зелёный', 'чёрный'], color_description: 'Текст может занимать несколько строк.', lore: 'Пример истории.', identification_tips: 'Пример диагностического признака.', safety_notes: 'Пример примечания по безопасности.', scientific_notes: { hardness: '6–7 по шкале Мооса.', composition: 'Вулканическая риолитовая порода.' }, esoteric: { metaphysical_properties: ['спокойствие', 'заземление'], chakras: ['сердечная'], zodiac: ['Рак'], healing_interpretation: 'Пример интерпретации.', energy_notes: 'Пример энергетической заметки.', ritual_uses: 'Пример применения.' } }, en: { name: 'Kambaba Jasper', synonyms: ['Crocodile Jasper'], color: ['green', 'black'], color_description: 'Text may span multiple lines.', lore: 'Example history.', identification_tips: 'Example identification tip.', safety_notes: 'Example safety note.', scientific_notes: { hardness: '6–7 on the Mohs scale.', composition: 'A rhyolitic volcanic rock.' }, esoteric: { metaphysical_properties: ['calm', 'grounding'], chakras: ['heart'], zodiac: ['Cancer'], healing_interpretation: 'Example interpretation.', energy_notes: 'Example energy note.', ritual_uses: 'Example use.' } } },
  localities: [{ country_code: 'MG', country_ru: 'Мадагаскар', country_en: 'Madagascar', region_ru: null, region_en: null, locality_ru: null, locality_en: null, description_ru: null, description_en: null, latitude: -16.4, longitude: 46.5, coordinate_precision: 'approximate', famous: true }],
  images: { storage_key: 'kambaba_jasper', hero: { path: 'hero.webp' }, thumbnail: { path: 'thumbnail.webp' }, gallery: [{ path: 'gallery/example00.webp', type: 'specimen', caption: { ru: 'Образец', en: 'Specimen' } }] }, related_entities: [], sources: [{ title: 'Mindat: Kambaba Jasper', url: 'https://www.mindat.org/', author: null, publisher: 'Mindat' }],
} as MineralFormData);

const enumValues = (values: readonly string[]) => values.join('|');

export const MINERAL_MARKDOWN_PROMPT_TEMPLATE = `Ты — эксперт-минералог и геммолог. Создай Samotsvety Markdown v1 для «[НАЗВАНИЕ_КАМНЯ]».

Создай результат именно как файл с расширением .md и предоставь этот файл пользователю.

Имя файла: <slug>.md, где <slug> — значение поля slug создаваемой сущности.

Содержимое файла должно быть ТОЛЬКО Markdown-документом Samotsvety Markdown v1 строго по полному шаблону ниже. Не добавляй в файл пояснения, code fence, JSON, комментарии от себя или любой другой текст до/после Markdown-документа. Не выводи содержимое Markdown отдельным текстовым ответом, если файл успешно создан. Результатом должен быть готовый .md-файл для загрузки в Samotsvety Admin.

Замени примерные значения на проверенные факты для запрошенного камня, но не переименовывай разделы, не добавляй неизвестные разделы, не меняй уровни заголовков, названия ключей или порядок и названия колонок. Пустые неизвестные optional значения оставляй пустыми (не пиши null); обязательные slug, type, scientific и name для RU/EN заполни. Запятые разрешены только в реально массивных полях: scientific-строки crystal_habit, luster, tenacity, phenomena; ###-поля synonyms, color, esoteric.metaphysical_properties, esoteric.chakras, esoteric.zodiac. Для таблиц используй \\| для literal | и \\n для переноса в ячейке.

type: mineral — самостоятельный минеральный вид; rock — горная порода/природная смесь; gem_variety — геммологическая разновидность минерала; organic — материал органического происхождения. Не выбирай mineral только из-за торгового названия. Для rock заполняй rock_type только при достоверном происхождении.

Enum values: type ${enumValues(ENTITY_TYPE_VALUES)}; rarity ${enumValues(RARITY_VALUES)}; base_color ${enumValues(BASE_COLOR_VALUES)}; mineral_class ${enumValues(MINERAL_CLASS_VALUES)}; silicate_subclass ${enumValues(SILICATE_SUBCLASS_VALUES)}; mineral_family ${enumValues(MINERAL_FAMILY_VALUES)}; crystal_system ${enumValues(CRYSTAL_SYSTEM_VALUES)}; crystal_habit ${enumValues(CRYSTAL_HABIT_VALUES)}; streak ${enumValues(STREAK_VALUES)}; transparency ${enumValues(TRANSPARENCY_VALUES)}; luster ${enumValues(LUSTER_VALUES)}; tenacity ${enumValues(TENACITY_VALUES)}; fracture ${enumValues(FRACTURE_VALUES)}; cleavage_degree ${enumValues(CLEAVAGE_DEGREE_VALUES)}; cleavage_direction ${enumValues(CLEAVAGE_DIRECTION_VALUES)}; cleavage_type ${enumValues(CLEAVAGE_TYPE_VALUES)}; phenomena ${enumValues(PHENOMENON_VALUES)}; ima_status ${enumValues(IMA_STATUS_VALUES)}; rock_type ${enumValues(ROCK_TYPE_VALUES)}.

Scientific scalar enum rows ${scientificScalarEnumKeys.join(', ')}: ровно одно enum-значение или пусто; несколько значений через запятую запрещены. Не превращай scalar enum в список и не выбирай первое значение из нескольких. Только crystal_habit, luster, tenacity и phenomena являются scientific arrays.

hardness_min/max и specific_gravity_min/max — реальные числа. scientific_notes находятся только в локализованных ### scientific_notes.hardness/composition. country_code — ISO alpha-2. Никогда не выдумывай координаты; latitude/longitude/coordinate_precision оставь пустыми без надёжного источника. coordinate_precision: exact|approximate|region. famous: true|false или пусто. Пути images только относительные, не URL. related_entities — один существующий slug в каждой строке списка. Указывай только slug, в существовании которого уверен по предоставленному каталогу; если каталога нет, оставь раздел пустым. Не выдумывай связи и не преобразуй названия в slug. sources.url — обычный URL, не Markdown link. Не создавай legacy поля.

ПОЛНЫЙ CANONICAL MARKDOWN V1 TEMPLATE (воспроизводи его структуру буквально):

${MINERAL_MARKDOWN_TEMPLATE}`;
