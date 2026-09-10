import assert from 'node:assert/strict';
import { toV2WritePayload } from '../lib/v2-helpers.ts';
import { GemEntityV2ImportSchema } from '../lib/validations/mineral.ts';
import { MINERAL_IMPORT_EXAMPLE } from '../lib/mineral-import-example.ts';
import { COUNTRIES, getCountryByCode, getCountryValues } from '../lib/countries.ts';
import { MINERAL_MARKDOWN_PROMPT_TEMPLATE, MINERAL_MARKDOWN_TEMPLATE, MineralMarkdownParseError, parseMineralMarkdown, parseMineralMarkdownWithWarnings, serializeMineralMarkdown } from '../lib/mineral-markdown.ts';
import { normalizeErrorMessage, parseRelatedEntityInput, resolveRelatedEntities } from '../lib/related-entities.ts';

assert.equal(COUNTRIES.length, 249, 'country directory must contain all ISO 3166-1 alpha-2 entries');
assert.equal(COUNTRIES.length, new Set(COUNTRIES.map(({ code }) => code)).size, 'country codes must be unique');
assert.ok(COUNTRIES.every(({ code }) => /^[A-Z]{2}$/.test(code)), 'country codes must be uppercase ISO alpha-2 values');
const madagascar = getCountryByCode('MG');
if (!madagascar) throw new Error('Madagascar must be present in country directory');
assert.deepEqual(madagascar, { code: 'MG', ru: 'Мадагаскар', en: 'Madagascar' });
assert.deepEqual(getCountryValues(madagascar), { country_code: 'MG', country_ru: 'Мадагаскар', country_en: 'Madagascar' });

