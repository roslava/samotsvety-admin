import assert from 'node:assert/strict';
import { normalizeV2ImportSourceUrls, parseV2Import, toV2WritePayload } from '../lib/v2-helpers.ts';
import { GemEntityV2ImportSchema } from '../lib/validations/mineral.ts';
import { MINERAL_IMPORT_EXAMPLE } from '../lib/mineral-import-example.ts';
import { COUNTRIES, getCountryByCode, getCountryValues } from '../lib/countries.ts';

assert.equal(COUNTRIES.length, 249, 'country directory must contain all ISO 3166-1 alpha-2 entries');
assert.equal(COUNTRIES.length, new Set(COUNTRIES.map(({ code }) => code)).size, 'country codes must be unique');
assert.ok(COUNTRIES.every(({ code }) => /^[A-Z]{2}$/.test(code)), 'country codes must be uppercase ISO alpha-2 values');
const madagascar = getCountryByCode('MG');
if (!madagascar) throw new Error('Madagascar must be present in country directory');
assert.deepEqual(madagascar, { code: 'MG', ru: 'Мадагаскар', en: 'Madagascar' });
assert.deepEqual(getCountryValues(madagascar), { country_code: 'MG', country_ru: 'Мадагаскар', country_en: 'Madagascar' });

const kambaba = MINERAL_IMPORT_EXAMPLE;
assert.equal(GemEntityV2ImportSchema.safeParse(kambaba).success, true, 'canonical example must pass MineralSchema');
const parsed = parseV2Import(JSON.stringify(kambaba));
assert.equal(parsed.type, 'rock'); assert.equal(parsed.scientific.rock_type, 'igneous');
assert.equal(parsed.scientific.hardness.min, 6); assert.equal(parsed.scientific.hardness.max, 7);
assert.equal(parsed.scientific.specific_gravity.min, 2.6); assert.equal(parsed.scientific.specific_gravity.max, 2.8);
assert.equal(parsed.i18n.ru.scientific_notes.hardness, '6–7 по шкале Мооса.'); assert.equal(parsed.i18n.en.scientific_notes.hardness, '6–7 on the Mohs scale.');
assert.equal(parsed.i18n.ru.scientific_notes.composition, 'Вулканическая риолитовая порода.'); assert.equal(parsed.i18n.en.scientific_notes.composition, 'A rhyolitic volcanic rock.');
assert.equal(parsed.images.storage_key, 'kambaba_jasper'); assert.equal(parsed.images.gallery.length, 1);
assert.equal(parsed.localities[0].country_code, 'MG'); assert.equal(parsed.sources[0].title, 'Mindat: Kambaba Jasper'); assert.deepEqual(parsed.related_entities, []);
assert.equal(parsed.scientific.hardness_note, undefined); assert.equal(parsed.scientific.composition, undefined);
assert.equal(parseV2Import(JSON.stringify({...kambaba, scientific:{...kambaba.scientific, crystal_system:'trigonal',base_color:'green'}})).scientific.crystal_system, 'trigonal');
const sourceUrl = kambaba.sources[0].url;
const normalUrl = normalizeV2ImportSourceUrls({...kambaba, sources: [{...kambaba.sources[0], url: sourceUrl}]});
assert.equal(normalUrl.sources[0].url, sourceUrl, 'normal source URL must remain unchanged');
const markdownUrl = normalizeV2ImportSourceUrls({...kambaba, sources: [{...kambaba.sources[0], url: `[${sourceUrl}](${sourceUrl})`}]});
assert.equal(markdownUrl.sources[0].url, sourceUrl, 'identical Markdown source URL must be normalized');
const mismatchedMarkdownUrl = normalizeV2ImportSourceUrls({...kambaba, sources: [{...kambaba.sources[0], url: `[${sourceUrl}](https://example.com/other)`}]});
assert.equal(GemEntityV2ImportSchema.safeParse(mismatchedMarkdownUrl).success, false, 'mismatched Markdown source URL must not be accepted');
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
console.log('V2 regression checks passed');
