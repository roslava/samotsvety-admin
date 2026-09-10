# Canonical V2 шаблон минерала

Источник истины для импортируемой записи — `lib/validations/mineral.ts`: `GemEntityV2ImportSchema = MineralSchema`. Схема strict: не добавляйте ключи, которых в ней нет.

## Верхний уровень

Обязательны `slug` (только `[a-z0-9-]`), `type` (`mineral`, `rock`, `gem_variety`, `organic`), `scientific` и `i18n` с объектами `ru` и `en`. В каждом языке обязателен `name`.

Опциональные верхнеуровневые поля: `localities`, `images`, `related_entities`, `sources`.

## Научные и локализованные данные

`scientific` допускает только поля canonical schema: `chemical_formula`, `hardness`, `specific_gravity`, `rarity`, `base_color`, `mineral_class`, `silicate_subclass`, `mineral_family`, `crystal_system`, `crystal_habit`, `streak`, `transparency`, `luster`, `tenacity`, `fracture`, `cleavage_degree`, `cleavage_direction`, `cleavage_type`, `phenomena`, `ima_status`, `rock_type`.

`chemical_formula` — optional nullable string; `hardness` и `specific_gravity` — optional nullable numeric ranges. Только `crystal_habit`, `luster`, `tenacity`, `phenomena` — optional nullable enum arrays. Все остальные enum-поля (`rarity`, `base_color`, `mineral_class`, `silicate_subclass`, `mineral_family`, `crystal_system`, `streak`, `transparency`, `fracture`, `cleavage_degree`, `cleavage_direction`, `cleavage_type`, `ima_status`, `rock_type`) — optional nullable scalar: ровно одно enum-значение или пусто; строки вида `a, b` запрещены.

`base_color`: `red | black | bi_color | blue | brown | green | yellow | grey | purple | white | pink | multicolor | orange`.

`crystal_system`: `monoclinic | orthorhombic | hexagonal | trigonal | isometric | triclinic | tetragonal | amorphous`.

Для `type: "rock"` не указывайте свойства индивидуального минерала, если они не применимы; `rock_type` возможен только для горной породы.

Не существует `scientific.hardness_note` и `scientific.composition`. Переводимые заметки указываются отдельно: `i18n.ru.scientific_notes.hardness`, `i18n.en.scientific_notes.hardness`, `i18n.ru.scientific_notes.composition`, `i18n.en.scientific_notes.composition`.

## Localities

Каждый объект locality содержит `country_code`, `country_ru`, `country_en`, `region_ru`, `region_en`, `locality_ru`, `locality_en`, `description_ru`, `description_en`, `famous`. `country_code` обязателен и имеет вид ISO 3166-1 alpha-2 в верхнем регистре: `RU`, `MG`, `US`. Поля без данных можно указывать как `null`. Поля `is_russian` в схеме нет.

## Images

Используйте только:

```json
{
  "images": {
    "storage_key": "kambaba_jasper",
    "hero": { "path": "hero.webp" },
    "thumbnail": { "path": "thumbnail.webp" },
    "gallery": [{
      "path": "gallery/example00.webp",
      "type": "specimen",
      "caption": { "ru": "Образец", "en": "Specimen" }
    }]
  }
}
```

Все пути относительны к `storage_key`; не указывайте URL. Полей `main_image_url`, `thumbnail_url` и `gallery[].url` нет.

## Связи и источники

`related_entities` — массив slug. `related_minerals` не существует.

`sources` — массив объектов с ключами `title`, `url`, `author`, `publisher`. В каждом источнике должен быть хотя бы `title` или `url`.

Перед импортом проверьте объект через `GemEntityV2ImportSchema.safeParse(example)`.
