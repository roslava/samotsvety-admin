export const MINERAL_IMPORT_EXAMPLE = {
  slug: 'kambaba-jasper',
  type: 'rock',
  scientific: {
    hardness: { min: 6, max: 7 },
    specific_gravity: { min: 2.6, max: 2.8 },
    base_color: 'green',
    rock_type: 'sedimentary',
    phenomena: [],
  },
  i18n: {
    ru: { name: 'Камбаба-яшма', scientific_notes: { hardness: '6–7 по шкале Мооса.', composition: 'Осадочная порода с кварцем, строматолитами и другими минералами.' } },
    en: { name: 'Kambaba Jasper', scientific_notes: { hardness: '6–7 on the Mohs scale.', composition: 'A sedimentary rock with quartz, stromatolites, and other minerals.' } },
  },
  localities: [{
    country_code: 'MG', country_ru: 'Мадагаскар', country_en: 'Madagascar',
    region_ru: null, region_en: null, locality_ru: null, locality_en: null,
    description_ru: null, description_en: null, famous: true,
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