const kambaba = MINERAL_IMPORT_EXAMPLE;
assert.equal(GemEntityV2ImportSchema.safeParse(kambaba).success, true, 'canonical example must pass MineralSchema');
const sourceWithoutUrl = { ...kambaba, sources: [{ title: 'Mindat: Kambaba Jasper', author: 'Mindat', publisher: 'Mindat.org' }] };
assert.equal(GemEntityV2ImportSchema.safeParse(sourceWithoutUrl).success, true, 'source with title and no URL must pass import schema validation');
const sourceWithUrl = { ...kambaba, sources: [{ url: 'https://www.mindat.org/min-52559.html' }] };
assert.equal(GemEntityV2ImportSchema.safeParse(sourceWithUrl).success, true, 'source with a normal URL must remain supported by import schema validation');
const sourceWithoutTitleOrUrl = { ...kambaba, sources: [{ author: 'Mindat', publisher: 'Mindat.org' }] };
assert.equal(GemEntityV2ImportSchema.safeParse(sourceWithoutTitleOrUrl).success, false, 'source without title or URL must fail import schema validation');
assert.deepEqual(parseRelatedEntityInput(' jasper, quartz, jasper, , ').slugs, ['jasper', 'quartz'], 'related slugs must trim, dedupe, and preserve order');
assert.deepEqual(parseRelatedEntityInput('iron oxides, Iron-Oxides, iron_oxides').warnings.map((warning) => warning.slug), ['iron oxides', 'Iron-Oxides', 'iron_oxides'], 'invalid related slugs must be reported');
let relatedGetCalls = 0;
const resolvedRelated = await resolveRelatedEntities(['jasper', 'quartz', 'jasper', 'radiolarite', 'iron oxides'], async (slug) => {
  relatedGetCalls++;
  if (slug === 'radiolarite') throw { status: 404 };
  if (slug === 'quartz') throw new Error('network down');
  return { slug };
});
assert.equal(relatedGetCalls, 3, 'a duplicate related slug must only cause one GET');
assert.deepEqual(resolvedRelated.slugs, ['jasper'], 'only existing related entities may be retained');
assert.deepEqual(resolvedRelated.warnings.map((warning) => warning.kind), ['invalid', 'unverified', 'not-found'], 'invalid, network, and 404 failures must remain distinct');
assert.equal(normalizeErrorMessage({}), 'Не удалось выполнить запрос.', 'empty API errors must never render as undefined');
const markdownWithBadRelated = parseMineralMarkdownWithWarnings(MINERAL_MARKDOWN_TEMPLATE.replace('## Связанные сущности\n\n', '## Связанные сущности\n- jasper\n- iron oxides\n- jasper\nобычный минералогический текст\n\n'));
assert.deepEqual(markdownWithBadRelated.data.related_entities, ['jasper'], 'Markdown must retain only syntactically valid unique list slugs');
assert.deepEqual(markdownWithBadRelated.warnings.map((warning) => warning.slug), ['iron oxides'], 'Markdown invalid related entries must not block the card import');
const locality = kambaba.localities[0];
const withLocality = (localityPatch) => ({ ...kambaba, localities: [{ ...locality, ...localityPatch }] });
const withoutGeo = { ...locality };
delete withoutGeo.latitude; delete withoutGeo.longitude; delete withoutGeo.coordinate_precision;
assert.equal(GemEntityV2ImportSchema.safeParse({ ...kambaba, localities: [withoutGeo] }).success, true, 'locality without geo fields must pass');
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ latitude: null, longitude: null, coordinate_precision: null })).success, true, 'null geo fields must pass');
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ latitude: 0, longitude: 0 })).success, true, 'zero coordinates must pass as numbers');
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ latitude: -90, longitude: -180 })).success, true, 'minimum coordinate bounds must pass');
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ latitude: 90, longitude: 180 })).success, true, 'maximum coordinate bounds must pass');
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ latitude: -90.000001 })).success, false, 'latitude below minimum must fail');
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ latitude: 90.000001 })).success, false, 'latitude above maximum must fail');
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ longitude: -180.000001 })).success, false, 'longitude below minimum must fail');
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ longitude: 180.000001 })).success, false, 'longitude above maximum must fail');
for (const coordinate_precision of ['exact', 'approximate', 'region']) {
  assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ coordinate_precision })).success, true, `${coordinate_precision} coordinate precision must pass`);
}
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ coordinate_precision: 'estimated' })).success, false, 'unknown coordinate precision must fail');
assert.equal(GemEntityV2ImportSchema.safeParse(withLocality({ geojson: { type: 'Point', coordinates: [46.5, -16.4] } })).success, false, 'unknown locality geo keys must be rejected by strict schema');
assert.equal(GemEntityV2ImportSchema.safeParse({ ...kambaba, scientific: { ...kambaba.scientific, crystal_system: 'trigonal' } }).success, true, 'valid scalar enum must pass schema validation');
assert.equal(GemEntityV2ImportSchema.safeParse({ ...kambaba, sources: [{ ...kambaba.sources[0], url: 'not-a-url' }] }).success, false, 'invalid source URL must fail schema validation');
const legacyExamples = [
  {...kambaba,scientific:{...kambaba.scientific,hardness_note:'legacy'}},
  {...kambaba,scientific:{...kambaba.scientific,composition:'legacy'}},
  {...kambaba,localities:[{...kambaba.localities[0],is_russian:false}]},
  {...kambaba,main_image_url:'https://example.com/hero.webp'},
  {...kambaba,thumbnail_url:'https://example.com/thumbnail.webp'},
  {...kambaba,images:{...kambaba.images,gallery:[{...kambaba.images.gallery[0],url:'https://example.com/gallery.webp'}]}},
  {...kambaba,related_minerals:[]},
];
for (const bad of [{extra:true},{...kambaba,scientific:{...kambaba.scientific,chemical_class:'x'}},...legacyExamples]) assert.equal(GemEntityV2ImportSchema.safeParse(bad).success, false, 'strict schema must reject legacy or unknown fields');
const write = toV2WritePayload({...kambaba, created_at:'x', updated_at:'y'});
assert.equal('created_at' in write, false); assert.equal('updated_at' in write, false);
for (const key of ['related_minerals','main_image_url','thumbnail_url','is_russian']) assert.equal(key in write, false);

