import assert from 'node:assert/strict';
import { parseV2Import, toV2WritePayload } from '../lib/v2-helpers.ts';

const kambaba = { slug:'kambaba-jasper', type:'rock', scientific:{ hardness:{min:6,max:7}, phenomena:[] }, i18n:{ ru:{name:'Камбаба-яшма',scientific_notes:{hardness:'RU',composition:'RU composition'}}, en:{name:'Kambaba Jasper',scientific_notes:{hardness:'EN',composition:'EN composition'}} }, localities:[], images:{storage_key:'kambaba_jasper',hero:{path:'hero.webp'},thumbnail:{path:'thumbnail.webp'},gallery:[{path:'gallery/kambaba_jasper00.webp'},{path:'gallery/kambaba_jasper01.webp'},{path:'gallery/kambaba_jasper02.webp'}]}, related_entities:[], sources:[] };
const parsed = parseV2Import(JSON.stringify(kambaba));
assert.equal(parsed.scientific.hardness.min, 6); assert.equal(parsed.scientific.hardness.max, 7);
assert.equal(parsed.i18n.ru.scientific_notes.hardness, 'RU'); assert.equal(parsed.i18n.en.scientific_notes.hardness, 'EN');
assert.equal(parsed.images.storage_key, 'kambaba_jasper'); assert.equal(parsed.images.gallery.length, 3);
assert.deepEqual(parsed.localities, []); assert.deepEqual(parsed.sources, []); assert.deepEqual(parsed.related_entities, []);
assert.equal(parsed.scientific.hardness_note, undefined); assert.equal(parsed.scientific.composition, undefined);
assert.equal(parseV2Import(JSON.stringify({...kambaba, scientific:{...kambaba.scientific, crystal_system:'trigonal',base_color:'green'}})).scientific.crystal_system, 'trigonal');
for (const bad of [{extra:true},{...kambaba,scientific:{...kambaba.scientific,chemical_class:'x'}},{...kambaba,related_minerals:[]}]) assert.throws(() => parseV2Import(JSON.stringify(bad)));
assert.throws(() => parseV2Import('{bad'));
const write = toV2WritePayload({...kambaba, created_at:'x', updated_at:'y'});
assert.equal('created_at' in write, false); assert.equal('updated_at' in write, false);
for (const key of ['related_minerals','main_image_url','thumbnail_url','is_russian']) assert.equal(key in write, false);
console.log('V2 regression checks passed');
