import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeV2ImportSourceUrls, parseV2Import, toV2WritePayload } from '../lib/v2-helpers.ts';
import { GemEntityV2ImportSchema } from '../lib/validations/mineral.ts';
import { MINERAL_IMPORT_EXAMPLE } from '../lib/mineral-import-example.ts';
import { COUNTRIES, getCountryByCode, getCountryValues } from '../lib/countries.ts';
import { MINERAL_MARKDOWN_TEMPLATE, MineralMarkdownParseError, parseMineralMarkdown, serializeMineralMarkdown } from '../lib/mineral-markdown.ts';

assert.equal(COUNTRIES.length, 249, 'country directory must contain all ISO 3166-1 alpha-2 entries');
assert.equal(COUNTRIES.length, new Set(COUNTRIES.map(({ code }) => code)).size, 'country codes must be unique');
assert.ok(COUNTRIES.every(({ code }) => /^[A-Z]{2}$/.test(code)), 'country codes must be uppercase ISO alpha-2 values');
const madagascar = getCountryByCode('MG');
if (!madagascar) throw new Error('Madagascar must be present in country directory');
assert.deepEqual(madagascar, { code: 'MG', ru: 'Мадагаскар', en: 'Madagascar' });
assert.deepEqual(getCountryValues(madagascar), { country_code: 'MG', country_ru: 'Мадагаскар', country_en: 'Madagascar' });

const kambaba = MINERAL_IMPORT_EXAMPLE;
assert.equal(GemEntityV2ImportSchema.safeParse(kambaba).success, true, 'canonical example must pass MineralSchema');
const importPrompt = readFileSync(new URL('../app/admin/minerals/components/ImportJsonSection.tsx', import.meta.url), 'utf8');
assert.ok(importPrompt.includes('При генерации JSON для ручного копирования из AI НЕ включай sources[].url.'), 'AI prompt must explicitly omit source URLs');
assert.equal(importPrompt.includes('экранируй каждый символ "/"'), false, 'AI prompt must not require escaped URL slashes');
assert.equal(importPrompt.includes('encodeURIComponent'), false, 'AI prompt must not include URL encoding instructions');
assert.equal(importPrompt.includes('Не экранируй двоеточие, ?, &, = или %'), false, 'AI prompt must not include special URL character escaping instructions');
const sourceWithoutUrl = { ...kambaba, sources: [{ title: 'Mindat: Kambaba Jasper', author: 'Mindat', publisher: 'Mindat.org' }] };
assert.equal(GemEntityV2ImportSchema.safeParse(sourceWithoutUrl).success, true, 'source with title and no URL must pass import schema validation');
const sourceWithUrl = { ...kambaba, sources: [{ url: 'https://www.mindat.org/min-52559.html' }] };
assert.equal(GemEntityV2ImportSchema.safeParse(sourceWithUrl).success, true, 'source with a normal URL must remain supported by import schema validation');
const sourceWithoutTitleOrUrl = { ...kambaba, sources: [{ author: 'Mindat', publisher: 'Mindat.org' }] };
assert.equal(GemEntityV2ImportSchema.safeParse(sourceWithoutTitleOrUrl).success, false, 'source without title or URL must fail import schema validation');
const parsed = parseV2Import(JSON.stringify(kambaba));
assert.equal(parsed.type, 'rock'); assert.equal(parsed.scientific.rock_type, 'igneous');
assert.equal(parsed.scientific.hardness.min, 6); assert.equal(parsed.scientific.hardness.max, 7);
assert.equal(parsed.scientific.specific_gravity.min, 2.6); assert.equal(parsed.scientific.specific_gravity.max, 2.8);
assert.equal(parsed.i18n.ru.scientific_notes.hardness, '6–7 по шкале Мооса.'); assert.equal(parsed.i18n.en.scientific_notes.hardness, '6–7 on the Mohs scale.');
assert.equal(parsed.i18n.ru.scientific_notes.composition, 'Вулканическая риолитовая порода.'); assert.equal(parsed.i18n.en.scientific_notes.composition, 'A rhyolitic volcanic rock.');
assert.equal(parsed.images.storage_key, 'kambaba_jasper'); assert.equal(parsed.images.gallery.length, 1);
assert.equal(parsed.localities[0].country_code, 'MG'); assert.equal(parsed.sources[0].title, 'Mindat: Kambaba Jasper'); assert.deepEqual(parsed.related_entities, []);
assert.equal(parsed.scientific.hardness_note, undefined); assert.equal(parsed.scientific.composition, undefined);
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
assert.throws(() => parseV2Import(JSON.stringify(withLocality({ geojson: { type: 'Point', coordinates: [46.5, -16.4] } }))), 'unknown locality geo keys must be rejected by strict import');
assert.equal(parseV2Import(JSON.stringify({...kambaba, scientific:{...kambaba.scientific, crystal_system:'trigonal',base_color:'green'}})).scientific.crystal_system, 'trigonal');
const sourceUrl = kambaba.sources[0].url;
const normalUrl = normalizeV2ImportSourceUrls({...kambaba, sources: [{...kambaba.sources[0], url: sourceUrl}]});
assert.equal(normalUrl.sources[0].url, sourceUrl, 'normal source URL must remain unchanged');
const markdownUrl = normalizeV2ImportSourceUrls({...kambaba, sources: [{...kambaba.sources[0], url: `[${sourceUrl}](${sourceUrl})`}]});
assert.equal(markdownUrl.sources[0].url, sourceUrl, 'identical Markdown source URL must be normalized');
const mismatchedMarkdownUrl = normalizeV2ImportSourceUrls({...kambaba, sources: [{...kambaba.sources[0], url: `[${sourceUrl}](https://example.com/other)`}]});
assert.equal(GemEntityV2ImportSchema.safeParse(mismatchedMarkdownUrl).success, false, 'mismatched Markdown source URL must not be accepted');
const escapedSlashSourceCases = [
  { rawUrl: 'https:\\/\\/www.mindat.org\\/min-52559.html', expectedUrl: 'https://www.mindat.org/min-52559.html', name: 'Mindat URL' },
  { rawUrl: 'https:\\/\\/www.epigem.de\\/en-us\\/?catid=73&id=350%3Anebula-kambaba-eldarite&layout=blog&view=article', expectedUrl: 'https://www.epigem.de/en-us/?catid=73&id=350%3Anebula-kambaba-eldarite&layout=blog&view=article', name: 'Epigem query URL' },
];
for (const { rawUrl, expectedUrl, name } of escapedSlashSourceCases) {
  const rawJson = JSON.stringify({...kambaba, sources: [{...kambaba.sources[0], url: sourceUrl}]}).replace(sourceUrl, rawUrl);
  assert.ok(rawJson.includes(`"${rawUrl}"`), `${name} must use escaped slashes in raw JSON`);
  const parsedRawJson = JSON.parse(rawJson);
  assert.equal(parsedRawJson.sources[0].url, expectedUrl, `${name} must restore the exact URL after JSON.parse`);
  assert.equal(GemEntityV2ImportSchema.safeParse(parsedRawJson).success, true, `${name} must pass import schema validation after JSON.parse`);
}
const invalidUrl = normalizeV2ImportSourceUrls({...kambaba, sources: [{...kambaba.sources[0], url: 'not-a-url'}]});
assert.equal(GemEntityV2ImportSchema.safeParse(invalidUrl).success, false, 'invalid source URL must fail schema validation');
const legacyExamples = [
  {...kambaba,scientific:{...kambaba.scientific,hardness_note:'legacy'}},
  {...kambaba,scientific:{...kambaba.scientific,composition:'legacy'}},
  {...kambaba,localities:[{...kambaba.localities[0],is_russian:false}]},
  {...kambaba,main_image_url:'https://example.com/hero.webp'},
  {...kambaba,thumbnail_url:'https://example.com/thumbnail.webp'},
  {...kambaba,images:{...kambaba.images,gallery:[{...kambaba.images.gallery[0],url:'https://example.com/gallery.webp'}]}},
  {...kambaba,related_minerals:[]},
];
for (const bad of [{extra:true},{...kambaba,scientific:{...kambaba.scientific,chemical_class:'x'}},...legacyExamples]) assert.throws(() => parseV2Import(JSON.stringify(bad)));
assert.throws(() => parseV2Import('{bad'));
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
assert.equal(GemEntityV2ImportSchema.safeParse(parseMineralMarkdown(MINERAL_MARKDOWN_TEMPLATE)).success, true, 'Markdown template must be canonical V2 compatible');

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
assert.deepEqual(richParsed.scientific.phenomena, ['iridescence', 'chatoyancy']);
assert.equal(richParsed.i18n.ru.color_description, 'Первая строка.\nВторая строка.');
assert.deepEqual(richParsed.i18n.ru.synonyms, ['Камбаба', 'крокодиловая яшма']);
assert.deepEqual(richParsed.related_entities, ['rhyolite', 'jasper', 'ocean-jasper']);

