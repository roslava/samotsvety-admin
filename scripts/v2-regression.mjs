import assert from 'node:assert/strict';
import { parseV2Import, toV2WritePayload } from '../lib/v2-helpers.ts';
import { GemEntityV2ImportSchema } from '../lib/validations/mineral.ts';
import { MINERAL_IMPORT_EXAMPLE } from '../lib/mineral-import-example.ts';

const kambaba = MINERAL_IMPORT_EXAMPLE;
assert.equal(GemEntityV2ImportSchema.safeParse(kambaba).success, true, 'canonical example must pass MineralSchema');
const parsed = parseV2Import(JSON.stringify(kambaba));
assert.equal(parsed.scientific.hardness.min, 6); assert.equal(parsed.scientific.hardness.max, 7);
assert.equal(parsed.i18n.ru.scientific_notes.hardness, '6–7 по шкале Мооса.'); assert.equal(parsed.i18n.en.scientific_notes.hardness, '6–7 on the Mohs scale.');
assert.equal(parsed.images.storage_key, 'kambaba_jasper'); assert.equal(parsed.images.gallery.length, 1);
assert.equal(parsed.localities[0].country_code, 'MG'); assert.equal(parsed.sources[0].title, 'Mindat: Kambaba Jasper'); assert.deepEqual(parsed.related_entities, []);
assert.equal(parsed.scientific.hardness_note, undefined); assert.equal(parsed.scientific.composition, undefined);
assert.equal(parseV2Import(JSON.stringify({...kambaba, scientific:{...kambaba.scientific, crystal_system:'trigonal',base_color:'green'}})).scientific.crystal_system, 'trigonal');
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
