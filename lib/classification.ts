// Stable codes shared by form options, validation, Markdown, and display.
export const MINERAL_GROUPS = [
  ['amphibole_group', 'Амфиболы', 'Amphiboles'], ['beryl_group', 'Бериллы', 'Beryls'],
  ['calcite_group', 'Кальциты', 'Calcite group'], ['chrysoberyl_group', 'Хризобериллы', 'Chrysoberyl group'],
  ['corundum_group', 'Корунды', 'Corundum group'], ['feldspar_group', 'Полевые шпаты', 'Feldspars'],
  ['garnet_group', 'Гранаты', 'Garnets'], ['mica_group', 'Слюды', 'Micas'],
  ['olivine_group', 'Оливины', 'Olivines'], ['pyrite_group', 'Пиритовая группа', 'Pyrite group'],
  ['pyroxene_group', 'Пироксены', 'Pyroxenes'], ['quartz_group', 'Кварцы', 'Quartz group'],
  ['spinel_group', 'Шпинели', 'Spinels'], ['tourmaline_group', 'Турмалины', 'Tourmalines'],
  ['zeolite_group', 'Цеолиты', 'Zeolites'],
] as const;
export const CHEMICAL_CLASSES = [
  ['native_elements', 'Самородные элементы', 'Native elements'],
  ['sulfides_sulfosalts', 'Сульфиды и сульфосоли', 'Sulfides and sulfosalts'],
  ['halides', 'Галогениды', 'Halides'], ['oxides_hydroxides', 'Оксиды и гидроксиды', 'Oxides and hydroxides'],
  ['carbonates_nitrates', 'Карбонаты и нитраты', 'Carbonates and nitrates'], ['borates', 'Бораты', 'Borates'],
  ['sulfates_chromates_molybdates_tungstates', 'Сульфаты, хроматы, молибдаты и вольфраматы', 'Sulfates, chromates, molybdates and tungstates'],
  ['phosphates_arsenates_vanadates', 'Фосфаты, арсенаты и ванадаты', 'Phosphates, arsenates and vanadates'],
  ['silicates', 'Силикаты', 'Silicates'], ['organic', 'Органические минералы', 'Organic minerals'],
] as const;
export const CATALOG_FAMILIES = [
  ['agates', 'Агаты', 'Agates'], ['beryls', 'Бериллы', 'Beryls'],
  ['chalcedonies', 'Халцедоны', 'Chalcedonies'], ['garnets', 'Гранаты', 'Garnets'],
  ['jaspers', 'Яшмы', 'Jaspers'], ['opals', 'Опалы', 'Opals'], ['tourmalines', 'Турмалины', 'Tourmalines'],
] as const;
export const classificationLabel = (kind: 'mineral_group'|'chemical_class'|'catalog_family', code: string, language: 'ru'|'en' = 'ru') => {
  const entries = kind === 'mineral_group' ? MINERAL_GROUPS : kind === 'chemical_class' ? CHEMICAL_CLASSES : CATALOG_FAMILIES;
  const found = entries.find(([value]) => value === code);
  return found?.[language === 'ru' ? 1 : 2] ?? code;
};