for (const coordinate_precision of ['exact', 'approximate', 'region']) {
  const parsedLocality = parseMineralMarkdown(serializeMineralMarkdown(withLocality({ latitude: 0, longitude: 0, coordinate_precision })));
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
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('| rock_type | igneous |', '| made_up_field | value |'), 'Неизвестное поле таблицы');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('| country_code | country_ru |', '| country_code | unknown_column |'), 'Неожиданные колонки');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('| hardness_min | 6 |', '| hardness_min | six |'), 'должно быть числом');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('| MG | Мадагаскар |', '| MG | Мадагаскар |').replace('| 0 | 0 | approximate | false |', '| 0 | 0 | approximate | yes |'), 'famous допускает');
markdownError(MINERAL_MARKDOWN_TEMPLATE.replace('hero.webp', 'https://example.com/hero.webp'), 'относительным путём');
const invalidEnumMarkdown = parseMineralMarkdown(MINERAL_MARKDOWN_TEMPLATE.replace('| base_color | green |', '| base_color | ultraviolet |'));
assert.equal(GemEntityV2ImportSchema.safeParse(invalidEnumMarkdown).success, false, 'invalid enum must pass Markdown structure parser and fail V2 schema');
const invalidSlugMarkdown = parseMineralMarkdown(MINERAL_MARKDOWN_TEMPLATE.replace('| slug | kambaba-jasper |', '| slug | Not a slug |'));
assert.equal(GemEntityV2ImportSchema.safeParse(invalidSlugMarkdown).success, false, 'invalid slug must fail V2 schema');
console.log('V2 regression checks passed');