const markdownRoundTrip = parseMineralMarkdown(serializeMineralMarkdown(kambaba));
const markdownRoundTripResult = GemEntityV2ImportSchema.safeParse(markdownRoundTrip);
assert.equal(markdownRoundTripResult.success, true, 'serialized canonical example must parse and validate as V2');
assert.equal(markdownRoundTripResult.data.slug, kambaba.slug);
assert.deepEqual(markdownRoundTripResult.data.scientific.hardness, kambaba.scientific.hardness);
assert.deepEqual(markdownRoundTripResult.data.scientific.specific_gravity, kambaba.scientific.specific_gravity);
assert.equal(markdownRoundTripResult.data.localities[0].latitude, -16.4);
assert.equal(markdownRoundTripResult.data.localities[0].longitude, 46.5);
assert.equal(markdownRoundTripResult.data.images.gallery[0].caption.ru, 'Образец');
assert.deepEqual(markdownRoundTripResult.data.related_entities, []);
assert.equal(markdownRoundTripResult.data.sources[0].url, 'https://www.mindat.org/');
const canonicalMarkdownKambaba = parseMineralMarkdown(MINERAL_MARKDOWN_TEMPLATE);
assert.equal(GemEntityV2ImportSchema.safeParse(canonicalMarkdownKambaba).success, true, 'Markdown template must be canonical V2 compatible');
assert.deepEqual(canonicalMarkdownKambaba.scientific, kambaba.scientific, 'Markdown and JSON Kambaba fixtures must have identical scientific data');
assert.deepEqual(canonicalMarkdownKambaba.scientific.hardness, kambaba.scientific.hardness, 'Markdown Kambaba must retain the canonical hardness range');
assert.deepEqual(canonicalMarkdownKambaba.scientific.specific_gravity, kambaba.scientific.specific_gravity, 'Markdown Kambaba must retain the canonical specific gravity range');
assert.equal(canonicalMarkdownKambaba.localities[0].latitude, kambaba.localities[0].latitude, 'Markdown Kambaba must retain its real fixture latitude');
assert.equal(canonicalMarkdownKambaba.localities[0].longitude, kambaba.localities[0].longitude, 'Markdown Kambaba must retain its real fixture longitude');
for (const mineralOnlyKey of ['chemical_formula', 'mineral_class', 'silicate_subclass', 'mineral_family', 'crystal_system', 'ima_status']) assert.equal(mineralOnlyKey in canonicalMarkdownKambaba.scientific, false, `rock template must leave ${mineralOnlyKey} empty`);
assert.ok(MINERAL_MARKDOWN_PROMPT_TEMPLATE.includes(MINERAL_MARKDOWN_TEMPLATE), 'Markdown AI prompt must include the exact canonical Markdown template');
assert.ok(MINERAL_MARKDOWN_PROMPT_TEMPLATE.includes('Создай результат именно как файл с расширением .md'), 'Markdown AI prompt must require creating an .md file');
assert.ok(MINERAL_MARKDOWN_PROMPT_TEMPLATE.includes('Имя файла: <slug>.md'), 'Markdown AI prompt must derive the file name from the entity slug');
assert.ok(MINERAL_MARKDOWN_PROMPT_TEMPLATE.includes('Не выводи содержимое Markdown отдельным текстовым ответом, если файл успешно создан'), 'Markdown AI prompt must not return Markdown separately after creating the file');
assert.ok(MINERAL_MARKDOWN_PROMPT_TEMPLATE.includes('не переименовывай разделы'), 'Markdown AI prompt must prohibit structural invention');
assert.ok(MINERAL_MARKDOWN_PROMPT_TEMPLATE.includes('ровно одно enum-значение или пусто; несколько значений через запятую запрещены'), 'Markdown AI prompt must forbid comma-separated scalar enums');
assert.ok(MINERAL_MARKDOWN_PROMPT_TEMPLATE.includes('scientific-строки crystal_habit, luster, tenacity, phenomena'), 'Markdown AI prompt must explicitly limit comma-separated scientific arrays');
for (const fragment of ['## Основное', '## Научные данные', '## Русский', '## English', '## Месторождения', '## Изображения', '## Связанные сущности', '## Источники', '### scientific_notes.hardness', '### esoteric.ritual_uses', '| country_code | country_ru |', '| path | type | caption_ru | caption_en |', '| title | url | author | publisher |']) {
  assert.ok(MINERAL_MARKDOWN_TEMPLATE.includes(fragment), `canonical Markdown template must include ${fragment}`);
}

