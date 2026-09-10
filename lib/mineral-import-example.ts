export const MINERAL_IMPORT_EXAMPLE = {
  slug: 'kambaba-jasper',
  type: 'rock',
  scientific: {
    hardness: { min: 6, max: 7 },
    specific_gravity: { min: 2.6, max: 2.8 },
    base_color: 'green',
    rock_type: 'igneous',
  },
  i18n: {
    ru: { name: 'Камбаба-яшма', scientific_notes: { hardness: '6–7 по шкале Мооса.', composition: 'Вулканическая риолитовая порода.' } },
    en: { name: 'Kambaba Jasper', scientific_notes: { hardness: '6–7 on the Mohs scale.', composition: 'A rhyolitic volcanic rock.' } },
  },
  localities: [{
    country_code: 'MG', country_ru: 'Мадагаскар', country_en: 'Madagascar',
    region_ru: null, region_en: null, locality_ru: null, locality_en: null,
    description_ru: null, description_en: null,
    latitude: -16.4, longitude: 46.5, coordinate_precision: 'approximate',
    famous: true,
  }],
  images: {
    storage_key: 'kambaba_jasper',
    hero: { path: 'hero.webp' },
    thumbnail: { path: 'thumbnail.webp' },
    gallery: [{ path: 'gallery/example00.webp', type: 'specimen', caption: { ru: 'Образец', en: 'Specimen' } }],
  },
  related_entities: [],
  sources: [{ title: 'Mindat: Kambaba Jasper', url: 'https://www.mindat.org/', author: null, publisher: 'Mindat' }],
};