const richMarkdownData = {
  ...kambaba,
  scientific: { ...kambaba.scientific, crystal_habit: ['massive', 'granular'], luster: ['vitreous', 'waxy'], tenacity: ['brittle'], phenomena: ['iridescence', 'chatoyancy'] },
  i18n: {
    ru: { name: 'Камбаба-яшма', synonyms: ['Камбаба', 'крокодиловая яшма'], color: ['зелёный', 'чёрный'], color_description: 'Первая строка.\nВторая строка.', scientific_notes: { hardness: 'Многострочная\nзаметка.' }, esoteric: { metaphysical_properties: ['спокойствие', 'заземление'], chakras: ['сердечная'], zodiac: ['Рак'] } },
    en: { name: 'Kambaba Jasper', color_description: 'First line.\nSecond line.' },
  },
  related_entities: ['rhyolite', 'jasper', 'ocean-jasper'],
};
const richParsed = parseMineralMarkdown(serializeMineralMarkdown(richMarkdownData));
assert.deepEqual(richParsed.scientific.crystal_habit, ['massive', 'granular']);
assert.deepEqual(richParsed.scientific.luster, ['vitreous', 'waxy']);
assert.deepEqual(richParsed.scientific.tenacity, ['brittle']);
assert.deepEqual(richParsed.scientific.phenomena, ['iridescence', 'chatoyancy']);
assert.equal(richParsed.i18n.ru.color_description, 'Первая строка.\nВторая строка.');
assert.deepEqual(richParsed.i18n.ru.synonyms, ['Камбаба', 'крокодиловая яшма']);
assert.deepEqual(richParsed.related_entities, ['rhyolite', 'jasper', 'ocean-jasper']);

const scientificMarkdownValue = (field, value) => MINERAL_MARKDOWN_TEMPLATE.replace(
  new RegExp(`(\\| ${field} \\| )[^|]*( \\|)`),
  `$1${value}$2`,
);
const scalarScientificEnumCases = [
  ['rarity', 'common', 'uncommon'],
  ['base_color', 'green', 'black'],
  ['mineral_class', 'silicates', 'organic'],
  ['silicate_subclass', 'tectosilicates', 'phyllosilicates'],
  ['mineral_family', 'quartz_group', 'garnet_group'],
  ['crystal_system', 'trigonal', 'monoclinic'],
  ['streak', 'black', 'grey'],
  ['transparency', 'opaque', 'translucent'],
  ['fracture', 'conchoidal', 'uneven'],
  ['cleavage_degree', 'good', 'perfect'],
  ['cleavage_direction', '1', '2'],
  ['cleavage_type', 'basal', 'prismatic'],
  ['ima_status', 'approved', 'grandfathered'],
  ['rock_type', 'igneous', 'sedimentary'],
];
for (const [field, validValue, secondValue] of scalarScientificEnumCases) {
  const validMarkdown = scientificMarkdownValue(field, validValue);
  const validData = parseMineralMarkdown(validMarkdown);
  assert.equal(validData.scientific[field], validValue, `${field} must retain one scalar enum value`);
  assert.equal(GemEntityV2ImportSchema.safeParse(validData).success, true, `${field}: one enum value must validate`);

  const invalidValue = `${validValue}, ${secondValue}`;
  const invalidData = parseMineralMarkdown(scientificMarkdownValue(field, invalidValue));
  assert.equal(invalidData.scientific[field], invalidValue, `${field}: parser must not silently coerce a comma-separated scalar enum`);
  assert.equal(GemEntityV2ImportSchema.safeParse(invalidData).success, false, `${field}: comma-separated scalar enums must fail canonical V2 validation`);

  const emptyData = parseMineralMarkdown(scientificMarkdownValue(field, ''));
  assert.equal(field in emptyData.scientific, false, `${field}: an empty optional scalar enum must be omitted`);
  assert.equal(GemEntityV2ImportSchema.safeParse(emptyData).success, true, `${field}: an empty optional scalar enum must validate`);
}

const syntheticCoordinateFixture = {
  ...kambaba,
  slug: 'synthetic-coordinate-test',
  i18n: { ru: { name: 'Synthetic coordinate test' }, en: { name: 'Synthetic coordinate test' } },
  localities: [{ country_code: 'ZZ', country_ru: null, country_en: null, region_ru: null, region_en: null, locality_ru: null, locality_en: null, description_ru: null, description_en: null, famous: false }],
};
for (const coordinate_precision of ['exact', 'approximate', 'region']) {
  const parsedLocality = parseMineralMarkdown(serializeMineralMarkdown({ ...syntheticCoordinateFixture, localities: [{ ...syntheticCoordinateFixture.localities[0], latitude: 0, longitude: 0, coordinate_precision }] }));
  assert.equal(parsedLocality.localities[0].latitude, 0, 'zero latitude must survive Markdown parsing');
  assert.equal(parsedLocality.localities[0].longitude, 0, 'zero longitude must survive Markdown parsing');
  assert.equal(parsedLocality.localities[0].coordinate_precision, coordinate_precision);
}
const markdownWithoutCoordinates = parseMineralMarkdown(serializeMineralMarkdown(withLocality({ latitude: null, longitude: null, coordinate_precision: null })));
assert.equal('latitude' in markdownWithoutCoordinates.localities[0], false, 'empty coordinate cell maps to absent field');
assert.equal('longitude' in markdownWithoutCoordinates.localities[0], false, 'empty coordinate cell maps to absent field');

const markdownError = (markdown, message) => assert.throws(() => parseMineralMarkdown(markdown), (error) => error instanceof MineralMarkdownParseError && error.message.includes(message));
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('<!-- samotsvety-mineral-md:v1 -->', ''), 'Требуется маркер');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('v1 -->', 'v2 -->'), 'Требуется маркер');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('## Основное', '## Неизвестный раздел'), 'Неизвестный раздел');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('## Основное', '## basic'), 'Неизвестный раздел');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('| rock_type | igneous |', '| made_up_field | value |'), 'Неизвестное поле таблицы');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('| country_code | country_ru |', '| country_code | unknown_column |'), 'Неожиданные колонки');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('| hardness_min | 6 |', '| hardness_min | six |'), 'должно быть числом');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('| -16.4 | 46.5 | approximate | true |', '| -16.4 | 46.5 | approximate | yes |'), 'famous допускает');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('hero.webp', 'https://example.com/hero.webp'), 'относительным путём');
const invalidEnumMarkdown = parseMineralMarkdown(MINERAL_MARKDOWN_TEMPLATE.replace('| base_color | green |', '| base_color | ultraviolet |'));
assert.equal(GemEntityV2ImportSchema.safeParse(invalidEnumMarkdown).success, false, 'invalid enum must pass Markdown structure parser and fail V2 schema');
const invalidSlugMarkdown = parseMineralMarkdown(MINERAL_MARKDOWN_TEMPLATE.replace('| slug | kambaba-jasper |', '| slug | Not a slug |'));
assert.equal(GemEntityV2ImportSchema.safeParse(invalidSlugMarkdown).success, false, 'invalid slug must fail V2 schema');
console.log('V2 regression checks passed');
